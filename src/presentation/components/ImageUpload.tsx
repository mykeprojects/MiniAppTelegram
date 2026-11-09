import { useState, type ChangeEvent } from 'react'
import styles from './ImageUpload.module.css'

interface ImageUploadProps {
  image: File | null
  onChange: (image: File | null) => void
  disabled?: boolean
}

const MAX_IMAGE_SIZE = 10 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export function ImageUpload({ image, onChange, disabled = false }: ImageUploadProps) {
  const [error, setError] = useState('')

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedImage = event.currentTarget.files?.[0]
    event.currentTarget.value = ''
    if (!selectedImage) return

    if (!ALLOWED_IMAGE_TYPES.includes(selectedImage.type)) {
      onChange(null)
      setError('Selecciona una imagen JPG, PNG o WebP.')
      return
    }
    if (selectedImage.size > MAX_IMAGE_SIZE) {
      onChange(null)
      setError('La imagen debe pesar 10 MB o menos.')
      return
    }
    setError('')
    onChange(selectedImage)
  }

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor="news-imagen">
        Imagen <span className={styles.optional}>(opcional)</span>
      </label>
      <input
        id="news-imagen"
        className={styles.input}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleChange}
        aria-describedby="news-imagen-hint"
        disabled={disabled}
      />
      <span className={styles.hint} id="news-imagen-hint">
        JPG, PNG o WebP; máximo 10 MB.
      </span>
      {error && <span className={styles.error} role="alert">{error}</span>}
      {image && (
        <div className={styles.selectedImage}>
          <span>{image.name}</span>
          <button type="button" disabled={disabled} onClick={() => { onChange(null); setError('') }}>
            Quitar
          </button>
        </div>
      )}
    </div>
  )
}
