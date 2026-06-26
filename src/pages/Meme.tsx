import { useState, useRef } from 'react';
import { ImagePlus, Download, Smile, Sparkles, Camera } from 'lucide-react';
import { usePetStore } from '../hooks/usePetStore';
import { memeStyles, generateMeme } from '../utils/memeGenerator';
import { Meme as MemeType } from '../types';
import { getCategoryById } from '../utils/breedData';

export function MemePage() {
 const { pets, currentPetId, currentPet, memes, addMeme } = usePetStore();
 const [selectedImage, setSelectedImage] = useState<string | null>(null);
 const [selectedStyle, setSelectedStyle] = useState(memeStyles[0]);
 const [customText, setCustomText] = useState('');
 const [generatedMeme, setGeneratedMeme] = useState<string | null>(null);
 const [showGenerated, setShowGenerated] = useState(false);
 const imageRef = useRef<HTMLImageElement>(null);

 // 筛选当前选中宠物的表情包
 const filteredMemes = currentPetId
  ? memes.filter(m => m.petId === currentPetId)
  : memes;

 const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
   const reader = new FileReader();
   reader.onload = (event) => {
    setSelectedImage(event.target?.result as string);
    setShowGenerated(false);
   };
   reader.readAsDataURL(file);
  }
 };

 const handleGenerate = () => {
  if (!selectedImage || !imageRef.current) return;

  const meme = generateMeme(
   imageRef.current,
   selectedStyle,
   customText || undefined
  );
  setGeneratedMeme(meme);
  setShowGenerated(true);
 };

 const handleSave = () => {
  if (!generatedMeme) return;
  if (!currentPetId && pets.length > 0) {
   alert('请先选择一只宝贝！');
   return;
  }

  const targetPetId = currentPetId || pets[0].id;
  const newMeme: Omit<MemeType, 'id' | 'authorUserId'> = {
   petId: targetPetId,
   image: generatedMeme,
   style: selectedStyle.id,
   createdAt: new Date().toISOString(),
  };

  addMeme(newMeme);
  alert('表情包已保存！');
 };

 const handleDownload = () => {
  if (!generatedMeme) return;

  const link = document.createElement('a');
  link.href = generatedMeme;
  link.download = `meme-${Date.now()}.png`;
  link.click();
 };

 const displayPet = currentPet || (pets.length > 0 ? pets[0] : null);
 const DisplayIcon = displayPet ? (getCategoryById(displayPet.categoryId)?.icon || Smile) : Smile;

 return (
  <div className="min-h-screen bg-background pb-20">
   <div className="bg-surface border-b border-orange-100 sticky top-0 z-40 shadow-sm">
    <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-3">
     {displayPet?.avatar ? (
      <img
       src={displayPet.avatar}
       alt={displayPet.name}
       className="w-10 h-10 rounded-full object-cover border-2 border-primary/20"
      />
     ) : (
      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
       <DisplayIcon className="w-5 h-5 text-primary" />
      </div>
     )}
     <div>
      <h1 className="text-xl font-bold text-text flex items-center gap-2">
       <Sparkles className="w-5 h-5 text-primary" />
       表情包生成器
      </h1>
      <p className="text-sm text-text-muted">给宝贝制作可爱的表情包</p>
     </div>
    </div>
   </div>

   <div className="max-w-md mx-auto px-4 pt-6">
    <div className="bg-surface rounded-2xl p-6 shadow-sm border border-orange-100 mb-6">
     {!selectedImage ? (
      <label className="block cursor-pointer">
       <div className="border-2 border-dashed border-orange-300 rounded-xl p-8 text-center hover:border-primary hover:bg-primary/5 transition-all">
        <ImagePlus className="w-12 h-12 mx-auto text-text-muted mb-3" />
        <p className="text-text-muted">点击上传图片</p>
        <p className="text-xs text-text-muted mt-1">支持 JPG、PNG 格式</p>
       </div>
       <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
       />
      </label>
     ) : (
      <div className="space-y-4">
       <div className="relative">
        <img
         ref={imageRef}
         src={selectedImage}
         alt="原图"
         className="w-full rounded-xl max-h-64 object-contain"
         crossOrigin="anonymous"
        />
        <button
         onClick={() => {
          setSelectedImage(null);
          setShowGenerated(false);
         }}
         className="absolute top-2 right-2 w-8 h-8 bg-gray-800 text-white rounded-full flex items-center justify-center hover:bg-gray-700"
        >
         ×
        </button>
       </div>

       <div>
        <label className="block text-sm font-medium text-text mb-2">选择风格</label>
        <div className="grid grid-cols-3 gap-2">
         {memeStyles.map((style) => (
          <button
           key={style.id}
           onClick={() => {
            setSelectedStyle(style);
            setShowGenerated(false);
           }}
           className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
            selectedStyle.id === style.id
             ? 'bg-primary text-white'
             : 'bg-orange-100 text-text hover:bg-orange-200'
           }`}
          >
           {style.name}
          </button>
         ))}
        </div>
       </div>

       <div>
        <label className="block text-sm font-medium text-text mb-1">自定义文字（可选）</label>
        <input
         type="text"
         value={customText}
         onChange={(e) => {
          setCustomText(e.target.value);
          setShowGenerated(false);
         }}
         className="w-full px-4 py-3 rounded-xl border border-orange-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-orange-50/50"
         placeholder="输入文字..."
        />
       </div>

       <button
        onClick={handleGenerate}
        className="w-full py-3 bg-secondary text-white rounded-xl font-semibold hover:bg-orange-600 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-sm"
       >
        <Smile className="w-5 h-5" />
        生成表情包
       </button>
      </div>
     )}
    </div>

    {showGenerated && generatedMeme && (
     <div className="bg-surface rounded-2xl p-6 shadow-sm border border-orange-100 mb-6 animate-fade-in">
      <h3 className="font-semibold text-text mb-3">生成结果</h3>
      <img
       src={generatedMeme}
       alt="生成的表情包"
       className="w-full rounded-xl mb-4"
      />
      <div className="flex gap-3">
       <button
        onClick={handleDownload}
        className="flex-1 py-2 bg-orange-100 text-text rounded-xl font-medium hover:bg-orange-200 transition-all flex items-center justify-center gap-2"
       >
        <Download className="w-4 h-4" />
        下载
       </button>
       <button
        onClick={handleSave}
        className="flex-1 py-2 bg-primary text-white rounded-xl font-medium hover:bg-orange-600 transition-all shadow-sm"
       >
        保存
       </button>
      </div>
     </div>
    )}

    {filteredMemes.length > 0 && (
     <div>
      <h3 className="font-semibold text-text mb-3">我的表情包</h3>
      <div className="grid grid-cols-3 gap-3">
       {filteredMemes.map((meme) => (
        <img
         key={meme.id}
         src={meme.image}
         alt="表情包"
         className="w-full aspect-square object-cover rounded-xl"
        />
       ))}
      </div>
     </div>
    )}
   </div>
  </div>
 );
}
