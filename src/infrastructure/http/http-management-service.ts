import type { ManagementService } from '../../application/ports/management-service'
import type {
  ContactInformation,
  ManagedNews,
  ManagedUser,
} from '../../domain/models/management'
import type { NewsSubmission } from '../../domain/models/news-submission'
import type { TelegramService } from '../../application/ports/telegram-service'

export class HttpManagementService implements ManagementService {
  private readonly apiUrl: string
  private readonly telegram: TelegramService

  constructor(
    apiUrl: string,
    telegram: TelegramService,
  ) {
    this.apiUrl = apiUrl
    this.telegram = telegram
  }

  listNews(): Promise<ManagedNews[]> {
    return this.request('/publicaciones')
  }

  saveNews(
    news: NewsSubmission,
    imageUrl?: string,
    id?: string,
    original?: ManagedNews,
  ): Promise<ManagedNews> {
    const optionalFields = [
      'resumen',
      'proposito',
      'etiqueta',
    ] as const

    if (id && original) {
      const changes: Record<string, string | null> = {}
      if (news.titulo.trim() !== original.titulo) changes.titulo = news.titulo.trim()
      if (news.cuerpo.trim() !== original.cuerpo) changes.cuerpo = news.cuerpo.trim()
      for (const field of optionalFields) {
        const value = news[field].trim()
        if (value !== (original[field] ?? '')) {
          changes[field] = value || null
        }
      }

      if (Object.keys(changes).length === 0 && !imageUrl) {
        return Promise.resolve(original)
      }

      return this.request(`/publicaciones/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          ...changes,
          ...(imageUrl ? { imagenUrl: imageUrl } : {}),
        }),
      })
    }

    const { estado, ...contenido } = news
    const optionalContent = Object.fromEntries(
      optionalFields.flatMap((field) => {
        const value = contenido[field].trim()
        return value ? [[field, value]] : []
      }),
    )
    return this.request('/publicaciones', {
      method: 'POST',
      body: JSON.stringify({
        ...contenido,
        ...optionalContent,
        estado,
        ...(imageUrl ? { imagenUrl: imageUrl } : {}),
      }),
    })
  }

  approveNews(id: string): Promise<ManagedNews> {
    return this.request(`/publicaciones/${id}/aprobar`, { method: 'POST' })
  }

  approveAndActivateNews(id: string): Promise<ManagedNews> {
    return this.request(`/publicaciones/${id}/aprobar-y-activar`, {
      method: 'POST',
    })
  }

  setNewsActive(id: string, estaActivo: boolean): Promise<ManagedNews> {
    return this.request(`/publicaciones/${id}/activacion`, {
      method: 'PATCH',
      body: JSON.stringify({ estaActivo }),
    })
  }

  async deleteNews(id: string): Promise<void> {
    await this.request<void>(`/publicaciones/${id}`, { method: 'DELETE' })
  }

  listUsers(): Promise<ManagedUser[]> {
    return this.request('/usuarios')
  }

  saveUser(
    user: { nombre: string; telegramId?: string },
    id?: string,
  ): Promise<ManagedUser> {
    return this.request(id ? `/usuarios/${id}` : '/usuarios', {
      method: id ? 'PATCH' : 'POST',
      body: JSON.stringify(id ? { nombre: user.nombre } : user),
    })
  }

  setUserActive(id: string, activo: boolean): Promise<ManagedUser> {
    return this.request(`/usuarios/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ activo }),
    })
  }

  deleteUser(id: string): Promise<ManagedUser> {
    return this.request(`/usuarios/${id}`, { method: 'DELETE' })
  }

  listContacts(): Promise<ContactInformation[]> {
    return this.request('/contactos')
  }

  saveContact(
    contact: Pick<ContactInformation, 'nombre' | 'tipo' | 'informacion'>,
    id?: string,
  ): Promise<ContactInformation> {
    return this.request(id ? `/contactos/${id}` : '/contactos', {
      method: id ? 'PATCH' : 'POST',
      body: JSON.stringify(contact),
    })
  }

  async deleteContact(id: string): Promise<void> {
    await this.request<void>(`/contactos/${id}`, { method: 'DELETE' })
  }

  private async request<T>(
    path: string,
    options: RequestInit = {},
  ): Promise<T> {
    const response = await fetch(`${this.apiUrl}/api/gestion${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-Telegram-Init-Data': this.telegram.getInitData(),
        ...options.headers,
      },
    })

    if (response.status === 204) return undefined as T

    const data: unknown = await response.json()
    if (!response.ok) {
      const message =
        typeof data === 'object' &&
        data !== null &&
        'error' in data &&
        typeof data.error === 'string'
          ? data.error
          : 'No fue posible completar la operación.'
      const fields =
        typeof data === 'object' &&
        data !== null &&
        'campos' in data &&
        Array.isArray(data.campos)
          ? data.campos.filter((field): field is string => typeof field === 'string')
          : []
      if (response.status === 404 && message === 'Ruta no encontrada') {
        throw new Error(
          `El backend respondió 404 para ${options.method ?? 'GET'} ${path}. Reinicia o despliega la versión del backend que incluye /api/gestion.`,
        )
      }
      throw new Error(fields.length > 0 ? `${message}: ${fields.join(', ')}` : message)
    }
    return data as T
  }
}
