import * as yup from 'yup'
import { getYouTubeVideoId } from '../models/youtube-video'

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
      videoUrl: yup
        .string()
        .trim()
        .default('')
        .test(
          'youtube-url',
          'Ingresa un enlace válido de un video de YouTube.',
          (url) => !url || Boolean(getYouTubeVideoId(url)),
        ),
      estado: yup
        .mixed<'BORRADOR' | 'PENDIENTE_APROBACION'>()
        .oneOf(['BORRADOR', 'PENDIENTE_APROBACION'])
        .required(),
    })

export interface NewsSubmissionShape {
  titulo: string
  resumen: string
  cuerpo: string
  proposito: string
  etiqueta: string
  videoUrl: string
  estado: 'BORRADOR' | 'PENDIENTE_APROBACION'
}
