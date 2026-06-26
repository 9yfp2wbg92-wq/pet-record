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
  detected_pet_name?: string; // AI识别到的宠物名字（最佳匹配）
  detected_pet_names?: string[]; // 所有识别到的宠物名（多宠物动态）
}

// 解析文本中的相对日期词，返回实际日期字符串
function parseRelativeDate(text: string, today: Date): string | null {
  const dayMs = 24 * 60 * 60 * 1000;
  const fmt = (d: Date) => d.toISOString().split('T')[0];

  // 精确相对天数
  const relativeDays: Record<string, number> = {
    '大前天': -3, '前天': -2, '昨天': -1, '今天': 0,
    '明天': 1, '后天': 2, '大后天': 3,
  };
  for (const [word, offset] of Object.entries(relativeDays)) {
    if (text.includes(word)) {
      const d = new Date(today.getTime() + offset * dayMs);
      return fmt(d);
    }
  }

  // X天前 / X天之前
  const daysAgoMatch = text.match(/(\d{1,3})\s*天[之以]?前/);
  if (daysAgoMatch) {
    const d = new Date(today.getTime() - parseInt(daysAgoMatch[1]) * dayMs);
    return fmt(d);
  }

  // X天后 / X天之后
  const daysLaterMatch = text.match(/(\d{1,3})\s*天[之以]?后/);
  if (daysLaterMatch) {
    const d = new Date(today.getTime() + parseInt(daysLaterMatch[1]) * dayMs);
    return fmt(d);
  }

  // 上周X
  const lastWeekMatch = text.match(/上周([一二三四五六日天])/);
  if (lastWeekMatch) {
    const dayMap: Record<string, number> = { '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6, '日': 0, '天': 0 };
    const targetDay = dayMap[lastWeekMatch[1]];
    const currentDay = today.getDay();
    const daysToLastMonday = currentDay === 0 ? 6 : currentDay - 1; // days since last Monday
    const lastMonday = new Date(today.getTime() - (daysToLastMonday + 7) * dayMs);
    const d = new Date(lastMonday.getTime() + targetDay * dayMs);
    return fmt(d);
  }

  // 本周X
  const thisWeekMatch = text.match(/本周([一二三四五六日天])/);
  if (thisWeekMatch) {
    const dayMap: Record<string, number> = { '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6, '日': 0, '天': 0 };
    const targetDay = dayMap[thisWeekMatch[1]];
    const currentDay = today.getDay();
    const daysToLastMonday = currentDay === 0 ? 6 : currentDay - 1;
    const thisMonday = new Date(today.getTime() - daysToLastMonday * dayMs);
    const d = new Date(thisMonday.getTime() + targetDay * dayMs);
    return fmt(d);
  }

  // 周X（默认本周）
  const weekDayMatch = text.match(/周([一二三四五六日天])/);
  if (weekDayMatch) {
    const dayMap: Record<string, number> = { '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6, '日': 0, '天': 0 };
    const targetDay = dayMap[weekDayMatch[1]];
    const currentDay = today.getDay();
    const daysToLastMonday = currentDay === 0 ? 6 : currentDay - 1;
    const thisMonday = new Date(today.getTime() - daysToLastMonday * dayMs);
    let d = new Date(thisMonday.getTime() + targetDay * dayMs);
    // If the target day is before today, assume next week
    if (d.getTime() < today.getTime() - dayMs) {
      d = new Date(d.getTime() + 7 * dayMs);
    }
    return fmt(d);
  }

  // 上周 / 这周（模糊匹配，返回周中日期）
  if (text.includes('上周')) {
    const currentDay = today.getDay();
    const daysToLastMonday = currentDay === 0 ? 6 : currentDay - 1;
    const d = new Date(today.getTime() - (daysToLastMonday + 7) * dayMs);
    return fmt(d);
  }

  return null;
}

export function mockAIExtract(text: string, currentDate: string, petNames?: string[]): AIExtractedData {
  const lowerText = text.toLowerCase();
  const events: DetectedEvent[] = [];
  const today = new Date(currentDate);

  // 从文本中提取相对日期词，用于事件日期
  const extractedDate = parseRelativeDate(text, today);
  const eventDate = extractedDate || currentDate;

  // 识别宠物名字 —— 更智能的匹配（收集所有匹配到的宠物）
  let detectedPetName: string | undefined;
  const detectedPetNamesSet = new Set<string>();
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
      detectedPetNamesSet.add(bestMatch.name);
    }
    // 同时收集文本中出现的所有宠物名（支持多宠物动态）
    for (const name of sortedPetNames) {
      if (text.includes(name)) {
        detectedPetNamesSet.add(name);
      }
    }
  }

  const addDays = (days: number) => {
    const d = new Date(eventDate);
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };
  const addMonths = (months: number) => {
    const d = new Date(eventDate);
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
      next_predicted_date: '',
      next_days_interval: 0,
    });
  }

  // 识别绝育
  if (lowerText.includes('绝育') || lowerText.includes('阉割') || lowerText.includes('去势') || lowerText.includes('绝育手术')) {
    events.push({
      event_type: 'neuter',
      event_name: '绝育手术',
      summary: '进行绝育/去势手术',
      metrics: {},
      next_predicted_date: '',
      next_days_interval: 0,
    });
  }

  // 识别就医（打针需结合上下文判断，单独"打针"默认归为疫苗，用户可在弹窗中修改）
  if (lowerText.includes('就医') || lowerText.includes('看病') || lowerText.includes('医院') || lowerText.includes('兽医') || lowerText.includes('看诊') || lowerText.includes('就诊') || lowerText.includes('门诊')) {
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
    date: eventDate,
    raw_text: text,
    detected_pet_name: detectedPetName,
    detected_pet_names: detectedPetNamesSet.size > 0 ? Array.from(detectedPetNamesSet) : undefined,
  };
}
