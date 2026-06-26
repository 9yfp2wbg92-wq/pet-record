import { create } from 'zustand';

import { User, Pet, Post, Milestone, Meme, Comment, Like } from '../types';
import { isSupabaseConfigured } from '../lib/supabase';
import * as petService from '../lib/petService';

// 初始种子数据
import { initialUsers, initialPets, initialPosts, initialMilestones } from '../utils/initialData';

// 邀请码暴力枚举防护 — 独立于 store state 的速率限制
const INVITE_FAIL_KEY = 'pet_tracker_invite_fails';

function getInviteFailCount(): number {
  try {
    const data = localStorage.getItem(INVITE_FAIL_KEY);
    if (!data) return 0;
    const { count, timestamp } = JSON.parse(data);
    if (Date.now() - timestamp > 3600000) return 0;
    return count;
  } catch {
    return 0;
  }
}

function recordInviteFail(): void {
  const current = getInviteFailCount();
  localStorage.setItem(INVITE_FAIL_KEY, JSON.stringify({
    count: current + 1,
    timestamp: Date.now(),
  }));
}

function clearInviteFails(): void {
  localStorage.removeItem(INVITE_FAIL_KEY);
}

// 生成邀请码
function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const array = new Uint8Array(6);
  crypto.getRandomValues(array);
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(array[i] % chars.length);
  }
  return code;
}

// 持久化数据结构（不包含计算属性和 action）
interface PersistedState {
  currentUser: User | null;
  users: User[];
  pets: Pet[];
  posts: Post[];
  milestones: Milestone[];
  memes: Meme[];
  currentPetId: string | null;
}

interface AppState extends PersistedState {
  // 计算属性（不持久化）
  currentPet: Pet | null;

  // Supabase 状态（不持久化）
  supabaseReady: boolean;
  supabaseError: string | null;

  // 用户操作
  registerUser: (name: string, avatar?: string) => User;
  switchUser: (userId: string) => void;
  logout: () => void;

  // 宠物操作
  addPet: (pet: Omit<Pet, 'id' | 'inviteCode' | 'ownerUserId' | 'sharedUserIds'>) => Promise<Pet>;
  updatePet: (pet: Pet) => Promise<void>;
  deletePet: (id: string) => Promise<void>;
  sharePet: (petId: string) => string;
  joinPetByInviteCode: (code: string) => Pet | null;

  // 动态操作
  addPost: (post: Omit<Post, 'id' | 'authorUserId' | 'comments' | 'likes'>) => void;
  deletePost: (id: string) => void;
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

  // 初始化种子数据
  _seedInitialData: () => void;
}

// 辅助：根据 currentPetId 从 pets 中找到 currentPet
function computeCurrentPet(pets: Pet[], currentPetId: string | null): Pet | null {
  if (!currentPetId) return null;
  return pets.find(p => p.id === currentPetId) || null;
}

// 辅助：过滤当前用户可见的宠物
function getVisiblePets(pets: Pet[], userId: string | null): Pet[] {
  if (!userId) return [];
  return pets.filter(pet =>
    pet.ownerUserId === userId || pet.sharedUserIds.includes(userId)
  );
}

// 辅助：过滤当前用户可见的 posts
function getVisiblePosts(posts: Post[], petIds: string[]): Post[] {
  if (petIds.length === 0) return [];
  return posts
    .filter(p => petIds.includes(p.petId))
    .map(p => {
      // 数据迁移：统一 timestamp → createdAt
      const normalized = { ...p, likes: p.likes || [] };
      if (!normalized.createdAt && normalized.timestamp) {
        normalized.createdAt = normalized.timestamp;
      }
      return normalized;
    });
}

export const usePetStore = create<AppState>()((set, get) => ({
      currentUser: null,
      users: initialUsers,
      pets: initialPets,
      posts: initialPosts,
      milestones: initialMilestones,
      memes: [],
      currentPetId: null,
      currentPet: null,
      supabaseReady: false,
      supabaseError: null,

      registerUser: (name: string, avatar?: string) => {
        const newUser: User = {
          id: Date.now().toString(),
          name,
          avatar,
          createdAt: new Date().toISOString(),
        };

        set(state => {
          const newUsers = [...state.users, newUser];
          // 新用户暂时看不到任何宠物
          const currentPetId = null;
          return {
            users: newUsers,
            currentUser: newUser,
            currentPetId,
            currentPet: null,
            // 切换到新用户后，pets/posts/milestones/memes 应只显示该用户可见的
            ...filterStateForUser(newUser.id, state.pets, state.posts, state.milestones, state.memes),
          };
        });

        return newUser;
      },

      switchUser: (userId: string) => {
        const state = get();
        // 如果数据被清空（如退出登录后），重新播种 Demo 数据
        if (state.users.length === 0 && state.pets.length === 0) {
          get()._seedInitialData();
        }
        const refreshed = get();
        const user = refreshed.users.find(u => u.id === userId);
        if (!user) return;

        set({
          currentUser: user,
          ...filterStateForUser(user.id, refreshed.pets, refreshed.posts, refreshed.milestones, refreshed.memes),
        });
      },

      logout: () => {
        // 彻底清空所有数据（zustand state + 旧版 localStorage key + persist key）
        set({
          currentUser: null,
          currentPetId: null,
          currentPet: null,
          users: [],
          pets: [],
          posts: [],
          milestones: [],
          memes: [],
        });
        // 同步清除旧版分散的 localStorage key
        const oldKeys = ['pet_tracker_users', 'pet_tracker_pets', 'pet_tracker_posts',
          'pet_tracker_milestones', 'pet_tracker_memes', 'pet_tracker_current_user_id',
          'pet_tracker_current_pet_id', 'pet_tracker_store'];
        oldKeys.forEach(k => localStorage.removeItem(k));
      },

      addPet: async (petData) => {
        const state = get();
        if (!state.currentUser) throw new Error('请先登录');

        const newPet: Pet = {
          id: Date.now().toString(),
          inviteCode: generateInviteCode(),
          ownerUserId: state.currentUser.id,
          sharedUserIds: [],
          ...petData,
        };

        // 自动创建里程碑
        const newMilestones: Milestone[] = [];
        if (petData.homeDate) {
          newMilestones.push({
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
          });
        }
        if (petData.birthDateType === 'exact' && petData.birthDate) {
          newMilestones.push({
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
          });
        } else if (petData.birthDateType === 'estimated' && petData.birthYear) {
          newMilestones.push({
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
          });
        }

        // 尝试 Supabase 同步
        if (isSupabaseConfigured()) {
          try {
            const remotePet = await petService.addPetRemote(newPet, state.currentUser.id);
            if (remotePet) {
              // 使用 Supabase 返回的数据（UUID 等）
              newPet.id = remotePet.id;
            }
            set({ supabaseReady: true, supabaseError: null });
          } catch (err: any) {
            console.warn('Supabase addPet 失败，回退到本地存储:', err.message);
            set({ supabaseError: err.message });
          }
        }

        const newPets = [...state.pets, newPet];
        const newMilestonesAll = [...state.milestones, ...newMilestones];
        const visiblePets = getVisiblePets(newPets, state.currentUser.id);
        const visiblePetIds = visiblePets.map(p => p.id);
        const currentPetId = visiblePetIds.length > 0 ? visiblePetIds[0] : null;

        set({
          pets: newPets,
          milestones: newMilestonesAll,
          currentPetId,
          currentPet: currentPetId ? visiblePets[0] : null,
          posts: getVisiblePosts(state.posts, visiblePetIds),
          memes: state.memes.filter(m => visiblePetIds.includes(m.petId)),
        });

        return newPet;
      },

      updatePet: async (pet) => {
        const state = get();
        const existingPet = state.pets.find(p => p.id === pet.id);
        if (!existingPet || existingPet.ownerUserId !== state.currentUser?.id) return;

        // 尝试 Supabase 同步
        if (isSupabaseConfigured() && state.currentUser) {
          try {
            await petService.updatePetRemote(pet, state.currentUser.id);
            set({ supabaseError: null });
          } catch (err: any) {
            console.warn('Supabase updatePet 失败:', err.message);
            set({ supabaseError: err.message });
          }
        }

        const currentMilestones = state.milestones;
        let updatedMilestones = [...currentMilestones];
        let hasChanges = false;

        // 1. 更新"到家"里程碑
        const homeMsIndex = updatedMilestones.findIndex(
          m => m.petId === pet.id && m.type === 'home' && m.title === '到家'
        );

        if (pet.homeDate) {
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
            if (updatedMilestones[homeMsIndex].date !== pet.homeDate) {
              updatedMilestones[homeMsIndex] = newHomeMilestone;
              hasChanges = true;
            }
          } else {
            updatedMilestones.push(newHomeMilestone);
            hasChanges = true;
          }
        } else if (homeMsIndex >= 0) {
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
              hasChanges = true;
            }
          } else {
            updatedMilestones.push(newBirthMilestone);
            hasChanges = true;
          }
        } else if (birthMsIndex >= 0) {
          updatedMilestones.splice(birthMsIndex, 1);
          hasChanges = true;
        }

        set(s => ({
          pets: s.pets.map(p => p.id === pet.id ? pet : p),
          currentPet: s.currentPetId === pet.id ? pet : s.currentPet,
          milestones: hasChanges ? updatedMilestones : s.milestones,
        }));
      },

      deletePet: async (id) => {
        const state = get();
        const pet = state.pets.find(p => p.id === id);
        if (!pet || pet.ownerUserId !== state.currentUser?.id) return;

        // 尝试 Supabase 同步（级联删除由数据库外键处理）
        if (isSupabaseConfigured() && state.currentUser) {
          try {
            await petService.deletePetRemote(id, state.currentUser.id);
            set({ supabaseError: null });
          } catch (err: any) {
            console.warn('Supabase deletePet 失败:', err.message);
            set({ supabaseError: err.message });
          }
        }

        const petIdsToDelete = [id];

        set(s => ({
          pets: s.pets.filter(p => p.id !== id),
          posts: s.posts.filter(p => !petIdsToDelete.includes(p.petId)),
          milestones: s.milestones.filter(m => !petIdsToDelete.includes(m.petId)),
          memes: s.memes.filter(m => !petIdsToDelete.includes(m.petId)),
          currentPetId: s.currentPetId === id ? null : s.currentPetId,
          currentPet: s.currentPetId === id ? null : s.currentPet,
        }));
      },

      sharePet: (petId) => {
        const state = get();
        if (!state.currentUser) throw new Error('请先登录');
        const pet = state.pets.find(p => p.id === petId);
        if (!pet) throw new Error('宠物不存在');
        const isOwner = pet.ownerUserId === state.currentUser.id;
        const isShared = pet.sharedUserIds.includes(state.currentUser.id);
        if (!isOwner && !isShared) throw new Error('无权查看该宠物的邀请码');
        return pet.inviteCode;
      },

      joinPetByInviteCode: (code) => {
        const state = get();
        if (!state.currentUser) throw new Error('请先登录');

        // Fix #4: 邀请码暴力枚举防护
        const failCount = getInviteFailCount();
        if (failCount >= 5) {
          throw new Error('尝试次数过多，请1小时后再试');
        }

        const pet = state.pets.find(p => p.inviteCode === code);
        if (!pet) {
          recordInviteFail();
          return null;
        }

        // 成功则清除失败计数
        clearInviteFails();

        if (pet.ownerUserId === state.currentUser.id || pet.sharedUserIds.includes(state.currentUser.id)) {
          return pet;
        }

        const updatedPet = {
          ...pet,
          sharedUserIds: [...pet.sharedUserIds, state.currentUser.id],
        };

        set(s => ({
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

        set(state => ({
          posts: [...state.posts, newPost],
        }));
      },

      deletePost: (id) => {
        const state = get();
        if (!state.currentUser) return;
        const post = state.posts.find(p => p.id === id);
        if (!post) return;
        if (post.authorUserId && post.authorUserId !== state.currentUser.id) return;

        set(state => ({
          posts: state.posts.filter(p => p.id !== id),
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

        set(s => ({
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
          updatedPost = {
            ...post,
            likes: post.likes.filter((_, index) => index !== existingLikeIndex),
          };
        } else {
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

        set(s => ({
          posts: s.posts.map(p => p.id === postId ? updatedPost : p),
        }));
      },

      addMilestone: (milestoneData) => {
        const state = get();
        if (!state.currentUser) throw new Error('请先登录');

        const pet = state.pets.find(p => p.id === milestoneData.petId);
        if (!pet) return;

        // Fix #7: 事件去重
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

        set(state => ({
          milestones: [...state.milestones, newMilestone],
        }));
      },

      updateMilestone: (milestone) => {
        const state = get();
        const existing = state.milestones.find(m => m.id === milestone.id);
        if (!existing) return;
        const pet = state.pets.find(p => p.id === existing.petId);
        if (!pet) return;
        const isOwner = pet.ownerUserId === state.currentUser?.id;
        const isShared = state.currentUser && pet.sharedUserIds.includes(state.currentUser.id);
        if (!isOwner && !isShared) return;

        set(state => ({
          milestones: state.milestones.map(m => m.id === milestone.id ? milestone : m),
        }));
      },

      deleteMilestone: (id) => {
        const state = get();
        const existing = state.milestones.find(m => m.id === id);
        if (!existing) return;
        const pet = state.pets.find(p => p.id === existing.petId);
        if (!pet) return;
        const isOwner = pet.ownerUserId === state.currentUser?.id;
        const isShared = state.currentUser && pet.sharedUserIds.includes(state.currentUser.id);
        if (!isOwner && !isShared) return;

        set(state => ({
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

        set(state => ({
          memes: [...state.memes, newMeme],
        }));
      },

      setCurrentPetId: (id) => {
        set(state => {
          const currentPet = id ? state.pets.find(p => p.id === id) || null : null;
          return {
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

      _seedInitialData: () => {
        set({
            users: initialUsers,
            pets: initialPets,
            posts: initialPosts,
            milestones: initialMilestones,
            currentUser: null,
            currentPetId: null,
            currentPet: null,
          });
      },
    }),
);

// 辅助：安全解析 JSON 数组
function safeParseArray(key: string): any[] {
  try {
    const data = localStorage.getItem(key);
    if (!data) return [];
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    localStorage.removeItem(key);
    return [];
  }
}

// 辅助：过滤当前用户可见的数据（用于 registerUser/switchUser）
function filterStateForUser(
  userId: string,
  allPets: Pet[],
  allPosts: Post[],
  allMilestones: Milestone[],
  allMemes: Meme[],
) {
  const visiblePets = getVisiblePets(allPets, userId);
  const visiblePetIds = visiblePets.map(p => p.id);

  return {
    pets: allPets,
    posts: getVisiblePosts(allPosts, visiblePetIds),
    memes: allMemes.filter(m => visiblePetIds.includes(m.petId)),
    // 不覆盖 currentPetId，保持用户选择（null=全部）
  };
}
