import type { NewsSubmission } from '../../domain/models/news-submission'

export interface NewsSubmissionService {
  submitNews(
    news: NewsSubmission,
    imageUrl: string | undefined,
    initData: string,
  ): Promise<void>
}
