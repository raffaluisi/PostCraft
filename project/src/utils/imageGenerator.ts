import { toPng } from 'html-to-image';
import download from 'downloadjs';

export const generatePostImage = async (postId: string): Promise<string> => {
  const element = document.getElementById(`post-${postId}`);
  if (!element) {
    throw new Error('Post element not found');
  }

  try {
    const dataUrl = await toPng(element, {
      quality: 1.0,
      width: 1080,
      height: 1080,
      style: {
        transform: 'scale(1)',
        transformOrigin: 'top left',
        width: '1080px',
        height: '1080px'
      }
    });
    
    return dataUrl;
  } catch (error) {
    console.error('Error generating image:', error);
    throw error;
  }
};

export const downloadPostImage = async (postId: string, filename: string): Promise<void> => {
  try {
    const dataUrl = await generatePostImage(postId);
    download(dataUrl, filename, 'image/png');
  } catch (error) {
    console.error('Error downloading image:', error);
    throw error;
  }
};