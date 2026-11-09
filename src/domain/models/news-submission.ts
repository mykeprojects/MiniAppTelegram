export interface NewsSubmission {
  titulo: string
  resumen: string
  cuerpo: string
  proposito: string
  etiqueta: string
  videoUrl: string
  estado: 'BORRADOR' | 'PENDIENTE_APROBACION'
}
