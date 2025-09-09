/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import { useState } from 'react';
import PostCard from '@/components/forum/PostCard';
import { useGetPostsQuery, useCreatePostMutation } from '@/redux/features/posts/postApi';
import { Camera, Send, Search } from 'lucide-react';
import { TPostTopic } from '@/types/types';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { toast } from 'react-hot-toast';

// Cloudinary upload response type
interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  [key: string]: any;
}

// Cloudinary uploader function
const uploadImageToCloudinary = async (file: File): Promise<string> => {
  try {
    if (!file) {
      throw new Error('No image file selected');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);

    console.log('uploadImageToCloudinary: Initiating upload', {
      fileName: file.name,
      fileSize: file.size,
      uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
    });

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Upload failed');
    }

    const data: CloudinaryUploadResponse = await response.json();
    console.log('uploadImageToCloudinary: Upload successful', {
      secureUrl: data.secure_url,
      publicId: data.public_id,
    });

    return data.secure_url;
  } catch (error: any) {
    console.error('uploadImageToCloudinary: Error', error.message);
    toast.error(`Failed to upload image: ${error.message}`);
    throw error;
  }
};

export default function PostsForumPage() {
  const { data: posts, isLoading, error } = useGetPostsQuery();
  const [createPost, { isLoading: isCreating }] = useCreatePostMutation();
  const { currentUser } = useSelector((state: RootState) => state.currentUser);
  const [postText, setPostText] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [postTopics, setPostTopics] = useState<TPostTopic[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'my'>('all');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      console.log('handleImageUpload: Selected file', { fileName: file.name, fileSize: file.size });
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
      toast.error('Post text is required');
      return;
    }
    if (postTopics.length === 0) {
      setErrorMessage('At least one topic is required');
      console.log('handleSubmit - Error: postTopics is empty:', postTopics);
      toast.error('At least one topic is required');
      return;
    }
    try {
      let imageUrl: string | undefined;
      if (selectedImage) {
        setIsUploadingImage(true);
        console.log('handleSubmit - Starting image upload for:', selectedImage.name);
        imageUrl = await uploadImageToCloudinary(selectedImage);
        console.log('handleSubmit - Image upload complete, URL:', imageUrl);
        setIsUploadingImage(false);
        if (!imageUrl) {
          setErrorMessage('Failed to upload image');
          console.log('handleSubmit - Error: Image upload failed');
          toast.error('Failed to upload image');
          return;
        }
      }
      const payload = {
        postText: postText,
        postImage: imageUrl || undefined,
        postTopics: postTopics,
      };
      console.log('handleSubmit - createPost payload:', payload);
      await createPost(payload).unwrap();
      console.log('handleSubmit - createPost success');
      setPostText('');
      setSelectedImage(null);
      setImagePreview(null);
      setPostTopics([]);
      setErrorMessage('');
      console.log('handleSubmit - Form reset, postTopics:', postTopics);
      toast.success('Post created successfully');
    } catch (err) {
      console.error('handleSubmit - Create post error:', err);
      setErrorMessage('Failed to create post');
      setIsUploadingImage(false);
      toast.error('Failed to create post');
    }
  };

  const availableTopics: TPostTopic[] = [
    'rice', 'potato', 'onion', 'disease', 'insect', 'fertilizer', 'irrigation',
    'weather', 'harvest', 'equipment', 'market', 'pest', 'technology',
  ];

  const filteredPosts = posts?.filter((post) => {
    const matchesSearch = post.postText.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCreator = filter === 'all' || post.creatorId?._id === currentUser?._id;
    return matchesSearch && matchesCreator;
  });

  return (
    <div className="w-full mx-auto p-4 bg-gray-100 pt-10 min-h-[100vh]">
      <div>
        <h2 className="text-3xl font-bold text-green-800 my-2">🌐 Community Forum</h2>
        <p className="mb-6">Farmers can post questions, share experiences, and interact here.</p>
      </div>
      <div className="flex flex-col md:flex-row gap-5">
        <div className="w-full md:w-1/3 space-y-4 md:sticky top-10 self-start">
          <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-[23vw]">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search posts..."
                className="w-full p-3 pl-10 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
            </div>
            <div className="w-full sm:max-w-md">
              <select
                value={filter}
                onChange={(e) => {
                  setFilter(e.target.value as 'all' | 'my');
                  toast.success(`Showing ${e.target.value === 'all' ? 'all posts' : 'your posts'}`);
                }}
                className="w-full p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-gray-700"
              >
                <option value="all">See All Posts</option>
                <option value="my">My Posts</option>
              </select>
            </div>
          </div>
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
                {isUploadingImage ? (
                  <div className="w-16 h-16 flex items-center justify-center bg-gray-200 rounded-md">
                    <div className="w-8 h-8 border-4 border-green-800 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-16 h-16 object-cover rounded-md"
                  />
                ) : null}
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
                className="flex items-center gap-2 bg-green-800 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400"
              >
                <Send className="w-5 h-5" />
                {isCreating || isUploadingImage ? 'Posting...' : 'Post to forum'}
              </button>
            </form>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-green-800 mb-2">Forum Stats</h3>
            <p className="text-sm text-gray-600">Total Posts: {posts?.length || 0}</p>
            <p className="text-sm text-gray-600">Active Users: {new Set(posts?.map((p) => p.creatorId)).size || 0}</p>
          </div>
        </div>
        <div className="w-full md:w-3/5">
          {filter === 'my' && !currentUser ? (
            <p className="text-red-600 text-center">Please log in to view your posts.</p>
          ) : isLoading ? (
            <p className="text-gray-600 text-center">Loading posts...</p>
          ) : error ? (
            <p className="text-red-600 text-center">
              {'status' in error && error.status === 401
                ? 'You are not authorized. Please log in.'
                : 'Failed to load posts.'}
            </p>
          ) : !filteredPosts || filteredPosts.length === 0 ? (
            <p className="text-gray-600 text-center">
              {searchQuery || filter === 'my' ? 'No posts match your criteria.' : 'No posts found.'}
            </p>
          ) : (
            <div className="space-y-4">
              {filteredPosts.map((post) => (
                <PostCard key={post._id?.toString()} post={post} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}