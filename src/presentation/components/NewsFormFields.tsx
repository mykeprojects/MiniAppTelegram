import { useField, useFormikContext } from 'formik'
import type { NewsSubmission } from '../../domain/models/news-submission'
import { ImageUpload } from './ImageUpload'
import styles from './NewsFormFields.module.css'

interface NewsFormFieldsProps {
  step: number
  image: File | null
  onImageChange: (image: File | null) => void
}

interface TextInputProps {
  label: string
  name: keyof NewsSubmission
  placeholder: string
  required?: boolean
  rows?: number
  hint?: string
}

interface SelectInputProps {
  label: string
  name: keyof NewsSubmission
  placeholder: string
  options: SelectOption[]
}

interface SelectOption {
  label: string
  value: string
}

function TextInput({
  label,
  name,
  placeholder,
  required = false,
  rows,
  hint,
}: TextInputProps) {
  const [field, meta] = useField<string>(name)
  const hasError = meta.touched && Boolean(meta.error)
  const inputId = `news-${name}`
  const controlClass = hasError
    ? `${styles.control} ${styles.invalid}`
    : styles.control
  const commonProps = {
    ...field,
    id: inputId,
    placeholder,
    'aria-invalid': hasError,
    'aria-describedby': hasError ? `${inputId}-error` : undefined,
  }

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={inputId}>
        {label}
        {required && <span className={styles.required}> *</span>}
      </label>
      {rows ? (
        <textarea
          {...commonProps}
          className={`${controlClass} ${styles.textarea}`}
          rows={rows}
        />
      ) : (
        <input {...commonProps} className={controlClass} />
      )}
      {hint && <span className={styles.hint}>{hint}</span>}
      {hasError && (
        <span className={styles.fieldError} id={`${inputId}-error`}>
          {meta.error}
        </span>
      )}
    </div>
  )
}

function SelectInput({
  label,
  name,
  placeholder,
  options,
}: SelectInputProps) {
  const [field, meta] = useField<string>(name)
  const hasError = meta.touched && Boolean(meta.error)
  const inputId = `news-${name}`
  const controlClass = hasError
    ? `${styles.control} ${styles.invalid}`
    : styles.control

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={inputId}>
        {label}
      </label>
      <select
        {...field}
        id={inputId}
        className={`${controlClass} ${styles.select}`}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${inputId}-error` : undefined}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option value={option.value} key={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {hasError && (
        <span className={styles.fieldError} id={`${inputId}-error`}>
          {meta.error}
        </span>
      )}
    </div>
  )
}

function OriginFields() {
  const { touched, values, errors } = useFormikContext<NewsSubmission>()
  const showPairError =
    Boolean(errors.moduloOrigen) &&
    !touched.moduloOrigen &&
    (Boolean(touched.registroOrigenId) ||
      Boolean(values.moduloOrigen) ||
      Boolean(values.registroOrigenId))

  return (
    <>
      <div className={styles.fieldGrid}>
        <TextInput
          label="Módulo de origen"
          name="moduloOrigen"
          placeholder="Ej. eventos"
        />
        <TextInput
          label="Identificador del registro"
          name="registroOrigenId"
          placeholder="Ej. 123e4567-e89b-12d3-a456-426614174000"
        />
      </div>
      {showPairError && (
        <p className={styles.fieldError} role="alert">
          {errors.moduloOrigen}
        </p>
      )}
    </>
  )
}

export function NewsFormFields({ step, image, onImageChange }: NewsFormFieldsProps) {
  if (step === 1) {
    return (
      <section className={styles.fields} aria-labelledby="step-title">
        <h2 className={styles.stepTitle} id="step-title">
          ¿Qué deseas comunicarle a la comunidad{' '}
          <span className={styles.accentWord}>Up</span>?
        </h2>
        <p className={styles.stepDescription}>
          Empieza con un título claro y el contenido de tu noticia.
        </p>
        <TextInput
          label="Título"
          name="titulo"
          placeholder="Escribe el título de la noticia"
          required
        />
        <TextInput
          label="Cuerpo de la noticia"
          name="cuerpo"
          placeholder="Desarrolla la información que quieres compartir..."
          required
          rows={7}
        />
        <ImageUpload image={image} onChange={onImageChange} />
      </section>
    )
  }

  if (step === 2) {
    return (
      <section className={styles.fields} aria-labelledby="step-title">
        <h2 className={styles.stepTitle} id="step-title">
          Añade contexto
        </h2>
        <p className={styles.stepDescription}>
          Estos detalles son opcionales y ayudan a organizar la publicación.
        </p>
        <TextInput
          label="Resumen"
          name="resumen"
          placeholder="Una breve descripción de la noticia"
          rows={3}
        />
        <SelectInput
          label="Propósito"
          name="proposito"
          placeholder="Selecciona el propósito de la noticia"
          options={[
            { value: 'Informar a la comunidad', label: 'Informar a la comunidad' },
            {
              value: 'Educar y compartir conocimientos',
              label: 'Educar y compartir conocimientos',
            },
            {
              value: 'Promover la salud y el bienestar',
              label: 'Promover la salud y el bienestar',
            },
            {
              value: 'Invitar a participar en actividades',
              label: 'Invitar a participar en actividades',
            },
            {
              value: 'Sensibilizar sobre una causa',
              label: 'Sensibilizar sobre una causa',
            },
            {
              value: 'Compartir recursos y servicios',
              label: 'Compartir recursos y servicios',
            },
          ]}
        />
        <SelectInput
          label="Etiqueta"
          name="etiqueta"
          placeholder="Selecciona una etiqueta"
          options={[
            { value: 'Comunidad', label: 'Comunidad' },
            { value: 'Eventos', label: 'Eventos' },
            { value: 'Salud', label: 'Salud' },
            { value: 'Consejos', label: 'Consejos' },
          ]}
        />
      </section>
    )
  }

  return (
    <section className={styles.fields} aria-labelledby="step-title">
      <h2 className={styles.stepTitle} id="step-title">
        Configura el origen
      </h2>
      <p className={styles.stepDescription}>
        Indica desde dónde se creó esta publicación y, si aplica, su referencia.
      </p>
      <SelectInput
        label="Canal de publicación"
        name="canalId"
        placeholder="Selecciona el canal"
        options={[
          { value: 'web', label: 'Web' },
          { value: 'telegram', label: 'Telegram' },
        ]}
      />
      <OriginFields />
    </section>
  )
}
