
import { useState } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { IPost, TComment } from '@/types/types';
import {
  useLikePostMutation,
  useRemoveLikePostMutation,
  useDislikePostMutation,
  useRemoveDislikePostMutation,
  useCommentMutation,
} from '@/redux/features/posts/postApi';

interface PostCardProps {
  post: IPost;
}

export default function PostCard({ post }: PostCardProps) {

  const {
    postImage,
    creatorName,
    creatorPhoto,
    postTopics,
    postText,
    reactions,
    comments: initialComments,
    _id,
    createdAt: time
  } = post;


  const { user } = useSelector((state: RootState) => state.user);

  const [likePost, { isLoading: isLiking }] = useLikePostMutation();
  const [removeLikePost, { isLoading: isRemovingLike }] = useRemoveLikePostMutation();
  const [dislikePost, { isLoading: isDisliking }] = useDislikePostMutation();
  const [removeDislikePost, { isLoading: isRemovingDislike }] = useRemoveDislikePostMutation();
  const [commentPost, { isLoading: isCommenting }] = useCommentMutation();

  const [commentText, setCommentText] = useState('');

  const userId = user?._id ?? '';
  const hasInitiallyLiked = reactions.likes.by.includes(userId);
  const hasInitiallyDisliked = reactions.dislikes.by.includes(userId);

  const [hasLiked, setHasLiked] = useState(hasInitiallyLiked);
  const [hasDisliked, setHasDisliked] = useState(hasInitiallyDisliked);
  const [comments, setComments] = useState<TComment[]>(initialComments);

  const handleLikeToggle = async () => {
    try {
      if (!_id) return;
      if (hasLiked) {
        setHasLiked(false);
        await removeLikePost(_id).unwrap();
      } else {
        setHasLiked(true);
        setHasDisliked(false);
        if (hasDisliked) {
          await removeDislikePost(_id).unwrap();
        }
        await likePost(_id).unwrap();
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      setHasLiked(hasInitiallyLiked);
    }
  };

  const handleDislikeToggle = async () => {
    try {
      if (!_id) return;
      if (hasDisliked) {
        setHasDisliked(false);
        await removeDislikePost(_id).unwrap();
      } else {
        setHasDisliked(true);
        setHasLiked(false);
        if (hasLiked) {
          await removeLikePost(_id).unwrap();
        }
        await dislikePost(_id).unwrap();
      }
    } catch (error) {
      console.error('Error toggling dislike:', error);
      setHasDisliked(hasInitiallyDisliked);
    }
  };

  const handleCommentSubmit = async () => {
    if (!commentText.trim() || !_id || !user) return;
    try {
      await commentPost({ postId: _id, commentText }).unwrap();

      const newComment: TComment = {
        commenterName: user.name,
        commenterId: user._id,
        commentText: commentText.trim(),
      };
      setComments((prev) => [...prev, newComment]);
      setCommentText('');
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md max-w-4xl mx-auto mb-4">
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
          <p className="font-semibold text-green-800 text-lg">{creatorName}</p>
          <p className="text-sm">{time.slice(0,10)}</p>
        </div>
      </div>

      {/* Post Text */}
      <p className="text-gray-700 my-5 text-lg font-semibold">{postText}</p>

      {/* Post Tags */}
      <div className="flex flex-wrap gap-2 mb-3">
        {postTopics && postTopics.length > 0 ? (
          postTopics.map((topic, index) => (
            <span
              key={index}
              className="bg-gray-100 text-gray-900 text-sm px-2 rounded-full border border-teal-600 font-medium"
            >
              #{topic}
            </span>
          ))
        ) : (
          <span className="text-sm text-gray-500">No topics</span>
        )}
      </div>

      {/* Post Image */}
      {postImage && (
        <div className="mb-3">
          <img
            src={postImage}
            alt="Post image"
            className="w-full h-84 object-cover rounded-md"
          />
        </div>
      )}

      {/* Reactions */}
      <div className="flex gap-4 mb-3 items-center">
        <button
          onClick={handleLikeToggle}
          disabled={isLiking || isRemovingLike || isDisliking || isRemovingDislike}
          className={`flex items-center gap-1 ${
            hasLiked ? 'text-green-700' : 'text-gray-600'
          } hover:text-green-900 transition`}
        >
          {hasLiked ? (
            <ThumbsUp fill="currentColor" className="w-5 h-5" />
          ) : (
            <ThumbsUp className="w-5 h-5" />
          )}
          <span className="text-sm">
            {reactions.likes.count +
              (hasLiked !== hasInitiallyLiked ? (hasLiked ? 1 : -1) : 0)}
          </span>
        </button>

        <button
          onClick={handleDislikeToggle}
          disabled={isLiking || isRemovingLike || isDisliking || isRemovingDislike}
          className={`flex items-center gap-1 ${
            hasDisliked ? 'text-red-600' : 'text-gray-600'
          } hover:text-red-800 transition`}
        >
          {hasDisliked ? (
            <ThumbsDown fill="currentColor" className="w-5 h-5" />
          ) : (
            <ThumbsDown className="w-5 h-5" />
          )}
          <span className="text-sm">
            {reactions.dislikes.count +
              (hasDisliked !== hasInitiallyDisliked ? (hasDisliked ? 1 : -1) : 0)}
          </span>
        </button>
      </div>

      {/* Comments */}
      <div className="border-t border-gray-200 pt-2">
        <p className="font-semibold text-green-800 mb-2">Comments</p>
        {comments.length === 0 ? (
          <p className="text-sm text-gray-500">No comments yet.</p>
        ) : (
          comments.map((comment, idx) => (
            <div key={idx} className="mb-2 border-l-2 border-gray-400 pl-2">
              <p className="font-semibold text-gray-700">{comment.commenterName}</p>
              <p className="text-gray-600">{comment.commentText}</p>
            </div>
          ))
        )}
      </div>

      {/* Comment Input */}
      <div className="mt-5">
        <input
          type="text"
          placeholder="Write a comment"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          disabled={isCommenting}
          className="border border-gray-200 focus:outline-green-800 w-full h-10 rounded-md px-2"
        />
        <div className="flex justify-end">
          <button
            onClick={handleCommentSubmit}
            disabled={isCommenting || !commentText.trim()}
            className="bg-green-800 text-white p-2 rounded-lg mt-2 disabled:opacity-50"
          >
            {isCommenting ? 'Posting...' : 'Comment'}
          </button>
        </div>
      </div>
    </div>
  );
}