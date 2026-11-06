import { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { FormikProvider, useFormik } from 'formik'
import { NewsSubmissionSchema } from './domain/validation/news-submission-schema'
import type { NewsSubmission } from './domain/models/news-submission'
import type {
  ContactInformation,
  ManagedNews,
  ManagedUser,
} from './domain/models/management'
import { SubmitNewsUseCase } from './application/use-cases/submit-news-use-case'
import { YupNewsValidator } from './infrastructure/validation/yup-news-validator'
import { TelegramWebAppService } from './infrastructure/telegram/telegram-web-app-service'
import { CloudinaryImageStorageService } from './infrastructure/http/cloudinary-image-storage-service'
import { HttpNewsSubmissionService } from './infrastructure/http/http-news-submission-service'
import { HttpManagementService } from './infrastructure/http/http-management-service'
import { Header } from './presentation/components/Header'
import { Stepper } from './presentation/components/Stepper'
import { NewsFormFields } from './presentation/components/NewsFormFields'
import { StepNavigation } from './presentation/components/StepNavigation'
import { Lista } from './presentation/components/Lista'
import { NewsManagementForm } from './presentation/components/NewsManagementForm'
import { UserManagementForm } from './presentation/components/UserManagementForm'
import { ContactManagementForm } from './presentation/components/ContactManagementForm'
import { RoleGuard } from './presentation/components/RoleGuard'
import { Icon } from './presentation/components/Icon'
import { AuthenticatedActorContext } from './presentation/context/AuthenticatedActorContext'
import styles from './presentation/styles/App.module.css'

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const telegram = new TelegramWebAppService()
const imageStorage = new CloudinaryImageStorageService(apiUrl)
const submitNews = new SubmitNewsUseCase(
  new YupNewsValidator(),
  telegram,
  imageStorage,
  new HttpNewsSubmissionService(apiUrl),
)
const management = new HttpManagementService(apiUrl, telegram)

const initialValues: NewsSubmission = {
  titulo: '',
  resumen: '',
  cuerpo: '',
  proposito: '',
  etiqueta: '',
  estado: 'BORRADOR',
}

const stepFields: Record<number, (keyof NewsSubmission)[]> = {
  1: ['titulo', 'cuerpo'],
  2: ['resumen', 'proposito', 'etiqueta'],
  3: ['estado'],
}

const estadoLabel: Record<ManagedNews['estado'], string> = {
  BORRADOR: 'Borrador',
  PENDIENTE_APROBACION: 'En espera por aprobación',
  PUBLICADA: 'Aprobada',
  ARCHIVADA: 'Archivada',
}

function App() {
  const actor = useContext(AuthenticatedActorContext)
  if (!actor) return null

  if (actor.rol === 'DIRECTORA') {
    return (
      <RoleGuard roles={['DIRECTORA']}>
        <DirectorWorkspace />
      </RoleGuard>
    )
  }

  return (
    <RoleGuard roles={['COLABORADOR', 'COMUNICACIONES']}>
      <ContributorWorkspace />
    </RoleGuard>
  )
}

function DirectorWorkspace() {
  const [tab, setTab] = useState<'news' | 'users' | 'contacts'>('news')
  const [news, setNews] = useState<ManagedNews[]>([])
  const [users, setUsers] = useState<ManagedUser[]>([])
  const [contacts, setContacts] = useState<ContactInformation[]>([])
  const [newsForm, setNewsForm] = useState<{ item: ManagedNews | null; mode: 'create' | 'view' | 'edit' } | null>(null)
  const [userForm, setUserForm] = useState<ManagedUser | null | undefined>(undefined)
  const [contactForm, setContactForm] = useState<ContactInformation | null | undefined>(undefined)
  const [userReadOnly, setUserReadOnly] = useState(false)
  const [contactReadOnly, setContactReadOnly] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      if (tab === 'news') setNews(await management.listNews())
      if (tab === 'users') setUsers(await management.listUsers())
      if (tab === 'contacts') setContacts(await management.listContacts())
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No fue posible cargar la información.')
    } finally {
      setLoading(false)
    }
  }, [tab])

  useEffect(() => {
    void Promise.resolve().then(refresh)
  }, [refresh])

  const run = async (action: () => Promise<unknown>) => {
    setError(null)
    try {
      await action()
      await refresh()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No fue posible completar la operación.')
    }
  }

  const saveNews = async (values: NewsSubmission, image: File | null) => {
    const imageUrl = image
      ? await imageStorage.uploadImage(image, telegram.getInitData())
      : undefined
    await management.saveNews(
      values,
      imageUrl,
      newsForm?.mode === 'edit' ? newsForm.item?.id : undefined,
      newsForm?.mode === 'edit' ? newsForm.item ?? undefined : undefined,
    )
    setNewsForm(null)
    await refresh()
  }

  const saveUser = async (user: { nombre: string; telegramId: string }) => {
    await management.saveUser(
      userForm ? { nombre: user.nombre } : user,
      userForm?.id,
    )
    setUserForm(undefined)
    await refresh()
  }

  const saveContact = async (
    data: Pick<ContactInformation, 'nombre' | 'tipo' | 'informacion'>,
  ) => {
    await management.saveContact(data, contactForm?.id)
    setContactForm(undefined)
    await refresh()
  }

  if (newsForm) {
    return (
      <main className="workspace">
        <Header />
        <NewsManagementForm
          initial={newsForm.item}
          readOnly={newsForm.mode === 'view'}
          onSave={saveNews}
          onApprove={
            newsForm.mode === 'edit' && newsForm.item
              ? async () => {
                  const updated = await management.approveNews(newsForm.item!.id)
                  setNews((items) =>
                    items.map((item) => (item.id === updated.id ? updated : item)),
                  )
                  return updated
                }
              : undefined
          }
          onToggleActive={
            newsForm.mode === 'edit' && newsForm.item
              ? async (estaActivo) => {
                  const updated = await management.setNewsActive(
                    newsForm.item!.id,
                    estaActivo,
                  )
                  setNews((items) =>
                    items.map((item) => (item.id === updated.id ? updated : item)),
                  )
                  return updated
                }
              : undefined
          }
          onCancel={() => setNewsForm(null)}
        />
      </main>
    )
  }
  if (userForm !== undefined) {
    return (
      <main className="workspace">
        <Header />
        <UserManagementForm
          initial={userForm}
          readOnly={userReadOnly}
          onSave={saveUser}
          onCancel={() => {
            setUserForm(undefined)
            setUserReadOnly(false)
          }}
        />
      </main>
    )
  }
  if (contactForm !== undefined) {
    return (
      <main className="workspace">
        <Header />
        <ContactManagementForm
          initial={contactForm}
          readOnly={contactReadOnly}
          onSave={saveContact}
          onCancel={() => {
            setContactForm(undefined)
            setContactReadOnly(false)
          }}
        />
      </main>
    )
  }

  return (
    <main className="workspace">
      <Header />
      <section className="workspace-intro">
        <p className="eyebrow">PANEL DE ADMINISTRACIÓN</p>
        <h1>Gestión de UpNews</h1>
        <p>Administra publicaciones, colaboradores e información de contacto.</p>
      </section>
      <nav className="director-bottom-nav" aria-label="Secciones de administración">
        <button
          type="button"
          className={tab === 'news' ? 'active' : ''}
          aria-label="Noticias"
          aria-current={tab === 'news' ? 'page' : undefined}
          title="Noticias"
          onClick={() => setTab('news')}
        >
          <Icon name="newspaper" size={24} />
        </button>
        <button
          type="button"
          className={tab === 'users' ? 'active' : ''}
          aria-label="Gestión de usuarios"
          aria-current={tab === 'users' ? 'page' : undefined}
          title="Gestión de usuarios"
          onClick={() => setTab('users')}
        >
          <Icon name="users" size={24} />
        </button>
        <button
          type="button"
          className={tab === 'contacts' ? 'active' : ''}
          aria-label="Información de contacto"
          aria-current={tab === 'contacts' ? 'page' : undefined}
          title="Información de contacto"
          onClick={() => setTab('contacts')}
        >
          <Icon name="phone" size={24} />
        </button>
      </nav>
      {error && <p className="form-error" role="alert">{error}</p>}
      {loading && <p role="status">Cargando información…</p>}
      {tab === 'news' && (
        <Lista
          titulo="Noticias"
          items={news}
          onCrear={() => setNewsForm({ item: null, mode: 'create' })}
          onVer={(item) => setNewsForm({ item, mode: 'view' })}
          onEditar={(item) => setNewsForm({ item, mode: 'edit' })}
          onEliminar={(item) => {
            if (window.confirm(`¿Eliminar la noticia "${item.titulo}"?`)) {
              void run(() => management.deleteNews(item.id))
            }
          }}
          columnas={[
            { label: 'Título', render: (item) => item.titulo },
            { label: 'Estado', render: (item) => estadoLabel[item.estado] },
            { label: 'Publicada', render: (item) => item.estaActivo ? 'Activa' : 'Inactiva' },
          ]}
        />
      )}
      {tab === 'users' && (
        <Lista
          titulo="Colaboradores"
          items={users.filter((user) => user.rol === 'COLABORADOR')}
          onCrear={() => {
            setUserReadOnly(false)
            setUserForm(null)
          }}
          onEditar={(item) => {
            setUserReadOnly(false)
            setUserForm(item)
          }}
          onVer={(item) => {
            setUserReadOnly(true)
            setUserForm(item)
          }}
          columnas={[
            { label: 'Nombre', render: (item) => item.nombre },
            { label: 'Telegram ID', render: (item) => item.telegramId },
            { label: 'Acceso', render: (item) => item.activo ? 'Activo' : 'Desactivado' },
          ]}
          acciones={(item) => (
            <button
              type="button"
              className={item.activo ? 'danger-button' : ''}
              onClick={() => {
                if (!item.activo || window.confirm(`¿Eliminar el acceso de ${item.nombre}?`)) {
                  void run(() =>
                    item.activo
                      ? management.deleteUser(item.id)
                      : management.setUserActive(item.id, true),
                  )
                }
              }}
            >
              {item.activo ? 'Eliminar' : 'Reactivar'}
            </button>
          )}
        />
      )}
      {tab === 'contacts' && (
        <Lista
          titulo="Información de contacto"
          items={contacts}
          onCrear={() => {
            setContactReadOnly(false)
            setContactForm(null)
          }}
          onEditar={(item) => {
            setContactReadOnly(false)
            setContactForm(item)
          }}
          onVer={(item) => {
            setContactReadOnly(true)
            setContactForm(item)
          }}
          onEliminar={(item) => {
            if (window.confirm(`¿Eliminar "${item.nombre}"?`)) {
              void run(() => management.deleteContact(item.id))
            }
          }}
          columnas={[
            { label: 'Nombre', render: (item) => item.nombre },
            { label: 'Tipo', render: (item) => item.tipo.replaceAll('_', ' ') },
            { label: 'Información', render: (item) => item.informacion },
          ]}
        />
      )}
    </main>
  )
}

function ContributorWorkspace() {
  const [activeStep, setActiveStep] = useState(1)
  const [isSubmitReady, setIsSubmitReady] = useState(false)
  const [image, setImage] = useState<File | null>(null)
  const [news, setNews] = useState<ManagedNews[]>([])
  const [editor, setEditor] = useState<{ item: ManagedNews; mode: 'view' | 'edit' } | null>(null)
  const [listError, setListError] = useState<string | null>(null)
  const submissionPromiseRef = useRef<Promise<void> | null>(null)
  const submitCooldownRef = useRef<number | null>(null)

  const refreshNews = async () => {
    setListError(null)
    try {
      setNews(await management.listNews())
    } catch (reason) {
      setListError(reason instanceof Error ? reason.message : 'No fue posible cargar tus noticias.')
    }
  }

  useEffect(() => {
    void Promise.resolve().then(refreshNews)
    return () => {
      if (submitCooldownRef.current !== null) window.clearTimeout(submitCooldownRef.current)
    }
  }, [])

  const formik = useFormik<NewsSubmission>({
    initialValues,
    validationSchema: NewsSubmissionSchema,
    validateOnMount: true,
    onSubmit: async (values, helpers) => {
      if (submissionPromiseRef.current) {
        await submissionPromiseRef.current
        return
      }

      const submissionPromise = (async () => {
        helpers.setStatus(undefined)
        try {
          await submitNews.execute(values, image ?? undefined)
          helpers.setStatus({
            kind: 'success',
            message:
              values.estado === 'BORRADOR'
                ? 'La noticia se guardó como borrador.'
                : 'La noticia se envió para aprobación.',
          })
          await refreshNews()
        } catch (error) {
          helpers.setStatus({
            kind: 'error',
            message: error instanceof Error ? error.message : 'No fue posible enviar la noticia.',
          })
        } finally {
          helpers.setSubmitting(false)
        }
      })()

      submissionPromiseRef.current = submissionPromise
      try {
        await submissionPromise
      } finally {
        submissionPromiseRef.current = null
      }
    },
  })

  const currentStepErrors = stepFields[activeStep].some((field) => Boolean(formik.errors[field]))
  const currentStepMissingRequiredFields =
    activeStep === 1 && (!formik.values.titulo.trim() || !formik.values.cuerpo.trim())
  const canContinue = !currentStepErrors && !currentStepMissingRequiredFields && !formik.isSubmitting

  const goToNextStep = async () => {
    const errors = await formik.validateForm()
    const hasCurrentStepErrors = stepFields[activeStep].some((field) => Boolean(errors[field]))
    if (hasCurrentStepErrors) {
      await formik.setTouched(Object.fromEntries(stepFields[activeStep].map((field) => [field, true])))
      return
    }
    if (activeStep === 2) {
      setIsSubmitReady(false)
      if (submitCooldownRef.current !== null) window.clearTimeout(submitCooldownRef.current)
      submitCooldownRef.current = window.setTimeout(() => {
        setIsSubmitReady(true)
        submitCooldownRef.current = null
      }, 2000)
    }
    setActiveStep((step) => Math.min(step + 1, 3))
  }

  const goToPreviousStep = () => {
    if (activeStep === 3 && submitCooldownRef.current !== null) {
      window.clearTimeout(submitCooldownRef.current)
      submitCooldownRef.current = null
      setIsSubmitReady(true)
    }
    setActiveStep((step) => Math.max(step - 1, 1))
  }

  const saveDraftChanges = async (values: NewsSubmission, image: File | null) => {
    const imageUrl = image
      ? await imageStorage.uploadImage(image, telegram.getInitData())
      : undefined
    await management.saveNews(values, imageUrl, editor?.item.id, editor?.item)
    setEditor(null)
    await refreshNews()
  }

  if (editor) {
    return (
      <main className="workspace">
        <Header />
        <NewsManagementForm
          initial={editor.item}
          readOnly={editor.mode === 'view'}
          onSave={saveDraftChanges}
          onCancel={() => setEditor(null)}
        />
      </main>
    )
  }

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <Header />
        <section className={styles.card} aria-label="Publicar noticia">
          <div className={styles.intro}>
            <p className={styles.eyebrow}><span>NUEVA</span> PUBLICACIÓN</p>
            <h1 className={styles.title}>Comparte una noticia</h1>
            <p className={styles.description}>Completa los datos para preparar tu publicación.</p>
          </div>
          <Stepper activeStep={activeStep} />
          <FormikProvider value={formik}>
            <form onSubmit={formik.handleSubmit} noValidate>
              <NewsFormFields step={activeStep} image={image} onImageChange={setImage} />
              {formik.status?.message && (
                <p className={formik.status.kind === 'success' ? styles.successMessage : styles.errorMessage}
                  role={formik.status.kind === 'error' ? 'alert' : 'status'}>
                  {formik.status.message}
                </p>
              )}
              <StepNavigation
                activeStep={activeStep}
                canContinue={canContinue}
                isSubmitting={formik.isSubmitting}
                isSubmitReady={isSubmitReady}
                onBack={goToPreviousStep}
                onNext={goToNextStep}
              />
            </form>
          </FormikProvider>
        </section>
        {listError && <p className="form-error" role="alert">{listError}</p>}
        <Lista
          titulo="Mis borradores"
          items={news}
          columnas={[
            { label: 'Título', render: (item) => item.titulo },
            { label: 'Estado', render: (item) => estadoLabel[item.estado] },
          ]}
          onVer={(item) => setEditor({ item, mode: 'view' })}
          onEditar={(item) => setEditor({ item, mode: 'edit' })}
          vacio="Tus borradores aparecerán aquí. Las noticias enviadas a aprobación quedan bajo gestión de la directora."
        />
        <p className={styles.footer}>Tu información se enviará de forma segura.</p>
      </div>
    </main>
  )
}

export default App
