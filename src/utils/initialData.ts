import { User, Pet, Post, Milestone } from '../types';

export const initialUsers: User[] = [
  {
    id: 'user_1',
    name: '铲屎官',
    createdAt: new Date().toISOString(),
  },
];

export const initialPets: Pet[] = [
  {
    id: 'pet_1',
    name: '豆豆',
    categoryId: 'dog',
    subCategoryId: 'golden_retriever',
    gender: 'male',
    birthDate: '2022-06-15',
    birthDateType: 'exact',
    homeDate: '2022-08-20',
    avatar: '',
    inviteCode: 'ABC123',
    ownerUserId: 'user_1',
    sharedUserIds: [],
  },
  {
    id: 'pet_2',
    name: '花花',
    categoryId: 'cat',
    subCategoryId: 'persian',
    gender: 'female',
    birthDate: '2023-03-10',
    birthDateType: 'exact',
    homeDate: '2023-05-01',
    avatar: '',
    inviteCode: 'DEF456',
    ownerUserId: 'user_1',
    sharedUserIds: [],
  },
];

export const initialPosts: Post[] = [
  {
    id: 'post_1',
    petId: 'pet_1',
    authorUserId: 'user_1',
    content: '豆豆今天特别开心，在公园里跑了好久！',
    media: [],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    comments: [],
    likes: [],
  },
  {
    id: 'post_2',
    petId: 'pet_2',
    authorUserId: 'user_1',
    content: '花花今天又睡了一整天，真是个小懒猫🐱',
    media: [],
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    comments: [],
    likes: [],
  },
];

export const initialMilestones: Milestone[] = [
  {
    id: 'milestone_1',
    petId: 'pet_1',
    type: 'home',
    title: '到家',
    description: '豆豆来到新家的第一天',
    date: '2022-08-20',
    icon: '🏠',
    authorUserId: 'user_1',
  },
  {
    id: 'milestone_2',
    petId: 'pet_1',
    type: 'vaccine',
    title: '疫苗接种',
    description: '完成第一针疫苗',
    date: '2022-09-01',
    icon: '💉',
    authorUserId: 'user_1',
  },
  {
    id: 'milestone_3',
    petId: 'pet_2',
    type: 'home',
    title: '到家',
    description: '花花来到新家',
    date: '2023-05-01',
    icon: '🏠',
    authorUserId: 'user_1',
  },
  {
    id: 'milestone_4',
    petId: 'pet_2',
    type: 'neuter',
    title: '绝育',
    description: '完成绝育手术',
    date: '2023-06-15',
    icon: '⚕️',
    authorUserId: 'user_1',
  },
];

export const initializeData = (): void => {
  const users = localStorage.getItem('pet_tracker_users');
  const pets = localStorage.getItem('pet_tracker_pets');
  
  if (!users || !pets) {
    localStorage.setItem('pet_tracker_users', JSON.stringify(initialUsers));
    localStorage.setItem('pet_tracker_pets', JSON.stringify(initialPets));
    localStorage.setItem('pet_tracker_posts', JSON.stringify(initialPosts));
    localStorage.setItem('pet_tracker_milestones', JSON.stringify(initialMilestones));
    localStorage.setItem('pet_tracker_current_user_id', 'user_1');
    localStorage.setItem('pet_tracker_current_pet_id', '');
  }
};
