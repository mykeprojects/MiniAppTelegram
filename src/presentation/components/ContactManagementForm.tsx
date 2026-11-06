import { useState, type FormEvent } from 'react'
import type {
  ContactInformation,
  ContactType,
} from '../../domain/models/management'

interface ContactManagementFormProps {
  initial?: ContactInformation | null
  readOnly?: boolean
  onSave: (contact: Pick<ContactInformation, 'nombre' | 'tipo' | 'informacion'>) => Promise<void>
  onCancel: () => void
}

export function ContactManagementForm({
  initial,
  readOnly = false,
  onSave,
  onCancel,
}: ContactManagementFormProps) {
  const [nombre, setNombre] = useState(initial?.nombre ?? '')
  const [tipo, setTipo] = useState<ContactType>(initial?.tipo ?? 'RED_SOCIAL')
  const [informacion, setInformacion] = useState(initial?.informacion ?? '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await onSave({ nombre, tipo, informacion })
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : 'No fue posible guardar el contacto.',
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="management-card">
      <header className="management-heading">
        <h2>{initial ? 'Modificar información' : 'Nuevo dato de contacto'}</h2>
      </header>
      <form className="management-form" onSubmit={submit}>
        <label className="form-field">
          <span>Nombre</span>
          <input required value={nombre} onChange={(event) => setNombre(event.target.value)} disabled={busy || readOnly} />
        </label>
        <label className="form-field">
          <span>Tipo</span>
          <select value={tipo} onChange={(event) => setTipo(event.target.value as ContactType)} disabled={busy || readOnly}>
            <option value="RED_SOCIAL">Red social</option>
            <option value="NUMERO_CONTACTO">Número de contacto</option>
            <option value="DIRECCION">Dirección</option>
          </select>
        </label>
        <label className="form-field">
          <span>Información</span>
          <input required value={informacion} onChange={(event) => setInformacion(event.target.value)} disabled={busy || readOnly} />
        </label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="form-actions">
          <button type="button" onClick={onCancel} disabled={busy}>Volver</button>
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
