export interface NewsSubmission {
  titulo: string
  resumen: string
  cuerpo: string
  proposito: string
  etiqueta: string
  estado: 'BORRADOR' | 'PENDIENTE_APROBACION'
}
