import * as yup from 'yup'

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
  estado: 'BORRADOR' | 'PENDIENTE_APROBACION'
}
