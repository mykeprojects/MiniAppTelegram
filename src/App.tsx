import { useEffect, useRef, useState } from 'react'
import { FormikProvider, useFormik } from 'formik'
import { NewsSubmissionSchema } from './domain/validation/news-submission-schema'
import type { NewsSubmission } from './domain/models/news-submission'
import { SubmitNewsUseCase } from './application/use-cases/submit-news-use-case'
import { YupNewsValidator } from './infrastructure/validation/yup-news-validator'
import { TelegramWebAppService } from './infrastructure/telegram/telegram-web-app-service'
import { CloudinaryImageStorageService } from './infrastructure/http/cloudinary-image-storage-service'
import { HttpNewsSubmissionService } from './infrastructure/http/http-news-submission-service'
import { Header } from './presentation/components/Header'
import { Stepper } from './presentation/components/Stepper'
import { NewsFormFields } from './presentation/components/NewsFormFields'
import { StepNavigation } from './presentation/components/StepNavigation'
import styles from './presentation/styles/App.module.css'

const submitNews = new SubmitNewsUseCase(
  new YupNewsValidator(),
  new TelegramWebAppService(),
  new CloudinaryImageStorageService(
    import.meta.env.VITE_API_URL || 'http://localhost:3000',
  ),
  new HttpNewsSubmissionService(
    import.meta.env.VITE_API_URL || 'http://localhost:3000',
  ),
)

const initialValues: NewsSubmission = {
  titulo: '',
  resumen: '',
  cuerpo: '',
  proposito: '',
  etiqueta: '',
  canalId: 'web',
  moduloOrigen: '',
  registroOrigenId: '',
}

const stepFields: Record<number, (keyof NewsSubmission)[]> = {
  1: ['titulo', 'cuerpo'],
  2: ['resumen', 'proposito', 'etiqueta'],
  3: ['canalId', 'moduloOrigen', 'registroOrigenId'],
}

function App() {
  const [activeStep, setActiveStep] = useState(1)
  const [isSubmitReady, setIsSubmitReady] = useState(false)
  const [image, setImage] = useState<File | null>(null)
  const submissionPromiseRef = useRef<Promise<void> | null>(null)
  const submitCooldownRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (submitCooldownRef.current !== null) {
        window.clearTimeout(submitCooldownRef.current)
      }
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
            message: 'La noticia se guardó como borrador correctamente.',
          })
        } catch (error) {
          helpers.setStatus({
            kind: 'error',
            message:
              error instanceof Error
                ? error.message
                : 'No fue posible enviar la noticia. Inténtalo nuevamente.',
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

  const currentStepErrors = stepFields[activeStep].some((field) =>
    Boolean(formik.errors[field]),
  )
  const currentStepMissingRequiredFields =
    activeStep === 1 &&
    (!formik.values.titulo.trim() || !formik.values.cuerpo.trim())
  const canContinue =
    !currentStepErrors && !currentStepMissingRequiredFields && !formik.isSubmitting

  const goToNextStep = async () => {
    const stepToAdvanceFrom = activeStep
    const errors = await formik.validateForm()
    const hasCurrentStepErrors = stepFields[stepToAdvanceFrom].some((field) =>
      Boolean(errors[field]),
    )

    if (hasCurrentStepErrors) {
      await formik.setTouched(
        Object.fromEntries(
          stepFields[stepToAdvanceFrom].map((field) => [field, true]),
        ),
      )
      return
    }

    if (stepToAdvanceFrom === 2) {
      setIsSubmitReady(false)
      if (submitCooldownRef.current !== null) {
        window.clearTimeout(submitCooldownRef.current)
      }
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

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <Header />
        <section className={styles.card} aria-label="Publicar noticia">
          <div className={styles.intro}>
            <p className={styles.eyebrow}>
              <span>NUEVA</span> PUBLICACIÓN
            </p>
            <h1 className={styles.title}>Comparte una noticia</h1>
            <p className={styles.description}>
              Completa los datos para preparar tu publicación.
            </p>
          </div>

          <Stepper activeStep={activeStep} />

          <FormikProvider value={formik}>
            <form onSubmit={formik.handleSubmit} noValidate>
              <NewsFormFields
                step={activeStep}
                image={image}
                onImageChange={setImage}
              />
              {formik.status?.message && (
                <p
                  className={
                    formik.status.kind === 'success'
                      ? styles.successMessage
                      : styles.errorMessage
                  }
                  role={formik.status.kind === 'error' ? 'alert' : 'status'}
                >
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
        <p className={styles.footer}>Tu información se enviará de forma segura.</p>
      </div>
    </main>
  )
}

export default App
