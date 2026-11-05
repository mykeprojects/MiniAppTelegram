import type { NewsSubmission } from '../../domain/models/news-submission'

export interface NewsValidator {
  validate(input: NewsSubmission): Promise<NewsSubmission>
}
