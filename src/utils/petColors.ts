// 每个宠物分配一种主题色，用于时间轴、动态卡片、AI管家等所有界面
export const PET_COLORS = [
 { bg: 'bg-rose-50', text: 'text-rose-600', dot: 'bg-rose-400', border: 'border-rose-200', ring: 'ring-rose-200', btn: 'from-rose-500 to-pink-500', btnShadow: 'shadow-rose-200', fill: 'fill-rose-100', stroke: 'stroke-rose-500' },
 { bg: 'bg-sky-50', text: 'text-sky-600', dot: 'bg-sky-400', border: 'border-sky-200', ring: 'ring-sky-200', btn: 'from-sky-500 to-blue-500', btnShadow: 'shadow-sky-200', fill: 'fill-sky-100', stroke: 'stroke-sky-500' },
 { bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-400', border: 'border-emerald-200', ring: 'ring-emerald-200', btn: 'from-emerald-500 to-teal-500', btnShadow: 'shadow-emerald-200', fill: 'fill-emerald-100', stroke: 'stroke-emerald-500' },
 { bg: 'bg-violet-50', text: 'text-violet-600', dot: 'bg-violet-400', border: 'border-violet-200', ring: 'ring-violet-200', btn: 'from-violet-500 to-purple-500', btnShadow: 'shadow-violet-200', fill: 'fill-violet-100', stroke: 'stroke-violet-500' },
 { bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-400', border: 'border-amber-200', ring: 'ring-amber-200', btn: 'from-amber-500 to-orange-500', btnShadow: 'shadow-amber-200', fill: 'fill-amber-100', stroke: 'stroke-amber-500' },
 { bg: 'bg-teal-50', text: 'text-teal-600', dot: 'bg-teal-400', border: 'border-teal-200', ring: 'ring-teal-200', btn: 'from-teal-500 to-cyan-500', btnShadow: 'shadow-teal-200', fill: 'fill-teal-100', stroke: 'stroke-teal-500' },
];

export function getPetColor(index: number) {
 return PET_COLORS[index % PET_COLORS.length];
}
