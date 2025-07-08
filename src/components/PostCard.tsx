import React, { useState, useRef, useEffect } from 'react';
import { Heart, Check, Download, Calendar, Edit3, Hash, MessageCircle, Star, Clock } from 'lucide-react';
import { Post } from '../types';
import { downloadPostImage } from '../utils/imageGenerator';
import { instagramService } from '../services/instagramApi';

interface PostCardProps {
  post: Post;
  onUpdate: (updatedPost: Post) => void;
  onSchedule: (postId: string) => void;
  onPublish: (postId: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onUpdate, onSchedule, onPublish }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedPost, setEditedPost] = useState(post);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [fontSize, setFontSize] = useState('text-5xl');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);

  // Calculate dynamic font size based on text length and container size
  const calculateFontSize = (text: string, containerWidth: number = 320) => {
    const textLength = text.length;
    const wordsCount = text.split(' ').length;
    
    // Base font size calculation - aim for text to take up about 1/3 of the image
    let baseFontSize = Math.max(32, Math.min(80, containerWidth / (textLength * 0.8)));
    
    // Adjust for number of words (multi-line consideration)
    if (wordsCount > 3) {
      baseFontSize *= 0.8;
    }
    if (wordsCount > 6) {
      baseFontSize *= 0.8;
    }
    
    // Convert to Tailwind classes
    if (baseFontSize >= 72) return 'text-7xl';
    if (baseFontSize >= 60) return 'text-6xl';
    if (baseFontSize >= 48) return 'text-5xl';
    if (baseFontSize >= 36) return 'text-4xl';
    if (baseFontSize >= 30) return 'text-3xl';
    if (baseFontSize >= 24) return 'text-2xl';
    return 'text-xl';
  };

  // Update font size when text changes
  useEffect(() => {
    const newFontSize = calculateFontSize(post.headline);
    setFontSize(newFontSize);
  }, [post.headline]);

  const handleSave = () => {
    onUpdate(editedPost);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedPost(post);
    setIsEditing(false);
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const filename = `${post.headline.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.png`;
      await downloadPostImage(post.id, filename);
    } catch (error) {
      console.error('Failed to download image:', error);
      alert('Failed to download image. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      await onPublish(post.id);
    } catch (error) {
      console.error('Failed to publish:', error);
      alert('Failed to publish post. Please try again.');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleHeadlineChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
    
    const newText = e.target.value;
    setEditedPost({ ...editedPost, headline: newText });
    
    // Update font size dynamically while editing
    const newFontSize = calculateFontSize(newText);
    setFontSize(newFontSize);
  };

  const formatScheduledTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getTextShadowStyle = () => ({
    textShadow: '2px 2px 0px #000, -2px -2px 0px #000, 2px -2px 0px #000, -2px 2px 0px #000, 0px 2px 0px #000, 2px 0px 0px #000, 0px -2px 0px #000, -2px 0px 0px #000'
  });

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      {/* Post Visual */}
      <div className="relative">
        <div
          id={`post-${post.id}`}
          className="relative w-full h-80 bg-cover bg-center bg-no-repeat flex items-center justify-center overflow-hidden"
          style={{ 
            backgroundImage: `url(${post.backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          {/* Text container - centered and responsive */}
          <div 
            ref={textContainerRef}
            className="absolute inset-0 flex items-center justify-center p-8"
          >
            {isEditing ? (
              <textarea
                ref={textareaRef}
                value={editedPost.headline}
                onChange={handleHeadlineChange}
                className={`w-full max-w-lg text-center text-white ${fontSize} font-bold bg-transparent border-2 border-white border-dashed rounded-lg p-4 resize-none focus:outline-none focus:border-pink-400 transition-colors edit-element leading-tight`}
                style={{ 
                  minHeight: '120px',
                  ...getTextShadowStyle()
                }}
                autoFocus
              />
            ) : (
              <h2 
                className={`${fontSize} font-bold text-white text-center leading-tight break-words max-w-lg px-4`}
                style={getTextShadowStyle()}
              >
                {post.headline}
              </h2>
            )}
          </div>
        </div>

        {/* Status Indicators - positioned absolutely to avoid export */}
        <div className="absolute top-4 right-4 flex space-x-2 ui-overlay export-exclude">
          {post.favorited && (
            <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg">
              <Star className="w-4 h-4 text-white fill-current" />
            </div>
          )}
          {post.approved && (
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
              <Check className="w-4 h-4 text-white" />
            </div>
          )}
          {post.scheduledTime && (
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
              <Clock className="w-4 h-4 text-white" />
            </div>
          )}
        </div>

        {/* Edit Button - positioned absolutely to avoid export */}
        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`absolute top-4 left-4 w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-colors ui-overlay export-exclude ${
            isEditing ? 'bg-pink-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Edit3 className="w-4 h-4" />
        </button>
      </div>

      {/* Post Content */}
      <div className="p-6">
        {/* Caption */}
        <div className="mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <MessageCircle className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Caption</span>
          </div>
          {isEditing ? (
            <textarea
              value={editedPost.caption}
              onChange={(e) => setEditedPost({ ...editedPost, caption: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
              rows={3}
              placeholder="Enter your caption..."
            />
          ) : (
            <p className="text-gray-700 text-sm leading-relaxed">{post.caption}</p>
          )}
        </div>

        {/* Hashtags */}
        <div className="mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <Hash className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Hashtags</span>
          </div>
          {isEditing ? (
            <input
              type="text"
              value={editedPost.hashtags.join(' ')}
              onChange={(e) => setEditedPost({ 
                ...editedPost, 
                hashtags: e.target.value.split(' ').filter(tag => tag.trim()) 
              })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder="mindfulness meditation wellness"
            />
          ) : (
            <div className="flex flex-wrap gap-2">
              {post.hashtags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Scheduled Time */}
        {post.scheduledTime && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">
                Scheduled for {formatScheduledTime(post.scheduledTime)}
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Check className="w-4 h-4" />
                <span>Save</span>
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <span>Cancel</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onUpdate({ ...post, favorited: !post.favorited })}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  post.favorited
                    ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Star className={`w-4 h-4 ${post.favorited ? 'fill-current' : ''}`} />
                <span>Favorite</span>
              </button>

              <button
                onClick={() => onUpdate({ ...post, approved: !post.approved })}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  post.approved
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>Approve</span>
              </button>

              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{isDownloading ? 'Downloading...' : 'Download'}</span>
              </button>

              <button
                onClick={() => onSchedule(post.id)}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Calendar className="w-4 h-4" />
                <span>Schedule</span>
              </button>

              <button
                onClick={handlePublish}
                disabled={isPublishing}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50"
              >
                <span>{isPublishing ? 'Publishing...' : 'Publish Now'}</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostCard;