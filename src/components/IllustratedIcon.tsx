import { LucideIcon, Syringe, Bug, Droplets, Scale, Stethoscope, AlertTriangle, Home, Cake, FileText, Scissors } from 'lucide-react';

// 事件类型 → Lucide 图标（粗描边 = MTJJ 风格）
export const eventIcons: Record<string, { Icon: LucideIcon; color: string; bg: string }> = {
  vaccine:  { Icon: Syringe,        color: 'text-blue-600',   bg: 'bg-blue-50' },
  deworm:   { Icon: Bug,            color: 'text-teal-600',   bg: 'bg-teal-50' },
  bath:     { Icon: Droplets,       color: 'text-cyan-600',   bg: 'bg-cyan-50' },
  weight:   { Icon: Scale,          color: 'text-amber-600',  bg: 'bg-amber-50' },
  medical:  { Icon: Stethoscope,    color: 'text-red-600',    bg: 'bg-red-50' },
  abnormal: { Icon: AlertTriangle,  color: 'text-orange-600', bg: 'bg-orange-50' },
  home:     { Icon: Home,           color: 'text-amber-600',  bg: 'bg-amber-50' },
  anniversary: { Icon: Cake,        color: 'text-pink-600',   bg: 'bg-pink-50' },
  other:    { Icon: FileText,       color: 'text-paper-700',  bg: 'bg-paper-200' },
  neuter:   { Icon: Scissors,       color: 'text-purple-600', bg: 'bg-purple-50' },
};

import { Cat, Dog, Bird, Rabbit, Fish, Rat, Turtle, Squirrel, PiggyBank, Star, PawPrint } from 'lucide-react';

// 宠物种类 → Lucide 图标（基于2026中国宠物饲养数据筛选的热门种类）
export const petCategoryIcons: Record<string, { Icon: LucideIcon; label: string }> = {
  cat:     { Icon: Cat,      label: '猫咪' },
  dog:     { Icon: Dog,      label: '狗狗' },
  bird:    { Icon: Bird,     label: '鸟类' },
  rabbit:  { Icon: Rabbit,   label: '兔子' },
  fish:    { Icon: Fish,     label: '鱼类' },
  reptile: { Icon: Turtle,   label: '爬宠' },
  hamster: { Icon: Rat,      label: '仓鼠' },
  chinchilla: { Icon: Squirrel, label: '龙猫' },
  guinea_pig: { Icon: PiggyBank, label: '荷兰猪' },
  fancy_rat: { Icon: Star,   label: '花枝鼠' },
  other_pet: { Icon: PawPrint, label: '其他' },
};

// 旧版本种类 ID → 新 ID 迁移映射
export const OLD_CATEGORY_MAP: Record<string, string> = {
  mouse: 'hamster',
  ferret: 'chinchilla',
  sugar_glider: 'guinea_pig',
  hedgehog: 'fancy_rat',
};

// 安全获取种类图标（兼容旧数据）
export function getCategoryIcon(categoryId: string) {
  return petCategoryIcons[categoryId] || petCategoryIcons[OLD_CATEGORY_MAP[categoryId]] || petCategoryIcons.other_pet;
}

// emoji 仅用于 <select> option 文本（React 组件不能放 option 内）
export const petCategoryEmoji: Record<string, string> = {
  cat: '🐱', dog: '🐶', bird: '🐦', rabbit: '🐰', fish: '🐟',
  reptile: '🐢', hamster: '🐹', chinchilla: '🐿️', guinea_pig: '🐹',
  fancy_rat: '⭐', other_pet: '🐾',
};

export function getCategoryEmoji(categoryId: string) {
  return petCategoryEmoji[categoryId] || petCategoryEmoji[OLD_CATEGORY_MAP[categoryId]] || '🐾';
}

// 手绘圆形相框组件
export function SketchCircle({ children, size = 'lg', className = '' }: {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}) {
  const sizes = { sm: 'w-10 h-10', md: 'w-14 h-14', lg: 'w-20 h-20', xl: 'w-28 h-28' };
  return (
    <div className={`${sizes[size]} rounded-full border-2 border-dashed border-paper-400 bg-paper-100 flex items-center justify-center ${className}`}>
      <div className="rounded-full bg-surface border-2 border-paper-300 flex items-center justify-center w-[85%] h-[85%]">
        {children}
      </div>
    </div>
  );
}
