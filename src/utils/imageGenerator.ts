import { toPng } from 'html-to-image';
import download from 'downloadjs';

const calculateExportFontSize = (textLength: number): number => {
  // Font size rules for 1080x1080 export
  if (textLength <= 30) {
    return 120; // Large text for short headlines
  } else if (textLength <= 60) {
    return 90; // Medium text for medium headlines
  } else {
    return 70; // Smaller text for long headlines
  }
};

export const generatePostImage = async (postId: string): Promise<string> => {
  const element = document.getElementById(`post-${postId}`);
  if (!element) {
    throw new Error('Post element not found');
  }

  // Find the text container and text element
  const textContainer = element.querySelector('div[class*="absolute inset-0 flex items-center justify-center"]') as HTMLElement;
  const textElement = element.querySelector('h2') as HTMLElement;
  
  if (!textContainer || !textElement) {
    throw new Error('Text container or text element not found');
  }

  // Store original styles
  const originalContainerClassName = textContainer.className;
  const originalContainerStyle = textContainer.getAttribute('style') || '';
  const originalTextClassName = textElement.className;
  const originalTextStyle = textElement.getAttribute('style') || '';

  try {
    // Calculate font size based on text length
    const textContent = textElement.textContent || '';
    const exportFontSize = calculateExportFontSize(textContent.length);

    // Override container styles to ensure proper centering
    const containerStyles = `
      position: absolute !important;
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      bottom: 0 !important;
      width: 1080px !important;
      height: 1080px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      padding: 80px !important;
      box-sizing: border-box !important;
    `;

    // Override text styles with proper sizing and centering
    const textStyles = `
      font-size: ${exportFontSize}px !important;
      line-height: 1.2 !important;
      text-align: center !important;
      max-width: 920px !important;
      width: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
      word-break: break-word !important;
      hyphens: auto !important;
      display: block !important;
      position: relative !important;
      color: white !important;
      font-weight: bold !important;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
      text-shadow: 2px 2px 0px #000, -2px -2px 0px #000, 2px -2px 0px #000, -2px 2px 0px #000, 0px 2px 0px #000, 2px 0px 0px #000, 0px -2px 0px #000, -2px 0px 0px #000 !important;
    `;

    // Apply export styles
    textContainer.setAttribute('style', containerStyles);
    textElement.setAttribute('style', textStyles);

    // Wait for styles to be applied
    await new Promise(resolve => setTimeout(resolve, 500));

    const dataUrl = await toPng(element, {
      quality: 1.0,
      width: 1080,
      height: 1080,
      pixelRatio: 2,
      cacheBust: true,
      backgroundColor: 'transparent',
      style: {
        transform: 'scale(1)',
        transformOrigin: 'top left',
        width: '1080px',
        height: '1080px',
        position: 'relative',
        display: 'block',
        overflow: 'hidden',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      },
      filter: (node) => {
        // Ensure node is an Element before accessing properties
        if (!(node instanceof Element)) {
          return true;
        }
        
        // Exclude UI overlay elements (edit buttons, status indicators)
        if (node.classList && (
          node.classList.contains('ui-overlay') || 
          node.classList.contains('export-exclude')
        )) {
          return false;
        }
        // Exclude edit elements (textarea when editing)
        if (node.classList && node.classList.contains('edit-element')) {
          return false;
        }
        return true;
      }
    });
    
    return dataUrl;
  } catch (error) {
    console.error('Error generating image:', error);
    throw error;
  } finally {
    // Restore original styles
    textContainer.className = originalContainerClassName;
    if (originalContainerStyle) {
      textContainer.setAttribute('style', originalContainerStyle);
    } else {
      textContainer.removeAttribute('style');
    }
    
    textElement.className = originalTextClassName;
    if (originalTextStyle) {
      textElement.setAttribute('style', originalTextStyle);
    } else {
      textElement.removeAttribute('style');
    }
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