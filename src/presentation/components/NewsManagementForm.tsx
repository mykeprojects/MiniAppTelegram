import { useState, type FormEvent } from 'react'
import type { ManagedNews } from '../../domain/models/management'
import type { NewsSubmission } from '../../domain/models/news-submission'
import { ImageUpload } from './ImageUpload'
import {
  NEWS_PURPOSE_OPTIONS,
  NEWS_TAG_OPTIONS,
} from '../../domain/models/news-options'

const estadosEditables: { value: NewsSubmission['estado']; label: string }[] = [
  { value: 'BORRADOR', label: 'Borrador' },
  { value: 'PENDIENTE_APROBACION', label: 'En espera por aprobación' },
]

interface NewsManagementFormProps {
  initial?: ManagedNews | null
  readOnly?: boolean
  onSave: (news: NewsSubmission, image: File | null) => Promise<void>
  onApprove?: () => Promise<ManagedNews>
  onToggleActive?: (estaActivo: boolean) => Promise<ManagedNews>
  onCancel: () => void
}

const estadoVacio: NewsSubmission = {
  titulo: '',
  resumen: '',
  cuerpo: '',
  proposito: '',
  etiqueta: '',
  estado: 'BORRADOR',
}

export function NewsManagementForm({
  initial,
  readOnly = false,
  onSave,
  onApprove,
  onToggleActive,
  onCancel,
}: NewsManagementFormProps) {
  const [values, setValues] = useState<NewsSubmission>(() => ({
    ...estadoVacio,
    ...initial,
    resumen: initial?.resumen ?? '',
    proposito: initial?.proposito ?? '',
    etiqueta: initial?.etiqueta ?? '',
    estado:
      initial?.estado === 'PENDIENTE_APROBACION'
        ? initial.estado
        : 'BORRADOR',
  }))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [image, setImage] = useState<File | null>(null)
  const [currentNews, setCurrentNews] = useState(initial ?? null)

  const setField = (field: keyof NewsSubmission, value: string) => {
    setValues((current) => ({ ...current, [field]: value }))
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setBusy(true)
    setError(null)
    try {
      if (
        initial &&
        !image &&
        values.titulo.trim() === initial.titulo &&
        values.cuerpo.trim() === initial.cuerpo &&
        values.resumen.trim() === (initial.resumen ?? '') &&
        values.proposito.trim() === (initial.proposito ?? '') &&
        values.etiqueta.trim() === (initial.etiqueta ?? '')
      ) {
        onCancel()
        return
      }
      await onSave(values, image)
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : 'No fue posible guardar la noticia.',
      )
    } finally {
      setBusy(false)
    }

  }

  const runStatusAction = async (action: () => Promise<ManagedNews>) => {
    setBusy(true)
    setError(null)
    try {
      setCurrentNews(await action())
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : 'No fue posible actualizar el estado.',
      )
    } finally {
      setBusy(false)
    }
  }

  const field = (
    label: string,
    name: keyof NewsSubmission,
    multiline = false,
  ) => (
    <label className="form-field">
      <span>{label}</span>
      {multiline ? (
        <textarea
          value={values[name]}
          onChange={(event) => setField(name, event.target.value)}
          required={name === 'titulo' || name === 'cuerpo'}
          rows={name === 'cuerpo' ? 7 : 3}
          disabled={readOnly || busy}
        />
      ) : (
        <input
          value={values[name]}
          onChange={(event) => setField(name, event.target.value)}
          required={name === 'titulo'}
          disabled={readOnly || busy}
        />
      )}
    </label>
  )
  const selectField = (
    label: string,
    name: keyof NewsSubmission,
    options: readonly { value: string; label: string }[],
  ) => (
    <label className="form-field">
      <span>{label}</span>
      <select
        value={values[name]}
        onChange={(event) => setField(name, event.target.value)}
        disabled={readOnly || busy}
      >
        <option value="">Selecciona una opción</option>
        {options.map((option) => (
          <option value={option.value} key={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )

  return (
    <section className="management-card">
      <header className="management-heading">
        <h2>{readOnly ? 'Detalle de noticia' : initial ? 'Modificar noticia' : 'Nueva noticia'}</h2>
      </header>
      {initial && (
        <p className="empty-state">
          Estado: {currentNews?.estado.replaceAll('_', ' ').toLowerCase()} ·{' '}
            {currentNews?.estaActivo ? 'Activa' : 'Inactiva'}
        </p>
      )}
      <form className="management-form" onSubmit={submit}>
        {field('Título', 'titulo')}
        {field('Resumen', 'resumen', true)}
        {field('Contenido', 'cuerpo', true)}
        {selectField(
          'Propósito',
          'proposito',
          NEWS_PURPOSE_OPTIONS.map((value) => ({ value, label: value })),
        )}
        {selectField(
          'Etiqueta',
          'etiqueta',
          NEWS_TAG_OPTIONS.map((value) => ({ value, label: value })),
        )}
        {!readOnly && (
          <ImageUpload image={image} onChange={setImage} />
        )}
        {!readOnly && currentNews && (
          <div className="form-actions">
            {currentNews.estado !== 'PUBLICADA' && currentNews.estado !== 'ARCHIVADA' && onApprove && (
              <button
                type="button"
                onClick={() => void runStatusAction(onApprove)}
                disabled={busy}
              >
                Aprobar
              </button>
            )}
            {currentNews.estado === 'PUBLICADA' && onToggleActive && (
              <button
                type="button"
                onClick={() =>
                  void runStatusAction(() => onToggleActive(!currentNews.estaActivo))
                }
                disabled={busy}
              >
                {currentNews.estaActivo ? 'Desactivar noticia' : 'Activar noticia'}
              </button>
            )}
          </div>
        )}
        {!initial && (
          selectField(
            'Estado inicial',
            'estado',
            estadosEditables.map((estado) => ({
              value: estado.value,
              label: estado.label,
            })),
          )
        )}
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="form-actions">
          <button type="button" onClick={onCancel} disabled={busy}>
            Volver
          </button>
          {!readOnly && (
            <button type="submit" className="primary-button" disabled={busy}>
              {busy ? 'Guardando…' : 'Guardar'}
            </button>
          )}
        </div>
      </form>
    </section>
  )
}
