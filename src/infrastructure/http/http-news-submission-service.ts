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
    const response = await fetch(`${this.apiUrl}/api/miniapp/publicaciones`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Telegram-Init-Data': initData,
      },
      body: JSON.stringify({
        titulo: news.titulo,
        resumen: news.resumen || undefined,
        cuerpo: news.cuerpo,
        proposito: news.proposito || undefined,
        etiqueta: news.etiqueta || undefined,
        canal: news.canalId,
        moduloOrigen: news.moduloOrigen || undefined,
        registroOrigenId: news.registroOrigenId || undefined,
        imagenUrl: imageUrl,
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
