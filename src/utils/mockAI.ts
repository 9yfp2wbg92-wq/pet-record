export interface DetectedEvent {
  event_type: string;
  event_name: string;
  summary: string;
  metrics: Record<string, number>;
  next_predicted_date: string;
  next_days_interval?: number; // 用户自定义的下次提醒间隔天数
}

export interface AIExtractedData {
  has_event: boolean;
  events: DetectedEvent[];
  date: string;
  raw_text: string;
  detected_pet_name?: string; // AI识别到的宠物名字
}

export function mockAIExtract(text: string, currentDate: string, petNames?: string[]): AIExtractedData {
  const lowerText = text.toLowerCase();
  const events: DetectedEvent[] = [];
  const today = new Date(currentDate);

  // 识别宠物名字 —— 更智能的匹配
  let detectedPetName: string | undefined;
  if (petNames && petNames.length > 0) {
    // 1. 按名字长度从长到短排序，优先匹配更具体的名字
    const sortedPetNames = [...petNames].sort((a, b) => b.length - a.length);

    // 2. 常见宠物称呼模式
    const petNamePatterns = sortedPetNames.map(name => ({
      name,
      patterns: [
        name,                          // 精确匹配: 豆豆
        `${name}今天`,                  // 豆豆今天
        `${name}现在`,                  // 豆豆现在
        `${name}又`,                    // 豆豆又
        `${name}刚`,                    // 豆豆刚
        `${name}去`,                    // 豆豆去
        `我家的${name}`,                // 我家的豆豆
        `我家${name}`,                  // 我家豆豆
        `给${name}`,                    // 给豆豆
        `${name}去医院`,                // 豆豆去医院
        `${name}去看`,                  // 豆豆去看
        `${name}看病`,                  // 豆豆看病
        `${name}打针`,                  // 豆豆打针
        `${name}洗澡`,                  // 豆豆洗澡
        `${name}驱虫`,                  // 豆豆驱虫
        `${name}疫苗`,                  // 豆豆疫苗
        `${name}体重`,                  // 豆豆体重
        `${name}${name.charAt(name.length - 1)}`, // 豆豆豆
      ]
    }));

    // 3. 第一阶段：在文本中寻找包含宠物名字的模式
    let bestMatch: { name: string; score: number } | null = null;

    for (const { name, patterns } of petNamePatterns) {
      for (const pattern of patterns) {
        if (text.includes(pattern) || lowerText.includes(pattern.toLowerCase())) {
          // 越具体的模式得分越高
          const score = pattern.length + (name.length * 2);
          if (!bestMatch || score > bestMatch.score) {
            bestMatch = { name, score };
          }
        }
      }
    }

    // 4. 第二阶段：如果没有模式匹配，尝试查找文本中的宠物名字作为独立的词
    if (!bestMatch) {
      // 定义常见的分隔符/边界字符
      const boundaries = [' ', ',', '，', '。', '.', '!', '！', '?', '？', '\n', '\r', '的', '了', '在', '要', '去', '给', '和', '与', '、'];
      const textLength = text.length;

      for (const name of sortedPetNames) {
        let searchStart = 0;
        while (searchStart < textLength) {
          const idx = text.indexOf(name, searchStart);
          if (idx === -1) break;

          // 检查名字前后的字符是否为边界字符
          const charBefore = idx > 0 ? text.charAt(idx - 1) : '';
          const charAfter = idx + name.length < textLength ? text.charAt(idx + name.length) : '';

          const isWordBoundary =
            (charBefore === '' || boundaries.includes(charBefore) || charBefore === name.charAt(0)) &&
            (charAfter === '' || boundaries.includes(charAfter));

          if (isWordBoundary) {
            const score = name.length * 3;
            if (!bestMatch || score > bestMatch.score) {
              bestMatch = { name, score };
            }
            break;
          }

          searchStart = idx + 1;
        }
      }
    }

    // 5. 第三阶段：简单的包含匹配（作为兜底）
    if (!bestMatch) {
      for (const name of sortedPetNames) {
        if (text.includes(name) || lowerText.includes(name.toLowerCase())) {
          // 名字越长越可能是正确的匹配
          const score = name.length * 2;
          if (!bestMatch || score > bestMatch.score) {
            bestMatch = { name, score };
          }
        }
      }
    }

    if (bestMatch) {
      detectedPetName = bestMatch.name;
    }
  }

  const addDays = (days: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };
  const addMonths = (months: number) => {
    const d = new Date(today);
    d.setMonth(d.getMonth() + months);
    return d.toISOString().split('T')[0];
  };

  // 提取体重数值
  let weightValue: number | null = null;
  // 匹配各种格式：5kg、体重5kg、体重5、体重 5kg、体重 5、5斤、体重5斤 等
  const weightMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:kg|公斤)|体重[：:\s]*(\d+(?:\.\d+)?)\s*(?:kg|公斤)?|(\d+(?:\.\d+)?)\s*斤/i);
  if (weightMatch) {
    let weight: number;
    if (weightMatch[3]) {
      // 斤为单位，需要除以2转换为公斤
      weight = parseFloat(weightMatch[3]) / 2;
    } else {
      weight = parseFloat(weightMatch[1] || weightMatch[2]);
    }
    if (!isNaN(weight) && weight > 0 && weight < 500) {
      weightValue = weight;
    }
  }

  // 识别驱虫（区分体内/体外）
  if (lowerText.includes('驱虫') || lowerText.includes('除虫') || lowerText.includes('打虫')) {
    const isInternal = lowerText.includes('体内') || lowerText.includes('内驱');
    const isExternal = lowerText.includes('体外') || lowerText.includes('外驱');

    if (isInternal && isExternal) {
      events.push({
        event_type: '驱虫',
        event_name: '体内外驱虫',
        summary: '进行体内外驱虫处理',
        metrics: {},
        next_predicted_date: addDays(30),
        next_days_interval: 30,
      });
    } else if (isInternal) {
      events.push({
        event_type: '驱虫',
        event_name: '体内驱虫',
        summary: '进行体内驱虫处理',
        metrics: {},
        next_predicted_date: addDays(90),
        next_days_interval: 90,
      });
    } else if (isExternal) {
      events.push({
        event_type: '驱虫',
        event_name: '体外驱虫',
        summary: '进行体外驱虫处理',
        metrics: {},
        next_predicted_date: addDays(30),
        next_days_interval: 30,
      });
    } else {
      events.push({
        event_type: '驱虫',
        event_name: '驱虫处理',
        summary: '进行驱虫处理',
        metrics: {},
        next_predicted_date: addDays(30),
        next_days_interval: 30,
      });
    }
  }

  // 识别洗澡
  if (lowerText.includes('洗澡') || lowerText.includes('沐浴') || lowerText.includes('泡澡')) {
    events.push({
      event_type: '洗澡',
      event_name: '洗澡清洁',
      summary: '洗澡清洁',
      metrics: {},
      next_predicted_date: addDays(30),
      next_days_interval: 30,
    });
  }

  // 识别疫苗
  if (lowerText.includes('疫苗') || lowerText.includes('打针') || lowerText.includes('免疫') || lowerText.includes('狂犬')) {
    const vaccineName = lowerText.includes('狂犬') ? '狂犬' : lowerText.includes('三联') ? '三联' : lowerText.includes('四联') ? '四联' : '';
    events.push({
      event_type: '疫苗',
      event_name: `${vaccineName}疫苗接种`,
      summary: `${vaccineName}疫苗接种`,
      metrics: {},
      next_predicted_date: addMonths(11),
      next_days_interval: 365,
    });
  }

  // 识别体重记录
  if (lowerText.includes('体重') || weightMatch) {
    events.push({
      event_type: '体重',
      event_name: '体重记录',
      summary: weightValue ? `体重 ${weightValue}kg` : '体重记录',
      metrics: weightValue ? { weight_kg: weightValue } : {},
      next_predicted_date: addDays(30),
      next_days_interval: 30,
    });
  }

  // 识别就医
  if (lowerText.includes('就医') || lowerText.includes('看病') || lowerText.includes('医院') || lowerText.includes('兽医') || lowerText.includes('看诊')) {
    events.push({
      event_type: '就医',
      event_name: '就医问诊',
      summary: '就医问诊',
      metrics: {},
      next_predicted_date: '',
      next_days_interval: 0,
    });
  }

  // 识别异常情况
  if (lowerText.includes('异常') || lowerText.includes('拉稀') || lowerText.includes('呕吐') || lowerText.includes('发烧') || lowerText.includes('生病') || lowerText.includes('食欲不振') || lowerText.includes('没精神')) {
    const symptoms: string[] = [];
    if (lowerText.includes('拉稀')) symptoms.push('拉稀');
    if (lowerText.includes('呕吐')) symptoms.push('呕吐');
    if (lowerText.includes('发烧')) symptoms.push('发烧');
    if (lowerText.includes('食欲不振')) symptoms.push('食欲不振');
    if (lowerText.includes('没精神') || lowerText.includes('精神差')) symptoms.push('精神差');
    events.push({
      event_type: '异常',
      event_name: '异常情况',
      summary: symptoms.length > 0 ? `出现${symptoms.join('、')}症状` : '出现异常情况',
      metrics: {},
      next_predicted_date: '',
      next_days_interval: 0,
    });
  }

  return {
    has_event: events.length > 0,
    events,
    date: currentDate,
    raw_text: text,
    detected_pet_name: detectedPetName,
  };
}
