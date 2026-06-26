import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, ImagePlus, X, User, Send } from 'lucide-react';
import { usePetStore } from '../hooks/usePetStore';
import { Post, Pet } from '../types';
import { mockAIExtract, DetectedEvent } from '../utils/mockAI';

export function Home() {
 const {
  pets,
  currentPetId,
  posts,
  addPost,
  addMilestone,
  addComment,
  currentUser,
  users,
  toggleLike,
 } = usePetStore();
 const navigate = useNavigate();
 const [content, setContent] = useState('');
 const [selectedImages, setSelectedImages] = useState<string[]>([]);
 const [isAIProcessing, setIsAIProcessing] = useState(false);
 const [showAIModal, setShowAIModal] = useState(false);
 const [aiExtractedData, setAiExtractedData] = useState<any>(null);
 const [showComments, setShowComments] = useState<string | null>(null);
 const [commentTexts, setCommentTexts] = useState<Record<string, string>>({});
 const [previewImage, setPreviewImage] = useState<string | null>(null);
 const [likedPostIds, setLikedPostIds] = useState<Set<string>>(new Set());
 const fileInputRef = useRef<HTMLInputElement>(null);

 const handleImageClick = (imgUrl: string) => {
  setPreviewImage(imgUrl);
 };

 // 当 currentUser 或 posts 变化时同步点赞状态
 useEffect(() => {
  if (!currentUser) return;
  const likedIds = new Set<string>();
  posts.forEach(post => {
   if (post.likes?.some(l => l.userId === currentUser.id)) {
    likedIds.add(post.id);
   }
  });
  setLikedPostIds(prev => {
   if (prev.size === likedIds.size && [...prev].every(id => likedIds.has(id))) {
    return prev;
   }
   return likedIds;
  });
 }, [currentUser, posts]);

 const displayPet = pets.find(p => p.id === currentPetId);

 const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = e.target.files;
  if (!files) return;

  Array.from(files).slice(0, 3).forEach(file => {
   // Fix #5: 图片大小和类型校验
   const MAX_SIZE = 5 * 1024 * 1024;
   const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
   if (file.size > MAX_SIZE) { alert('图片不能超过5MB'); return; }
   if (!ALLOWED_TYPES.includes(file.type)) { alert('仅支持 JPG、PNG、WebP、GIF 格式'); return; }
   const reader = new FileReader();
   reader.onload = (event) => {
    setSelectedImages(prev => [...prev, event.target?.result as string]);
   };
   reader.readAsDataURL(file);
  });
 };

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!content.trim() && selectedImages.length === 0) return;

  // Bug #2 fix: 始终触发 AI，不再限制健康关键词
  setIsAIProcessing(true);
  await new Promise(resolve => setTimeout(resolve, 2000));

  const petNames = pets.map(p => p.name);
  const result = mockAIExtract(content, new Date().toISOString().split('T')[0], petNames);
  setAiExtractedData(result);
  setIsAIProcessing(false);

  if (result.events.length > 0) {
   setShowAIModal(true);
  } else {
   const newPost: Post = {
     id: Date.now().toString(),
     petId: currentPetId || pets[0]?.id || '',
     content,
     media: selectedImages,
     author: currentUser?.name || '我',
     createdAt: new Date().toISOString(),
     isAI: false,
     comments: [],
     likes: [],
    };
    addPost(newPost);
    resetForm();
   }
 };

 const handleAIConfirm = (selectedEvents: DetectedEvent[], selectedDate: string, selectedPetId: string) => {
  const newPost: Post = {
   id: Date.now().toString(),
   petId: selectedPetId || currentPetId || pets[0]?.id || '',
   content,
   media: selectedImages,
   author: currentUser?.name || '我',
   createdAt: new Date().toISOString(),
   isAI: true,
   comments: [],
   likes: [],
  };

  addPost(newPost);

  const eventTypeMap: Record<string, string> = {
   '疫苗': 'vaccine',
   '驱虫': 'deworm',
   '洗澡': 'bath',
   '体重': 'weight',
   '就医': 'medical',
   '异常': 'abnormal',
  };

  if (selectedPetId) {
   selectedEvents.forEach((event) => {
    addMilestone({
     petId: selectedPetId,
     type: (eventTypeMap[event.event_type] || 'other') as any,
     title: event.event_name,
     description: event.summary,
     date: selectedDate,
     icon: eventTypeMap[event.event_type] || 'other',
     metrics: event.metrics,
     isAI: true,
     reminder_interval: event.next_days_interval,
    });
   });
  }

  setShowAIModal(false);
  resetForm();
 };

 const handleAICancel = () => {
  setShowAIModal(false);
  setAiExtractedData(null);
 };

 const resetForm = () => {
  setContent('');
  setSelectedImages([]);
  if (fileInputRef.current) {
   fileInputRef.current.value = '';
  }
 };

 const handleToggleLike = (postId: string) => {
  setLikedPostIds(prev => {
   const newSet = new Set(prev);
   if (newSet.has(postId)) {
    newSet.delete(postId);
   } else {
    newSet.add(postId);
   }
   return newSet;
  });
  toggleLike(postId);
 };

 const handleAddComment = (postId: string) => {
  const text = commentTexts[postId] || '';
  if (!text.trim()) return;
  addComment(postId, {
   postId,
   content: text.trim(),
   createdAt: new Date().toISOString(),
  });
  setCommentTexts(prev => ({ ...prev, [postId]: '' }));
 };

 const filteredPosts = currentPetId
  ? posts.filter(p => p.petId === currentPetId)
  : posts;

 const sortedPosts = [...filteredPosts].sort((a, b) =>
  new Date(b.createdAt || b.timestamp || '').getTime() - new Date(a.createdAt || a.timestamp || '').getTime()
 );

 return (
  <div className="min-h-screen bg-background pb-20">
   {/* AI处理状态条 */}
   {isAIProcessing && (
    <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 h-1 ai-loading-bar" />
   )}

   {/* 发布动态区 */}
   {pets.length > 0 && (
    <div className="bg-white border-b border-neutral-200">
     <div className="max-w-md mx-auto px-4 py-4">
      <form onSubmit={handleSubmit} className="space-y-3">
       <div className="flex gap-3">
        {currentUser?.avatar ? (
         <img
          src={currentUser.avatar}
          alt={currentUser.name}
          className="w-9 h-9 rounded-2xl object-cover flex-shrink-0 ring-2 ring-neutral-100"
         />
        ) : (
         <div className="w-9 h-9 rounded-2xl bg-neutral-100 flex items-center justify-center flex-shrink-0">
          <User className="w-4 h-4 text-primary-500" />
         </div>
        )}
        <div className="flex-1 relative">
         <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full px-4 py-3 rounded-2xl border-2 border-neutral-200 focus:border-neutral-400 focus:ring-4 focus:ring-neutral-100 outline-none resize-none bg-neutral-50 text-sm placeholder:text-text-muted transition-all"
          placeholder={`${displayPet ? '记录' + displayPet.name + '的' : '分享宝贝的'}趣事或健康状况...`}
          rows={2}
         />
        </div>
       </div>

       {/* 已选图片预览 */}
       {selectedImages.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 pl-12">
         {selectedImages.map((img, index) => (
          <div key={index} className="relative flex-shrink-0 group">
           <img
            src={img}
            alt={`预览 ${index + 1}`}
            className="w-16 h-16 object-cover rounded-xl ring-1 ring-neutral-200"
           />
           <button
            type="button"
            onClick={() => setSelectedImages(prev => prev.filter((_, i) => i !== index))}
            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-text-primary/70 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
           >
            <X className="w-3 h-3" />
           </button>
          </div>
         ))}
        </div>
       )}

       <div className="flex items-center justify-between pl-12">
        <label className="flex items-center gap-2 px-3 py-2 bg-primary-50 rounded-2xl cursor-pointer hover:bg-neutral-200 transition-colors">
         <ImagePlus className="w-5 h-5 text-primary-500" />
         <span className="text-sm text-primary-600 font-medium">添加照片</span>
         <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleImageUpload}
         />
        </label>

        <button
         type="submit"
         disabled={!content.trim() && selectedImages.length === 0}
         className="px-6 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-2xl text-sm font-semibold hover:from-primary-600 hover:to-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary-200 active:scale-95"
        >
         发布
        </button>
       </div>
      </form>
     </div>
    </div>
   )}

   {/* 信息流 */}
   <div className="max-w-md mx-auto px-4 py-4 space-y-4">
    {sortedPosts.length === 0 ? (
     <div className="text-center py-16 animate-fade-in">
      <div className="w-24 h-24 mx-auto mb-4 rounded-3xl bg-neutral-100 flex items-center justify-center shadow-soft">
       <span className="text-5xl">🐾</span>
      </div>
      <p className="text-text-secondary font-medium text-lg">还没有动态</p>
      <p className="text-text-muted text-sm mt-1">发布第一条记录，记录宝贝的成长吧 ✨</p>
     </div>
    ) : (
     sortedPosts.map((post) => {
      const postPet = pets.find(p => p.id === post.petId);
      return (
       <div key={post.id} className="bg-white rounded-2xl shadow-card border border-neutral-200 overflow-hidden animate-slide-up">
        {/* 头部 */}
        <div className="px-4 py-3 flex items-center justify-between">
         <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-neutral-100 flex items-center justify-center">
           <span className="text-sm font-bold text-accent-600">
            {(post.author || '我').charAt(0)}
           </span>
          </div>
          <div>
           <p className="font-semibold text-text-primary text-sm">
            {post.author || '未知作者'}
            {postPet && (
             <span className="text-text-muted font-normal text-xs ml-1">· {postPet.name}</span>
            )}
           </p>
           <p className="text-xs text-text-muted">
            {(post.createdAt || post.timestamp) ? new Date(post.createdAt || post.timestamp || '').toLocaleString('zh-CN', {
             month: 'short',
             day: 'numeric',
             hour: '2-digit',
             minute: '2-digit',
            }) : ''}
           </p>
          </div>
         </div>
         {post.isAI && (
          <span className="px-2.5 py-1 bg-gradient-to-r from-purple-100 to-violet-100 text-purple-600 text-xs rounded-full font-medium flex items-center gap-1">
           <span>✨</span> AI归档
          </span>
         )}
        </div>

        {/* 内容 */}
        <div className="px-4 pb-3">
         <p className="text-text-primary leading-relaxed whitespace-pre-wrap">{post.content}</p>
        </div>

        {/* 图片 */}
        {post.media && post.media.length > 0 && (
         <div className={`px-4 pb-2 flex gap-1.5 flex-wrap ${post.media.length === 1 ? 'justify-start' : ''}`}>
          {post.media.map((img, index) => (
           <img
            key={index}
            src={img}
            alt={`图片 ${index + 1}`}
            className={`object-cover rounded-xl cursor-pointer hover:opacity-90 transition-opacity ${post.media.length === 1 ? 'max-w-[65%] h-36' : 'w-[calc(33.333%-4px)] aspect-square'}`}
            onClick={() => handleImageClick(img)}
           />
          ))}
         </div>
        )}

        {/* 操作栏 */}
        <div className="px-4 py-3 border-t border-neutral-100 flex items-center gap-6">
         <button
          onClick={() => handleToggleLike(post.id)}
          className={`flex items-center gap-1.5 transition-all active:scale-90 ${
           likedPostIds.has(post.id) ? 'text-red-500' : 'text-text-muted hover:text-red-400'
          }`}
         >
          <Heart className={`w-5 h-5 transition-all ${likedPostIds.has(post.id) ? 'fill-current scale-110' : ''}`} />
          <span className="text-sm">
           {post.likes && post.likes.length > 0
            ? post.likes.map(l => l.userName).join('、')
            : '赞'
           }
          </span>
         </button>
         <button
          onClick={() => setShowComments(showComments === post.id ? null : post.id)}
          className="flex items-center gap-1.5 text-text-muted hover:text-text-secondary transition-colors"
         >
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm">评论{post.comments && post.comments.length > 0 ? `(${post.comments.length})` : ''}</span>
         </button>
        </div>

        {/* 评论区 */}
        {showComments === post.id && (
         <div className="px-4 pb-3 border-t border-neutral-100 bg-neutral-50 animate-slide-down">
          <div className="space-y-3 pt-3">
           {post.comments && post.comments.length > 0 && post.comments.map((comment) => {
            const commentAuthor = users.find(u => u.id === comment.authorUserId);
            return (
             <div key={comment.id} className="flex gap-2">
              <div className="w-7 h-7 rounded-full bg-neutral-100 flex items-center justify-center flex-shrink-0">
               <span className="text-xs font-bold text-primary-600">
                {(commentAuthor?.name || '?').charAt(0)}
               </span>
              </div>
              <div className="flex-1 bg-white rounded-2xl px-3 py-2 shadow-sm">
               <div className="flex items-center gap-2 mb-0.5">
                <span className="text-sm font-semibold text-text-primary">
                 {commentAuthor?.name || '匿名'}
                </span>
                <span className="text-xs text-text-muted">
                 {comment.createdAt ? new Date(comment.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) : ''}
                </span>
               </div>
               <p className="text-sm text-text-secondary">{comment.content}</p>
              </div>
             </div>
            );
           })}
          </div>

          {/* 评论输入框 */}
          <div className="flex gap-2 mt-3">
           <input
            type="text"
            value={commentTexts[post.id] || ''}
            onChange={(e) => setCommentTexts(prev => ({ ...prev, [post.id]: e.target.value }))}
            onKeyDown={(e) => {
             if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleAddComment(post.id);
             }
            }}
            placeholder="写下评论..."
            className="flex-1 px-4 py-2.5 bg-white border border-neutral-200 rounded-full text-sm outline-none focus:border-neutral-400 focus:ring-4 focus:ring-neutral-100 transition-all"
           />
           <button
            onClick={() => handleAddComment(post.id)}
            disabled={!(commentTexts[post.id] || '').trim()}
            className="px-4 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-full text-sm font-medium hover:from-primary-600 hover:to-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
           >
            <Send className="w-4 h-4" />
           </button>
          </div>
         </div>
        )}
       </div>
      );
     })
    )}
   </div>

   {/* AI提取确认框 */}
   <AIExtractModalWrapper
    isOpen={showAIModal}
    onClose={handleAICancel}
    onConfirm={handleAIConfirm}
    data={aiExtractedData}
    pets={pets}
    currentPetId={currentPetId}
   />

   {/* 图片预览弹窗 */}
   {previewImage && (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[60] p-4 animate-fade-in" onClick={() => setPreviewImage(null)}>
     <img
      src={previewImage}
      alt="预览"
      className="max-w-[95vw] max-h-[90vh] object-contain rounded-2xl"
      onClick={(e) => e.stopPropagation()}
     />
     <button
      onClick={() => setPreviewImage(null)}
      className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
     >
      <X className="w-6 h-6 text-white" />
     </button>
    </div>
   )}
  </div>
 );
}

// AI 提取弹窗包装组件
function AIExtractModalWrapper({ isOpen, onClose, onConfirm, data, pets, currentPetId }: {
 isOpen: boolean;
 onClose: () => void;
 onConfirm: (events: DetectedEvent[], date: string, selectedPetId: string) => void;
 data: any;
 pets: Pet[];
 currentPetId: string | null;
}) {
 const [selectedEvents, setSelectedEvents] = useState<DetectedEvent[]>([]);
 const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
 const [selectedPet, setSelectedPet] = useState<string>('');
 const [nextIntervals, setNextIntervals] = useState<Record<string, number>>({});

 useEffect(() => {
  if (!isOpen || pets.length === 0) return;

  let targetPetId = '';

  if (currentPetId) {
   const currentPet = pets.find(p => p.id === currentPetId);
   if (currentPet) {
    targetPetId = currentPetId;
   }
  }

  if (!targetPetId && data?.detected_pet_name) {
   const matchedPet = pets.find(p => p.name === data.detected_pet_name);
   if (matchedPet) {
    targetPetId = matchedPet.id;
   }
  }

  if (!targetPetId) {
   targetPetId = pets[0]?.id || '';
  }

  setSelectedPet(targetPetId);
 }, [isOpen, pets, currentPetId, data?.detected_pet_name]);

 if (!isOpen || !data) return null;

 const toggleEvent = (event: DetectedEvent) => {
  setSelectedEvents(prev => {
   const exists = prev.some(e => e.event_name === event.event_name);
   if (exists) {
    return prev.filter(e => e.event_name !== event.event_name);
   } else {
    const newEvents = [...prev, event];
    setNextIntervals(prev2 => ({ ...prev2, [event.event_name]: event.next_days_interval || 30 }));
    return newEvents;
   }
  });
 };

 const handleConfirm = () => {
  if (!selectedPet) {
   alert('请选择宠物');
   return;
  }
  const finalEvents = selectedEvents.length > 0 ? selectedEvents : data.events;
  const eventsWithInterval = finalEvents.map(e => ({
   ...e,
   next_days_interval: nextIntervals[e.event_name] || e.next_days_interval || 30,
  }));
  onConfirm(eventsWithInterval, selectedDate, selectedPet);
  setSelectedEvents([]);
 };

 return (
  <div className="fixed inset-0 z-[55] flex items-center justify-center p-4 animate-fade-in">
   <div className="absolute inset-0 bg-black/50 " onClick={onClose} />
   <div className="relative w-full max-w-md bg-white rounded-3xl shadow-float p-6 max-h-[80vh] overflow-y-auto animate-scale-in">
    <div className="flex items-center justify-between mb-4">
     <div className="flex items-center gap-2">
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center">
       <span className="text-white text-sm">✨</span>
      </div>
      <h3 className="text-lg font-bold text-text-primary">AI 智能识别</h3>
     </div>
     <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
      <X className="w-5 h-5 text-text-muted" />
     </button>
    </div>

    <p className="text-sm text-text-secondary mb-5">已识别出以下健康事件，请确认是否归档：</p>

    {/* 宠物选择 */}
    <div className="mb-4">
     <label className="block text-sm font-semibold text-text-primary mb-2">选择宠物</label>
     <select
      value={selectedPet}
      onChange={(e) => setSelectedPet(e.target.value)}
      className="w-full px-4 py-3 bg-neutral-50 border-2 border-neutral-200 rounded-2xl outline-none focus:border-neutral-400 focus:ring-4 focus:ring-neutral-100 transition-all"
     >
      {pets.length === 0 && <option value="">暂无宠物</option>}
      {pets.map((pet) => (
       <option key={pet.id} value={pet.id}>
        {pet.name} {pet.gender === 'female' ? '♀' : pet.gender === 'male' ? '♂' : ''}
       </option>
      ))}
     </select>
    </div>

    <div className="space-y-3 mb-4">
     {data.events.map((event: DetectedEvent) => (
      <div
       key={event.event_name}
       onClick={() => toggleEvent(event)}
       className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
        selectedEvents.some(e => e.event_name === event.event_name)
         ? 'border-accent-500 bg-accent-50 shadow-sm'
         : 'border-gray-200 bg-white hover:border-gray-300'
       }`}
      >
       <div className="flex items-center justify-between mb-1">
        <span className="font-semibold text-text-primary">{event.event_name}</span>
        {selectedEvents.some(e => e.event_name === event.event_name) && (
         <span className="text-xs text-accent-600 font-medium bg-accent-100 px-2 py-0.5 rounded-full">已选</span>
        )}
       </div>
       {event.summary && <p className="text-sm text-text-secondary mb-2">{event.summary}</p>}
       {['疫苗', '驱虫', '洗澡'].includes(event.event_type) && (
       <div className="mt-2 pt-2 border-t border-gray-100">
        <label className="block text-xs text-text-muted mb-1.5">下次提醒间隔（天）</label>
        <input
         type="number"
         value={nextIntervals[event.event_name] || event.next_days_interval || 30}
         onChange={(e) => {
          e.stopPropagation();
          setNextIntervals(prev => ({
           ...prev,
           [event.event_name]: parseInt(e.target.value) || 30
          }));
         }}
         onClick={(e) => e.stopPropagation()}
         className="w-full px-3 py-2 bg-white border-2 border-gray-100 rounded-xl text-sm outline-none focus:border-accent-400 focus:ring-4 focus:ring-accent-50 transition-all"
         min="1"
        />
       </div>
       )}
      </div>
     ))}
    </div>

    <div className="mb-4">
     <label className="block text-sm font-semibold text-text-primary mb-2">事件日期</label>
     <input
      type="date"
      value={selectedDate}
      onChange={(e) => setSelectedDate(e.target.value)}
      className="w-full px-4 py-3 bg-neutral-50 border-2 border-neutral-200 rounded-2xl outline-none focus:border-neutral-400 focus:ring-4 focus:ring-neutral-100 transition-all"
     />
    </div>

    <div className="flex gap-3">
     <button
      onClick={onClose}
      className="flex-1 py-3 bg-gray-100 text-text-secondary rounded-2xl font-semibold hover:bg-gray-200 transition-colors"
     >
      取消
     </button>
     <button
      onClick={handleConfirm}
      className="flex-1 py-3 bg-gradient-to-r from-accent-500 to-accent-600 text-white rounded-2xl font-semibold hover:from-accent-600 hover:to-accent-700 transition-all shadow-lg shadow-accent-200"
     >
      确认归档
     </button>
    </div>
   </div>
  </div>
 );
}
