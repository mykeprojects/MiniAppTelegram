import { useEffect, useState } from 'react'
import { TelegramWebAppService } from '../../infrastructure/telegram/telegram-web-app-service'
import { HttpTelegramAuthService } from '../../infrastructure/http/http-telegram-auth-service'
import type { AuthenticatedActor } from '../../domain/models/actor'

type AuthState =
  | { status: 'verifying' }
  | { status: 'authenticated'; actor: AuthenticatedActor }
  | { status: 'forbidden'; message: string }

const telegram = new TelegramWebAppService()
const authentication = new HttpTelegramAuthService(
  import.meta.env.VITE_API_URL || 'http://localhost:3000',
)

export function useTelegramAuth() {
  const [state, setState] = useState<AuthState>({ status: 'verifying' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let active = true

    void Promise.resolve()
      .then(() => telegram.getInitData())
      .then((initData) => authentication.authenticate(initData))
      .then(
        (actor) => {
          if (active) setState({ status: 'authenticated', actor })
        },
        (error: unknown) => {
          if (active) {
            setState({
              status: 'forbidden',
              message:
                error instanceof Error
                  ? error.message
                  : 'No fue posible verificar tu acceso a UP News.',
            })
          }
        },
      )

    return () => {
      active = false
    }
  }, [attempt])

  const retry = () => {
    setState({ status: 'verifying' })
    setAttempt((value) => value + 1)
  }

  return {
    isVerifying: state.status === 'verifying',
    isAuthenticated: state.status === 'authenticated',
    actor: state.status === 'authenticated' ? state.actor : null,
    isForbidden: state.status === 'forbidden',
    message: state.status === 'forbidden' ? state.message : null,
    retry,
  }
}
