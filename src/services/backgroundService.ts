// Background Media Service for handling custom uploads
interface UploadedMedia {
  id: string;
  url: string;
  type: 'image' | 'video';
  name: string;
  uploadedAt: Date;
}

class BackgroundService {
  private readonly STORAGE_KEY = 'uploaded_backgrounds';

  // Upload media file and store locally (in production, use cloud storage)
  async uploadMedia(file: File): Promise<UploadedMedia> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const result = e.target?.result as string;
          const mediaId = `media_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          
          const uploadedMedia: UploadedMedia = {
            id: mediaId,
            url: result, // In production, this would be a cloud storage URL
            type: file.type.startsWith('image/') ? 'image' : 'video',
            name: file.name,
            uploadedAt: new Date(),
          };

          // Store in localStorage (in production, use proper database)
          const existingMedia = this.getUploadedMedia();
          const updatedMedia = [uploadedMedia, ...existingMedia];
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedMedia));

          resolve(uploadedMedia);
        } catch (error) {
          reject(new Error('Failed to process file'));
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsDataURL(file);
    });
  }

  // Get all uploaded media
  getUploadedMedia(): UploadedMedia[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];
      
      const media = JSON.parse(stored);
      return media.map((item: any) => ({
        ...item,
        uploadedAt: new Date(item.uploadedAt),
      }));
    } catch (error) {
      console.error('Failed to load uploaded media:', error);
      return [];
    }
  }

  // Delete uploaded media
  async deleteMedia(mediaId: string): Promise<void> {
    try {
      const existingMedia = this.getUploadedMedia();
      const updatedMedia = existingMedia.filter(media => media.id !== mediaId);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedMedia));
    } catch (error) {
      console.error('Failed to delete media:', error);
      throw new Error('Failed to delete media');
    }
  }

  // Get media by ID
  getMediaById(mediaId: string): UploadedMedia | null {
    const media = this.getUploadedMedia();
    return media.find(item => item.id === mediaId) || null;
  }

  // Get all media URLs for background selection
  getBackgroundUrls(): string[] {
    const media = this.getUploadedMedia();
    return media.filter(item => item.type === 'image').map(item => item.url);
  }

  // Clear all uploaded media
  async clearAllMedia(): Promise<void> {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}

export const backgroundService = new BackgroundService();
export type { UploadedMedia };