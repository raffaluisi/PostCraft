import React, { useState, useEffect, useRef } from 'react';
import { Settings, Instagram, Upload, X, Check, AlertCircle, Image, Video, Trash2, Eye } from 'lucide-react';
import { instagramService } from '../services/instagramApi';
import { backgroundService } from '../services/backgroundService';

interface ConfigurationPageProps {
  onClose: () => void;
}

interface UploadedMedia {
  id: string;
  url: string;
  type: 'image' | 'video';
  name: string;
  uploadedAt: Date;
}

const ConfigurationPage: React.FC<ConfigurationPageProps> = ({ onClose }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connected' | 'error'>('disconnected');
  const [userInfo, setUserInfo] = useState<any>(null);
  const [uploadedMedia, setUploadedMedia] = useState<UploadedMedia[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewMedia, setPreviewMedia] = useState<UploadedMedia | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    checkConnectionStatus();
    loadUploadedMedia();
  }, []);

  const checkConnectionStatus = async () => {
    try {
      const isConnected = await instagramService.isConnected();
      if (isConnected) {
        setConnectionStatus('connected');
        const user = await instagramService.getUserInfo();
        setUserInfo(user);
      } else {
        setConnectionStatus('disconnected');
      }
    } catch (error) {
      setConnectionStatus('error');
    }
  };

  const loadUploadedMedia = async () => {
    try {
      const media = await backgroundService.getUploadedMedia();
      setUploadedMedia(media);
    } catch (error) {
      console.error('Failed to load uploaded media:', error);
    }
  };

  const handleInstagramConnect = async () => {
    setIsConnecting(true);
    try {
      const success = await instagramService.authenticate();
      if (success) {
        setConnectionStatus('connected');
        const user = await instagramService.getUserInfo();
        setUserInfo(user);
      } else {
        setConnectionStatus('error');
      }
    } catch (error) {
      console.error('Instagram connection failed:', error);
      setConnectionStatus('error');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleInstagramDisconnect = async () => {
    try {
      await instagramService.disconnect();
      setConnectionStatus('disconnected');
      setUserInfo(null);
    } catch (error) {
      console.error('Failed to disconnect:', error);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach(handleFileUpload);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      setUploadError('Please upload only image or video files');
      return;
    }

    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      setUploadError('File size must be less than 50MB');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const uploadedFile = await backgroundService.uploadMedia(file);
      setUploadedMedia(prev => [uploadedFile, ...prev]);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteMedia = async (mediaId: string) => {
    try {
      await backgroundService.deleteMedia(mediaId);
      setUploadedMedia(prev => prev.filter(media => media.id !== mediaId));
    } catch (error) {
      console.error('Failed to delete media:', error);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      Array.from(files).forEach(handleFileUpload);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Settings className="w-6 h-6 text-gray-600" />
              <h2 className="text-2xl font-bold text-gray-900">Configuration</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Instagram Connection Section */}
          <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Instagram className="w-6 h-6 text-pink-600" />
              <h3 className="text-xl font-semibold text-gray-900">Instagram Account</h3>
            </div>

            {connectionStatus === 'connected' && userInfo ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-4 bg-white rounded-lg shadow-sm">
                  {userInfo.profile_picture_url && (
                    <img
                      src={userInfo.profile_picture_url}
                      alt="Profile"
                      className="w-12 h-12 rounded-full"
                    />
                  )}
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{userInfo.name || userInfo.username}</h4>
                    <p className="text-sm text-gray-600">@{userInfo.username}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-green-600">Connected</span>
                    </div>
                  </div>
                  <button
                    onClick={handleInstagramDisconnect}
                    className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-600">
                  Connect your Instagram Business account to schedule and publish posts directly from the app.
                </p>
                
                {connectionStatus === 'error' && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">
                      Failed to connect to Instagram. Please try again or check your account permissions.
                    </p>
                  </div>
                )}

                <button
                  onClick={handleInstagramConnect}
                  disabled={isConnecting}
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50"
                >
                  <Instagram className="w-5 h-5" />
                  <span>{isConnecting ? 'Connecting...' : 'Connect Instagram'}</span>
                </button>

                <div className="text-sm text-gray-500 space-y-1">
                  <p>• Requires Instagram Business or Creator account</p>
                  <p>• You'll be redirected to Instagram for authorization</p>
                  <p>• We only access posting permissions, not your personal data</p>
                </div>
              </div>
            )}
          </div>

          {/* Background Media Upload Section */}
          <div className="bg-gray-50 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Image className="w-6 h-6 text-gray-600" />
              <h3 className="text-xl font-semibold text-gray-900">Background Media</h3>
            </div>

            <p className="text-gray-600 mb-6">
              Upload custom images or videos to use as backgrounds for your posts. Supported formats: JPG, PNG, MP4, MOV.
            </p>

            {/* Upload Area */}
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              
              <div className="flex flex-col items-center space-y-3">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <Upload className="w-6 h-6 text-gray-400" />
                </div>
                
                <div>
                  <p className="text-gray-600">
                    Drop your media files here, or{' '}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-pink-600 hover:text-pink-700 font-medium"
                    >
                      browse
                    </button>
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Images and videos up to 50MB
                  </p>
                </div>
              </div>
            </div>

            {uploadError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{uploadError}</p>
              </div>
            )}

            {isUploading && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">Uploading media...</p>
              </div>
            )}

            {/* Uploaded Media Grid */}
            {uploadedMedia.length > 0 && (
              <div className="mt-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Uploaded Media ({uploadedMedia.length})
                </h4>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {uploadedMedia.map((media) => (
                    <div key={media.id} className="relative group">
                      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        {media.type === 'image' ? (
                          <img
                            src={media.url}
                            alt={media.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200">
                            <Video className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setPreviewMedia(media)}
                            className="p-2 bg-white rounded-full text-gray-600 hover:text-gray-800 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteMedia(media.id)}
                            className="p-2 bg-white rounded-full text-red-600 hover:text-red-800 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <p className="mt-2 text-xs text-gray-600 truncate">{media.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Media Preview Modal */}
      {previewMedia && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-60 p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setPreviewMedia(null)}
              className="absolute top-4 right-4 p-2 bg-white rounded-full text-gray-600 hover:text-gray-800 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>
            
            {previewMedia.type === 'image' ? (
              <img
                src={previewMedia.url}
                alt={previewMedia.name}
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            ) : (
              <video
                src={previewMedia.url}
                controls
                className="max-w-full max-h-full rounded-lg"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfigurationPage;