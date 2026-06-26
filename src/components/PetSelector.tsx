import { usePetStore } from '../hooks/usePetStore';
import { PawPrint, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { petCategoryIcons, getCategoryIcon } from './IllustratedIcon';
import { getPetColor } from '../utils/petColors';

export function PetSelector() {
  const { pets, currentPetId, setCurrentPetId, getFamilyMembers } = usePetStore();
  const navigate = useNavigate();

  return (
    <div className="bg-surface border-b-2 border-paper-300 sticky top-0 z-40">
      <div className="max-w-md mx-auto px-4 py-3">
        <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide">

          {/* "全部" — 1:1 正方形 */}
          <button
            onClick={() => setCurrentPetId(null)}
            className={`flex flex-col items-center justify-center gap-1 w-[60px] h-[60px] rounded-2xl transition-all flex-shrink-0 ${
              currentPetId === null
                ? 'bg-paper-800 text-white shadow-card'
                : 'bg-paper-100 text-text-secondary border-2 border-dashed border-paper-300 hover:border-paper-400 hover:bg-paper-200'
            }`}
          >
            <PawPrint className="w-6 h-6" strokeWidth={2} />
            <span className="text-[11px] font-semibold leading-none">全部</span>
          </button>

          {/* 宠物 — 1:1 正方形，图标在上名字在下 */}
          {pets.map((pet, idx) => {
            const category = getCategoryIcon(pet.categoryId);
            const CatIcon = category.Icon;
            const isActive = currentPetId === pet.id;
            const members = getFamilyMembers(pet.id);
            const pColor = getPetColor(idx);

            return (
              <button
                key={pet.id}
                onClick={() => setCurrentPetId(pet.id)}
                className={`flex flex-col items-center justify-center gap-1 w-[60px] h-[60px] rounded-2xl transition-all flex-shrink-0 relative ${
                  isActive
                    ? `bg-gradient-to-br ${pColor.btn} text-white shadow-card`
                    : `${pColor.bg} ${pColor.text} border-2 border-dashed ${pColor.border} hover:opacity-80`
                }`}
              >
                <div className="relative">
                  {pet.avatar ? (
                    <div className={`w-7 h-7 rounded-full overflow-hidden ring-1 ${isActive ? 'ring-white/50' : 'ring-white'}`}>
                      <img src={pet.avatar} alt={pet.name} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <CatIcon className="w-6 h-6" strokeWidth={2} />
                  )}
                  {members.length > 1 && (
                    <div className="absolute -top-1.5 -right-3 w-4 h-4 bg-amber-400 text-white rounded-full flex items-center justify-center text-[9px] font-bold ring-1 ring-white">
                      {members.length}
                    </div>
                  )}
                </div>
                <span className="text-[11px] font-semibold leading-none truncate w-full text-center px-0.5">{pet.name}</span>
              </button>
            );
          })}

          {/* 添加按钮 — 1:1 正方形 */}
          <button
            onClick={() => navigate('/profile?add=true')}
            className="flex flex-col items-center justify-center gap-1 w-[60px] h-[60px] rounded-2xl bg-surface border-2 border-dashed border-paper-400 hover:border-paper-500 hover:bg-paper-200 transition-all flex-shrink-0 group"
          >
            <Plus className="w-6 h-6 text-paper-400 group-hover:text-paper-600 transition-colors" strokeWidth={2.5} />
            <span className="text-[11px] font-medium text-paper-500 group-hover:text-paper-700 leading-none">添加</span>
          </button>

        </div>
      </div>
    </div>
  );
}
