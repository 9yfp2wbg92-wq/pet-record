import { User, Pet, Post, Milestone, Meme } from '../types';

const STORAGE_KEYS = {
  USERS: 'pet_tracker_users',
  PETS: 'pet_tracker_pets',
  POSTS: 'pet_tracker_posts',
  MILESTONES: 'pet_tracker_milestones',
  MEMES: 'pet_tracker_memes',
  CURRENT_USER_ID: 'pet_tracker_current_user_id',
  CURRENT_PET_ID: 'pet_tracker_current_pet_id',
};

// Fix #10: 数据 schema 校验 — 损坏数据不导致白屏
function safeParse<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    if (!data) return fallback;
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) return fallback;
    return parsed as T;
  } catch {
    // 数据损坏时清除并返回默认值
    localStorage.removeItem(key);
    return fallback;
  }
}

export const storage = {
  // 用户操作
  getUsers: (): User[] => safeParse(STORAGE_KEYS.USERS, []),

  addUser: (user: User): void => {
    const users = storage.getUsers();
    users.push(user);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  updateUser: (updatedUser: User): void => {
    const users = storage.getUsers();
    const index = users.findIndex(u => u.id === updatedUser.id);
    if (index !== -1) {
      users[index] = updatedUser;
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    }
  },

  getUserById: (id: string): User | undefined => {
    return storage.getUsers().find(u => u.id === id);
  },

  getCurrentUserId: (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
  },

  setCurrentUserId: (id: string | null): void => {
    if (id) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, id);
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
    }
  },

  // 宠物操作
  getPets: (): Pet[] => safeParse(STORAGE_KEYS.PETS, []),

  getPetsByUserId: (userId: string): Pet[] => {
    const pets = storage.getPets();
    return pets.filter(pet =>
      pet.ownerUserId === userId || pet.sharedUserIds.includes(userId)
    );
  },

  addPet: (pet: Pet): void => {
    const pets = storage.getPets();
    pets.push(pet);
    localStorage.setItem(STORAGE_KEYS.PETS, JSON.stringify(pets));
  },

  updatePet: (updatedPet: Pet): void => {
    const pets = storage.getPets();
    const index = pets.findIndex(p => p.id === updatedPet.id);
    if (index !== -1) {
      pets[index] = updatedPet;
      localStorage.setItem(STORAGE_KEYS.PETS, JSON.stringify(pets));
    }
  },

  deletePet: (id: string): void => {
    const pets = storage.getPets();
    const filtered = pets.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PETS, JSON.stringify(filtered));
  },

  getPetByInviteCode: (inviteCode: string): Pet | undefined => {
    const pets = storage.getPets();
    return pets.find(p => p.inviteCode === inviteCode);
  },

  getCurrentPetId: (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_PET_ID);
  },

  setCurrentPetId: (id: string | null): void => {
    if (id) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_PET_ID, id);
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_PET_ID);
    }
  },

  // 动态操作
  getPosts: (): Post[] => safeParse(STORAGE_KEYS.POSTS, []),

  getPostsByPetId: (petId: string): Post[] => {
    const posts = storage.getPosts();
    return posts.filter(p => p.petId === petId).sort(
      (a, b) => new Date(b.createdAt || b.timestamp || '').getTime() - new Date(a.createdAt || a.timestamp || '').getTime()
    );
  },

  getPostsByPetIds: (petIds: string[]): Post[] => {
    const posts = storage.getPosts();
    return posts.filter(p => petIds.includes(p.petId)).sort(
      (a, b) => new Date(b.createdAt || b.timestamp || '').getTime() - new Date(a.createdAt || a.timestamp || '').getTime()
    );
  },

  addPost: (post: Post): void => {
    const posts = storage.getPosts();
    posts.push(post);
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
  },

  updatePost: (updatedPost: Post): void => {
    const posts = storage.getPosts();
    const index = posts.findIndex(p => p.id === updatedPost.id);
    if (index !== -1) {
      posts[index] = updatedPost;
      localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
    }
  },

  deletePost: (id: string): void => {
    const posts = storage.getPosts();
    const filtered = posts.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(filtered));
  },

  // 里程碑操作
  getMilestones: (): Milestone[] => safeParse(STORAGE_KEYS.MILESTONES, []),

  getMilestonesByPetId: (petId: string): Milestone[] => {
    const milestones = storage.getMilestones();
    return milestones.filter(m => m.petId === petId).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  },

  addMilestone: (milestone: Milestone): void => {
    const milestones = storage.getMilestones();
    milestones.push(milestone);
    localStorage.setItem(STORAGE_KEYS.MILESTONES, JSON.stringify(milestones));
  },

  updateMilestone: (updatedMilestone: Milestone): void => {
    const milestones = storage.getMilestones();
    const index = milestones.findIndex(m => m.id === updatedMilestone.id);
    if (index !== -1) {
      milestones[index] = updatedMilestone;
      localStorage.setItem(STORAGE_KEYS.MILESTONES, JSON.stringify(milestones));
    }
  },

  deleteMilestone: (id: string): void => {
    const milestones = storage.getMilestones();
    const filtered = milestones.filter(m => m.id !== id);
    localStorage.setItem(STORAGE_KEYS.MILESTONES, JSON.stringify(filtered));
  },

  // 表情包操作
  getMemes: (): Meme[] => safeParse(STORAGE_KEYS.MEMES, []),

  getMemesByPetId: (petId: string): Meme[] => {
    const memes = storage.getMemes();
    return memes.filter(m => m.petId === petId).sort(
      (a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
    );
  },

  getMemesByPetIds: (petIds: string[]): Meme[] => {
    const memes = storage.getMemes();
    return memes.filter(m => petIds.includes(m.petId)).sort(
      (a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
    );
  },

  addMeme: (meme: Meme): void => {
    const memes = storage.getMemes();
    memes.push(meme);
    localStorage.setItem(STORAGE_KEYS.MEMES, JSON.stringify(memes));
  },

  deleteMeme: (id: string): void => {
    const memes = storage.getMemes();
    const filtered = memes.filter(m => m.id !== id);
    localStorage.setItem(STORAGE_KEYS.MEMES, JSON.stringify(filtered));
  },

  // 生成邀请码
  generateInviteCode: (): string => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const array = new Uint8Array(6);
    crypto.getRandomValues(array);
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(array[i] % chars.length);
    }
    return code;
  },

  // Fix #4: 邀请码暴力枚举防护 — 连续失败计数
  getInviteFailCount: (): number => {
    const data = localStorage.getItem('pet_tracker_invite_fails');
    if (!data) return 0;
    try {
      const { count, timestamp } = JSON.parse(data);
      // 1小时后重置计数
      if (Date.now() - timestamp > 3600000) return 0;
      return count;
    } catch { return 0; }
  },

  recordInviteFail: (): void => {
    const current = storage.getInviteFailCount();
    localStorage.setItem('pet_tracker_invite_fails', JSON.stringify({
      count: current + 1,
      timestamp: Date.now(),
    }));
  },

  clearInviteFails: (): void => {
    localStorage.removeItem('pet_tracker_invite_fails');
  },
};
