export interface Post {
  id: string;
  headline: string;
  caption: string;
  hashtags: string[];
  backgroundImage: string;
  favorited: boolean;
  approved: boolean;
  scheduledTime: Date | null;
  createdAt: Date;
}

export interface PostUpload {
  headline: string;
  caption: string;
  hashtags?: string[];
}

export interface ScheduleRequest {
  postId: string;
  scheduledTime: Date;
  imageUrl: string;
  caption: string;
  hashtags: string[];
}

export interface PublishRequest {
  postId: string;
  imageUrl: string;
  caption: string;
  hashtags: string[];
}