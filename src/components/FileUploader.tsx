import React, { useRef, useState } from 'react';
import { Upload, X, FileText, AlertCircle } from 'lucide-react';
import { PostUpload } from '../types';

interface FileUploaderProps {
  onUpload: (posts: PostUpload[]) => void;
  onClose: () => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onUpload, onClose }) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFile = async (file: File) => {
    if (!file.name.endsWith('.json')) {
      setError('Please upload a JSON file');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      // Validate data structure
      if (!Array.isArray(data)) {
        throw new Error('JSON must contain an array of posts');
      }

      const validPosts: PostUpload[] = data.map((post, index) => {
        if (!post.headline || !post.caption) {
          throw new Error(`Post ${index + 1} is missing required fields (headline, caption)`);
        }
        return {
          headline: post.headline,
          caption: post.caption,
          hashtags: post.hashtags || []
        };
      });

      onUpload(validPosts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse JSON file');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Upload Posts</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive 
              ? 'border-pink-500 bg-pink-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <div className="flex flex-col items-center space-y-3">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <FileText className="w-6 h-6 text-gray-400" />
            </div>
            
            <div>
              <p className="text-sm text-gray-600">
                Drop your JSON file here, or{' '}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-pink-600 hover:text-pink-700 font-medium"
                >
                  browse
                </button>
              </p>
              <p className="text-xs text-gray-400 mt-1">
                JSON files only
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {isProcessing && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">Processing file...</p>
          </div>
        )}

        <div className="mt-6 text-xs text-gray-500">
          <p className="font-medium mb-2">Expected JSON format:</p>
          <pre className="bg-gray-50 p-2 rounded text-xs overflow-x-auto">
{`[
  {
    "headline": "Your headline",
    "caption": "Your caption",
    "hashtags": ["tag1", "tag2"]
  }
]`}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default FileUploader;