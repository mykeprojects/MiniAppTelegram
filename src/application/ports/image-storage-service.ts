export interface ImageStorageService {
  uploadImage(image: File, initData: string): Promise<string>
}
