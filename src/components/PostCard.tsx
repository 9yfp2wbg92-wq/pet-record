import { useState } from 'react';
import { MessageCircle, Send, Camera } from 'lucide-react';
import { Post, Comment } from '../types';
import { usePetStore } from '../hooks/usePetStore';
import { getCategoryById } from '../utils/breedData';

interface PostCardProps {
 post: Post;
}

export function PostCard({ post }: PostCardProps) {
 const { pets, users, currentUser, addComment } = usePetStore();
 const pet = pets.find(p => p.id === post.petId);
 const author = users.find(u => u.id === post.authorUserId);
 const [showComments, setShowComments] = useState(false);
 const [commentText, setCommentText] = useState('');

 const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
   year: 'numeric',
   month: 'long',
   day: 'numeric',
  });
 };

 const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('zh-CN', {
   hour: '2-digit',
   minute: '2-digit',
  });
 };

 const formatCommentTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
 };

 const handleAddComment = () => {
  if (!commentText.trim()) return;
  const newComment: Omit<Comment, 'id'> = {
   postId: post.id,
   authorUserId: currentUser?.id || '',
   content: commentText.trim(),
   createdAt: new Date().toISOString(),
  };
  addComment(post.id, newComment);
  setCommentText('');
 };

 const DisplayIcon = pet ? (getCategoryById(pet.categoryId)?.icon || Camera) : Camera;

 return (
  <div className="bg-surface rounded-2xl shadow-sm border border-orange-100 mb-4 overflow-hidden animate-slide-up">
   {/* 照片在顶部 */}
   {post.media.length > 0 && (
    <div className="grid gap-1">
     {post.media.map((media, index) => (
      <img
       key={index}
       src={media}
       alt={`动态 ${index + 1}`}
       className={`w-full object-cover ${
        post.media.length === 1 ? 'aspect-[4/3]' : 'aspect-square'
       }`}
      />
     ))}
    </div>
   )}

   {/* 宠物头像和名称 + by 用户名 */}
   <div className="flex items-center gap-3 p-4 pb-2">
    {pet?.avatar ? (
     <img
      src={pet.avatar}
      alt={pet.name}
      className="w-10 h-10 rounded-full object-cover border-2 border-primary/20"
     />
    ) : (
     <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-200 to-yellow-200 flex items-center justify-center border-2 border-primary/20">
      <DisplayIcon className="w-5 h-5 text-orange-700" />
     </div>
    )}
    <div className="flex-1">
     <p className="font-semibold text-text">
      {pet?.name || '未知宠物'}
      <span className="text-text-muted font-normal"> by {author?.name || '匿名'}</span>
     </p>
     <p className="text-xs text-text-muted">
      {formatDate(post.createdAt)} {formatTime(post.createdAt)}
     </p>
    </div>
   </div>

   {/* 文字内容在照片下方 */}
   {post.content && (
    <div className="px-4 pb-3">
     <p className="text-text">{post.content}</p>
    </div>
   )}

   {/* 操作栏 */}
   <div className="px-4 py-3 flex items-center justify-between border-t border-orange-100">
    <button
     onClick={() => setShowComments(!showComments)}
     className="flex items-center gap-2 text-text-muted hover:text-primary transition-colors"
    >
     <MessageCircle className="w-5 h-5" />
     {post.comments.length > 0 && <span className="text-sm">{post.comments.length}</span>}
    </button>
   </div>

   {/* 评论区 */}
   {showComments && (
    <div className="px-4 pb-4 border-t border-orange-100 pt-3">
     {/* 评论列表 */}
     {post.comments.length > 0 && (
      <div className="space-y-3 mb-4">
       {post.comments.map((comment) => {
        const commentAuthor = users.find(u => u.id === comment.authorUserId);
        return (
         <div key={comment.id} className="flex gap-3">
          {commentAuthor?.avatar ? (
           <img
            src={commentAuthor.avatar}
            alt={commentAuthor.name}
            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
           />
          ) : (
           <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-200 to-yellow-200 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-orange-700">
             {commentAuthor?.name?.[0]?.toUpperCase() || '?'}
            </span>
           </div>
          )}
          <div className="flex-1">
           <div className="flex items-baseline gap-2">
            <span className="font-semibold text-sm text-text">
             {commentAuthor?.name || '匿名'}
            </span>
            <span className="text-xs text-text-muted">
             {formatCommentTime(comment.createdAt)}
            </span>
           </div>
           <p className="text-sm text-text mt-1">{comment.content}</p>
          </div>
         </div>
        );
       })}
      </div>
     )}

     {/* 添加评论输入框 */}
     <div className="flex gap-2">
      <input
       type="text"
       value={commentText}
       onChange={(e) => setCommentText(e.target.value)}
       onKeyDown={(e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
         e.preventDefault();
         handleAddComment();
        }
       }}
       placeholder="写下你的评论..."
       className="flex-1 px-4 py-2 rounded-full border border-orange-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-orange-50/50 text-sm"
      />
      <button
       onClick={handleAddComment}
       disabled={!commentText.trim()}
       className="p-2 bg-primary text-white rounded-full hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
       <Send className="w-5 h-5" />
      </button>
     </div>
    </div>
   )}
  </div>
 );
}
