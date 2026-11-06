export type UserRole = 'DIRECTORA' | 'COMUNICACIONES' | 'COLABORADOR'

export interface AuthenticatedActor {
  id: string
  nombre: string
  rol: UserRole
}
