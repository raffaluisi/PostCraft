import React from 'react';
import { Instagram, Upload, Calendar, Star, Settings } from 'lucide-react';

interface HeaderProps {
  onUploadClick: () => void;
  onConfigClick: () => void;
  totalPosts: number;
  approvedPosts: number;
  favoritedPosts: number;
}

const Header: React.FC<HeaderProps> = ({ 
  onUploadClick, 
  onConfigClick,
  totalPosts, 
  approvedPosts, 
  favoritedPosts 
}) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <Instagram className="h-8 w-8 text-pink-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Post Manager</h1>
              <p className="text-sm text-gray-500 hidden sm:block">
                Create, edit, and schedule Instagram posts
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="hidden md:flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-600">
                {totalPosts} Posts
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">
                {approvedPosts} Approved
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <span className="text-sm text-gray-600">
                {favoritedPosts} Favorited
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onConfigClick}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </button>
            
            <button
              onClick={onUploadClick}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Upload className="w-4 h-4" />
              <span>Upload JSON</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;