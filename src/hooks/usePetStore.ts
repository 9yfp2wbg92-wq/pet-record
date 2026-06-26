import { create } from 'zustand';
import { User, Pet, Post, Milestone, Meme, Comment, Like } from '../types';
import { storage } from '../utils/storage';

interface AppState {
  currentUser: User | null;
  users: User[];
  pets: Pet[];
  posts: Post[];
  milestones: Milestone[];
  memes: Meme[];
  currentPetId: string | null;
  
  // 计算属性
  currentPet: Pet | null;
  
  // 用户操作
  registerUser: (name: string, avatar?: string) => User;
  switchUser: (userId: string) => void;
  logout: () => void;
  
  // 宠物操作
  addPet: (pet: Omit<Pet, 'id' | 'inviteCode' | 'ownerUserId' | 'sharedUserIds'>) => Pet;
  updatePet: (pet: Pet) => void;
  deletePet: (id: string) => void;
  sharePet: (petId: string) => string;
  joinPetByInviteCode: (code: string) => Pet | null;
  
  // 动态操作
  addPost: (post: Omit<Post, 'id' | 'authorUserId' | 'comments' | 'likes'>) => void;
  addComment: (postId: string, comment: Omit<Comment, 'id' | 'authorUserId'>) => void;
  toggleLike: (postId: string) => void;
  
  // 里程碑操作
  addMilestone: (milestone: Omit<Milestone, 'id' | 'authorUserId'>) => void;
  updateMilestone: (milestone: Milestone) => void;
  deleteMilestone: (id: string) => void;
  
  // 表情包操作
  addMeme: (meme: Omit<Meme, 'id' | 'authorUserId'>) => void;
  
  // 选择宠物
  setCurrentPetId: (id: string | null) => void;
  
  // 获取家庭成员
  getFamilyMembers: (petId: string) => User[];
  
  // 加载数据
  loadData: () => void;
}

export const usePetStore = create<AppState>((set, get) => ({
  currentUser: null,
  users: [],
  pets: [],
  posts: [],
  milestones: [],
  memes: [],
  currentPetId: null,
  currentPet: null,

  registerUser: (name: string, avatar?: string) => {
    const newUser: User = {
      id: Date.now().toString(),
      name,
      avatar,
      createdAt: new Date().toISOString(),
    };
    storage.addUser(newUser);
    storage.setCurrentUserId(newUser.id);
    
    // 重新加载数据，确保新用户的数据是空的
    const pets = storage.getPetsByUserId(newUser.id);
    const petIds = pets.map(p => p.id);
    const posts = petIds.length > 0 ? storage.getPostsByPetIds(petIds) : [];
    const memes = petIds.length > 0 ? storage.getMemesByPetIds(petIds) : [];
    
    // 为新用户获取里程碑
    const milestones: Milestone[] = [];
    pets.forEach(pet => {
      const petMilestones = storage.getMilestonesByPetId(pet.id);
      milestones.push(...petMilestones);
    });
    
    const currentPetId = pets.length > 0 ? pets[0].id : null;
    if (currentPetId) {
      storage.setCurrentPetId(currentPetId);
    }
    
    set(state => ({
      ...state,
      users: [...state.users, newUser],
      currentUser: newUser,
      pets,
      posts,
      milestones,
      memes,
      currentPetId,
      currentPet: currentPetId ? pets[0] : null,
    }));
    
    return newUser;
  },

  switchUser: (userId: string) => {
    const user = storage.getUserById(userId);
    if (user) {
      storage.setCurrentUserId(userId);
      // 使用get()获取loadData方法（因为loadData在后面定义）
      get().loadData();
    }
  },

  logout: () => {
    storage.setCurrentUserId(null);
    set(state => ({
      ...state,
      currentUser: null,
      currentPetId: null,
      currentPet: null,
    }));
  },

  addPet: (petData) => {
    const state = get();
    if (!state.currentUser) throw new Error('请先登录');
    
    const newPet: Pet = {
      id: Date.now().toString(),
      inviteCode: storage.generateInviteCode(),
      ownerUserId: state.currentUser.id,
      sharedUserIds: [],
      ...petData,
    };
    storage.addPet(newPet);
    
    // 自动创建里程碑
    const newMilestones: Milestone[] = [];
    
    // 创建"到家"里程碑
    if (petData.homeDate) {
      const homeMilestone: Milestone = {
        id: Date.now().toString() + '_home',
        petId: newPet.id,
        authorUserId: state.currentUser.id,
        type: 'home',
        title: '到家',
        description: `${newPet.name}来到新家的第一天`,
        date: petData.homeDate,
        metrics: {},
        isAI: false,
        icon: 'home',
      };
      storage.addMilestone(homeMilestone);
      newMilestones.push(homeMilestone);
    }
    
    // 创建"出生日期"里程碑
    if (petData.birthDateType === 'exact' && petData.birthDate) {
      const birthMilestone: Milestone = {
        id: Date.now().toString() + '_birth',
        petId: newPet.id,
        authorUserId: state.currentUser.id,
        type: 'anniversary',
        title: '生日',
        description: `${newPet.name}的生日`,
        date: petData.birthDate,
        metrics: {},
        isAI: false,
        icon: 'anniversary',
      };
      storage.addMilestone(birthMilestone);
      newMilestones.push(birthMilestone);
    } else if (petData.birthDateType === 'estimated' && petData.birthYear) {
      // 如果只有年份，创建一个大致的生日记录
      const birthMilestone: Milestone = {
        id: Date.now().toString() + '_birth',
        petId: newPet.id,
        authorUserId: state.currentUser.id,
        type: 'anniversary',
        title: '生日',
        description: `${newPet.name}出生于${petData.birthYear}年`,
        date: `${petData.birthYear}-01-01`,
        metrics: {},
        isAI: false,
        icon: 'anniversary',
      };
      storage.addMilestone(birthMilestone);
      newMilestones.push(birthMilestone);
    }
    
    set(state => ({
      ...state,
      pets: [...state.pets, newPet],
      milestones: [...state.milestones, ...newMilestones],
    }));
    
    return newPet;
  },

  updatePet: (pet) => {
    const state = get();
    const existingPet = state.pets.find(p => p.id === pet.id);
    // Fix #6: 只有宠物主人可以修改宠物信息，shared user 无权修改
    if (!existingPet || existingPet.ownerUserId !== state.currentUser?.id) return;
    storage.updatePet(pet);

    // 更新到家和生日里程碑，保持与宠物资料卡一致
    const currentMilestones = state.milestones;
    let updatedMilestones = [...currentMilestones];
    let hasChanges = false;

    // 1. 更新"到家"里程碑
    const homeMsIndex = updatedMilestones.findIndex(
      m => m.petId === pet.id && m.type === 'home' && m.title === '到家'
    );

    if (pet.homeDate) {
      // 如果用户填了到家日期
      const newHomeMilestone: Milestone = {
        id: homeMsIndex >= 0 ? updatedMilestones[homeMsIndex].id : Date.now().toString() + '_home',
        petId: pet.id,
        authorUserId: pet.ownerUserId || state.currentUser?.id || '',
        type: 'home',
        title: '到家',
        description: `${pet.name}来到新家的第一天`,
        date: pet.homeDate,
        metrics: {},
        isAI: false,
        icon: 'home',
      };

      if (homeMsIndex >= 0) {
        // 日期变化才更新
        if (updatedMilestones[homeMsIndex].date !== pet.homeDate) {
          updatedMilestones[homeMsIndex] = newHomeMilestone;
          storage.updateMilestone(newHomeMilestone);
          hasChanges = true;
        }
      } else {
        // 新增里程碑
        storage.addMilestone(newHomeMilestone);
        updatedMilestones.push(newHomeMilestone);
        hasChanges = true;
      }
    } else if (homeMsIndex >= 0) {
      // 用户清空了到家日期，但有里程碑，删除它
      storage.deleteMilestone(updatedMilestones[homeMsIndex].id);
      updatedMilestones.splice(homeMsIndex, 1);
      hasChanges = true;
    }

    // 2. 更新"生日"里程碑
    const birthMsIndex = updatedMilestones.findIndex(
      m => m.petId === pet.id && m.type === 'anniversary' && (m.title === '生日' || m.description?.includes('出生'))
    );

    let newBirthDate: string | undefined;
    let newBirthDesc: string | undefined;

    if (pet.birthDateType === 'exact' && pet.birthDate) {
      newBirthDate = pet.birthDate;
      newBirthDesc = `${pet.name}的生日`;
    } else if (pet.birthDateType === 'estimated' && pet.birthYear) {
      newBirthDate = `${pet.birthYear}-01-01`;
      newBirthDesc = `${pet.name}出生于${pet.birthYear}年`;
    }

    if (newBirthDate && newBirthDesc) {
      const newBirthMilestone: Milestone = {
        id: birthMsIndex >= 0 ? updatedMilestones[birthMsIndex].id : Date.now().toString() + '_birth',
        petId: pet.id,
        authorUserId: pet.ownerUserId || state.currentUser?.id || '',
        type: 'anniversary',
        title: '生日',
        description: newBirthDesc,
        date: newBirthDate,
        metrics: {},
        isAI: false,
        icon: 'anniversary',
      };

      if (birthMsIndex >= 0) {
        if (updatedMilestones[birthMsIndex].date !== newBirthDate) {
          updatedMilestones[birthMsIndex] = newBirthMilestone;
          storage.updateMilestone(newBirthMilestone);
          hasChanges = true;
        }
      } else {
        storage.addMilestone(newBirthMilestone);
        updatedMilestones.push(newBirthMilestone);
        hasChanges = true;
      }
    } else if (birthMsIndex >= 0) {
      // 用户清空了生日信息，删除里程碑
      storage.deleteMilestone(updatedMilestones[birthMsIndex].id);
      updatedMilestones.splice(birthMsIndex, 1);
      hasChanges = true;
    }

    set(s => ({
      ...s,
      pets: s.pets.map(p => p.id === pet.id ? pet : p),
      currentPet: s.currentPetId === pet.id ? pet : s.currentPet,
      milestones: hasChanges ? updatedMilestones : s.milestones,
    }));
  },

  deletePet: (id) => {
    const state = get();
    const pet = state.pets.find(p => p.id === id);
    // Fix #1: 只有宠物主人可以删除，shared user 无权删除
    if (!pet || pet.ownerUserId !== state.currentUser?.id) return;

    // Fix #2: 级联删除关联的 posts、milestones、memes
    const petPosts = storage.getPostsByPetId(id);
    petPosts.forEach(p => storage.deletePost(p.id));
    const petMilestones = storage.getMilestonesByPetId(id);
    petMilestones.forEach(m => storage.deleteMilestone(m.id));
    const petMemes = storage.getMemesByPetId(id);
    petMemes.forEach(m => storage.deleteMeme(m.id));

    storage.deletePet(id);
    set(state => ({
      ...state,
      pets: state.pets.filter(p => p.id !== id),
      posts: state.posts.filter(p => p.petId !== id),
      milestones: state.milestones.filter(m => m.petId !== id),
      memes: state.memes.filter(m => m.petId !== id),
      currentPetId: state.currentPetId === id ? null : state.currentPetId,
      currentPet: state.currentPetId === id ? null : state.currentPet,
    }));
  },

  sharePet: (petId) => {
    const state = get();
    const pet = state.pets.find(p => p.id === petId);
    if (!pet) throw new Error('宠物不存在');
    return pet.inviteCode;
  },

  joinPetByInviteCode: (code) => {
    const state = get();
    if (!state.currentUser) throw new Error('请先登录');

    // Fix #4: 邀请码暴力枚举防护 — 连续失败 5 次后锁定 1 小时
    const failCount = storage.getInviteFailCount();
    if (failCount >= 5) {
      throw new Error('尝试次数过多，请1小时后再试');
    }

    const pet = storage.getPetByInviteCode(code);
    if (!pet) {
      storage.recordInviteFail();
      return null;
    }

    // 成功则清除失败计数
    storage.clearInviteFails();

    if (pet.ownerUserId === state.currentUser.id || pet.sharedUserIds.includes(state.currentUser.id)) {
      return pet;
    }

    const updatedPet = {
      ...pet,
      sharedUserIds: [...pet.sharedUserIds, state.currentUser.id],
    };

    storage.updatePet(updatedPet);
    set(s => ({
      ...s,
      pets: s.pets.map(p => p.id === pet.id ? updatedPet : p),
    }));

    return updatedPet;
  },

  addPost: (postData) => {
    const state = get();
    if (!state.currentUser) throw new Error('请先登录');
    
    const newPost: Post = {
      id: Date.now().toString(),
      authorUserId: state.currentUser.id,
      comments: [],
      likes: [],
      ...postData,
    };
    storage.addPost(newPost);
    
    set(state => ({
      ...state,
      posts: [...state.posts, newPost],
    }));
  },

  addComment: (postId, commentData) => {
    const state = get();
    if (!state.currentUser) throw new Error('请先登录');
    
    const post = state.posts.find(p => p.id === postId);
    if (!post) return;
    
    const newComment: Comment = {
      id: Date.now().toString(),
      authorUserId: state.currentUser.id,
      ...commentData,
    };
    
    const updatedPost = {
      ...post,
      comments: [...post.comments, newComment],
    };
    
    storage.updatePost(updatedPost);
    
    set(s => ({
      ...s,
      posts: s.posts.map(p => p.id === postId ? updatedPost : p),
    }));
  },

  toggleLike: (postId) => {
    const state = get();
    if (!state.currentUser) throw new Error('请先登录');
    
    const post = state.posts.find(p => p.id === postId);
    if (!post) return;
    
    const currentUserId = state.currentUser.id;
    const currentUserName = state.currentUser.name;
    const existingLikeIndex = post.likes.findIndex(l => l.userId === currentUserId);
    let updatedPost: Post;
    
    if (existingLikeIndex >= 0) {
      // 取消点赞
      updatedPost = {
        ...post,
        likes: post.likes.filter((_, index) => index !== existingLikeIndex),
      };
    } else {
      // 添加点赞
      const newLike: Like = {
        userId: currentUserId,
        userName: currentUserName,
        createdAt: new Date().toISOString(),
      };
      updatedPost = {
        ...post,
        likes: [...post.likes, newLike],
      };
    }
    
    storage.updatePost(updatedPost);
    
    set(s => ({
      ...s,
      posts: s.posts.map(p => p.id === postId ? updatedPost : p),
    }));
  },

  addMilestone: (milestoneData) => {
    const state = get();
    if (!state.currentUser) throw new Error('请先登录');

    // Fix #3: 验证 petId 属于当前用户的宠物
    const pet = state.pets.find(p => p.id === milestoneData.petId);
    if (!pet) return;

    // Fix #7: 事件去重 — 同宠物 + 同类型 + 同日期 → 跳过（防止 mockAI 重复提取）
    const isDuplicate = state.milestones.some(
      m => m.petId === milestoneData.petId
        && m.type === milestoneData.type
        && m.date === milestoneData.date
    );
    if (isDuplicate) return;

    const newMilestone: Milestone = {
      id: Date.now().toString(),
      authorUserId: state.currentUser.id,
      ...milestoneData,
    };
    storage.addMilestone(newMilestone);

    set(state => ({
      ...state,
      milestones: [...state.milestones, newMilestone],
    }));
  },

  updateMilestone: (milestone) => {
    storage.updateMilestone(milestone);
    set(state => ({
      ...state,
      milestones: state.milestones.map(m => m.id === milestone.id ? milestone : m),
    }));
  },

  deleteMilestone: (id) => {
    storage.deleteMilestone(id);
    set(state => ({
      ...state,
      milestones: state.milestones.filter(m => m.id !== id),
    }));
  },

  addMeme: (memeData) => {
    const state = get();
    if (!state.currentUser) throw new Error('请先登录');
    
    const newMeme: Meme = {
      id: Date.now().toString(),
      authorUserId: state.currentUser.id,
      ...memeData,
    };
    storage.addMeme(newMeme);
    
    set(state => ({
      ...state,
      memes: [...state.memes, newMeme],
    }));
  },

  setCurrentPetId: (id) => {
    storage.setCurrentPetId(id);
    set(state => {
      const currentPet = id ? state.pets.find(p => p.id === id) || null : null;
      return {
        ...state,
        currentPetId: id,
        currentPet,
      };
    });
  },

  getFamilyMembers: (petId) => {
    const state = get();
    const pet = state.pets.find(p => p.id === petId);
    if (!pet) return [];
    const memberIds = [pet.ownerUserId, ...pet.sharedUserIds];
    return memberIds
      .map(id => state.users.find(u => u.id === id))
      .filter((u): u is User => u !== undefined);
  },

  loadData: () => {
    const currentUserId = storage.getCurrentUserId();
    let currentUser: User | null = null;
    const users = storage.getUsers();
    
    if (currentUserId) {
      currentUser = storage.getUserById(currentUserId) || null;
    }
    
    const pets = currentUser ? storage.getPetsByUserId(currentUser.id) : [];
    const petIds = pets.map(p => p.id);
    // 为旧帖子初始化likes字段（兼容旧数据）
    const posts = petIds.length > 0
      ? storage.getPostsByPetIds(petIds).map(p => {
          // Fix #9: 数据迁移 — 统一 timestamp → createdAt
          const normalized = { ...p, likes: p.likes || [] };
          if (!normalized.createdAt && normalized.timestamp) {
            normalized.createdAt = normalized.timestamp;
          }
          return normalized;
        })
      : [];
    const memes = petIds.length > 0 ? storage.getMemesByPetIds(petIds) : [];
    
    let milestones: Milestone[] = [];
    pets.forEach(pet => {
      const petMilestones = storage.getMilestonesByPetId(pet.id);
      milestones = [...milestones, ...petMilestones];
    });
    
    const currentPetId = storage.getCurrentPetId();
    const validCurrentPetId = currentPetId && petIds.includes(currentPetId) ? currentPetId : null;
    const currentPet = validCurrentPetId ? pets.find(p => p.id === validCurrentPetId) || null : null;
    
    set({
      currentUser,
      users,
      pets,
      posts,
      milestones,
      memes,
      currentPetId: validCurrentPetId,
      currentPet,
    });
  },
}));
