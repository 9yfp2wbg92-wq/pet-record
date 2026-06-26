import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { User, PawPrint, Users, Cake, Home, Calendar, Copy, Check, Key, Plus, Settings, LogOut, Camera, Edit3, Trash2, X, ChevronRight, MoreVertical, Share2 } from 'lucide-react';
import { usePetStore } from '../hooks/usePetStore';
import { petCategoryIcons, petCategoryEmoji, getCategoryIcon } from '../components/IllustratedIcon';
import { getPetColor } from '../utils/petColors';
import { calculateDaysAtHome, calculateAge } from '../utils/breedData';

const CATEGORIES = Object.entries(petCategoryIcons).map(([id, { label }]) => ({ id, name: label, emoji: petCategoryEmoji[id] || "🐾" })).filter(c => c.id !== 'other_pet');

const GENDERS = [
 { id: 'female', name: '妹妹', emoji: '♀' },
 { id: 'male', name: '弟弟', emoji: '♂' },
 { id: 'unknown', name: '未知', emoji: '?' },
];

const getPetBreedDisplay = (pet: any) => {
 if (pet.customBreed) return pet.customBreed;
 const cat = CATEGORIES.find(c => c.id === pet.categoryId);
 return cat ? cat.name : '其他宝贝';
};

const getPetEmoji = (pet: any) => {
 const cat = CATEGORIES.find(c => c.id === pet.categoryId);
 return cat ? cat.emoji : '🐾';
};

const getPetAge = (pet: any) => {
 const age = calculateAge(pet.birthDateType, pet.birthDate, pet.birthYear, pet.birthMonth);
 if (!age) return '年龄未知';
 if (age.years > 0) {
  return `${age.years}岁${age.months > 0 ? `${age.months}月` : ''}`;
 }
 return `${age.months}个月`;
};

export function Profile() {
 const navigate = useNavigate();
 const [searchParams, setSearchParams] = useSearchParams();
 const { pets, currentUser, setCurrentPetId, deletePet, sharePet, joinPetByInviteCode, logout, updatePet, addPet } = usePetStore();
 const [showJoinModal, setShowJoinModal] = useState(false);
 const [editingPet, setEditingPet] = useState<any>(null);
 const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
 const [showAddForm, setShowAddForm] = useState(false);
 const [showPetMenu, setShowPetMenu] = useState<string | null>(null);
 const [showSettingsMenu, setShowSettingsMenu] = useState(false);
 const [showInviteCodeModal, setShowInviteCodeModal] = useState<string | null>(null);
 const [generatedInviteCode, setGeneratedInviteCode] = useState<string>('');
 const [copiedCode, setCopiedCode] = useState<boolean>(false);
 const [inviteCodeInput, setInviteCodeInput] = useState('');

 const [formData, setFormData] = useState({
  avatar: '',
  name: '',
  gender: 'unknown' as 'female' | 'male' | 'unknown',
  categoryId: 'cat',
  customBreed: '',
  birthDateType: 'exact' as 'exact' | 'estimated' | 'unknown',
  birthDate: new Date().toISOString().split('T')[0],
  birthYear: '',
  birthMonth: '',
  homeDate: new Date().toISOString().split('T')[0],
 });

 const [editFormData, setEditFormData] = useState<any>(null);

 useEffect(() => {
  if (searchParams.get('add') === 'true') {
   setShowAddForm(true);
   setSearchParams({});
  }
 }, []);

 const handleStartEdit = (pet: any) => {
  setEditingPet(pet);
  setEditFormData({
   avatar: pet.avatar || '',
   name: pet.name,
   gender: pet.gender || 'unknown',
   categoryId: pet.categoryId,
   customBreed: pet.customBreed || '',
   birthDateType: pet.birthDateType || 'unknown',
   birthDate: pet.birthDate || '',
   birthYear: pet.birthYear || '',
   birthMonth: pet.birthMonth || '',
   homeDate: pet.homeDate,
  });
  setShowPetMenu(null);
 };

 const handleSaveEdit = () => {
  if (!editingPet || !editFormData) return;
  updatePet({
   ...editingPet,
   avatar: editFormData.avatar || undefined,
   name: editFormData.name,
   gender: editFormData.gender,
   categoryId: editFormData.categoryId,
   customBreed: editFormData.customBreed || undefined,
   birthDateType: editFormData.birthDateType,
   birthDate: editFormData.birthDateType === 'exact' ? editFormData.birthDate : undefined,
   birthYear: editFormData.birthDateType === 'estimated' ? editFormData.birthYear : undefined,
   birthMonth: editFormData.birthDateType === 'estimated' ? editFormData.birthMonth : undefined,
   homeDate: editFormData.homeDate,
  });
  setEditingPet(null);
  setEditFormData(null);
 };

 const handleDeletePet = (petId: string) => {
  deletePet(petId);
  setShowDeleteConfirm(null);
 };

 const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean = false) => {
  const file = e.target.files?.[0];
  if (file) {
   const reader = new FileReader();
   reader.onload = (event) => {
    const avatar = event.target?.result as string;
    if (isEdit && editFormData) {
     setEditFormData((prev: any) => ({ ...prev, avatar }));
    } else {
     setFormData(prev => ({ ...prev, avatar }));
    }
   };
   reader.readAsDataURL(file);
  }
 };

 const handleAddSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  // 检查必填字段
  const missingFields: string[] = [];
  if (!formData.name.trim()) missingFields.push('宠物名字');
  if (!formData.homeDate) missingFields.push('到家日期');

  if (missingFields.length > 0) {
   alert(`请填写${missingFields.join('和')}`);
   return;
  }

  const newPet = addPet({
   name: formData.name.trim(),
   categoryId: formData.categoryId,
   customBreed: formData.customBreed || undefined,
   gender: formData.gender,
   avatar: formData.avatar || undefined,
   homeDate: formData.homeDate,
   birthDateType: formData.birthDateType,
   birthDate: formData.birthDateType === 'exact' ? formData.birthDate : undefined,
   birthYear: formData.birthDateType === 'estimated' ? formData.birthYear : undefined,
   birthMonth: formData.birthDateType === 'estimated' ? formData.birthMonth : undefined,
  });

  setCurrentPetId(newPet.id);
  setShowAddForm(false);
  setFormData({
   avatar: '',
   name: '',
   gender: 'unknown',
   categoryId: 'cat',
   customBreed: '',
   birthDateType: 'exact',
   birthDate: new Date().toISOString().split('T')[0],
   birthYear: '',
   birthMonth: '',
   homeDate: new Date().toISOString().split('T')[0],
  });
 };

 const handleJoinByInvite = () => {
  const code = inviteCodeInput.trim().toUpperCase();
  if (!code) return;

  const pet = joinPetByInviteCode(code);
  if (pet) {
   setShowJoinModal(false);
   setInviteCodeInput('');
   alert(`成功加入 ${pet.name} 的家庭！`);
  } else {
   alert('邀请码无效，请检查后重试');
  }
 };

 const handleShowInviteCode = (petId: string) => {
  const code = sharePet(petId);
  setGeneratedInviteCode(code);
  setShowInviteCodeModal(petId);
 };

 const handleCopyInviteCode = () => {
  navigator.clipboard.writeText(generatedInviteCode);
  setCopiedCode(true);
  setTimeout(() => {
   setCopiedCode(false);
   setShowInviteCodeModal(null);
  }, 1500);
 };

 const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', {
   year: 'numeric',
   month: 'long',
   day: 'numeric',
  });
 };

 return (
  <div className="pb-4">
   {/* Header */}
   <div className="bg-surface border-b border-paper-300 sticky top-0 z-40">
    <div className="max-w-md mx-auto px-4 py-4">
     <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
       <div className="w-10 h-10 rounded-3xl bg-paper-200 flex items-center justify-center">
        <PawPrint className="w-5 h-5 text-paper-600" />
       </div>
       <div>
        <h1 className="text-xl font-bold text-text-primary">我的</h1>
        <p className="text-sm text-text-muted">管理宝贝和账户</p>
       </div>
      </div>

      <div className="relative">
       <button
        onClick={() => setShowSettingsMenu(!showSettingsMenu)}
        className="p-2 hover:bg-paper-200 rounded-2xl transition-colors"
        title="设置"
       >
        <MoreVertical className="w-5 h-5 text-text-muted" />
       </button>

       {showSettingsMenu && (
        <div className="absolute right-0 top-full mt-2 w-44 bg-surface rounded-3xl shadow-float border-2 border-paper-300 overflow-hidden z-50 animate-slide-down">
         <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors"
         >
          <LogOut className="w-4 h-4 text-red-500" />
          <span className="text-sm font-medium text-red-500">退出登录</span>
         </button>
        </div>
       )}
      </div>
     </div>
    </div>
   </div>

   <div className="max-w-md mx-auto px-4 py-6 space-y-6">
    {/* 我的宝贝 */}
    <section>
     <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
       <PawPrint className="w-5 h-5 text-paper-500" strokeWidth={2} /> 我的宝贝
      </h2>
      <button
       onClick={() => setShowAddForm(true)}
       className="flex items-center gap-1.5 text-sm font-semibold text-paper-700 hover:text-paper-900 transition-colors"
      >
       <Plus className="w-4 h-4" />
       添加宝贝
      </button>
     </div>

     {pets.length === 0 ? (
      <div className="bg-surface rounded-2xl p-8 text-center border-2 border-paper-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
       <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-paper-200 flex items-center justify-center">
        <PawPrint className="w-10 h-10 text-paper-400" />
       </div>
       <p className="text-text-secondary font-medium">还没有添加宝贝</p>
       <p className="text-text-muted text-sm mt-1">点击上方按钮添加你的第一个宝贝</p>
      </div>
     ) : (
      <div className="space-y-3">
       {pets.map((pet, idx) => {
         const pColor = getPetColor(idx);
         return (
        <div
         key={pet.id}
         className={`bg-surface rounded-2xl p-4 border-2 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-shadow ${pColor.border}`}
        >
         {editingPet?.id === pet.id ? (
          <div className="space-y-4">
           <div className="flex items-center justify-between">
            <h3 className="font-bold text-text-primary">编辑宝贝信息</h3>
            <button
             onClick={() => {
              setEditingPet(null);
              setEditFormData(null);
             }}
             className="p-2 hover:bg-paper-200 rounded-full transition-colors"
            >
             <X className="w-5 h-5 text-text-muted" />
            </button>
           </div>

           <div className="flex flex-col items-center">
            <div className="relative">
             {editFormData?.avatar ? (
              <img src={editFormData.avatar} alt="宠物头像" className="w-20 h-20 rounded-3xl object-cover ring-4 ring-neutral-200" />
             ) : (
              <div className="w-20 h-20 rounded-3xl bg-paper-200 flex items-center justify-center">
               <PawPrint className="w-10 h-10 text-paper-400" />
              </div>
             )}
             <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-paper-800 text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-paper-700 transition-all shadow-card">
              <Camera className="w-4 h-4" />
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, true)} />
             </label>
            </div>
            <p className="text-xs text-text-muted mt-2">点击修改头像</p>
           </div>

           <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">姓名</label>
            <input type="text" value={editFormData?.name || ''} onChange={(e) => setEditFormData((prev: any) => ({ ...prev, name: e.target.value }))}
             className="w-full px-3 py-2.5 bg-paper-100 border-2 border-paper-300 rounded-2xl text-sm outline-none focus:border-paper-500 focus:ring-4 focus:ring-paper-200 transition-all" />
           </div>

           <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">性别</label>
            <div className="grid grid-cols-3 gap-2">
             {GENDERS.map(g => (
              <button key={g.id} type="button" onClick={() => setEditFormData((prev: any) => ({ ...prev, gender: g.id }))}
               className={`py-2.5 rounded-2xl text-sm font-medium transition-all ${
                editFormData?.gender === g.id
                 ? 'bg-paper-800 text-white shadow-card'
                 : 'bg-paper-100 text-text-secondary hover:bg-paper-200'
               }`}
              >
               {g.emoji} {g.name}
              </button>
             ))}
            </div>
           </div>

           <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">种类</label>
            <select value={editFormData?.categoryId || 'cat'} onChange={(e) => setEditFormData((prev: any) => ({ ...prev, categoryId: e.target.value }))}
             className="w-full px-3 py-2.5 bg-paper-100 border-2 border-paper-300 rounded-2xl text-sm outline-none focus:border-paper-500 focus:ring-4 focus:ring-paper-200 transition-all">
             {CATEGORIES.map(c => (
              <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>
             ))}
            </select>
            {editFormData?.categoryId === 'other_pet' && (
             <input type="text" value={editFormData?.customBreed || ''} onChange={(e) => setEditFormData((prev: any) => ({ ...prev, customBreed: e.target.value }))}
              placeholder="如：乌龟、刺猬"
              className="w-full px-3 py-2.5 mt-2 bg-paper-100 border-2 border-paper-300 rounded-2xl text-sm outline-none focus:border-paper-500 transition-all" />
            )}
           </div>

           <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">出生日期</label>
            <div className="flex gap-2 mb-2">
             {(['exact', 'estimated', 'unknown'] as const).map(type => (
              <button key={type} type="button" onClick={() => setEditFormData((prev: any) => ({ ...prev, birthDateType: type }))}
               className={`flex-1 py-2 px-3 rounded-2xl text-xs font-medium transition-all ${
                editFormData?.birthDateType === type
                 ? 'bg-paper-800 text-white shadow-card'
                 : 'bg-paper-100 text-text-secondary hover:bg-paper-200'
               }`}
              >
               {type === 'exact' ? '准确日期' : type === 'estimated' ? '大概估计' : '未知'}
              </button>
             ))}
            </div>
            {editFormData?.birthDateType === 'exact' && (
             <input type="date" value={editFormData?.birthDate || ''} onChange={(e) => setEditFormData((prev: any) => ({ ...prev, birthDate: e.target.value }))}
              className="w-full px-3 py-2.5 bg-paper-100 border-2 border-paper-300 rounded-2xl text-sm outline-none focus:border-paper-500 transition-all" />
            )}
            {editFormData?.birthDateType === 'estimated' && (
             <div className="flex gap-2">
              <input type="number" value={editFormData?.birthYear || ''} onChange={(e) => setEditFormData((prev: any) => ({ ...prev, birthYear: e.target.value }))}
               placeholder="年份（如：2020）"
               className="flex-1 px-3 py-2.5 bg-paper-100 border-2 border-paper-300 rounded-2xl text-sm outline-none focus:border-paper-500 transition-all" />
              <input type="number" value={editFormData?.birthMonth || ''} onChange={(e) => setEditFormData((prev: any) => ({ ...prev, birthMonth: e.target.value }))}
               placeholder="月份（选填）" min="1" max="12"
               className="w-28 px-3 py-2.5 bg-paper-100 border-2 border-paper-300 rounded-2xl text-sm outline-none focus:border-paper-500 transition-all" />
             </div>
            )}
           </div>

           <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">到家日期</label>
            <input type="date" value={editFormData?.homeDate || ''} onChange={(e) => setEditFormData((prev: any) => ({ ...prev, homeDate: e.target.value }))}
             className="w-full px-3 py-2.5 bg-paper-100 border-2 border-paper-300 rounded-2xl text-sm outline-none focus:border-paper-500 transition-all" />
           </div>

           <div className="flex gap-3 pt-2">
            <button onClick={() => { setEditingPet(null); setEditFormData(null); }}
             className="flex-1 py-2.5 bg-paper-200 text-text-secondary rounded-2xl text-sm font-semibold hover:bg-paper-300 transition-colors">取消</button>
            <button onClick={handleSaveEdit}
             className="flex-1 py-2.5 bg-paper-900 text-white rounded-2xl text-sm font-semibold hover:bg-paper-800 transition-all shadow-card">保存</button>
           </div>
          </div>
         ) : (
          <div className="flex items-center gap-4">
           {pet.avatar ? (
            <img src={pet.avatar} alt={pet.name} className="w-16 h-16 rounded-3xl object-cover flex-shrink-0 ring-2 ring-paper-200" />
           ) : (
            <div className={`w-16 h-16 rounded-3xl flex items-center justify-center flex-shrink-0 ${pColor.bg}`}>
             <span className="text-3xl">{(() => { const cfg = getCategoryIcon(pet.categoryId); const Icon = cfg.Icon; return <Icon className={`w-10 h-10 ${pColor.text}`} strokeWidth={2} />; })()}</span>
            </div>
           )}

           <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
             <h3 className={`font-bold truncate ${pColor.text}`}>{pet.name}</h3>
             <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              pet.gender === 'male' ? 'bg-blue-50 text-blue-600' :
              pet.gender === 'female' ? 'bg-pink-50 text-pink-600' :
              'bg-paper-200 text-paper-600'
             }`}>
              {GENDERS.find(g => g.id === pet.gender)?.name || '未知'}
             </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-text-muted mb-2">
             <span className={`px-2 py-0.5 rounded-full font-medium ${pColor.bg} ${pColor.text}`}>
              {getPetBreedDisplay(pet)}
             </span>
            </div>
            <div className="flex items-center gap-2">
             <span className={`flex items-center gap-1 px-2.5 py-1 text-white text-xs font-semibold rounded-2xl shadow-card bg-gradient-to-r ${pColor.btn}`}>
              <Cake className="w-3.5 h-3.5" /> {getPetAge(pet)}
             </span>
             <span className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-2xl shadow-card ${pColor.bg} ${pColor.text}`}>
              <Home className="w-3.5 h-3.5" /> {calculateDaysAtHome(pet.homeDate)}天
             </span>
            </div>
           </div>

           <div className="flex gap-1">
            <button onClick={() => handleStartEdit(pet)}
             className="p-2 hover:bg-paper-200 rounded-2xl transition-colors" title="编辑">
             <Edit3 className="w-4 h-4 text-text-muted" />
            </button>
            <button onClick={() => setShowPetMenu(showPetMenu === pet.id ? null : pet.id)}
             className="p-2 hover:bg-paper-200 rounded-2xl transition-colors" title="更多">
             <MoreVertical className="w-4 h-4 text-text-muted" />
            </button>
           </div>
          </div>
         )}

         {showPetMenu === pet.id && !editingPet && (
          <div className="mt-3 pt-3 border-t border-paper-200 space-y-1 animate-slide-down">
           <button onClick={() => { handleShowInviteCode(pet.id); setShowPetMenu(null); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-paper-200 rounded-2xl text-sm text-text-secondary font-medium transition-colors">
            <Share2 className="w-4 h-4" /> 生成邀请码
           </button>
           <button onClick={() => { setShowDeleteConfirm(pet.id); setShowPetMenu(null); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-red-50 rounded-2xl text-sm text-red-500 font-medium transition-colors">
            <Trash2 className="w-4 h-4" /> 删除宝贝
           </button>
          </div>
         )}

         {showDeleteConfirm === pet.id && (
          <div className="mt-3 pt-3 border-t border-red-100">
           <p className="text-sm text-text-secondary mb-3">确定要删除 {pet.name} 吗？所有相关记录将被删除。</p>
           <div className="flex gap-3">
            <button onClick={() => setShowDeleteConfirm(null)}
             className="flex-1 py-2.5 bg-paper-200 text-text-secondary rounded-2xl text-sm font-semibold hover:bg-paper-300 transition-colors">取消</button>
            <button onClick={() => handleDeletePet(pet.id)}
             className="flex-1 py-2.5 bg-red-500 text-white rounded-2xl text-sm font-semibold hover:bg-red-600 transition-colors">删除</button>
           </div>
          </div>
         )}
        </div>
       );})}
      </div>
     )}
    </section>

    {/* 家庭共享 */}
    <section>
     <h2 className="text-lg font-bold text-text-primary mb-3 flex items-center gap-2">
      <Users className="w-5 h-5 text-paper-500" strokeWidth={2} /> 家庭共享
     </h2>
     <div className="bg-surface rounded-2xl border-2 border-paper-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
      <button
       onClick={() => setShowJoinModal(true)}
       className="w-full flex items-center justify-between p-4 hover:bg-paper-100 transition-colors"
      >
       <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-3xl bg-paper-200 flex items-center justify-center">
         <Key className="w-5 h-5 text-paper-600" />
        </div>
        <div className="text-left">
         <p className="font-semibold text-text-primary">加入其他家庭</p>
         <p className="text-xs text-text-muted">使用邀请码加入宝贝的家庭</p>
        </div>
       </div>
       <ChevronRight className="w-5 h-5 text-text-muted" />
      </button>
     </div>
    </section>
   </div>

   {/* 加入家庭弹窗 */}
   {showJoinModal && (
    <div className="fixed inset-0 z-[55] flex items-end justify-center">
     <div className="absolute inset-0 bg-black/50 " onClick={() => setShowJoinModal(false)} />
     <div className="relative w-full max-w-[430px] bg-surface rounded-t-3xl shadow-float p-6 pb-8 animate-slide-up">
      <div className="w-10 h-1 bg-paper-300 rounded-full mx-auto mb-4" />
      <h3 className="text-lg font-bold text-text-primary mb-2">加入其他家庭</h3>
      <p className="text-sm text-text-muted mb-4">输入家人分享的6位邀请码</p>

      <div className="space-y-4">
       <input
        type="text" value={inviteCodeInput}
        onChange={(e) => setInviteCodeInput(e.target.value.toUpperCase())}
        className="w-full px-4 py-4 bg-paper-100 border-2 border-paper-300 rounded-3xl outline-none focus:border-paper-500 focus:ring-4 focus:ring-paper-200 transition-all text-center text-2xl font-mono tracking-widest font-bold"
        placeholder="A1B2C3" maxLength={6}
       />

       <div className="flex gap-3">
        <button onClick={() => setShowJoinModal(false)}
         className="flex-1 py-3 bg-paper-200 text-text-secondary rounded-3xl font-semibold hover:bg-paper-300 transition-colors">取消</button>
        <button onClick={handleJoinByInvite} disabled={inviteCodeInput.length !== 6}
         className="flex-1 py-3 bg-paper-900 text-white rounded-3xl font-semibold hover:bg-paper-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-card">加入</button>
       </div>
      </div>
     </div>
    </div>
   )}

   {/* 邀请码显示弹窗 */}
   {showInviteCodeModal && (
    <div className="fixed inset-0 z-[55] flex items-center justify-center p-4">
     <div className="absolute inset-0 bg-black/50 " onClick={() => setShowInviteCodeModal(null)} />
     <div className="relative w-full max-w-sm bg-surface rounded-3xl shadow-float p-6 animate-scale-in">
      <div className="flex items-center justify-between mb-4">
       <h3 className="text-lg font-bold text-text-primary">邀请码</h3>
       <button onClick={() => setShowInviteCodeModal(null)} className="p-2 hover:bg-paper-200 rounded-full transition-colors">
        <X className="w-5 h-5 text-text-muted" />
       </button>
      </div>

      <p className="text-sm text-text-muted mb-4">分享此邀请码，让家人也能记录宝贝的成长</p>

      <div className="bg-paper-200 rounded-2xl p-5 text-center mb-4">
       <p className="text-3xl font-mono font-bold text-paper-800 tracking-widest">
        {generatedInviteCode}
       </p>
      </div>

      <button onClick={handleCopyInviteCode}
       className="w-full py-3.5 bg-paper-900 text-white rounded-3xl font-semibold hover:bg-paper-800 flex items-center justify-center gap-2 transition-all shadow-card">
       {copiedCode ? (
        <><Check className="w-5 h-5" /> 已复制</>
       ) : (
        <><Copy className="w-5 h-5" /> 复制邀请码</>
       )}
      </button>
     </div>
    </div>
   )}

   {/* 添加宝贝弹窗 */}
   {showAddForm && (
    <div className="fixed inset-0 z-[55] flex items-center justify-center p-4">
     <div className="absolute inset-0 bg-black/50 " onClick={() => setShowAddForm(false)} />
     <div className="relative w-full max-w-md max-h-[90vh] bg-surface rounded-3xl shadow-float overflow-y-auto animate-scale-in">
      <div className="sticky top-0 bg-surface z-10 px-6 pt-6 pb-4 border-b border-paper-200">
       <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-text-primary">添加宝贝</h3>
        <button onClick={() => setShowAddForm(false)} className="p-2 hover:bg-paper-200 rounded-full transition-colors">
         <X className="w-5 h-5 text-text-muted" />
        </button>
       </div>
      </div>

      <form onSubmit={handleAddSubmit} className="p-6 space-y-5">
       <div className="flex flex-col items-center">
        <div className="relative">
         {formData.avatar ? (
          <img src={formData.avatar} alt="宠物头像" className="w-24 h-24 rounded-3xl object-cover ring-4 ring-neutral-200" />
         ) : (
          <div className="w-24 h-24 rounded-3xl bg-paper-200 flex items-center justify-center">
           <PawPrint className="w-12 h-12 text-paper-400" />
          </div>
         )}
         <label className="absolute -bottom-2 -right-2 w-9 h-9 bg-paper-800 text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-paper-700 transition-all shadow-card">
          <Camera className="w-4 h-4" />
          <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
         </label>
        </div>
        <p className="text-sm text-text-muted mt-2">点击添加头像</p>
       </div>

       <div>
        <label className="block text-sm font-semibold text-text-primary mb-2">宠物名字 *</label>
        <input type="text" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
         className="w-full px-4 py-3 bg-paper-100 border-2 border-paper-300 rounded-3xl focus:border-paper-500 focus:ring-4 focus:ring-paper-200 outline-none transition-all"
         placeholder="给它起个名字" />
       </div>

       <div>
        <label className="block text-sm font-semibold text-text-primary mb-2">性别</label>
        <div className="grid grid-cols-3 gap-3">
         {GENDERS.map((g) => (
          <button key={g.id} type="button" onClick={() => setFormData(prev => ({ ...prev, gender: g.id as any }))}
           className={`flex items-center justify-center gap-2 py-3 rounded-3xl transition-all font-medium ${
            formData.gender === g.id
             ? 'bg-paper-800 text-white shadow-card'
             : 'bg-paper-100 hover:bg-paper-200 text-text-secondary'
           }`}
          >
           <span className="text-lg">{g.emoji}</span> <span className="text-sm">{g.name}</span>
          </button>
         ))}
        </div>
       </div>

       <div>
        <label className="block text-sm font-semibold text-text-primary mb-2">种类</label>
        <div className="grid grid-cols-5 gap-2">
         {CATEGORIES.map((cat) => (
          <button key={cat.id} type="button" onClick={() => setFormData(prev => ({ ...prev, categoryId: cat.id, customBreed: '' }))}
           className={`flex flex-col items-center p-2.5 rounded-3xl transition-all ${
            formData.categoryId === cat.id
             ? 'bg-paper-800 text-white shadow-card'
             : 'bg-paper-100 hover:bg-paper-200 text-text-secondary'
           }`}
          >
           {(() => { const cfg = getCategoryIcon(cat.id); const Icon = cfg.Icon; return <Icon className="w-6 h-6" strokeWidth={2} />; })()}
           <span className="text-xs mt-1 font-medium">{cat.name}</span>
          </button>
         ))}
        </div>
        <input type="text" value={formData.customBreed}
         onChange={(e) => setFormData(prev => ({ ...prev, customBreed: e.target.value, categoryId: 'other_pet' }))}
         className="w-full px-4 py-3 bg-paper-100 border-2 border-paper-300 rounded-3xl focus:border-paper-500 focus:ring-4 focus:ring-paper-200 outline-none transition-all mt-2"
         placeholder="其他宝贝（如：乌龟、刺猬）" />
       </div>

       <div>
        <label className="block text-sm font-semibold text-text-primary mb-2">出生日期</label>
        <div className="flex gap-2 mb-3">
         <button type="button" onClick={() => setFormData(prev => ({ ...prev, birthDateType: 'exact' }))}
          className={`flex-1 py-2.5 px-3 rounded-2xl text-sm font-medium transition-all ${formData.birthDateType === 'exact' ? 'bg-paper-800 text-white shadow-card' : 'bg-paper-100 hover:bg-paper-200 text-text-secondary'}`}>准确日期</button>
         <button type="button" onClick={() => setFormData(prev => ({ ...prev, birthDateType: 'estimated' }))}
          className={`flex-1 py-2.5 px-3 rounded-2xl text-sm font-medium transition-all ${formData.birthDateType === 'estimated' ? 'bg-paper-800 text-white shadow-card' : 'bg-paper-100 hover:bg-paper-200 text-text-secondary'}`}>大概估计</button>
         <button type="button" onClick={() => setFormData(prev => ({ ...prev, birthDateType: 'unknown' }))}
          className={`flex-1 py-2.5 px-3 rounded-2xl text-sm font-medium transition-all ${formData.birthDateType === 'unknown' ? 'bg-paper-800 text-white shadow-card' : 'bg-paper-100 hover:bg-paper-200 text-text-secondary'}`}>未知</button>
        </div>
        {formData.birthDateType === 'exact' && (
         <input type="date" value={formData.birthDate} onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
          onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.form?.requestSubmit(); }}
          className="w-full px-4 py-3 bg-paper-100 border-2 border-paper-300 rounded-3xl focus:border-paper-500 focus:ring-4 focus:ring-paper-200 outline-none transition-all" />
        )}
        {formData.birthDateType === 'estimated' && (
         <div className="flex gap-2">
          <input type="number" value={formData.birthYear} onChange={(e) => setFormData(prev => ({ ...prev, birthYear: e.target.value }))}
           className="flex-1 px-4 py-3 bg-paper-100 border-2 border-paper-300 rounded-3xl focus:border-paper-500 outline-none transition-all" placeholder="年份（如：2020）" min="1990" max={new Date().getFullYear()} />
          <input type="number" value={formData.birthMonth} onChange={(e) => setFormData(prev => ({ ...prev, birthMonth: e.target.value }))}
           className="w-28 px-4 py-3 bg-paper-100 border-2 border-paper-300 rounded-3xl focus:border-paper-500 outline-none transition-all" placeholder="月份" min="1" max="12" />
         </div>
        )}
       </div>

       <div>
        <label className="block text-sm font-semibold text-text-primary mb-2">到家日期 *</label>
        <input type="date" value={formData.homeDate} onChange={(e) => setFormData(prev => ({ ...prev, homeDate: e.target.value }))}
          onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.form?.requestSubmit(); }}
         className="w-full px-4 py-3 bg-paper-100 border-2 border-paper-300 rounded-3xl focus:border-paper-500 focus:ring-4 focus:ring-paper-200 outline-none transition-all" />
       </div>

       <div className="flex gap-3 pt-2 pb-6">
        <button type="button" onClick={() => setShowAddForm(false)}
         className="flex-1 py-3 bg-paper-200 text-text-secondary rounded-3xl font-semibold hover:bg-paper-300 transition-colors">取消</button>
        <button type="submit"
         className="flex-1 py-3 bg-paper-900 text-white rounded-3xl font-semibold hover:bg-paper-800 transition-all shadow-card">添加</button>
       </div>
      </form>
     </div>
    </div>
   )}
  </div>
 );
}
