import { useState, useEffect, useCallback } from 'react';
import { ChevronUp } from 'lucide-react';

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  const handleScroll = useCallback(() => {
    // 找到最近的可滚动父元素
    const el = document.querySelector('.overflow-y-auto');
    if (el) {
      setVisible(el.scrollTop > 300);
    }
  }, []);

  useEffect(() => {
    const el = document.querySelector('.overflow-y-auto');
    if (!el) return;
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const scrollToTop = () => {
    const el = document.querySelector('.overflow-y-auto');
    if (el) {
      el.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (!visible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-20 right-4 w-10 h-10 bg-surface border-2 border-paper-300 rounded-full flex items-center justify-center shadow-card hover:shadow-soft hover:bg-paper-100 transition-all z-40 active:scale-95"
    >
      <ChevronUp className="w-5 h-5 text-paper-600" strokeWidth={2.5} />
    </button>
  );
}
