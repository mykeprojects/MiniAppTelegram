import type { PropsWithChildren } from 'react'
import { useTelegramAuth } from '../hooks/useTelegramAuth'
import { AuthenticatedActorContext } from '../context/AuthenticatedActorContext'
import styles from './TelegramAuthGuard.module.css'

export function TelegramAuthGuard({ children }: PropsWithChildren) {
  const { isVerifying, isAuthenticated, actor, isForbidden, message, retry } =
    useTelegramAuth()

  if (isVerifying) {
    return (
      <main className={styles.screen} aria-live="polite">
        <section className={styles.card}>
          <div className={styles.spinner} aria-hidden="true" />
          <h1 className={styles.title}>Verificando acceso</h1>
          <p className={styles.message}>Espera un momento, por favor.</p>
        </section>
      </main>
    )
  }

  if (isForbidden) {
    return (
      <main className={styles.screen}>
        <section className={styles.card} role="alert">
          <h1 className={styles.title}>Acceso no disponible</h1>
          <p className={styles.message}>{message}</p>
          <button className={styles.retry} onClick={retry} type="button">
            Reintentar
          </button>
        </section>
      </main>
    )
  }

  return isAuthenticated && actor ? (
    <AuthenticatedActorContext.Provider value={actor}>
      {children}
    </AuthenticatedActorContext.Provider>
  ) : null
}
