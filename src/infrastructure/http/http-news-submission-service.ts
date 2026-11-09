import type { NewsSubmissionService } from '../../application/ports/news-submission-service'
import type { NewsSubmission } from '../../domain/models/news-submission'

interface NewsApiError {
  error?: unknown
}

export class HttpNewsSubmissionService implements NewsSubmissionService {
  private readonly apiUrl: string

  constructor(apiUrl: string) {
    this.apiUrl = apiUrl
  }

  async submitNews(
    news: NewsSubmission,
    imageUrl: string | undefined,
    initData: string,
  ): Promise<void> {
    if (imageUrl && news.videoUrl.trim()) {
      throw new Error('Adjunta una imagen o un video de YouTube, no ambos.')
    }
    const { videoUrl, ...contenido } = news
    const response = await fetch(`${this.apiUrl}/api/miniapp/publicaciones`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Telegram-Init-Data': initData,
      },
      body: JSON.stringify({
        titulo: contenido.titulo,
        resumen: contenido.resumen || undefined,
        cuerpo: contenido.cuerpo,
        proposito: contenido.proposito || undefined,
        etiqueta: contenido.etiqueta || undefined,
        estado: contenido.estado,
        imagenUrl: videoUrl.trim() || imageUrl,
      }),
    })

    if (!response.ok) {
      const errorData: unknown = await response.json()
      const message =
        typeof errorData === 'object' &&
        errorData !== null &&
        typeof (errorData as NewsApiError).error === 'string'
          ? (errorData as { error: string }).error
          : 'No fue posible guardar la noticia.'
      throw new Error(message)
    }
  }
}
