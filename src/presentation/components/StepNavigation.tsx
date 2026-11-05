import styles from './StepNavigation.module.css'

interface StepNavigationProps {
  activeStep: number
  canContinue: boolean
  isSubmitting: boolean
  isSubmitReady: boolean
  onBack: () => void
  onNext: () => void
}

export function StepNavigation({
  activeStep,
  canContinue,
  isSubmitting,
  isSubmitReady,
  onBack,
  onNext,
}: StepNavigationProps) {
  return (
    <div className={styles.navigation}>
      {activeStep > 1 ? (
        <button
          className={styles.backButton}
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
        >
          Atrás
        </button>
      ) : (
        <span />
      )}
      {activeStep < 3 ? (
        <button
          className={styles.primaryButton}
          type="button"
          onClick={onNext}
          disabled={!canContinue || isSubmitting}
        >
          {isSubmitting ? 'Avanzando…' : 'Siguiente'}
          {!isSubmitting && <span aria-hidden="true">→</span>}
        </button>
      ) : (
        <button
          className={styles.primaryButton}
          type="submit"
          disabled={!canContinue || !isSubmitReady || isSubmitting}
        >
          {isSubmitting
            ? 'Enviando…'
            : isSubmitReady
              ? 'Enviar noticia'
              : 'Preparando envío…'}
          {!isSubmitting && isSubmitReady && (
            <span aria-hidden="true">→</span>
          )}
        </button>
      )}
    </div>
  )
}
