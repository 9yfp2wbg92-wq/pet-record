import { Cat, Dog, Bird, Rabbit, Turtle, PawPrint, Fish, Bug } from 'lucide-react';

export interface SubCategory {
  id: string;
  name: string;
  specificBreeds: string[];
  allowCustom?: boolean;
}

export interface BreedCategory {
  id: string;
  name: string;
  icon: any;
  subCategories: SubCategory[];
}

export const BREED_CATEGORIES: BreedCategory[] = [
  {
    id: 'cat',
    name: '猫咪',
    icon: Cat,
    subCategories: [
      {
        id: 'garden_cat',
        name: '中华田园猫',
        specificBreeds: ['橘猫', '狸花猫', '奶牛猫', '三花猫', '黑猫', '白猫', '橘白', '狸白'],
        allowCustom: false
      },
      {
        id: 'purebred',
        name: '品种猫',
        specificBreeds: ['英短', '美短', '布偶', '暹罗', '金渐层', '银渐层', '蓝猫', '加菲', '缅因', '波斯'],
        allowCustom: false
      },
      {
        id: 'other_cat_breed',
        name: '其他品种',
        specificBreeds: [],
        allowCustom: true
      }
    ]
  },
  {
    id: 'dog',
    name: '狗狗',
    icon: Dog,
    subCategories: [
      {
        id: 'garden_dog',
        name: '中华田园犬',
        specificBreeds: ['土狗', '柴犬', '秋田', '巴哥', '松狮', '沙皮', '下司'],
        allowCustom: false
      },
      {
        id: 'purebred_dog',
        name: '品种狗',
        specificBreeds: ['金毛', '拉布拉多', '泰迪', '比熊', '萨摩耶', '哈士奇', '阿拉斯加', '边牧', '德牧', '法斗', '柯基', '博美', '吉娃娃'],
        allowCustom: false
      },
      {
        id: 'other_dog_breed',
        name: '其他品种',
        specificBreeds: [],
        allowCustom: true
      }
    ]
  },
  {
    id: 'bird',
    name: '鸟类',
    icon: Bird,
    subCategories: [
      {
        id: 'parrot',
        name: '鹦鹉',
        specificBreeds: ['虎皮鹦鹉', '玄凤鹦鹉', '牡丹鹦鹉', '和尚鹦鹉', '小太阳', '灰鹦鹉', '金刚鹦鹉'],
        allowCustom: false
      },
      {
        id: 'songbird',
        name: '鸣禽',
        specificBreeds: ['八哥', '画眉', '鹩哥', '百灵', '金丝雀', '相思鸟'],
        allowCustom: false
      },
      {
        id: 'other_bird_breed',
        name: '其他品种',
        specificBreeds: [],
        allowCustom: true
      }
    ]
  },
  {
    id: 'rabbit',
    name: '兔子',
    icon: Rabbit,
    subCategories: [
      {
        id: 'pet_rabbit',
        name: '宠物兔',
        specificBreeds: ['垂耳兔', '侏儒兔', '安哥拉', '荷兰兔', '狮子兔', '猫猫兔'],
        allowCustom: false
      },
      {
        id: 'other_rabbit_breed',
        name: '其他品种',
        specificBreeds: [],
        allowCustom: true
      }
    ]
  },
  {
    id: 'turtle',
    name: '龟类',
    icon: Turtle,
    subCategories: [
      {
        id: 'water_turtle',
        name: '水龟',
        specificBreeds: ['巴西龟', '草龟', '花龟', '地图龟', '麝香龟', '火焰龟'],
        allowCustom: false
      },
      {
        id: 'land_turtle',
        name: '陆龟',
        specificBreeds: ['缅甸陆龟', '红腿陆龟', '苏卡达'],
        allowCustom: false
      },
      {
        id: 'other_turtle_breed',
        name: '其他品种',
        specificBreeds: [],
        allowCustom: true
      }
    ]
  },
  {
    id: 'fish',
    name: '鱼类',
    icon: Fish,
    subCategories: [
      {
        id: 'tropical_fish',
        name: '热带鱼',
        specificBreeds: ['孔雀鱼', '灯鱼', '神仙鱼', '斗鱼', '玛丽鱼', '斑马鱼', '地图鱼'],
        allowCustom: false
      },
      {
        id: 'cold_fish',
        name: '冷水鱼',
        specificBreeds: ['金鱼', '锦鲤', '草金'],
        allowCustom: false
      },
      {
        id: 'other_fish_breed',
        name: '其他品种',
        specificBreeds: [],
        allowCustom: true
      }
    ]
  },
  {
    id: 'hamster',
    name: '仓鼠',
    icon: PawPrint,
    subCategories: [
      {
        id: 'syrian_hamster',
        name: '金丝熊',
        specificBreeds: ['金丝熊', '虎纹熊', '奶油熊', '白熊'],
        allowCustom: false
      },
      {
        id: 'dwarf_hamster',
        name: '侏儒仓鼠',
        specificBreeds: ['三线', '银狐', '紫仓', '布丁', '奶茶', '老公公'],
        allowCustom: false
      },
      {
        id: 'other_hamster_breed',
        name: '其他品种',
        specificBreeds: [],
        allowCustom: true
      }
    ]
  },
  {
    id: 'other_pet',
    name: '其他宝贝',
    icon: Bug,
    subCategories: [
      {
        id: 'insect',
        name: '昆虫',
        specificBreeds: ['独角仙', '锹甲', '蝈蝈', '蟋蟀'],
        allowCustom: false
      },
      {
        id: 'reptile',
        name: '爬宠',
        specificBreeds: ['蜥蜴', '蛇', '守宫'],
        allowCustom: false
      },
      {
        id: 'other_custom',
        name: '自定义宝贝',
        specificBreeds: [],
        allowCustom: true
      }
    ]
  }
];

export const getCategoryById = (id: string): BreedCategory | undefined => {
  return BREED_CATEGORIES.find(cat => cat.id === id);
};

export const getSubCategoryById = (categoryId: string, subCategoryId: string): SubCategory | undefined => {
  const category = getCategoryById(categoryId);
  return category?.subCategories.find(sub => sub.id === subCategoryId);
};

export const getFullBreedDisplay = (
  categoryId: string, 
  subCategoryId?: string, 
  specificBreed?: string, 
  customBreed?: string
): string => {
  if (specificBreed) {
    return specificBreed;
  }
  
  if (customBreed) {
    return customBreed;
  }
  
  const category = getCategoryById(categoryId);
  if (!category) return '';
  
  const categoryName = category.name;
  
  if (!subCategoryId) return categoryName;
  
  const subCategory = getSubCategoryById(categoryId, subCategoryId);
  if (!subCategory) return categoryName;
  
  return subCategory.name;
};

export const calculateDaysAtHome = (homeDate: string): number => {
  const today = new Date();
  const home = new Date(homeDate);
  const diffTime = Math.abs(today.getTime() - home.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export const calculateAge = (
  birthDateType?: string, 
  birthDate?: string, 
  birthYear?: string, 
  birthMonth?: string
): { years: number; months: number; days: number; isEstimated?: boolean } | null => {
  if (birthDateType === 'unknown') return null;
  
  let birthDateObj: Date;
  
  if (birthDateType === 'exact' && birthDate) {
    birthDateObj = new Date(birthDate);
  } else if (birthDateType === 'estimated' && birthYear) {
    const year = parseInt(birthYear);
    const month = birthMonth ? parseInt(birthMonth) - 1 : 0;
    birthDateObj = new Date(year, month, 1);
  } else {
    return null;
  }
  
  const today = new Date();
  let years = today.getFullYear() - birthDateObj.getFullYear();
  let months = today.getMonth() - birthDateObj.getMonth();
  let days = today.getDate() - birthDateObj.getDate();
  
  if (days < 0) {
    months--;
    const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    days += lastMonth.getDate();
  }
  
  if (months < 0) {
    years--;
    months += 12;
  }
  
  if (years < 0) {
    years = 0;
    months = 0;
    days = 0;
  }
  
  return { 
    years, 
    months,
    days,
    isEstimated: birthDateType === 'estimated'
  };
};


