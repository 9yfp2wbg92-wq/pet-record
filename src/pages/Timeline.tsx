import { useState, useEffect, useMemo } from 'react';
import { Plus, PawPrint, Edit3, X, Trash2 } from 'lucide-react';
import { usePetStore } from '../hooks/usePetStore';
import { Milestone } from '../types';

// 每个宠物分配一种主题色，方便在时间轴中区分
const PET_COLORS = [
 { bg: 'bg-rose-50', text: 'text-rose-600', dot: 'bg-rose-400', border: 'border-rose-200', ring: 'ring-rose-200', btn: 'from-rose-500 to-pink-500', btnShadow: 'shadow-rose-200' },
 { bg: 'bg-sky-50', text: 'text-sky-600', dot: 'bg-sky-400', border: 'border-sky-200', ring: 'ring-sky-200', btn: 'from-sky-500 to-blue-500', btnShadow: 'shadow-sky-200' },
 { bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-400', border: 'border-emerald-200', ring: 'ring-emerald-200', btn: 'from-emerald-500 to-teal-500', btnShadow: 'shadow-emerald-200' },
 { bg: 'bg-violet-50', text: 'text-violet-600', dot: 'bg-violet-400', border: 'border-violet-200', ring: 'ring-violet-200', btn: 'from-violet-500 to-purple-500', btnShadow: 'shadow-violet-200' },
 { bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-400', border: 'border-amber-200', ring: 'ring-amber-200', btn: 'from-amber-500 to-orange-500', btnShadow: 'shadow-amber-200' },
 { bg: 'bg-teal-50', text: 'text-teal-600', dot: 'bg-teal-400', border: 'border-teal-200', ring: 'ring-teal-200', btn: 'from-teal-500 to-cyan-500', btnShadow: 'shadow-teal-200' },
];

const filterChips: { key: string; label: string; emoji: string }[] = [
 { key: 'all', label: '全部', emoji: '📋' },
 { key: 'vaccine', label: '疫苗', emoji: '💉' },
 { key: 'deworm', label: '驱虫', emoji: '🐛' },
 { key: 'bath', label: '洗澡', emoji: '🛁' },
 { key: 'weight', label: '体重', emoji: '⚖️' },
 { key: 'medical', label: '就医', emoji: '🩺' },
 { key: 'abnormal', label: '异常', emoji: '⚠️' },
];

const eventTypeIcons: Record<string, string> = {
 vaccine: '💉', deworm: '🐛', bath: '🛁', weight: '⚖️',
 medical: '🩺', abnormal: '⚠️', home: '🏠', anniversary: '🎂', other: '📝',
};

const eventTypeLabels: Record<string, string> = {
 vaccine: '疫苗', deworm: '驱虫', bath: '洗澡', weight: '体重登记',
 medical: '就医', abnormal: '异常', home: '到家', anniversary: '纪念日', other: '其他',
};

export function Timeline() {
 const { pets, users, currentPetId, milestones, addMilestone, updateMilestone, deleteMilestone, setCurrentPetId } = usePetStore();
 const [activeFilter, setActiveFilter] = useState('all');
 const [showAddModal, setShowAddModal] = useState(false);
 const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
 const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
 const [newMilestone, setNewMilestone] = useState({
  type: 'other' as Milestone['type'],
  title: '',
  description: '',
  date: new Date().toISOString().split('T')[0],
  metrics: {},
 });

 // 给每个宠物分配颜色（按出现顺序固定）
 const petColorMap = useMemo(() => {
  const map: Record<string, typeof PET_COLORS[number]> = {};
  pets.forEach((p, i) => { map[p.id] = PET_COLORS[i % PET_COLORS.length]; });
  return map;
 }, [pets]);

 const filteredMilestones = useMemo(() => {
  const filtered = milestones
   .filter(m => {
    const petExists = pets.some(p => p.id === m.petId);
    if (!petExists) return false;
    if (!currentPetId) return true;
    return m.petId === currentPetId;
   })
   .filter(m => activeFilter === 'all' || m.type === activeFilter);

  return filtered.sort((a, b) => {
   const dateA = new Date(a.date).getTime();
   const dateB = new Date(b.date).getTime();
   if (dateA !== dateB) return dateA - dateB;
   const isAIA = a.isAI ? 1 : 0;
   const isAIB = b.isAI ? 1 : 0;
   return isAIA - isAIB;
  });
 }, [currentPetId, milestones, activeFilter, pets]);

 const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
 };

 const getMilestoneDisplayText = (milestone: Milestone) => {
  if (milestone.type === 'weight' && milestone.metrics?.weight_kg) {
   return `体重 ${milestone.metrics.weight_kg}kg`;
  }
  if (milestone.title && milestone.type !== 'home' && milestone.type !== 'anniversary') {
   return milestone.title;
  }
  return eventTypeLabels[milestone.type] || milestone.title || '事件';
 };

 const isDescriptionRedundant = (milestone: Milestone) => {
  if (!milestone.description) return true;
  const desc = milestone.description.trim();
  const title = getMilestoneDisplayText(milestone).trim();
  return desc === title || desc === eventTypeLabels[milestone.type];
 };

 const handleAddMilestone = () => {
  const targetPetId = currentPetId || pets[0]?.id;
  if (!targetPetId) return;
  addMilestone({
   petId: targetPetId,
   type: newMilestone.type,
   title: newMilestone.title || eventTypeLabels[newMilestone.type],
   description: newMilestone.description,
   date: newMilestone.date,
   icon: newMilestone.type,
   metrics: newMilestone.metrics,
   isAI: false,
  });
  setShowAddModal(false);
  setNewMilestone({
   type: 'other', title: '', description: '',
   date: new Date().toISOString().split('T')[0], metrics: {},
  });
 };

 const handleUpdateMilestone = () => {
  if (!editingMilestone) return;
  updateMilestone(editingMilestone);
  setEditingMilestone(null);
 };

 const handleDeleteMilestone = (id: string) => {
  deleteMilestone(id);
  setShowDeleteConfirm(null);
 };

 const groupedMilestones = useMemo(() => {
  const groups: { label: string; items: Milestone[] }[] = [];
  let currentLabel = '';
  let currentItems: Milestone[] = [];
  filteredMilestones.forEach((m, i) => {
   const d = new Date(m.date);
   const label = `${d.getFullYear()}年${d.getMonth() + 1}月`;
   if (label !== currentLabel) {
    if (currentItems.length > 0) groups.push({ label: currentLabel, items: currentItems });
    currentLabel = label;
    currentItems = [m];
   } else {
    currentItems.push(m);
   }
   if (i === filteredMilestones.length - 1 && currentItems.length > 0) {
    groups.push({ label: currentLabel, items: currentItems });
   }
  });
  return groups;
 }, [filteredMilestones]);

 return (
  <div className="min-h-screen bg-[#FAFAFA] pb-20">
   {/* === 顶部 === */}
   <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
    <div className="max-w-md mx-auto px-4 pt-4 pb-0">
     <div className="flex items-center justify-between mb-3">
      <h1 className="text-2xl font-extrabold text-gray-800 tracking-tight">大事年表</h1>
      <button
       onClick={() => setShowAddModal(true)}
       className="w-9 h-9 bg-gray-900 text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors active:scale-95 shadow-sm"
      >
       <Plus className="w-5 h-5" />
      </button>
     </div>

     {/* 宠物选择 — 每个宠物有自己的颜色 */}
     {pets.length > 0 && (
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-3">
       <button
        onClick={() => setCurrentPetId(null)}
        className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-[13px] font-semibold transition-all ${
         currentPetId === null
          ? 'bg-gray-800 text-white shadow-sm'
          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
        }`}
       >
        全部
       </button>
       {pets.map((pet) => {
        const colors = petColorMap[pet.id] || PET_COLORS[0];
        const isActive = currentPetId === pet.id;
        return (
         <button
          key={pet.id}
          onClick={() => setCurrentPetId(pet.id)}
          className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-semibold transition-all ${
           isActive
            ? `bg-gradient-to-r ${colors.btn} text-white shadow-sm`
            : `${colors.bg} ${colors.text} hover:opacity-80`
          }`}
         >
          <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white' : colors.dot}`} />
          {pet.name}
         </button>
        );
       })}
      </div>
     )}

     {/* 事件类型筛选 */}
     <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-3">
      {filterChips.map((chip) => (
       <button
        key={chip.key}
        onClick={() => setActiveFilter(chip.key)}
        className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[12px] font-medium whitespace-nowrap transition-all ${
         activeFilter === chip.key
          ? 'bg-gray-800 text-white shadow-sm'
          : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300'
        }`}
       >
        <span className="text-xs leading-none">{chip.emoji}</span>
        {chip.label}
       </button>
      ))}
     </div>
    </div>
   </div>

   {/* === 时间线内容 === */}
   <div className="max-w-md mx-auto px-5 py-5">
    {filteredMilestones.length === 0 ? (
     <div className="text-center py-20">
      <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
       <PawPrint className="w-10 h-10 text-gray-300" />
      </div>
      <p className="text-gray-400 font-medium">暂无记录</p>
      <p className="text-gray-300 text-sm mt-1">点击右上角 + 添加第一个事件</p>
     </div>
    ) : (
     <div className="space-y-10">
      {groupedMilestones.map((group) => (
       <div key={group.label}>
        {/* 月份标题 */}
        <div className="flex items-baseline gap-4 mb-4">
         <span className="text-[13px] font-bold text-gray-400 tracking-wider uppercase">
          {group.label}
         </span>
         <div className="flex-1 h-px bg-gray-100 translate-y-[-3px]" />
        </div>

        {/* 事件列表 */}
        <div className="space-y-3">
         {group.items.map((milestone) => {
          const pet = pets.find(p => p.id === milestone.petId);
          const colors = pet ? petColorMap[pet.id] : PET_COLORS[0];
          const author = users.find(u => u.id === milestone.authorUserId);

          return (
           <div key={milestone.id} className="flex gap-3 group/item">
            {/* 左侧时间轴：圆点 + 竖线 */}
            <div className="flex flex-col items-center pt-0.5">
             <div className={`w-3 h-3 rounded-full ${colors.dot} ring-2 ring-white shadow-sm flex-shrink-0`} />
            </div>

            {/* 卡片内容 */}
            <div className="flex-1 min-w-0 pb-1">
             {/* 日期行 */}
             <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] text-gray-400 font-medium tracking-wide">
               {formatDate(milestone.date)}
              </span>
              {/* 宠物标签 — 用宠物专属色 */}
              {pet && (
               <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${colors.bg} ${colors.text}`}>
                {pet.name}
               </span>
              )}
             </div>

             {/* 事件内容 */}
             <div className="bg-white rounded-xl border border-gray-100/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-3 hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-shadow">
              <div className="flex items-start justify-between gap-2">
               <div className="flex items-center gap-2 min-w-0">
                <span className="text-lg leading-none flex-shrink-0">
                 {eventTypeIcons[milestone.type] || '📝'}
                </span>
                <span className="text-[14px] font-semibold text-gray-800 truncate">
                 {getMilestoneDisplayText(milestone)}
                </span>
                {milestone.isAI && (
                 <span className="text-[10px] px-1.5 py-0.5 bg-purple-50 text-purple-500 rounded-full font-medium flex-shrink-0">
                  AI
                 </span>
                )}
               </div>

               {/* 操作按钮 — hover 组时显示 */}
               {milestone.type !== 'home' && milestone.type !== 'anniversary' && (
                <div className="flex gap-0.5 opacity-0 group-hover/item:opacity-100 transition-opacity flex-shrink-0 -mr-1">
                 <button
                  onClick={() => setEditingMilestone({ ...milestone })}
                  className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                 >
                  <Edit3 className="w-3 h-3 text-gray-400 hover:text-gray-600" />
                 </button>
                 <button
                  onClick={() => setShowDeleteConfirm(milestone.id)}
                  className="p-1 hover:bg-red-50 rounded-md transition-colors"
                 >
                  <Trash2 className="w-3 h-3 text-gray-400 hover:text-red-400" />
                 </button>
                </div>
               )}
              </div>

              {/* 描述（去重） */}
              {!isDescriptionRedundant(milestone) && (
               <p className="text-[12px] text-gray-500 mt-1.5 leading-relaxed">
                {milestone.description}
               </p>
              )}

              {/* 记录者 */}
              {author && (
               <p className="text-[11px] text-gray-400 mt-2">
                {author.name} 记录
               </p>
              )}

              {/* 删除确认 */}
              {showDeleteConfirm === milestone.id && (
               <div className="mt-3 pt-3 border-t border-red-100">
                <p className="text-[13px] text-gray-600 mb-2">确定删除这条记录？</p>
                <div className="flex gap-2">
                 <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 py-2 bg-gray-100 text-gray-500 rounded-lg text-[13px] font-medium hover:bg-gray-200 transition-colors"
                 >
                  取消
                 </button>
                 <button
                  onClick={() => handleDeleteMilestone(milestone.id)}
                  className="flex-1 py-2 bg-red-500 text-white rounded-lg text-[13px] font-medium hover:bg-red-600 transition-colors"
                 >
                  删除
                 </button>
                </div>
               </div>
              )}
             </div>
            </div>
           </div>
          );
         })}
        </div>
       </div>
      ))}
     </div>
    )}
   </div>

   {/* === 添加事件弹窗 === */}
   {showAddModal && (
    <div className="fixed inset-0 z-[55] flex items-end justify-center">
     <div className="absolute inset-0 bg-black/50 " onClick={() => setShowAddModal(false)} />
     <div className="relative w-full max-w-[430px] bg-white rounded-t-3xl p-6 pb-8 animate-slide-up shadow-2xl">
      <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
      <h3 className="text-lg font-bold text-gray-800 mb-5">添加新事件</h3>
      <div className="space-y-4">
       <div>
        <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">事件类型</label>
        <select
         value={newMilestone.type}
         onChange={(e) => setNewMilestone(prev => ({ ...prev, type: e.target.value as Milestone['type'] }))}
         className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition-all"
        >
         {Object.entries(eventTypeLabels).map(([key, label]) => (
          <option key={key} value={key}>{eventTypeIcons[key] || ''} {label}</option>
         ))}
        </select>
       </div>
       <div>
        <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">日期</label>
        <input type="date" value={newMilestone.date}
         onChange={(e) => setNewMilestone(prev => ({ ...prev, date: e.target.value }))}
         className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition-all" />
       </div>
       <div>
        <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">备注</label>
        <textarea value={newMilestone.description}
         onChange={(e) => setNewMilestone(prev => ({ ...prev, description: e.target.value }))}
         placeholder="添加备注..." rows={3}
         className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition-all resize-none" />
       </div>
       <div className="flex gap-3 pt-1">
        <button onClick={() => setShowAddModal(false)}
         className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors">取消</button>
        <button onClick={handleAddMilestone}
         className="flex-1 py-3 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors">添加</button>
       </div>
      </div>
     </div>
    </div>
   )}

   {/* === 编辑事件弹窗 === */}
   {editingMilestone && (
    <div className="fixed inset-0 z-[55] flex items-center justify-center p-4">
     <div className="absolute inset-0 bg-black/50 " onClick={() => setEditingMilestone(null)} />
     <div className="relative w-full max-w-md bg-white rounded-3xl p-6 animate-scale-in shadow-2xl">
      <div className="flex items-center justify-between mb-5">
       <h3 className="text-lg font-bold text-gray-800">编辑事件</h3>
       <button onClick={() => setEditingMilestone(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
        <X className="w-5 h-5 text-gray-400" />
       </button>
      </div>
      <div className="space-y-4">
       <div>
        <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">事件类型</label>
        <select value={editingMilestone.type}
         onChange={(e) => setEditingMilestone(prev => prev ? { ...prev, type: e.target.value as Milestone['type'] } : null)}
         className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition-all">
         {Object.entries(eventTypeLabels).map(([key, label]) => (
          <option key={key} value={key}>{eventTypeIcons[key] || ''} {label}</option>
         ))}
        </select>
       </div>
       <div>
        <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">标题</label>
        <input type="text" value={editingMilestone.title || ''}
         onChange={(e) => setEditingMilestone(prev => prev ? { ...prev, title: e.target.value } : null)}
         className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition-all" placeholder="事件标题" />
       </div>
       <div>
        <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">日期</label>
        <input type="date" value={editingMilestone.date}
         onChange={(e) => setEditingMilestone(prev => prev ? { ...prev, date: e.target.value } : null)}
         className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition-all" />
       </div>
       <div>
        <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">备注</label>
        <textarea value={editingMilestone.description || ''}
         onChange={(e) => setEditingMilestone(prev => prev ? { ...prev, description: e.target.value } : null)}
         placeholder="添加备注..." rows={3}
         className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition-all resize-none" />
       </div>
       <div className="flex gap-3 pt-1">
        <button onClick={() => setEditingMilestone(null)}
         className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors">取消</button>
        <button onClick={handleUpdateMilestone}
         className="flex-1 py-3 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors">保存</button>
       </div>
      </div>
     </div>
    </div>
   )}
  </div>
 );
}
