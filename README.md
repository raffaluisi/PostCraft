# Instagram Post Manager

A complete web application for creating, editing, and publishing Instagram posts with custom backgrounds and scheduling capabilities.

## Features

- 📱 **Instagram Integration**: Connect your Instagram Business account to schedule and publish posts
- 🖼️ **Custom Backgrounds**: Upload your own images and videos as post backgrounds
- ✏️ **Post Editor**: Edit headlines, captions, and hashtags with live preview
- 📅 **Scheduling**: Schedule posts for future publication
- 📊 **Post Management**: Approve, favorite, and organize your content
- 📱 **Responsive Design**: Works perfectly on desktop, tablet, and mobile

## Setup Instructions

### 1. Instagram API Setup

1. Go to [Facebook Developers](https://developers.facebook.com/apps/)
2. Create a new app and select "Business" type
3. Add Instagram Basic Display and Instagram Graph API products
4. Configure OAuth redirect URIs:
   - Add `http://localhost:5173/auth/instagram/callback` for development
   - Add your production domain callback URL for deployment
5. Copy your App ID and App Secret

### 2. Environment Configuration

1. Copy `.env.example` to `.env`
2. Fill in your Instagram API credentials:
   ```
   VITE_INSTAGRAM_CLIENT_ID=your_app_id_here
   VITE_INSTAGRAM_CLIENT_SECRET=your_app_secret_here
   ```

### 3. Installation

```bash
npm install
npm run dev
```

### 4. Instagram Account Requirements

- Instagram Business or Creator account
- Facebook Page connected to your Instagram account
- Account must be eligible for Instagram Graph API

## Usage

### Connecting Instagram Account

1. Click the "Settings" button in the header
2. Click "Connect Instagram" in the configuration page
3. Authorize the app with your Instagram account
4. You're now ready to schedule and publish posts!

### Uploading Custom Backgrounds

1. Go to Settings → Background Media
2. Drag and drop images or videos, or click to browse
3. Uploaded media will be used as backgrounds for new posts

### Creating Posts

1. Upload a JSON file with your post content, or use the sample data
2. Edit headlines, captions, and hashtags directly on the post cards
3. Use the action buttons to approve, favorite, download, schedule, or publish posts

### JSON Format

```json
[
  {
    "headline": "Your Post Title",
    "caption": "Your post description and content",
    "hashtags": ["mindfulness", "wellness", "selfcare"]
  }
]
```

## Deployment

### GitHub Pages

```bash
npm run build
npm run deploy
```

### Other Platforms

The app builds to a static site in the `dist` folder and can be deployed to any static hosting service.

## Technical Architecture

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Image Generation**: html-to-image for post exports
- **API Integration**: Instagram Graph API
- **Storage**: LocalStorage (development), easily extensible to cloud storage

## Production Considerations

- Replace localStorage with proper database (Supabase, Firebase, etc.)
- Implement proper error handling and retry logic
- Add image optimization and CDN integration
- Set up proper monitoring and analytics
- Implement user authentication and multi-account support

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details