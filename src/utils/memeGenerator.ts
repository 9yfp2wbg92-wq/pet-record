export const memeStyles = [
  { id: 'classic', name: '太可爱了', text: '太可爱了！', topText: '', bottomText: '太可爱了！' },
  { id: 'ok', name: '好的', text: '好的~', topText: '', bottomText: '好的~' },
  { id: 'surprised', name: '什么？！', text: '什么？！', topText: '什么？！', bottomText: '' },
  { id: 'happy', name: '好开心', text: '今天好开心！', topText: '', bottomText: '今天好开心！' },
  { id: 'thinking', name: '让我想想', text: '让我想想...', topText: '让我想想...', bottomText: '' },
  { id: 'cool', name: '酷', text: '酷！', topText: '酷！', bottomText: '' },
  { id: 'love', name: '爱你哦', text: '爱你哦~', topText: '', bottomText: '爱你哦~' },
  { id: 'thank', name: '谢谢', text: '谢谢~', topText: '', bottomText: '谢谢~' },
  { id: 'great', name: '真棒', text: '真棒！', topText: '', bottomText: '真棒！' },
  { id: 'haha', name: '哈哈', text: '哈哈哈哈', topText: '', bottomText: '哈哈哈哈' },
  { id: 'hello', name: '哈喽', text: '哈喽~', topText: '', bottomText: '哈喽~' },
  { id: 'morning', name: '早上好', text: '早上好！', topText: '', bottomText: '早上好！' },
  { id: 'night', name: '晚安', text: '晚安~', topText: '', bottomText: '晚安~' },
  { id: 'cry', name: '哭', text: '呜呜呜...', topText: '', bottomText: '呜呜呜...' },
  { id: 'bye', name: '再见', text: '拜拜~', topText: '', bottomText: '拜拜~' },
  { id: 'hug', name: '抱抱', text: '抱抱~', topText: '', bottomText: '抱抱~' },
  { id: 'hungry', name: '饿了', text: '我饿了...', topText: '', bottomText: '我饿了...' },
  { id: 'full', name: '饱', text: '吃撑了~', topText: '', bottomText: '吃撑了~' },
  { id: 'sorry', name: '对不起', text: '对不起', topText: '对不起', bottomText: '' },
  { id: 'nice', name: '好的', text: '好的！', topText: '好的！', bottomText: '' },
  { id: 'yes', name: '收到', text: '收到~', topText: '', bottomText: '收到~' },
  { id: 'work', name: '下班了', text: '下班了！', topText: '', bottomText: '下班了！' },
  { id: 'yeah', name: '耶', text: '耶！', topText: '耶！', bottomText: '' },
  { id: 'can', name: '可以', text: '可以！', topText: '可以！', bottomText: '' },
  { id: 'pixel', name: '像素风', text: '', topText: '', bottomText: '' },
];

const applyPixelEffect = (ctx: CanvasRenderingContext2D, width: number, height: number): void => {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  
  const pixelSize = 6;
  
  for (let y = 0; y < height; y += pixelSize) {
    for (let x = 0; x < width; x += pixelSize) {
      let r = 0, g = 0, b = 0, count = 0;
      
      for (let py = y; py < Math.min(y + pixelSize, height); py++) {
        for (let px = x; px < Math.min(x + pixelSize, width); px++) {
          const index = (py * width + px) * 4;
          r += data[index];
          g += data[index + 1];
          b += data[index + 2];
          count++;
        }
      }
      
      r = Math.floor(r / count);
      g = Math.floor(g / count);
      b = Math.floor(b / count);
      
      // 增加色彩精准度，使用更多颜色级别
      const level = 16;
      r = Math.round(r / level) * level;
      g = Math.round(g / level) * level;
      b = Math.round(b / level) * level;
      
      for (let py = y; py < Math.min(y + pixelSize, height); py++) {
        for (let px = x; px < Math.min(x + pixelSize, width); px++) {
          const index = (py * width + px) * 4;
          data[index] = r;
          data[index + 1] = g;
          data[index + 2] = b;
          data[index + 3] = 255;
        }
      }
    }
  }
  
  ctx.putImageData(imageData, 0, 0);
};

export const generateMeme = (
  image: HTMLImageElement,
  style: typeof memeStyles[0],
  customText?: string
): string => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const maxWidth = 600;
  const maxHeight = 600;
  let width = image.width;
  let height = image.height;

  if (width > maxWidth) {
    height = (maxWidth / width) * height;
    width = maxWidth;
  }
  if (height > maxHeight) {
    width = (maxHeight / height) * width;
    height = maxHeight;
  }

  canvas.width = width;
  canvas.height = height;

  ctx.drawImage(image, 0, 0, width, height);
  
  if (style.id === 'pixel') {
    applyPixelEffect(ctx, width, height);
    return canvas.toDataURL('image/png');
  }

  ctx.font = `bold ${Math.max(24, width / 12)}px Impact, Arial Black, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillStyle = 'white';
  ctx.strokeStyle = 'black';
  ctx.lineWidth = Math.max(3, width / 100);

  const text = customText || style.text;
  const topText = customText ? '' : style.topText;
  const bottomText = customText ? text : style.bottomText;

  if (topText) {
    ctx.strokeText(topText, width / 2, height * 0.15);
    ctx.fillText(topText, width / 2, height * 0.15);
  }

  if (bottomText) {
    ctx.strokeText(bottomText, width / 2, height * 0.9);
    ctx.fillText(bottomText, width / 2, height * 0.9);
  }

  return canvas.toDataURL('image/png');
};
