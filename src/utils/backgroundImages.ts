import { backgroundService } from '../services/backgroundService';

// Default background images for posts - using high-quality stock photos
export const defaultBackgroundImages = [
  // Folhas - Leaves/Nature
  'https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg?auto=compress&cs=tinysrgb&w=1080&h=1080&fit=crop',
  // Agua - Water/Serenity
  'https://images.pexels.com/photos/1619317/pexels-photo-1619317.jpeg?auto=compress&cs=tinysrgb&w=1080&h=1080&fit=crop',
  // Mente - Mind/Meditation
  'https://images.pexels.com/photos/1029604/pexels-photo-1029604.jpeg?auto=compress&cs=tinysrgb&w=1080&h=1080&fit=crop',
  // Additional backgrounds for variety
  'https://images.pexels.com/photos/1670187/pexels-photo-1670187.jpeg?auto=compress&cs=tinysrgb&w=1080&h=1080&fit=crop',
  'https://images.pexels.com/photos/1323550/pexels-photo-1323550.jpeg?auto=compress&cs=tinysrgb&w=1080&h=1080&fit=crop',
  'https://images.pexels.com/photos/1906658/pexels-photo-1906658.jpeg?auto=compress&cs=tinysrgb&w=1080&h=1080&fit=crop'
];

export const getBackgroundImage = (index: number): string => {
  // First, try to get uploaded backgrounds
  const uploadedBackgrounds = backgroundService.getBackgroundUrls();
  
  if (uploadedBackgrounds.length > 0) {
    // Use uploaded backgrounds if available
    return uploadedBackgrounds[index % uploadedBackgrounds.length];
  }
  
  // Fall back to default backgrounds
  return defaultBackgroundImages[index % defaultBackgroundImages.length];
};

export const getAllBackgroundImages = (): string[] => {
  const uploadedBackgrounds = backgroundService.getBackgroundUrls();
  return [...uploadedBackgrounds, ...defaultBackgroundImages];
};