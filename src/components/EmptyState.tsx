import React from 'react';
import { Upload, FileText, Sparkles } from 'lucide-react';

interface EmptyStateProps {
  onUploadClick: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onUploadClick }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-24 h-24 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center mb-6">
        <Sparkles className="w-12 h-12 text-pink-600" />
      </div>
      
      <h2 className="text-2xl font-bold text-gray-900 mb-3">
        Ready to Create Amazing Posts?
      </h2>
      
      <p className="text-gray-600 mb-8 max-w-md">
        Upload your JSON file with post content and start managing your Instagram posts with ease. 
        Edit, schedule, and publish your content seamlessly.
      </p>

      <button
        onClick={onUploadClick}
        className="inline-flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
      >
        <Upload className="w-5 h-5" />
        <span>Upload JSON File</span>
      </button>

      <div className="mt-8 p-6 bg-gray-50 rounded-lg max-w-md">
        <div className="flex items-center space-x-2 mb-3">
          <FileText className="w-5 h-5 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Expected JSON Format</span>
        </div>
        
        <pre className="text-xs text-gray-600 bg-white p-3 rounded border overflow-x-auto">
{`[
  {
    "headline": "Your headline",
    "caption": "Your caption text",
    "hashtags": ["tag1", "tag2"]
  }
]`}
        </pre>
      </div>
    </div>
  );
};

export default EmptyState;