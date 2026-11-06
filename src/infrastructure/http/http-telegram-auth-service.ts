import type { TelegramAuthService } from '../../application/ports/telegram-auth-service'
import type { AuthenticatedActor } from '../../domain/models/actor'

interface ApiError {
  error?: unknown
}

interface LoginResponse {
  actor?: unknown
}

export class HttpTelegramAuthService implements TelegramAuthService {
  private readonly apiUrl: string

  constructor(apiUrl: string) {
    this.apiUrl = apiUrl
  }

  async authenticate(initData: string): Promise<AuthenticatedActor> {
    const response = await fetch(`${this.apiUrl}/api/auth/telegram-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initData }),
    })

    if (!response.ok) {
      let message = 'No fue posible verificar tu acceso a UP News.'
      try {
        const errorData: unknown = await response.json()
        if (
          typeof errorData === 'object' &&
          errorData !== null &&
          typeof (errorData as ApiError).error === 'string'
        ) {
          message = (errorData as { error: string }).error
        }
      } catch {
        // La respuesta HTTP ya indica que la verificación falló.
      }
      throw new Error(message)
    }

    const data: unknown = await response.json()
    const actor =
      typeof data === 'object' && data !== null
        ? (data as LoginResponse).actor
        : undefined
    if (
      typeof actor !== 'object' ||
      actor === null ||
      typeof (actor as AuthenticatedActor).id !== 'string' ||
      typeof (actor as AuthenticatedActor).nombre !== 'string' ||
      !['DIRECTORA', 'COMUNICACIONES', 'COLABORADOR'].includes(
        String((actor as AuthenticatedActor).rol),
      )
    ) {
      throw new Error('El servidor devolvió una identidad no válida.')
    }

    return actor as AuthenticatedActor
  }
}
