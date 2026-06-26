import { usePetStore } from '../hooks/usePetStore';
import { BREED_CATEGORIES, getCategoryById } from '../utils/breedData';
import { PawPrint } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function PetSelector() {
 const { pets, currentPetId, setCurrentPetId, getFamilyMembers } = usePetStore();
 const navigate = useNavigate();

 const getPetIcon = (categoryId: string) => {
  const category = getCategoryById(categoryId);
  return category?.icon || PawPrint;
 };

 return (
  <div className="bg-white border-b border-neutral-200 sticky top-0 z-40">
   <div className="max-w-md mx-auto px-4 py-3">
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
     {/* 全部按钮 */}
     <button
      onClick={() => setCurrentPetId(null)}
      className={`flex flex-col items-center justify-center min-w-[60px] p-2 rounded-2xl transition-all duration-200 ${
       currentPetId === null
        ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-200'
        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
      }`}
     >
      <PawPrint className="w-6 h-6" />
      <span className="text-[11px] font-medium mt-1">全部</span>
     </button>

     {/* 宠物列表 */}
     {pets.map((pet) => {
      const Icon = getPetIcon(pet.categoryId);
      const isActive = currentPetId === pet.id;
      const members = getFamilyMembers(pet.id);
      return (
       <button
        key={pet.id}
        onClick={() => setCurrentPetId(pet.id)}
        className={`flex flex-col items-center justify-center min-w-[60px] p-2 rounded-2xl transition-all duration-200 ${
         isActive
          ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-200'
          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
        }`}
       >
        {pet.avatar ? (
         <div className="relative">
          <img
           src={pet.avatar}
           alt={pet.name}
           className="w-8 h-8 rounded-full object-cover ring-2 ring-white"
          />
          {members.length > 1 && (
           <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-accent-500 text-white rounded-full flex items-center justify-center text-[9px] font-bold ring-1 ring-white">
            {members.length}
           </div>
          )}
         </div>
        ) : (
         <div className="relative">
          <Icon className="w-8 h-8" />
          {members.length > 1 && (
           <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-accent-500 text-white rounded-full flex items-center justify-center text-[9px] font-bold ring-1 ring-white">
            {members.length}
           </div>
          )}
         </div>
        )}
        <span className="text-[11px] font-medium mt-1 truncate w-full text-center">
         {pet.name}
        </span>
       </button>
      );
     })}

     {/* 添加按钮 */}
     <button
      onClick={() => navigate('/profile?add=true')}
      className="flex flex-col items-center justify-center min-w-[60px] p-2 rounded-2xl bg-white border-2 border-dashed border-neutral-300 text-primary-500 hover:border-neutral-400 hover:bg-neutral-100 transition-all"
     >
      <span className="text-lg font-bold leading-none">+</span>
      <span className="text-[11px] font-medium mt-1">添加</span>
     </button>
    </div>
   </div>
  </div>
 );
}
