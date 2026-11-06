import type { AuthenticatedActor } from '../../domain/models/actor'

export interface TelegramAuthService {
  authenticate(initData: string): Promise<AuthenticatedActor>
}
