import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { IPost } from '@/types/types';

interface PostCardProps {
  post: IPost;
}

export default function PostCard({ post }: PostCardProps) {
  const { postImage, creatorName, creatorPhoto, postTopics, postText, reactions, comments } = post;

  return (
    <div className="bg-white p-4 rounded-lg  shadow-md max-w-3xl mx-auto mb-4">
      {/* Creator Section */}
      <div className="flex items-center gap-2 mb-3">
        <img
          src={creatorPhoto || 'https://i.postimg.cc/4yq4jX4W/default-avatar.png'}
          alt={`${creatorName}'s photo`}
          width={40}
          height={40}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div>
          <p className="font-semibold text-green-800  text-lg">{creatorName}</p>
          <p className="text-sm text-gray-500">{postTopics.join(', ')}</p>
        </div>
      </div>

      {/* Post Text */}
      <p className="text-gray-700 mb-3 text-lg font-semibold">{postText}</p>

      {/* Post Image */}

        <div className="mb-3">
          <img
            src={postImage}
            alt="Post image"
            width={500}
            height={300}
            className="w-full h-84 object-cover rounded-md"
          />
        </div>


      {/* Reactions */}
      <div className="flex gap-4 mb-3">
        <div className="flex items-center gap-1">
          <ThumbsUp className="w-5 h-5 text-green-600" />
          <span className="text-sm text-gray-600">{reactions.likes.count}</span>
        </div>
        <div className="flex items-center gap-1">
          <ThumbsDown className="w-5 h-5 text-red-600" />
          <span className="text-sm text-gray-600">{reactions.dislikes.count}</span>
        </div>
      </div>

      {/* Comments */}
      <div className="border-t pt-2">
        <p className="font-semibold text-green-800 mb-2">Comments</p>
        {comments.length === 0 ? (
          <p className="text-sm text-gray-500">No comments yet.</p>
        ) : (
          comments.map((comment, idx) => (
            <div key={idx} className="mb-2 border-l-2 border-gray-400 pl-2">
              <p className=" font-semibold text-gray-700">{comment.commenterName}</p>
              <p className=" text-gray-600">{comment.commentText}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
