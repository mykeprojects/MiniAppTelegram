export type NewsChannel = 'web' | 'telegram'

export interface NewsSubmission {
  titulo: string
  resumen: string
  cuerpo: string
  proposito: string
  etiqueta: string
  canalId: NewsChannel
  moduloOrigen: string
  registroOrigenId: string
}
