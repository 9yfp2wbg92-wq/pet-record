import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, ImagePlus, X, User, Send, Sparkles, PawPrint, Trash2 } from 'lucide-react';
import { getPetColor } from '../utils/petColors';
import { ScrollToTop } from '../components/ScrollToTop';
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
  deletePost,
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

  const isImageOnly = !content.trim() && selectedImages.length > 0;
  if (result.events.length > 0 || (isImageOnly && pets.length > 1)) {
   setShowAIModal(true);
  } else {
   const newPost: Post = {
     id: Date.now().toString(),
     petId: (result.detected_pet_name ? (pets.find(p => p.name === result.detected_pet_name)?.id) : null) || currentPetId || pets[0]?.id || '',
     petIds: result.detected_pet_names?.map(n => pets.find(p => p.name === n)?.id).filter(Boolean) as string[] || undefined,
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

 const handleAIConfirm = (selectedEvents: DetectedEvent[], selectedDate: string, selectedPetIds: string[]) => {
  const primaryPetId = selectedPetIds[0] || currentPetId || pets[0]?.id || '';
  const newPost: Post = {
   id: Date.now().toString(),
   petId: primaryPetId,
   petIds: selectedPetIds.length > 1 ? selectedPetIds : undefined,
   content,
   media: selectedImages,
   author: currentUser?.name || '我',
   createdAt: new Date().toISOString(),
   isAI: true,
   comments: [],
   likes: [],
  };

  addPost(newPost);

  const validTypes = new Set(['vaccine', 'deworm', 'bath', 'weight', 'medical', 'abnormal', 'neuter', 'home', 'anniversary', 'other']);
  const cnToEn: Record<string, string> = {
   '疫苗': 'vaccine', '驱虫': 'deworm', '洗澡': 'bath', '体重': 'weight',
   '就医': 'medical', '异常': 'abnormal', '绝育': 'neuter',
  };
  const toValidType = (t: string) => validTypes.has(t) ? t : (cnToEn[t] || 'other');

  // 为每只选中的宠物创建独立的大事记
  selectedPetIds.forEach(petId => {
   selectedEvents.forEach((event) => {
    const finalType = toValidType(event.event_type);
    addMilestone({
     petId: petId,
     type: finalType as any,
     title: event.event_name,
     description: event.summary,
     date: selectedDate,
     icon: finalType,
     metrics: event.metrics,
     isAI: true,
     reminder_interval: typeof event.next_days_interval === 'number' ? event.next_days_interval : 0,
    });
   });
  });

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
    <div className="bg-surface border-b border-paper-300">
     <div className="max-w-md mx-auto px-4 py-4">
      <form onSubmit={handleSubmit} className="space-y-3">
       <div className="flex gap-3">
        {currentUser?.avatar ? (
         <img
          src={currentUser.avatar}
          alt={currentUser.name}
          className="w-9 h-9 rounded-2xl object-cover flex-shrink-0 ring-2 ring-paper-200"
         />
        ) : (
         <div className="w-9 h-9 rounded-2xl bg-paper-200 flex items-center justify-center flex-shrink-0">
          <User className="w-4 h-4 text-paper-600" />
         </div>
        )}
        <div className="flex-1 relative">
         <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full px-4 py-3 rounded-2xl border-2 border-neutral-200 focus:border-neutral-400 focus:ring-4 focus:ring-paper-200 outline-none resize-none bg-paper-100 text-sm placeholder:text-text-muted transition-all"
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
        <label className="flex items-center gap-2 px-3 py-2 bg-paper-200 rounded-full cursor-pointer hover:bg-paper-300 transition-colors">
         <ImagePlus className="w-5 h-5 text-paper-600" />
         <span className="text-sm text-paper-700 font-medium">添加照片</span>
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
         className="px-6 py-2.5 bg-paper-900 text-white rounded-full text-sm font-semibold hover:bg-paper-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-card active:scale-95"
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
      <div className="w-24 h-24 mx-auto mb-4 rounded-3xl bg-paper-200 flex items-center justify-center shadow-card">
       <PawPrint className="w-12 h-12 text-paper-400" strokeWidth={2} />
      </div>
      <p className="text-text-secondary font-medium text-lg">还没有动态</p>
      <p className="text-text-muted text-sm mt-1">发布第一条记录，记录宝贝的成长吧</p>
     </div>
    ) : (
     sortedPosts.map((post) => {
      const postPet = pets.find(p => p.id === post.petId);
      return (
       <div key={post.id} className="bg-surface rounded-2xl border-2 border-paper-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] overflow-hidden animate-slide-up transition-shadow group">
        {/* 头部 */}
        <div className="px-4 py-3 flex items-center justify-between">
         <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-paper-200 flex items-center justify-center">
           <span className="text-sm font-bold text-accent-600">
            {(post.author || '我').charAt(0)}
           </span>
          </div>
          <div>
           <p className="font-semibold text-text-primary text-sm">
            {post.author || '未知作者'}
            {(post.petIds && post.petIds.length > 1
              ? post.petIds.map(pid => pets.find(p => p.id === pid)).filter(Boolean).map((p, i) => {
                  const pIdx = pets.findIndex(pt => pt.id === p!.id);
                  const pColor = getPetColor(pIdx);
                  return (
                   <span key={p!.id} className={`text-xs ml-1 px-1.5 py-0.5 rounded-full font-semibold ${pColor.bg} ${pColor.text}`}>{p!.name}</span>
                  );
                })
              : postPet && (() => {
                  const pIdx = pets.findIndex(p => p.id === postPet.id);
                  const pColor = getPetColor(pIdx);
                  return (
                   <span className={`text-xs ml-1 px-1.5 py-0.5 rounded-full font-semibold ${pColor.bg} ${pColor.text}`}>{postPet.name}</span>
                  );
                })()
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
          <span className="px-2.5 py-1 bg-purple-50 text-purple-500 text-xs rounded-full font-medium flex items-center gap-1">
           <span>✨</span> AI归档
          </span>
         )}
         <button
          onClick={(e) => { e.stopPropagation(); if (confirm('删除这条动态？')) deletePost(post.id); }}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 rounded-lg ml-auto"
          title="删除动态"
         >
          <Trash2 className="w-3.5 h-3.5 text-paper-400 hover:text-red-400" />
         </button>
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
         <div className="px-4 pb-3 border-t border-neutral-100 bg-paper-100 animate-slide-down">
          <div className="space-y-3 pt-3">
           {post.comments && post.comments.length > 0 && post.comments.map((comment) => {
            const commentAuthor = users.find(u => u.id === comment.authorUserId);
            return (
             <div key={comment.id} className="flex gap-2">
              <div className="w-7 h-7 rounded-full bg-paper-200 flex items-center justify-center flex-shrink-0">
               <span className="text-xs font-bold text-primary-600">
                {(commentAuthor?.name || '?').charAt(0)}
               </span>
              </div>
              <div className="flex-1 bg-surface rounded-2xl px-3 py-2 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
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
            className="flex-1 px-4 py-2.5 bg-surface border-2 border-paper-200 rounded-full text-sm outline-none focus:border-paper-400 focus:ring-2 focus:ring-paper-100 transition-all"
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

   <ScrollToTop />
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
 onConfirm: (events: DetectedEvent[], date: string, selectedPetIds: string[]) => void;
 data: any;
 pets: Pet[];
 currentPetId: string | null;
}) {
 const [selectedEvents, setSelectedEvents] = useState<DetectedEvent[]>([]);
 const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
 const [selectedPet, setSelectedPet] = useState<string[]>([]);
 const [nextIntervals, setNextIntervals] = useState<Record<string, number>>({});
 const [eventTypeOverrides, setEventTypeOverrides] = useState<Record<string, string>>({});

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

  setSelectedPet([targetPetId]);
  if (data?.date) { setSelectedDate(data.date); }
  setSelectedEvents([]);
  setEventTypeOverrides({});
 }, [isOpen, pets, currentPetId, data?.detected_pet_name, data?.date]);

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
  if (selectedPet.length === 0) {
   alert('请选择至少一只宠物');
   return;
  }
  const finalEvents = (selectedEvents.length > 0 ? selectedEvents : data.events).map(e => {
   const overriddenType = eventTypeOverrides[e.event_name] || e.event_type;
   const hasUserSet = Object.prototype.hasOwnProperty.call(nextIntervals, e.event_name);
   const interval = hasUserSet ? nextIntervals[e.event_name] : (e.next_days_interval || 0);
   return { ...e, event_type: overriddenType, next_days_interval: interval };
  });
  onConfirm(finalEvents, selectedDate, selectedPet);
  setSelectedEvents([]);
 };

 return (
  <div className="fixed inset-0 z-[55] flex items-center justify-center p-4 animate-fade-in">
   <div className="absolute inset-0 bg-black/50 " onClick={onClose} />
   <div className="relative w-full max-w-md bg-surface rounded-3xl shadow-float p-6 max-h-[80vh] overflow-y-auto animate-scale-in">
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

    <p className="text-sm text-text-secondary mb-5">
     {data.events.length > 0 ? '已识别出以下健康事件，请确认是否归档：' : '为图片选择宠物标签：'}
    </p>

    {/* 宠物选择 */}
	    <div className="mb-4">
	     <label className="block text-sm font-semibold text-text-primary mb-2">涉及宠物（可多选）</label>
	     <div className="flex flex-wrap gap-2">
	      {pets.map((pet, idx) => {
	       const pColor = getPetColor(idx);
	       const isSelected = selectedPet.includes(pet.id);
	       return (
	       <button
	        key={pet.id}
	        type="button"
	        onClick={() => setSelectedPet(prev => prev.includes(pet.id) ? prev.filter(id => id !== pet.id) : [...prev, pet.id])}
	        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
	         isSelected ? `bg-gradient-to-r ` + pColor.btn + ` text-white shadow-card` : pColor.bg + ` ` + pColor.text + ` border-2 border-dashed ` + pColor.border + ` hover:opacity-80`
	        }`}
	       >
	        {pet.name}
	       </button>
	      );})}
	     </div>
	    </div>
    <div className="space-y-3 mb-4">
     {data.events.map((event: DetectedEvent) => (
      <div
       key={event.event_name}
       onClick={() => toggleEvent(event)}
       className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
        selectedEvents.some(e => e.event_name === event.event_name)
         ? 'border-accent-500 bg-accent-50 shadow-sm'
         : 'border-paper-200 bg-surface hover:border-paper-300'
       }`}
      >
       <div className="flex items-center justify-between mb-1">
        <span className="font-semibold text-text-primary">{event.event_name}</span>
        {selectedEvents.some(e => e.event_name === event.event_name) && (
         <span className="text-xs text-accent-600 font-medium bg-accent-100 px-2 py-0.5 rounded-full">已选</span>
        )}
       </div>
       {event.summary && <p className="text-xs text-text-secondary mb-1.5">{event.summary}</p>}
       {(() => {
        const effectiveType = eventTypeOverrides[event.event_name] || event.event_type;
        const curInterval = nextIntervals[event.event_name];
        const storedInterval = Object.prototype.hasOwnProperty.call(nextIntervals, event.event_name) ? curInterval : (event.next_days_interval || 0);
        const hasReminder = storedInterval > 0;
        return (
       <div className="flex items-center gap-2 flex-wrap" onClick={(e) => e.stopPropagation()}>
        <select
         value={eventTypeOverrides[event.event_name] || event.event_type}
         onChange={(e) => setEventTypeOverrides(prev => ({ ...prev, [event.event_name]: e.target.value }))}
         className="px-2 py-1.5 bg-surface border-2 border-paper-200 rounded-xl text-[11px] outline-none focus:border-paper-400 transition-all flex-1 min-w-[80px]"
        >
         <option value="vaccine">疫苗</option>
         <option value="deworm">驱虫</option>
         <option value="bath">洗澡</option>
         <option value="weight">体重</option>
         <option value="medical">就医</option>
         <option value="neuter">绝育</option>
         <option value="abnormal">异常</option>
         <option value="other">其他</option>
        </select>
        <label className="flex items-center gap-1 cursor-pointer flex-shrink-0">
         <input type="checkbox" checked={hasReminder}
          onChange={(e) => { setNextIntervals(prev => ({ ...prev, [event.event_name]: e.target.checked ? (event.next_days_interval || 30) : 0 })); }}
          className="w-3.5 h-3.5 rounded accent-paper-800" />
         <span className="text-[11px] text-text-secondary">提醒</span>
        </label>
        {hasReminder && (
         <input type="number" value={storedInterval}
          onChange={(e) => { setNextIntervals(prev => ({ ...prev, [event.event_name]: Math.max(1, parseInt(e.target.value) || 30) })); }}
          className="w-14 px-1.5 py-1.5 bg-surface border-2 border-paper-200 rounded-xl text-[11px] text-center outline-none focus:border-paper-400 transition-all" min="1" />
        )}
       </div>
       );})()}
      </div>
     ))}
    </div>

    <div className="mb-4">
     <label className="block text-sm font-semibold text-text-primary mb-2">事件日期</label>
     <input
      type="date"
      value={selectedDate}
      onChange={(e) => setSelectedDate(e.target.value)}
      className="w-full px-4 py-3 bg-paper-100 border-2 border-neutral-200 rounded-2xl outline-none focus:border-neutral-400 focus:ring-4 focus:ring-paper-200 transition-all"
     />
    </div>

    <div className="flex gap-3">
     <button
      onClick={onClose}
      className="flex-1 py-3 bg-paper-200 text-text-secondary rounded-2xl font-semibold hover:bg-paper-300 transition-colors"
     >
      取消
     </button>
     <button
      onClick={handleConfirm}
      className="flex-1 py-3 bg-paper-900 text-white rounded-2xl font-semibold hover:bg-paper-800 transition-all shadow-card"
     >
      {data.events.length > 0 ? '确认归档' : '发布动态'}
     </button>
    </div>
   </div>
  </div>
 );
}
