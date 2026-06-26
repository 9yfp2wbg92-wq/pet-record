import { Link, useLocation } from 'react-router-dom';
import { Heart, Clock, Sparkles, PawPrint } from 'lucide-react';

const navItems = [
 { path: '/', icon: Heart, label: '记录' },
 { path: '/timeline', icon: Clock, label: '大事记' },
 { path: '/ai', icon: Sparkles, label: 'AI看板' },
 { path: '/profile', icon: PawPrint, label: '我的' },
];

export function BottomNav() {
 const location = useLocation();

 return (
  <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] h-16 bg-white border-t border-neutral-200 z-50 safe-area-bottom">
   <div className="flex justify-around items-center h-full px-2">
    {navItems.map((item) => {
     const isActive = location.pathname === item.path;
     return (
      <Link
       key={item.path}
       to={item.path}
       className={`flex flex-col items-center justify-center flex-1 py-1 transition-all duration-200 relative ${
        isActive ? 'text-primary-500' : 'text-text-muted hover:text-text-secondary'
       }`}
      >
       <div className={`relative mb-0.5 transition-transform duration-200 ${isActive ? 'scale-110' : 'scale-100'}`}>
        <item.icon
         className={`w-6 h-6 transition-all duration-200 ${
          isActive ? 'fill-primary-100 stroke-primary-500' : ''
         }`}
         strokeWidth={isActive ? 2.5 : 1.5}
        />
        {item.path === '/ai' && (
         <div className={`absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full flex items-center justify-center ${
          isActive ? 'bg-primary-500' : 'bg-neutral-300'
         }`}>
          <Sparkles className="w-2 h-2 text-white fill-white" />
         </div>
        )}
       </div>
       <span className={`text-[11px] font-medium ${
        isActive ? 'font-semibold' : ''
       }`}>
        {item.label}
       </span>
       {isActive && (
        <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-primary-500 rounded-full" />
       )}
      </Link>
     );
    })}
   </div>
  </nav>
 );
}
