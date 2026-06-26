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
   {/* 装饰性背景 */}
   <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-orange-50 to-amber-50" />
   <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary-200/30 to-transparent rounded-full -translate-y-1/2 translate-x-1/4" />
   <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-amber-200/20 to-transparent rounded-full translate-y-1/3 -translate-x-1/4" />
   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-neutral-200 to-neutral-100 rounded-full blur-3xl" />

   <div className="w-full max-w-sm relative z-10">
    {/* Logo 和标题区域 */}
    <div className="text-center mb-10">
     <div className="relative inline-block mb-6 animate-float">
      <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary-400 via-primary-500 to-amber-500 flex items-center justify-center shadow-float">
       <span className="text-5xl">🐾</span>
      </div>
      <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center">
       <Sparkles className="w-4 h-4 text-primary-500" />
      </div>
     </div>
     <h1
      className="text-5xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent"
      style={{
       fontFamily: "'Nunito', 'PingFang SC', 'Microsoft YaHei', sans-serif",
      }}
     >
      宠记
     </h1>
     <p className="text-text-secondary text-base mt-2 font-medium">
      记录宝贝成长的每一个瞬间 ✨
     </p>
    </div>

    {/* 用户已存在时显示账号列表 */}
    {!showForm && users.length > 0 ? (
     <div className="space-y-3 animate-fade-in">
      <h2 className="text-text-secondary text-sm font-medium mb-4 text-center">
       选择你的账号继续记录 👋
      </h2>
      {users.map((user) => (
       <button
        key={user.id}
        onClick={() => handleSwitchUser(user.id)}
        className="w-full flex items-center gap-4 p-4 bg-white rounded-2xl hover:bg-white transition-all shadow-card hover:shadow-soft border border-neutral-200 group"
       >
        {user.avatar ? (
         <img
          src={user.avatar}
          alt={user.name}
          className="w-14 h-14 rounded-2xl object-cover flex-shrink-0 ring-2 ring-neutral-100"
         />
        ) : (
         <div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center flex-shrink-0">
          <User className="w-7 h-7 text-primary-500" />
         </div>
        )}
        <div className="text-left flex-1">
         <p className="font-semibold text-text-primary text-lg">{user.name}</p>
         <p className="text-sm text-text-muted">点击进入</p>
        </div>
        <ArrowRight className="w-5 h-5 text-text-muted group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
       </button>
      ))}

      <button
       onClick={() => setShowForm(true)}
       className="w-full py-4 text-primary-600 font-medium hover:text-primary-700 transition-colors text-center mt-4"
      >
       ＋ 创建新账号
      </button>
     </div>
    ) : (
     /* 新用户注册页面 */
     <div className="bg-white rounded-3xl p-8 shadow-float border border-neutral-200 animate-scale-in">
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
           className="w-24 h-24 rounded-2xl object-cover ring-4 ring-neutral-200"
          />
         ) : (
          <div className="w-24 h-24 rounded-2xl bg-neutral-100 flex items-center justify-center">
           <Camera className="w-10 h-10 text-primary-400" />
          </div>
         )}
         <label className="absolute -bottom-2 -right-2 w-9 h-9 bg-primary-500 text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-primary-600 transition-colors shadow-lg">
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
         className="w-full px-5 py-3.5 bg-neutral-50 border-2 border-neutral-200 rounded-2xl focus:border-neutral-400 focus:ring-4 focus:ring-neutral-200 outline-none text-lg text-center placeholder:text-text-muted transition-all"
         placeholder="给自己起个昵称吧～"
         autoFocus
        />
       </div>

       {/* 提交按钮 */}
       <button
        type="submit"
        disabled={!name.trim()}
        className="w-full py-3.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-2xl font-semibold text-lg hover:from-primary-600 hover:to-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary-200 active:scale-[0.98]"
       >
        开始记录 🐾
       </button>

       {/* 已有账号提示 */}
       {users.length > 0 && (
        <button
         type="button"
         onClick={() => setShowForm(false)}
         className="w-full py-3 text-text-secondary font-medium hover:bg-neutral-100 rounded-2xl transition-colors text-center"
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
