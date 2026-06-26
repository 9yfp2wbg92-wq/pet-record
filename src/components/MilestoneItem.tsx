import { Home, Syringe, Droplets, Bath, Scissors, Star, Plus } from 'lucide-react';
import { Milestone } from '../types';

interface MilestoneItemProps {
 milestone: Milestone;
 isLeft?: boolean;
}

const iconMap: Record<string, any> = {
 home: Home,
 vaccine: Syringe,
 deworm: Droplets,
 bath: Bath,
 neuter: Scissors,
 anniversary: Star,
 custom: Plus,
};

const colorMap: Record<string, string> = {
 home: 'bg-primary text-white',
 vaccine: 'bg-blue-500 text-white',
 deworm: 'bg-teal-500 text-white',
 bath: 'bg-cyan-500 text-white',
 neuter: 'bg-purple-500 text-white',
 anniversary: 'bg-yellow-500 text-white',
 custom: 'bg-paper-1000 text-white',
};

export function MilestoneItem({ milestone, isLeft = true }: MilestoneItemProps) {
 const Icon = iconMap[milestone.type] || Plus;
 const color = colorMap[milestone.type] || 'bg-paper-1000 text-white';

 let dateText: string;
 if (milestone.onlyMonth) {
  const d = new Date(milestone.date);
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  dateText = `${year}年${month}月`;
 } else {
  dateText = new Date(milestone.date).toLocaleDateString('zh-CN', {
   year: 'numeric',
   month: 'long',
   day: 'numeric',
  });
 }

 if (milestone.isEstimated) {
  dateText = `${dateText} (预估)`;
 }

 return (
  <div className={`flex items-center gap-4 mb-8 ${isLeft ? 'flex-row' : 'flex-row-reverse'}`}>
   <div className={`flex-1 ${isLeft ? 'text-right' : 'text-left'}`}>
    <div className="inline-block bg-surface p-4 rounded-2xl shadow-card border-2 border-wood-200 animate-slide-up">
     <h3 className="font-semibold text-text mb-1">{milestone.title}</h3>
     <p className="text-sm text-text-muted">{dateText}</p>
     {milestone.description && (
      <p className="text-sm text-text mt-2">{milestone.description}</p>
     )}
    </div>
   </div>

   <div className={`w-12 h-12 rounded-full ${color} flex items-center justify-center flex-shrink-0 z-10`}>
    <Icon className="w-6 h-6" />
   </div>

   <div className="flex-1" />
  </div>
 );
}
