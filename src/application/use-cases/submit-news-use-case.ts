import type { NewsSubmission } from '../../domain/models/news-submission'
import type { ImageStorageService } from '../ports/image-storage-service'
import type { NewsSubmissionService } from '../ports/news-submission-service'
import type { TelegramService } from '../ports/telegram-service'
import type { NewsValidator } from '../ports/news-validator'

export class SubmitNewsUseCase {
  private readonly validator: NewsValidator
  private readonly telegramService: TelegramService
  private readonly imageStorageService: ImageStorageService
  private readonly newsSubmissionService: NewsSubmissionService

  constructor(
    validator: NewsValidator,
    telegramService: TelegramService,
    imageStorageService: ImageStorageService,
    newsSubmissionService: NewsSubmissionService,
  ) {
    this.validator = validator
    this.telegramService = telegramService
    this.imageStorageService = imageStorageService
    this.newsSubmissionService = newsSubmissionService
  }

  async execute(input: NewsSubmission, image?: File): Promise<void> {
    const validatedNews = await this.validator.validate(input)
    const initData = this.telegramService.getInitData()
    const imageUrl = image
      ? await this.imageStorageService.uploadImage(image, initData)
      : undefined
    await this.newsSubmissionService.submitNews(validatedNews, imageUrl, initData)
  }
}
