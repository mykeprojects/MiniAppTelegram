import styles from './Stepper.module.css'

const steps = ['Contenido', 'Detalles', 'Origen']

interface StepperProps {
  activeStep: number
}

export function Stepper({ activeStep }: StepperProps) {
  return (
    <nav className={styles.stepper} aria-label="Progreso de publicación">
      {steps.map((label, index) => {
        const step = index + 1
        const isComplete = step < activeStep
        const isActive = step === activeStep

        return (
          <div
            className={styles.step}
            aria-current={isActive ? 'step' : undefined}
            key={label}
          >
            <span
              className={[
                styles.number,
                isActive ? styles.active : '',
                isComplete ? styles.complete : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {isComplete ? '✓' : step}
            </span>
            <span className={isActive ? styles.activeLabel : styles.label}>
              {label}
            </span>
          </div>
        )
      })}
    </nav>
  )
}
