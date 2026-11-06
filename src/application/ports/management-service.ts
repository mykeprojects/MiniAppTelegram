import type {
  ContactInformation,
  ManagedNews,
  ManagedUser,
} from '../../domain/models/management'
import type { NewsSubmission } from '../../domain/models/news-submission'

export interface ManagementService {
  listNews(): Promise<ManagedNews[]>
  saveNews(
    news: NewsSubmission,
    imageUrl?: string,
    id?: string,
    original?: ManagedNews,
  ): Promise<ManagedNews>
  approveNews(id: string): Promise<ManagedNews>
  approveAndActivateNews(id: string): Promise<ManagedNews>
  setNewsActive(id: string, estaActivo: boolean): Promise<ManagedNews>
  deleteNews(id: string): Promise<void>
  listUsers(): Promise<ManagedUser[]>
  saveUser(
    user: { nombre: string; telegramId?: string },
    id?: string,
  ): Promise<ManagedUser>
  setUserActive(id: string, activo: boolean): Promise<ManagedUser>
  deleteUser(id: string): Promise<ManagedUser>
  listContacts(): Promise<ContactInformation[]>
  saveContact(
    contact: Pick<ContactInformation, 'nombre' | 'tipo' | 'informacion'>,
    id?: string,
  ): Promise<ContactInformation>
  deleteContact(id: string): Promise<void>
}
