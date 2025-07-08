import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Header from './components/Header';
import PostCard from './components/PostCard';
import FileUploader from './components/FileUploader';
import ScheduleModal from './components/ScheduleModal';
import ConfigurationPage from './components/ConfigurationPage';
import EmptyState from './components/EmptyState';
import { Post, PostUpload } from './types';
import { getBackgroundImage } from './utils/backgroundImages';
import { instagramService } from './services/instagramApi';
import { generatePostImage } from './utils/imageGenerator';
import sampleData from './data/posts_mindfulness.json';

function App() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [showUploader, setShowUploader] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showConfiguration, setShowConfiguration] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load sample data on initial load
  useEffect(() => {
    const loadSampleData = () => {
      const samplePosts: Post[] = sampleData.map((post, index) => ({
        id: uuidv4(),
        headline: post.headline,
        caption: post.caption,
        hashtags: post.hashtags,
        backgroundImage: getBackgroundImage(index),
        favorited: false,
        approved: false,
        scheduledTime: null,
        createdAt: new Date(),
      }));
      setPosts(samplePosts);
    };

    loadSampleData();
  }, []);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const connected = await instagramService.isConnected();
      setIsAuthenticated(connected);
    };
    checkAuth();
  }, []);

  // Handle Instagram OAuth callback
  useEffect(() => {
    const handleAuthCallback = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const error = urlParams.get('error');

      if (code) {
        // Send success message to parent window
        if (window.opener) {
          window.opener.postMessage({
            type: 'INSTAGRAM_AUTH_SUCCESS',
            code: code
          }, window.location.origin);
          window.close();
        }
      } else if (error) {
        // Send error message to parent window
        if (window.opener) {
          window.opener.postMessage({
            type: 'INSTAGRAM_AUTH_ERROR',
            error: error
          }, window.location.origin);
          window.close();
        }
      }
    };

    // Check if this is an auth callback
    if (window.location.pathname === '/auth/instagram/callback') {
      handleAuthCallback();
    }
  }, []);

  const handleUpload = (uploadedPosts: PostUpload[]) => {
    const newPosts: Post[] = uploadedPosts.map((post, index) => ({
      id: uuidv4(),
      headline: post.headline,
      caption: post.caption,
      hashtags: post.hashtags || [],
      backgroundImage: getBackgroundImage(posts.length + index),
      favorited: false,
      approved: false,
      scheduledTime: null,
      createdAt: new Date(),
    }));

    setPosts(prev => [...prev, ...newPosts]);
    setShowUploader(false);
  };

  const handlePostUpdate = (updatedPost: Post) => {
    setPosts(prev => 
      prev.map(post => 
        post.id === updatedPost.id ? updatedPost : post
      )
    );
  };

  const handleSchedule = (postId: string) => {
    setSelectedPostId(postId);
    setShowScheduleModal(true);
  };

  const handleScheduleConfirm = async (postId: string, scheduledTime: Date) => {
    try {
      if (!isAuthenticated) {
        alert('Please connect your Instagram account in Settings first.');
        setShowConfiguration(true);
        return;
      }

      // Generate image for the post
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      const imageUrl = await generatePostImage(postId);
      
      // Schedule the post
      await instagramService.schedulePost({
        postId,
        scheduledTime,
        imageUrl,
        caption: post.caption,
        hashtags: post.hashtags,
      });

      // Update post with scheduled time
      setPosts(prev => 
        prev.map(p => 
          p.id === postId 
            ? { ...p, scheduledTime }
            : p
        )
      );

      alert('Post scheduled successfully!');
    } catch (error) {
      console.error('Failed to schedule post:', error);
      alert(`Failed to schedule post: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handlePublish = async (postId: string) => {
    try {
      if (!isAuthenticated) {
        alert('Please connect your Instagram account in Settings first.');
        setShowConfiguration(true);
        return;
      }

      // Generate image for the post
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      const imageUrl = await generatePostImage(postId);
      
      // Publish the post
      await instagramService.publishPost({
        postId,
        imageUrl,
        caption: post.caption,
        hashtags: post.hashtags,
      });

      // Update post status
      setPosts(prev => 
        prev.map(p => 
          p.id === postId 
            ? { ...p, approved: true, scheduledTime: null }
            : p
        )
      );

      alert('Post published successfully!');
    } catch (error) {
      console.error('Failed to publish post:', error);
      alert(`Failed to publish post: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const selectedPost = posts.find(post => post.id === selectedPostId);

  const stats = {
    total: posts.length,
    approved: posts.filter(post => post.approved).length,
    favorited: posts.filter(post => post.favorited).length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onUploadClick={() => setShowUploader(true)}
        onConfigClick={() => setShowConfiguration(true)}
        totalPosts={stats.total}
        approvedPosts={stats.approved}
        favoritedPosts={stats.favorited}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {posts.length === 0 ? (
          <EmptyState onUploadClick={() => setShowUploader(true)} />
        ) : (
          <>
            {/* Filter and Sort Options */}
            <div className="mb-8 flex flex-wrap gap-4 items-center justify-between">
              <div className="flex items-center space-x-4">
                <h2 className="text-2xl font-bold text-gray-900">Your Posts</h2>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">{stats.total} posts</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>Sort by:</span>
                <select className="border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-pink-500 focus:border-transparent">
                  <option>Most Recent</option>
                  <option>Favorited</option>
                  <option>Approved</option>
                  <option>Scheduled</option>
                </select>
              </div>
            </div>

            {/* Posts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onUpdate={handlePostUpdate}
                  onSchedule={handleSchedule}
                  onPublish={handlePublish}
                />
              ))}
            </div>
          </>
        )}
      </main>

      {/* Modals */}
      {showUploader && (
        <FileUploader
          onUpload={handleUpload}
          onClose={() => setShowUploader(false)}
        />
      )}

      {showScheduleModal && selectedPost && (
        <ScheduleModal
          post={selectedPost}
          onSchedule={handleScheduleConfirm}
          onClose={() => setShowScheduleModal(false)}
        />
      )}

      {showConfiguration && (
        <ConfigurationPage
          onClose={() => setShowConfiguration(false)}
        />
      )}
    </div>
  );
}

export default App;