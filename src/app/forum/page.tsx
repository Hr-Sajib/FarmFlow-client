'use client';

import { useState } from 'react';
import PostCard from '@/components/forum/PostCard';
import { useGetPostsQuery, useCreatePostMutation } from '@/redux/features/posts/postApi';
import { Camera, Send } from 'lucide-react';
import { postImage } from '@/utils/postImage';
import { TPostTopic } from '@/types/types';

export default function PostsForumPage() {
  const { data: posts, isLoading, error } = useGetPostsQuery();
  const [createPost, { isLoading: isCreating }] = useCreatePostMutation();
  const [postText, setPostText] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [postTopics, setPostTopics] = useState<TPostTopic[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTopicChange = (topic: TPostTopic) => {
    console.log('handleTopicChange - Current postTopics:', postTopics, 'Adding/Removing:', topic);
    setPostTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
    console.log('handleTopicChange - Updated postTopics:', postTopics);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('handleSubmit - postTopics state:', postTopics);
    if (!postText.trim()) {
      setErrorMessage('Post text is required');
      console.log('handleSubmit - Error: Post text is empty');
      return;
    }
    if (postTopics.length === 0) {
      setErrorMessage('At least one topic is required');
      console.log('handleSubmit - Error: postTopics is empty:', postTopics);
      return;
    }
    try {
      let imageUrl: string | undefined;
      if (selectedImage) {
        setIsUploadingImage(true);
        console.log('handleSubmit - Starting image upload for:', selectedImage.name);
        // Comment out actual API call for testing
        imageUrl = await postImage(selectedImage);
        imageUrl = 'https://i.postimg.cc/9Q9nHyc6/field3.jpg'; // Mock URL
        console.log('handleSubmit - Image upload complete, URL:', imageUrl);
        setIsUploadingImage(false);
        if (!imageUrl) {
          setErrorMessage('Failed to upload image');
          console.log('handleSubmit - Error: Image upload failed');
          return;
        }
      }
      const payload = {
        postText: postText,
        postImage: imageUrl || undefined,
        postTopics: postTopics,
      };
      console.log('handleSubmit - createPost payload:', payload);
      // Comment out actual API call for testing
      await createPost(payload).unwrap();
      console.log('handleSubmit - createPost simulated success');
      setPostText('');
      setSelectedImage(null);
      setImagePreview(null);
      setPostTopics([]);
      setErrorMessage('');
      console.log('handleSubmit - Form reset, postTopics:', postTopics);
    } catch (err) {
      console.error('handleSubmit - Create post error:', err);
      setErrorMessage('Failed to create post');
      setIsUploadingImage(false);
    }
  };

  const availableTopics: TPostTopic[] = [
    'rice', 'potato', 'onion', 'disease', 'insect', 'fertilizer', 'irrigation',
    'weather', 'harvest', 'equipment', 'market', 'pest', 'technology',
  ];

  return (
    <div className="w-full mx-auto p-4 bg-gray-100 relative bottom-3 min-h-[100vh]">
      <div>
        <h2 className="text-3xl font-bold text-green-800 my-2">💬 Community Forum</h2>
        <p className="mb-6">Farmers can post questions, share experiences, and interact here.</p>
      </div>
      <div className="flex flex-col md:flex-row gap-5">
        {/* Left Section - Sticky */}
        <div className="w-full md:w-1/3 space-y-4 sticky top-10 self-start">
          {/* Post Creation Section */}
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-green-800 mb-2">Create a Post</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <textarea
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                placeholder="What's on your mind?"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                rows={4}
              />
              <div className="flex items-center gap-2">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Camera className="w-10 h-10 p-1 mb-1 rounded-md bg-green-100 text-green-700" />
                </label>
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-16 h-16 object-cover rounded-md"
                  />
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {availableTopics.map((topic) => (
                  <label key={topic} className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={postTopics.includes(topic)}
                      onChange={() => handleTopicChange(topic)}
                      className="form-checkbox text-green-600"
                    />
                    <span className="text-sm text-gray-700 capitalize">{topic}</span>
                  </label>
                ))}
              </div>
              {errorMessage && <p className="text-red-600 text-sm">{errorMessage}</p>}
              <button
                type="submit"
                disabled={isCreating || isUploadingImage}
                className="flex items-center gap-2 bg-green-800 font-semibold text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400"
              >
                <Send className="w-5 h-5" />
                {isCreating || isUploadingImage ? 'Posting...' : 'Post to forum'}
              </button>
            </form>
          </div>
          {/* Engagement Stats */}
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-green-800 mb-2">Forum Stats</h3>
            <p className="text-sm text-gray-600">Total Posts: {posts?.length || 0}</p>
            <p className="text-sm text-gray-600">Active Users: {new Set(posts?.map((p) => p.creatorId)).size || 0}</p>
          </div>
        </div>
        {/* Right Section - Feed */}
        <div className="w-full md:w-2/5">
          {isLoading ? (
            <p className="text-gray-600 text-center">Loading posts...</p>
          ) : error ? (
            <p className="text-red-600 text-center">
              {'status' in error && error.status === 401
                ? 'You are not authorized. Please log in.'
                : 'Failed to load posts.'}
            </p>
          ) : !posts || posts.length === 0 ? (
            <p className="text-gray-600 text-center">No posts found.</p>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard key={post._id?.toString()} post={post} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}