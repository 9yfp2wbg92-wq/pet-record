import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, User, ArrowRight, Sparkles } from 'lucide-react';
import { usePetStore } from '../hooks/usePetStore';

export function Login() {
 const navigate = useNavigate();
 const { registerUser, switchUser, users } = usePetStore();
 const [name, setName] = useState('');
 const [avatar, setAvatar] = useState('');
 const [showForm, setShowForm] = useState(users.length === 0);

 const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
   const reader = new FileReader();
   reader.onload = (event) => {
    setAvatar(event.target?.result as string);
   };
   reader.readAsDataURL(file);
  }
 };

 const handleRegister = (e: React.FormEvent) => {
  e.preventDefault();
  if (!name.trim()) return;

  registerUser(name.trim(), avatar || undefined);
  navigate('/');
 };

 const handleSwitchUser = (userId: string) => {
  switchUser(userId);
  navigate('/');
 };

 return (
  <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center p-6">
   {/* 罗小黑风格 — 纯色宣纸底，无渐变无装饰 blob */}
   <div className="w-full max-w-sm relative z-10">
    {/* Logo — 用户上传的手绘风格图标 */}
    <div className="text-center mb-10">
     <div className="relative inline-block mb-6">
      <div className="w-28 h-28 rounded-full flex items-center justify-center shadow-card overflow-hidden">
       <img src="/logo.png" alt="宠记" className="w-full h-full object-cover" />
      </div>
     </div>
     {/* 标题 — 马山正毛笔手写体 */}
     <h1 className="text-6xl text-paper-900" style={{ fontFamily: '"Ma Shan Zheng", "Noto Serif SC", "STKaiti", "KaiTi", cursive', fontWeight: 400, letterSpacing: '0.15em', textShadow: '2px 2px 0 rgba(44,36,22,0.05)' }}>
      宠 记
     </h1>
     <p className="text-paper-500 text-sm mt-4 tracking-[0.25em] font-medium">
      朝夕相伴 · 岁岁留痕
     </p>
    </div>

    {/* 用户已存在时显示账号列表 */}
    {!showForm && users.length > 0 ? (
     <div className="space-y-3 animate-fade-in">
      {users.map((user) => (
       <button
        key={user.id}
        onClick={() => handleSwitchUser(user.id)}
        className="w-full flex items-center gap-4 p-4 bg-surface rounded-3xl hover:bg-surface transition-all shadow-card hover:shadow-soft border-2 border-paper-300 group"
       >
        {user.avatar ? (
         <img
          src={user.avatar}
          alt={user.name}
          className="w-14 h-14 rounded-3xl object-cover flex-shrink-0 ring-2 ring-paper-200"
         />
        ) : (
         <div className="w-14 h-14 rounded-3xl bg-paper-200 flex items-center justify-center flex-shrink-0">
          <User className="w-7 h-7 text-paper-500" />
         </div>
        )}
        <div className="text-left flex-1">
         <p className="font-semibold text-text-primary text-lg">{user.name}</p>
         <p className="text-sm text-text-muted">点击进入</p>
        </div>
        <ArrowRight className="w-5 h-5 text-text-muted group-hover:text-paper-700 group-hover:translate-x-1 transition-all" />
       </button>
      ))}

      <button
       onClick={() => setShowForm(true)}
       className="w-full py-4 text-paper-600 font-medium hover:text-paper-800 transition-colors text-center mt-4"
      >
       ＋ 创建新账号
      </button>
     </div>
    ) : (
     /* 新用户注册页面 */
     <div className="bg-surface rounded-3xl p-8 shadow-float border-2 border-paper-300 animate-scale-in">
      <h2 className="text-2xl font-bold text-text-primary mb-6 text-center">
       {users.length > 0 ? '创建新账号' : '欢迎加入宠记'}
      </h2>

      <form onSubmit={handleRegister} className="space-y-6">
       {/* 头像 */}
       <div className="flex justify-center">
        <div className="relative">
         {avatar ? (
          <img
           src={avatar}
           alt="头像预览"
           className="w-24 h-24 rounded-3xl object-cover ring-4 ring-paper-300"
          />
         ) : (
          <div className="w-24 h-24 rounded-3xl bg-paper-200 flex items-center justify-center">
           <Camera className="w-10 h-10 text-forest-400" />
          </div>
         )}
         <label className="absolute -bottom-2 -right-2 w-9 h-9 bg-paper-800 text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-paper-700 transition-colors shadow-card">
          <Camera className="w-4 h-4" />
          <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
         </label>
        </div>
       </div>

       {/* 昵称输入 */}
       <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">你的昵称</label>
        <input
         type="text"
         value={name}
         onChange={(e) => setName(e.target.value)}
         className="w-full px-5 py-3.5 bg-paper-100 border-2 border-paper-300 rounded-3xl focus:border-paper-500 focus:ring-4 focus:ring-paper-300 outline-none text-lg text-center placeholder:text-text-muted transition-all"
         placeholder="给自己起个昵称吧～"
         autoFocus
        />
       </div>

       {/* 提交按钮 */}
       <button
        type="submit"
        disabled={!name.trim()}
        className="w-full py-3.5 bg-paper-900 text-white rounded-3xl font-semibold text-lg hover:bg-paper-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-card active:scale-[0.98]"
       >
        开始记录
       </button>

       {/* 已有账号提示 */}
       {users.length > 0 && (
        <button
         type="button"
         onClick={() => setShowForm(false)}
         className="w-full py-3 text-text-secondary font-medium hover:bg-paper-200 rounded-3xl transition-colors text-center"
        >
         返回账号列表
        </button>
       )}
      </form>
     </div>
    )}
   </div>
  </div>
 );
}
