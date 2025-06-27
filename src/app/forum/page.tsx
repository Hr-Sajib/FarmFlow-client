'use client';

import PostCard from "@/components/forum/PostCard";
import { useGetPostsQuery } from "@/redux/features/posts/postApi";

export default function PostsForumPage() {
  const { data: posts, isLoading, error } = useGetPostsQuery();

  console.log('Posts data:', posts);

  return (
    <div className="w-full mx-auto bottom-3 relative p-4 bg-gray-100">
      <h2 className="text-3xl font-bold text-green-800 mb-4">💬 Community Forum</h2>
      <p className="mb-6">Farmers can post questions, share experiences, and interact here.</p>
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
  );
}