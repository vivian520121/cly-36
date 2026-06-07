import Taro from '@tarojs/taro';
import { JournalData, DraftItem } from '@/types/journal';

const DRAFTS_KEY = 'journal_drafts';
const CURRENT_DRAFT_KEY = 'current_draft_id';

export const saveDraft = async (data: JournalData): Promise<void> => {
  try {
    const drafts = await getDrafts();
    const now = Date.now();
    
    const existingIndex = drafts.findIndex(d => d.id === data.id);
    const draftItem: DraftItem = {
      id: data.id,
      title: data.content.slice(0, 30) || '未命名手账',
      preview: data.content.slice(0, 100),
      updatedAt: now,
      data: { ...data, updatedAt: now },
    };
    
    if (existingIndex >= 0) {
      drafts[existingIndex] = draftItem;
    } else {
      drafts.unshift(draftItem);
    }
    
    await Taro.setStorage({
      key: DRAFTS_KEY,
      data: JSON.stringify(drafts),
    });
    
    console.log('[Storage] 草稿已保存:', data.id);
  } catch (error) {
    console.error('[Storage] 保存草稿失败:', error);
    throw error;
  }
};

export const getDrafts = async (): Promise<DraftItem[]> => {
  try {
    const res = await Taro.getStorage({ key: DRAFTS_KEY });
    return res.data ? JSON.parse(res.data) : [];
  } catch {
    return [];
  }
};

export const getDraftById = async (id: string): Promise<DraftItem | null> => {
  try {
    const drafts = await getDrafts();
    return drafts.find(d => d.id === id) || null;
  } catch (error) {
    console.error('[Storage] 获取草稿失败:', error);
    return null;
  }
};

export const deleteDraft = async (id: string): Promise<void> => {
  try {
    const drafts = await getDrafts();
    const filtered = drafts.filter(d => d.id !== id);
    await Taro.setStorage({
      key: DRAFTS_KEY,
      data: JSON.stringify(filtered),
    });
    console.log('[Storage] 草稿已删除:', id);
  } catch (error) {
    console.error('[Storage] 删除草稿失败:', error);
    throw error;
  }
};

export const setCurrentDraftId = async (id: string | null): Promise<void> => {
  try {
    if (id) {
      await Taro.setStorage({ key: CURRENT_DRAFT_KEY, data: id });
    } else {
      await Taro.removeStorage({ key: CURRENT_DRAFT_KEY });
    }
  } catch (error) {
    console.error('[Storage] 设置当前草稿ID失败:', error);
  }
};

export const getCurrentDraftId = async (): Promise<string | null> => {
  try {
    const res = await Taro.getStorage({ key: CURRENT_DRAFT_KEY });
    return res.data || null;
  } catch {
    return null;
  }
};

export const generateId = (): string => {
  return `j_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
