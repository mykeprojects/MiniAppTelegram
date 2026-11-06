import { useState, type FormEvent } from 'react'
import type { ManagedUser } from '../../domain/models/management'

interface UserManagementFormProps {
  initial?: ManagedUser | null
  readOnly?: boolean
  onSave: (user: { nombre: string; telegramId: string }) => Promise<void>
  onCancel: () => void
}

export function UserManagementForm({
  initial,
  readOnly = false,
  onSave,
  onCancel,
}: UserManagementFormProps) {
  const [nombre, setNombre] = useState(initial?.nombre ?? '')
  const [telegramId, setTelegramId] = useState(initial?.telegramId ?? '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await onSave({ nombre, telegramId })
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : 'No fue posible guardar al colaborador.',
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="management-card">
      <header className="management-heading">
        <h2>{initial ? 'Modificar colaborador' : 'Registrar colaborador'}</h2>
      </header>
      <form className="management-form" onSubmit={submit}>
        <label className="form-field">
          <span>Nombre</span>
          <input
            required
            value={nombre}
            onChange={(event) => setNombre(event.target.value)}
            disabled={busy || readOnly}
          />
        </label>
        <label className="form-field">
          <span>ID de Telegram</span>
          <input
            required
            inputMode="numeric"
            value={telegramId}
            onChange={(event) => setTelegramId(event.target.value)}
            disabled={Boolean(initial) || busy || readOnly}
          />
        </label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="form-actions">
          <button type="button" onClick={onCancel} disabled={busy}>Volver</button>
          {!readOnly && (
            <button type="submit" className="primary-button" disabled={busy}>
              {busy ? 'Guardando…' : 'Guardar colaborador'}
            </button>
          )}
        </div>
      </form>
    </section>
  )
}
