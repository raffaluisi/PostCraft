// Instagram API Service with real Meta Graph API integration
class InstagramService {
  private accessToken: string | null = null;
  private userId: string | null = null;
  private isAuthenticated = false;
  private readonly clientId = import.meta.env.VITE_INSTAGRAM_CLIENT_ID;
  private readonly clientSecret = import.meta.env.VITE_INSTAGRAM_CLIENT_SECRET;
  private readonly redirectUri = `${window.location.origin}/auth/instagram/callback`;

  constructor() {
    // Check for stored authentication
    this.loadStoredAuth();
  }

  private loadStoredAuth() {
    const storedToken = localStorage.getItem('instagram_access_token');
    const storedUserId = localStorage.getItem('instagram_user_id');
    
    if (storedToken && storedUserId) {
      this.accessToken = storedToken;
      this.userId = storedUserId;
      this.isAuthenticated = true;
    }
  }

  private storeAuth(token: string, userId: string) {
    localStorage.setItem('instagram_access_token', token);
    localStorage.setItem('instagram_user_id', userId);
    this.accessToken = token;
    this.userId = userId;
    this.isAuthenticated = true;
  }

  private clearAuth() {
    localStorage.removeItem('instagram_access_token');
    localStorage.removeItem('instagram_user_id');
    this.accessToken = null;
    this.userId = null;
    this.isAuthenticated = false;
  }

  // OAuth Authentication Flow
  async authenticate(): Promise<boolean> {
    if (!this.clientId) {
      throw new Error('Instagram Client ID not configured. Please set VITE_INSTAGRAM_CLIENT_ID in your environment variables.');
    }

    try {
      // Step 1: Redirect to Instagram OAuth
      const authUrl = new URL('https://api.instagram.com/oauth/authorize');
      authUrl.searchParams.set('client_id', this.clientId);
      authUrl.searchParams.set('redirect_uri', this.redirectUri);
      authUrl.searchParams.set('scope', 'user_profile,user_media,instagram_basic,instagram_content_publish');
      authUrl.searchParams.set('response_type', 'code');

      // Open popup window for authentication
      const popup = window.open(
        authUrl.toString(),
        'instagram-auth',
        'width=600,height=600,scrollbars=yes,resizable=yes'
      );

      if (!popup) {
        throw new Error('Popup blocked. Please allow popups for this site.');
      }

      // Wait for authentication callback
      return new Promise((resolve, reject) => {
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed);
            reject(new Error('Authentication cancelled'));
          }
        }, 1000);

        // Listen for message from popup
        const messageHandler = async (event: MessageEvent) => {
          if (event.origin !== window.location.origin) return;

          if (event.data.type === 'INSTAGRAM_AUTH_SUCCESS') {
            clearInterval(checkClosed);
            popup.close();
            window.removeEventListener('message', messageHandler);

            try {
              const { code } = event.data;
              await this.exchangeCodeForToken(code);
              resolve(true);
            } catch (error) {
              reject(error);
            }
          } else if (event.data.type === 'INSTAGRAM_AUTH_ERROR') {
            clearInterval(checkClosed);
            popup.close();
            window.removeEventListener('message', messageHandler);
            reject(new Error(event.data.error || 'Authentication failed'));
          }
        };

        window.addEventListener('message', messageHandler);
      });
    } catch (error) {
      console.error('Instagram authentication failed:', error);
      throw error;
    }
  }

  private async exchangeCodeForToken(code: string): Promise<void> {
    try {
      // Step 2: Exchange authorization code for access token
      const tokenResponse = await fetch('https://api.instagram.com/oauth/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.clientId!,
          client_secret: this.clientSecret!,
          grant_type: 'authorization_code',
          redirect_uri: this.redirectUri,
          code: code,
        }),
      });

      if (!tokenResponse.ok) {
        throw new Error('Failed to exchange code for token');
      }

      const tokenData = await tokenResponse.json();
      
      // Step 3: Exchange short-lived token for long-lived token
      const longLivedResponse = await fetch(
        `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${this.clientSecret}&access_token=${tokenData.access_token}`
      );

      if (!longLivedResponse.ok) {
        throw new Error('Failed to get long-lived token');
      }

      const longLivedData = await longLivedResponse.json();
      
      this.storeAuth(longLivedData.access_token, tokenData.user_id);
      console.log('✅ Successfully authenticated with Instagram');
    } catch (error) {
      console.error('Token exchange failed:', error);
      throw error;
    }
  }

  async getUserInfo(): Promise<any> {
    if (!this.isAuthenticated || !this.accessToken || !this.userId) {
      throw new Error('Not authenticated with Instagram');
    }

    try {
      const response = await fetch(
        `https://graph.instagram.com/${this.userId}?fields=id,username,name,profile_picture_url,followers_count,media_count&access_token=${this.accessToken}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch user info');
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get user info:', error);
      throw error;
    }
  }

  async schedulePost(request: ScheduleRequest): Promise<{ success: boolean; scheduledId?: string }> {
    if (!this.isAuthenticated || !this.accessToken || !this.userId) {
      throw new Error('Not authenticated with Instagram');
    }

    try {
      // Step 1: Create media container
      const mediaResponse = await fetch(
        `https://graph.instagram.com/${this.userId}/media`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image_url: request.imageUrl,
            caption: `${request.caption}\n\n${request.hashtags.map(tag => `#${tag}`).join(' ')}`,
            access_token: this.accessToken,
          }),
        }
      );

      if (!mediaResponse.ok) {
        throw new Error('Failed to create media container');
      }

      const mediaData = await mediaResponse.json();

      // Step 2: Schedule the post (Instagram doesn't support scheduling via API directly)
      // For now, we'll store the scheduled post locally and implement a scheduler
      const scheduledPost = {
        id: mediaData.id,
        postId: request.postId,
        scheduledTime: request.scheduledTime,
        mediaContainerId: mediaData.id,
        status: 'scheduled',
      };

      // Store scheduled post (in a real app, this would be in a database)
      const scheduledPosts = JSON.parse(localStorage.getItem('scheduled_posts') || '[]');
      scheduledPosts.push(scheduledPost);
      localStorage.setItem('scheduled_posts', JSON.stringify(scheduledPosts));

      console.log('📅 Scheduled post:', scheduledPost);
      return { 
        success: true, 
        scheduledId: mediaData.id 
      };
    } catch (error) {
      console.error('Failed to schedule post:', error);
      throw error;
    }
  }

  async publishPost(request: PublishRequest): Promise<{ success: boolean; postId?: string }> {
    if (!this.isAuthenticated || !this.accessToken || !this.userId) {
      throw new Error('Not authenticated with Instagram');
    }

    try {
      // Step 1: Create media container
      const mediaResponse = await fetch(
        `https://graph.instagram.com/${this.userId}/media`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image_url: request.imageUrl,
            caption: `${request.caption}\n\n${request.hashtags.map(tag => `#${tag}`).join(' ')}`,
            access_token: this.accessToken,
          }),
        }
      );

      if (!mediaResponse.ok) {
        const errorData = await mediaResponse.json();
        throw new Error(errorData.error?.message || 'Failed to create media container');
      }

      const mediaData = await mediaResponse.json();

      // Step 2: Publish the media container
      const publishResponse = await fetch(
        `https://graph.instagram.com/${this.userId}/media_publish`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            creation_id: mediaData.id,
            access_token: this.accessToken,
          }),
        }
      );

      if (!publishResponse.ok) {
        const errorData = await publishResponse.json();
        throw new Error(errorData.error?.message || 'Failed to publish post');
      }

      const publishData = await publishResponse.json();

      console.log('🚀 Published post:', publishData);
      return { 
        success: true, 
        postId: publishData.id 
      };
    } catch (error) {
      console.error('Failed to publish post:', error);
      throw error;
    }
  }

  async getScheduledPosts(): Promise<any[]> {
    // Get locally stored scheduled posts
    const scheduledPosts = JSON.parse(localStorage.getItem('scheduled_posts') || '[]');
    return scheduledPosts.filter((post: any) => post.status === 'scheduled');
  }

  async cancelScheduledPost(scheduledId: string): Promise<{ success: boolean }> {
    try {
      // Remove from local storage
      const scheduledPosts = JSON.parse(localStorage.getItem('scheduled_posts') || '[]');
      const updatedPosts = scheduledPosts.filter((post: any) => post.id !== scheduledId);
      localStorage.setItem('scheduled_posts', JSON.stringify(updatedPosts));

      console.log('❌ Cancelled scheduled post:', scheduledId);
      return { success: true };
    } catch (error) {
      console.error('Failed to cancel scheduled post:', error);
      throw error;
    }
  }

  async isConnected(): Promise<boolean> {
    if (!this.isAuthenticated || !this.accessToken) {
      return false;
    }

    try {
      // Verify token is still valid
      const response = await fetch(
        `https://graph.instagram.com/${this.userId}?fields=id&access_token=${this.accessToken}`
      );
      
      if (!response.ok) {
        this.clearAuth();
        return false;
      }

      return true;
    } catch (error) {
      this.clearAuth();
      return false;
    }
  }

  async disconnect(): Promise<void> {
    this.clearAuth();
    console.log('👋 Disconnected from Instagram');
  }

  isLoggedIn(): boolean {
    return this.isAuthenticated;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }
}

// Export types for the requests
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

export const instagramService = new InstagramService();