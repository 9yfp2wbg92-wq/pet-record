export interface User {
  id: string;
  name: string;
  avatar?: string;
  createdAt: string;
}

export interface Pet {
  id: string;
  name: string;
  categoryId: string;
  subCategoryId?: string;
  specificBreed?: string;
  customBreed?: string;
  gender?: 'female' | 'male' | 'unknown';
  birthDate?: string;
  birthDateType?: 'exact' | 'estimated' | 'unknown';
  birthYear?: string;
  birthMonth?: string;
  homeDate: string;
  avatar?: string;
  inviteCode: string;
  ownerUserId: string;
  sharedUserIds: string[];
}

export interface Comment {
  id: string;
  postId: string;
  authorUserId: string;
  content: string;
  createdAt: string;
}

export interface Like {
  userId: string;
  userName: string;
  createdAt: string;
}

export interface Post {
  id: string;
  petId: string;
  petIds?: string[]; // 多宠物动态（一条动态涉及多个宝贝）
  authorUserId?: string;
  author?: string;
  content: string;
  media: string[];
  createdAt?: string;
  timestamp?: string;
  comments: Comment[];
  likes: Like[];
  isAI?: boolean;
}

export interface Milestone {
  id: string;
  petId: string;
  type: 'home' | 'vaccine' | 'deworm' | 'bath' | 'neuter' | 'anniversary' | 'custom' | 'weight' | 'medical' | 'abnormal' | 'other';
  title: string;
  description?: string;
  date: string;
  icon: string;
  authorUserId?: string;
  isEstimated?: boolean;
  onlyMonth?: boolean;
  onlyYear?: boolean;
  metrics?: Record<string, number>;
  isAI?: boolean;
  reminder_interval?: number; // 用户自定义的提醒间隔天数
}

export interface Meme {
  id: string;
  petId: string;
  authorUserId: string;
  image: string;
  style: string;
  createdAt: string;
}
