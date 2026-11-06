import type { NewsSubmission } from './news-submission'

export type NewsState =
  | 'BORRADOR'
  | 'PENDIENTE_APROBACION'
  | 'PUBLICADA'
  | 'ARCHIVADA'

export interface ManagedNews
  extends Omit<
    NewsSubmission,
    | 'estado'
    | 'resumen'
    | 'proposito'
    | 'etiqueta'
  > {
  id: string
  resumen: string | null
  proposito: string | null
  etiqueta: string | null
  estado: NewsState
  estaActivo: boolean
  autorId: string
  publicadaEn: string | null
  actualizadoEn: string
}

export interface ManagedUser {
  id: string
  telegramId: string
  nombre: string
  rol: 'DIRECTORA' | 'COMUNICACIONES' | 'COLABORADOR'
  activo: boolean
}

export type ContactType = 'RED_SOCIAL' | 'NUMERO_CONTACTO' | 'DIRECCION'

export interface ContactInformation {
  id: string
  nombre: string
  tipo: ContactType
  informacion: string
  actualizadoEn: string
}
