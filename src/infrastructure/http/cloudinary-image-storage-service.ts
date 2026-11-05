import type { ImageStorageService } from '../../application/ports/image-storage-service'

interface UploadSignature {
  apiKey: string
  cloudName: string
  folder: string
  publicId: string
  signature: string
  timestamp: number
  overwrite: false
}

interface UploadResponse {
  secure_url?: unknown
  error?: { message?: unknown }
}

function isUploadSignature(value: unknown): value is UploadSignature {
  if (typeof value !== 'object' || value === null) return false
  const signature = value as Record<string, unknown>
  return (
    typeof signature.apiKey === 'string' &&
    typeof signature.cloudName === 'string' &&
    typeof signature.folder === 'string' &&
    typeof signature.publicId === 'string' &&
    typeof signature.signature === 'string' &&
    typeof signature.timestamp === 'number' &&
    signature.overwrite === false
  )
}

export class CloudinaryImageStorageService implements ImageStorageService {
  private readonly apiUrl: string

  constructor(apiUrl: string) {
    this.apiUrl = apiUrl
  }

  async uploadImage(image: File, initData: string): Promise<string> {
    const signatureResponse = await fetch(`${this.apiUrl}/api/miniapp/upload-signature`, {
      method: 'POST',
      headers: { 'X-Telegram-Init-Data': initData },
    })
    const signatureData: unknown = await signatureResponse.json()

    if (!signatureResponse.ok) {
      throw new Error(this.getErrorMessage(signatureData, 'No fue posible preparar la subida de la imagen.'))
    }
    if (!isUploadSignature(signatureData)) {
      throw new Error('El backend devolvió una firma de subida inválida.')
    }

    const formData = new FormData()
    formData.append('file', image)
    formData.append('api_key', signatureData.apiKey)
    formData.append('timestamp', String(signatureData.timestamp))
    formData.append('folder', signatureData.folder)
    formData.append('public_id', signatureData.publicId)
    formData.append('overwrite', 'false')
    formData.append('signature', signatureData.signature)

    const uploadResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${encodeURIComponent(signatureData.cloudName)}/image/upload`,
      { method: 'POST', body: formData },
    )
    const uploadData: unknown = await uploadResponse.json()

    if (!uploadResponse.ok) {
      throw new Error(this.getErrorMessage(uploadData, 'Cloudinary no pudo subir la imagen.'))
    }
    if (
      typeof uploadData !== 'object' ||
      uploadData === null ||
      typeof (uploadData as UploadResponse).secure_url !== 'string'
    ) {
      throw new Error('Cloudinary no devolvió la URL segura de la imagen.')
    }

    return (uploadData as { secure_url: string }).secure_url
  }

  private getErrorMessage(data: unknown, fallback: string): string {
    if (typeof data !== 'object' || data === null) return fallback
    const error = (data as UploadResponse).error
    return typeof error?.message === 'string'
      ? error.message
      : typeof (data as { error?: unknown }).error === 'string'
        ? (data as { error: string }).error
        : fallback
  }
}
