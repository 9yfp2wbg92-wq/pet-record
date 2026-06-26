import { useState, useEffect } from 'react';
import { Sparkles, ThumbsUp, ThumbsDown, Clock, Edit3, X } from 'lucide-react';
import { usePetStore } from '../hooks/usePetStore';

export function AIInsights() {
 const { pets, currentPetId, milestones, posts, setCurrentPetId, updateMilestone } = usePetStore();
 const [loading, setLoading] = useState(false);
 const [healthReport, setHealthReport] = useState<{
  overall: string;
  warning: string;
  suggestion: string;
 } | null>(null);
 const [reminders, setReminders] = useState<{
  type: string;
  daysLeft: number;
  lastDate: string;
  progress: number;
  totalDays: number;
  milestoneId: string;
 }[]>([]);
 const [showEditModal, setShowEditModal] = useState(false);
 const [editingReminder, setEditingReminder] = useState<{
  type: string;
  currentInterval: number;
  milestoneId: string;
 } | null>(null);
 const [editInterval, setEditInterval] = useState(30);

 const effectivePetId = currentPetId || (pets.length > 0 ? pets[0].id : '');
 const selectedPet = pets.find(p => p.id === effectivePetId);

 const milestoneCount = milestones.filter(m =>
  m.petId === effectivePetId &&
  m.type !== 'home' &&
  m.type !== 'anniversary'
 ).length + posts.filter(p => p.petId === effectivePetId).length;

 useEffect(() => {
  if (effectivePetId) {
   calculateReminders();
   if (milestoneCount >= 2) {
    generateHealthReport();
   } else {
    setHealthReport(null);
   }
  }
 }, [effectivePetId, milestoneCount]);

 const calculateNextDate = (lastDate: string, days: number): { nextDate: Date; daysLeft: number; progress: number } => {
  const last = new Date(lastDate);
  const next = new Date(last);
  next.setDate(next.getDate() + days);
  const today = new Date();
  const diffTime = next.getTime() - today.getTime();
  const daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  const totalDiff = next.getTime() - last.getTime();
  const elapsed = today.getTime() - last.getTime();
  const progress = Math.min(100, Math.round((elapsed / totalDiff) * 100));
  return { nextDate: next, daysLeft, progress };
 };

 const handleEditReminder = (reminderType: string, currentInterval: number, milestoneId: string) => {
  setEditingReminder({ type: reminderType, currentInterval, milestoneId });
  setEditInterval(currentInterval);
  setShowEditModal(true);
 };

 const handleSaveInterval = () => {
  if (editingReminder && editInterval > 0) {
   const milestone = milestones.find(m => m.id === editingReminder.milestoneId);
   if (milestone) {
    updateMilestone({ ...milestone, reminder_interval: editInterval });
    calculateReminders();
   }
  }
  setShowEditModal(false);
  setEditingReminder(null);
 };

 const generateHealthReport = () => {
  setLoading(true);

  setTimeout(() => {
   const petMilestones = milestones.filter(m =>
    m.petId === effectivePetId &&
    m.type !== 'home' &&
    m.type !== 'anniversary'
   );
   const petPosts = posts.filter(p => p.petId === effectivePetId);
   const totalRecords = petMilestones.length + petPosts.length;

   // Bug #3 fix: 阈值与外部 milestoneCount 对齐（posts + milestones）
   if (totalRecords < 2) {
    setHealthReport(null);
    setLoading(false);
    return;
   }

   const weightRecords = petMilestones
    .filter(m => m.type === 'weight' && m.metrics?.weight_kg)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

   const abnormalRecords = petMilestones.filter(m => m.type === 'abnormal');
   const vaccineRecords = petMilestones.filter(m => m.type === 'vaccine');
   const dewormRecords = petMilestones.filter(m => m.type === 'deworm');

   let weightTrend = '';
   if (weightRecords.length >= 2) {
    const firstWeight = weightRecords[0].metrics?.weight_kg || 0;
    const lastWeight = weightRecords[weightRecords.length - 1].metrics?.weight_kg || 0;
    const change = lastWeight - firstWeight;
    if (change > 0.5) {
     weightTrend = `体重增长良好，相比初始记录增加了${change.toFixed(1)}kg，发育情况正常。`;
    } else if (change < -0.3) {
     weightTrend = `体重有所下降，减少了${Math.abs(change).toFixed(1)}kg，建议关注饮食和健康状况。`;
    } else {
     weightTrend = `体重保持稳定，目前${lastWeight}kg，状态良好。`;
    }
   }

   let warning = '暂无异常记录，继续保持良好的护理习惯。';
   if (abnormalRecords.length > 0) {
    warning = `⚠️ 本月有 ${abnormalRecords.length} 次异常记录，${abnormalRecords.some(r => r.description?.includes('拉稀')) ? '包括轻微拉稀，' : ''}建议继续观察并注意保暖和饮食卫生。`;
   }

   let suggestion = '';
   const needs = [];
   if (vaccineRecords.length === 0) needs.push('尽快安排首次疫苗接种');
   if (dewormRecords.length === 0) needs.push('安排驱虫处理');
   if (weightRecords.length === 0) needs.push('记录体重变化');

   if (needs.length > 0) {
    suggestion = `建议：${needs.join('；')}。定期记录有助于及时发现健康问题。`;
   } else {
    suggestion = '目前各项护理都很到位，继续保持定期记录的好习惯！';
   }

   setHealthReport({
    overall: `${selectedPet?.name || '宝贝'}目前共记录了${petMilestones.length}条重要事件，整体健康状况良好。${weightTrend}`,
    warning,
    suggestion,
   });

   setLoading(false);
  }, 1500);
 };

 const calculateReminders = () => {
  if (!effectivePetId) {
   setReminders([]);
   return;
  }

  const petMilestones = milestones.filter(m => m.petId === effectivePetId);
  const newReminders: typeof reminders = [];

  const reminderTypes = [
   { type: '洗澡', milestoneType: 'bath', defaultInterval: 30, icon: '🛁' },
   { type: '驱虫', milestoneType: 'deworm', defaultInterval: 30, icon: '🐛' },
  ];

  reminderTypes.forEach(({ type, milestoneType, defaultInterval }) => {
   const records = petMilestones
    .filter(m => m.type === milestoneType)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

   if (records.length > 0) {
    const interval = records[0].reminder_interval || defaultInterval;
    const { daysLeft, progress } = calculateNextDate(records[0].date, interval);
    newReminders.push({
     type,
     daysLeft,
     lastDate: records[0].date,
     progress,
     totalDays: interval,
     milestoneId: records[0].id,
    });
   }
  });

  setReminders(newReminders);
 };

 const reminderIcons: Record<string, string> = {
  '洗澡': '🛁',
  '驱虫': '🐛',
  '疫苗': '💉',
  '体重': '⚖️',
 };

 return (
  <div className="min-h-screen bg-background pb-20">
   {/* Header */}
   <div className="bg-white border-b border-neutral-200 sticky top-0 z-40">
    <div className="max-w-md mx-auto px-4 py-4">
     <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center shadow-lg shadow-purple-200">
       <Sparkles className="w-5 h-5 text-white" />
      </div>
      <div>
       <h1 className="text-xl font-bold text-text-primary">AI 护理看板</h1>
       <p className="text-sm text-text-muted">
        {selectedPet ? `${selectedPet.name}的健康分析` : '选择宝贝开始分析'}
       </p>
      </div>
     </div>
    </div>

    {pets.length > 0 && (
     <div className="px-4 pb-3">
      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
       {pets.map((pet) => (
        <button
         key={pet.id}
         onClick={() => setCurrentPetId(pet.id)}
         className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
          effectivePetId === pet.id
           ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-200'
           : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
         }`}
        >
         {pet.name}
        </button>
       ))}
      </div>
     </div>
    )}
   </div>

   {!effectivePetId ? (
    <div className="max-w-md mx-auto px-4 py-16 text-center">
     <div className="w-24 h-24 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-purple-100 to-violet-100 flex items-center justify-center shadow-soft">
      <Sparkles className="w-12 h-12 text-purple-400" />
     </div>
     <p className="text-text-secondary font-medium text-lg">请先选择一个宝贝</p>
     <p className="text-text-muted text-sm mt-1">选择后即可查看健康分析</p>
    </div>
   ) : (
    <div className="max-w-md mx-auto px-4 py-6 space-y-6">
     {/* 30天健康总结卡片 */}
     <section>
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-50 via-violet-50 to-white p-5 border border-purple-100 shadow-soft">
       {/* 装饰背景 */}
       <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-200/20 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />

       <div className="relative">
        <div className="flex items-center gap-2 mb-4">
         <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
         </div>
         <h2 className="text-lg font-bold text-text-primary">30天健康报告</h2>
        </div>

        {loading ? (
         <div className="flex items-center justify-center gap-3 py-8">
          <div className="w-8 h-8 border-3 border-purple-300 border-t-purple-500 rounded-full animate-spin" />
          <span className="text-text-secondary font-medium">AI正在分析中...</span>
         </div>
        ) : healthReport ? (
         <div className="space-y-3">
          <div className="bg-white rounded-2xl p-4 ">
           <p className="text-sm font-semibold text-purple-600 mb-1">整体状态</p>
           <p className="text-sm text-text-secondary leading-relaxed">{healthReport.overall}</p>
          </div>

          <div className={`bg-white rounded-2xl p-4 ${
           healthReport.warning.includes('⚠️') ? 'border-l-4 border-red-400' : ''
          }`}>
           <p className="text-sm font-semibold text-red-500 mb-1">异常警示</p>
           <p className={`text-sm leading-relaxed ${
            healthReport.warning.includes('⚠️') ? 'text-red-600' : 'text-text-secondary'
           }`}>
            {healthReport.warning}
           </p>
          </div>

          <div className="bg-white rounded-2xl p-4 ">
           <p className="text-sm font-semibold text-accent-600 mb-1">护理建议</p>
           <p className="text-sm text-text-secondary leading-relaxed">{healthReport.suggestion}</p>
          </div>

          <div className="flex gap-4 pt-2">
           <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white text-text-secondary rounded-2xl text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm">
            <ThumbsUp className="w-4 h-4" />
            有用
           </button>
           <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white text-text-secondary rounded-2xl text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm">
            <ThumbsDown className="w-4 h-4" />
            改进
           </button>
          </div>
         </div>
        ) : milestoneCount < 2 ? (
         <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-purple-100 flex items-center justify-center">
           <Sparkles className="w-8 h-8 text-purple-400" />
          </div>
          {milestoneCount === 0 ? (
           <>
            <p className="text-text-secondary font-medium">
             {selectedPet?.name || '宝贝'}还在等待你的第一条记录
            </p>
            <p className="text-text-muted text-sm mt-1">
             快去记录页写点什么吧！
            </p>
           </>
          ) : (
           <>
            <p className="text-text-secondary font-medium">
             {selectedPet?.name || '宝贝'}已有一条记录啦！
            </p>
            <p className="text-text-muted text-sm mt-1">
             再记录一条即可解锁AI智能总结！
            </p>
           </>
          )}
         </div>
        ) : null}

        {healthReport && (
         <button
          onClick={generateHealthReport}
          className="w-full mt-4 py-3 bg-purple-100 text-purple-600 rounded-2xl font-semibold hover:bg-purple-200 transition-colors"
         >
          重新生成报告
         </button>
        )}
       </div>
      </div>
     </section>

     {/* 动态倒计时卡片 */}
     <section>
      <h2 className="text-lg font-bold text-text-primary mb-3 flex items-center gap-2">
       <Clock className="w-5 h-5 text-text-muted" />
       护理倒计时
      </h2>

      {reminders.length === 0 ? (
       <div className="bg-white rounded-2xl p-8 text-center border border-neutral-200 shadow-card">
        <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-primary-50 flex items-center justify-center">
         <Clock className="w-8 h-8 text-primary-300" />
        </div>
        <p className="text-text-secondary font-medium">暂无护理提醒</p>
        <p className="text-text-muted text-sm mt-1">记录驱虫或疫苗后会自动生成</p>
       </div>
      ) : (
       <div className="grid grid-cols-2 gap-3">
        {reminders.map((reminder, index) => {
         const icon = reminderIcons[reminder.type] || '📝';
         const isUrgent = reminder.daysLeft <= 3;
         return (
         <div
          key={index}
          className={`bg-white rounded-2xl p-4 border shadow-card transition-all hover:shadow-soft ${
           isUrgent ? 'border-red-200 bg-red-50/30' : 'border-neutral-200'
          }`}
         >
          <div className="flex items-center justify-between mb-2">
           <div className="flex items-center gap-2">
            <span className="text-lg">{icon}</span>
            <span className="text-sm font-semibold text-text-primary">{reminder.type}</span>
           </div>
           <button
            onClick={() => handleEditReminder(reminder.type, reminder.totalDays, reminder.milestoneId)}
            className="p-1.5 hover:bg-white rounded-lg transition-colors"
            title="编辑提醒间隔"
           >
            <Edit3 className="w-4 h-4 text-text-muted" />
           </button>
          </div>

          <div className={`text-3xl font-bold mb-2 number-font ${isUrgent ? 'text-red-500' : 'text-text-primary'}`}>
           {reminder.daysLeft}
           <span className="text-sm font-normal text-text-muted ml-1">天</span>
          </div>

          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
           <div
            className={`h-full rounded-full transition-all duration-500 ${
             reminder.type === '洗澡'
              ? 'bg-gradient-to-r from-blue-400 to-blue-500'
              : 'bg-gradient-to-r from-teal-400 to-teal-500'
            }`}
            style={{ width: `${reminder.progress}%` }}
           />
          </div>

          <p className="text-xs text-text-muted mt-2.5">
           上次: {new Date(reminder.lastDate).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
          </p>
         </div>
         );
        })}
       </div>
      )}
     </section>

     {/* 免责声明 */}
     <section className="text-center pb-4">
      <p className="text-xs text-text-muted">
       *免责声明：AI 总结基于日常记录，不代表专业兽医诊断，宠物生病请及时就医。
      </p>
     </section>

     {/* 编辑提醒间隔弹窗 */}
     {showEditModal && editingReminder && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[55] p-4">
       <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-float animate-scale-in">
        <div className="flex items-center justify-between mb-4">
         <h3 className="text-lg font-bold text-text-primary">编辑{editingReminder.type}提醒间隔</h3>
         <button
          onClick={() => setShowEditModal(false)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
         >
          <X className="w-5 h-5 text-text-muted" />
         </button>
        </div>

        <div className="mb-4">
         <label className="block text-sm font-semibold text-text-primary mb-2">
          提醒间隔（天）
         </label>
         <input
          type="number"
          min="1"
          max="365"
          value={editInterval}
          onChange={(e) => setEditInterval(Math.max(1, Math.min(365, parseInt(e.target.value) || 1)))}
          className="w-full px-4 py-3 bg-neutral-50 border-2 border-neutral-200 rounded-2xl focus:border-neutral-400 focus:ring-4 focus:ring-neutral-100 outline-none text-center text-2xl font-bold number-font"
         />
        </div>

        <div className="flex gap-3">
         <button
          onClick={() => setShowEditModal(false)}
          className="flex-1 py-3 bg-gray-100 text-text-secondary rounded-2xl font-semibold hover:bg-gray-200 transition-colors"
         >
          取消
         </button>
         <button
          onClick={handleSaveInterval}
          className="flex-1 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-2xl font-semibold hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg shadow-primary-200"
         >
          保存
         </button>
        </div>
       </div>
      </div>
     )}
    </div>
   )}
  </div>
 );
}
