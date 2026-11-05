import type { TelegramService } from '../../application/ports/telegram-service'

export class TelegramWebAppService implements TelegramService {
  getInitData(): string {
    const webApp =
      typeof window === 'undefined' ? undefined : window.Telegram?.WebApp

    if (!webApp?.initData) {
      throw new Error(
        'No se pudo validar tu sesión de Telegram. Abre esta aplicación desde Telegram e inténtalo nuevamente.',
      )
    }

    return webApp.initData
  }
}
