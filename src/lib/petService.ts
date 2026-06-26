import { supabase, isSupabaseConfigured } from './supabase';
import type { Pet } from '../types';

// ============================================================
// 宠物档案 — Supabase CRUD 服务
// 所有函数在 Supabase 未配置时返回 null，调用方应 fallback 到 localStorage
// ============================================================

export interface PetRow {
  id: string;
  owner_id: string;
  name: string;
  category_id: string;
  custom_breed: string | null;
  gender: 'female' | 'male' | 'unknown' | null;
  birth_date: string | null;
  birth_date_type: string;
  birth_year: number | null;
  birth_month: number | null;
  home_date: string;
  avatar: string | null;
  invite_code: string;
  shared_ids: string[];
  created_at: string;
  updated_at: string;
}

/** 将 Supabase 行转为 App Pet 类型 */
function rowToPet(row: PetRow, userId: string): Pet {
  return {
    id: row.id,
    name: row.name,
    categoryId: row.category_id,
    customBreed: row.custom_breed ?? undefined,
    gender: row.gender ?? undefined,
    birthDate: row.birth_date ?? undefined,
    birthDateType: (row.birth_date_type as Pet['birthDateType']) || 'unknown',
    birthYear: row.birth_year?.toString(),
    birthMonth: row.birth_month?.toString(),
    homeDate: row.home_date,
    avatar: row.avatar ?? undefined,
    inviteCode: row.invite_code,
    ownerUserId: row.owner_id,
    sharedUserIds: row.shared_ids,
  };
}

/** 将 App Pet 转为 Supabase 行 */
function petToRow(pet: Pet, userId: string): Omit<PetRow, 'created_at' | 'updated_at'> {
  return {
    id: pet.id,
    owner_id: userId,
    name: pet.name,
    category_id: pet.categoryId,
    custom_breed: pet.customBreed ?? null,
    gender: pet.gender ?? null,
    birth_date: pet.birthDate ?? null,
    birth_date_type: pet.birthDateType || 'unknown',
    birth_year: pet.birthYear ? parseInt(pet.birthYear) : null,
    birth_month: pet.birthMonth ? parseInt(pet.birthMonth) : null,
    home_date: pet.homeDate,
    avatar: pet.avatar ?? null,
    invite_code: pet.inviteCode,
    shared_ids: pet.sharedUserIds,
  };
}

/** 获取当前用户的所有宠物（拥有的 + 共享的） */
export async function fetchPets(userId: string): Promise<Pet[] | null> {
  if (!isSupabaseConfigured()) return null;

  const { data, error } = await supabase
    .from('pets')
    .select('*')
    .or(`owner_id.eq.${userId},shared_ids.cs.{${userId}}`)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('fetchPets error:', error);
    return null;
  }

  return (data as PetRow[]).map(row => rowToPet(row, userId));
}

/** 添加宠物 */
export async function addPetRemote(pet: Pet, userId: string): Promise<Pet | null> {
  if (!isSupabaseConfigured()) return null;

  const row = petToRow(pet, userId);
  const { data, error } = await supabase
    .from('pets')
    .insert(row)
    .select()
    .single();

  if (error) {
    console.error('addPetRemote error:', error);
    return null;
  }

  return rowToPet(data as PetRow, userId);
}

/** 更新宠物 */
export async function updatePetRemote(pet: Pet, userId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  const row = petToRow(pet, userId);
  const { error } = await supabase
    .from('pets')
    .update(row)
    .eq('id', pet.id)
    .eq('owner_id', userId); // RLS 双重保险

  if (error) {
    console.error('updatePetRemote error:', error);
    return false;
  }
  return true;
}

/** 删除宠物 */
export async function deletePetRemote(petId: string, userId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  const { error } = await supabase
    .from('pets')
    .delete()
    .eq('id', petId)
    .eq('owner_id', userId);

  if (error) {
    console.error('deletePetRemote error:', error);
    return false;
  }
  return true;
}

/** 通过邀请码查找宠物 */
export async function fetchPetByInviteCode(code: string): Promise<Pet | null> {
  if (!isSupabaseConfigured()) return null;

  const { data, error } = await supabase
    .from('pets')
    .select('*')
    .eq('invite_code', code)
    .single();

  if (error || !data) return null;

  // 不需要 userId 因为还没加入
  return rowToPet(data as PetRow, (data as PetRow).owner_id);
}

/** 加入宠物（添加 shared_ids） */
export async function joinPetRemote(petId: string, userId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  // 先获取当前 shared_ids
  const { data, error } = await supabase
    .from('pets')
    .select('shared_ids')
    .eq('id', petId)
    .single();

  if (error || !data) return false;

  const sharedIds = (data as PetRow).shared_ids || [];
  if (sharedIds.includes(userId)) return true; // 已经在列表中

  const { error: updateError } = await supabase
    .from('pets')
    .update({ shared_ids: [...sharedIds, userId] })
    .eq('id', petId);

  return !updateError;
}
