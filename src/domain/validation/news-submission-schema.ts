import * as yup from 'yup'
import type { NewsChannel } from '../models/news-submission'

export const NewsSubmissionSchema: yup.ObjectSchema<NewsSubmissionShape> =
  yup
    .object({
      titulo: yup
        .string()
        .trim()
        .required('El título es obligatorio.'),
      resumen: yup.string().trim().default(''),
      cuerpo: yup
        .string()
        .trim()
        .required('El cuerpo de la noticia es obligatorio.'),
      proposito: yup.string().trim().default(''),
      etiqueta: yup.string().trim().default(''),
      canalId: yup
        .mixed<NewsChannel>()
        .oneOf(['web', 'telegram'], 'Selecciona Web o Telegram.')
        .required('El canal es obligatorio.'),
      moduloOrigen: yup.string().trim().default(''),
      registroOrigenId: yup
        .string()
        .trim()
        .default('')
        .matches(
          /^$|^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
          'El identificador debe ser un UUID válido.',
        ),
    })
    .test(
      'origin-fields-pair',
      'Completa ambos campos de origen o deja ambos vacíos.',
      function validateOriginPair(value) {
        if (!value) return true

        const hasModule = Boolean(value.moduloOrigen?.trim())
        const hasRecordId = Boolean(value.registroOrigenId?.trim())

        return (
          hasModule === hasRecordId ||
          this.createError({
            path: 'moduloOrigen',
            message: 'Completa el módulo y el identificador de origen.',
          })
        )
      },
    )

export interface NewsSubmissionShape {
  titulo: string
  resumen: string
  cuerpo: string
  proposito: string
  etiqueta: string
  canalId: NewsChannel
  moduloOrigen: string
  registroOrigenId: string
}
