import type { NewsSubmission } from '../../domain/models/news-submission'
import { NewsSubmissionSchema } from '../../domain/validation/news-submission-schema'
import type { NewsValidator } from '../../application/ports/news-validator'

export class YupNewsValidator implements NewsValidator {
  validate(input: NewsSubmission): Promise<NewsSubmission> {
    return NewsSubmissionSchema.validate(input, {
      abortEarly: false,
      stripUnknown: true,
    })
  }
}
