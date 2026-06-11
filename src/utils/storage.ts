import Taro from '@tarojs/taro';
import { JournalData, DraftItem, ExportRecord, FavoriteTemplate, LayoutTemplate, FeedbackRecord, ExportClarity, ExportShape, FavoriteSticker, StickerItem } from '@/types/journal';

const DRAFTS_KEY = 'journal_drafts';
const CURRENT_DRAFT_KEY = 'current_draft_id';
const EXPORT_RECORDS_KEY = 'export_records';
const FAVORITE_TEMPLATES_KEY = 'favorite_templates';
const FAVORITE_STICKERS_KEY = 'favorite_stickers';
const FEEDBACK_RECORDS_KEY = 'feedback_records';

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

export const saveExportRecord = async (
  data: JournalData,
  imageUrl: string,
  clarity: ExportClarity,
  shape: ExportShape
): Promise<void> => {
  try {
    const records = await getExportRecords();
    const now = Date.now();
    const record: ExportRecord = {
      id: `exp_${now}_${Math.random().toString(36).substr(2, 9)}`,
      title: data.content.slice(0, 30) || '未命名手账',
      preview: data.content.slice(0, 100),
      imageUrl,
      clarity,
      shape,
      exportedAt: now,
      data: { ...data },
      size: clarity,
    };
    records.unshift(record);
    await Taro.setStorage({
      key: EXPORT_RECORDS_KEY,
      data: JSON.stringify(records),
    });
    console.log('[Storage] 导出记录已保存:', record.id);
  } catch (error) {
    console.error('[Storage] 保存导出记录失败:', error);
    throw error;
  }
};

export const getExportRecords = async (): Promise<ExportRecord[]> => {
  try {
    const res = await Taro.getStorage({ key: EXPORT_RECORDS_KEY });
    return res.data ? JSON.parse(res.data) : [];
  } catch {
    return [];
  }
};

export const deleteExportRecord = async (id: string): Promise<void> => {
  try {
    const records = await getExportRecords();
    const filtered = records.filter(r => r.id !== id);
    await Taro.setStorage({
      key: EXPORT_RECORDS_KEY,
      data: JSON.stringify(filtered),
    });
    console.log('[Storage] 导出记录已删除:', id);
  } catch (error) {
    console.error('[Storage] 删除导出记录失败:', error);
    throw error;
  }
};

export const addFavoriteTemplate = async (template: LayoutTemplate): Promise<void> => {
  try {
    const favorites = await getFavoriteTemplates();
    const existingIndex = favorites.findIndex(f => f.templateId === template.id);
    if (existingIndex >= 0) {
      console.log('[Storage] 模板已收藏:', template.id);
      return;
    }
    const now = Date.now();
    const favorite: FavoriteTemplate = {
      id: `fav_${now}_${Math.random().toString(36).substr(2, 9)}`,
      templateId: template.id,
      template: { ...template },
      favoritedAt: now,
    };
    favorites.unshift(favorite);
    await Taro.setStorage({
      key: FAVORITE_TEMPLATES_KEY,
      data: JSON.stringify(favorites),
    });
    console.log('[Storage] 模板已收藏:', template.id);
  } catch (error) {
    console.error('[Storage] 收藏模板失败:', error);
    throw error;
  }
};

export const removeFavoriteTemplate = async (templateId: string): Promise<void> => {
  try {
    const favorites = await getFavoriteTemplates();
    const filtered = favorites.filter(f => f.templateId !== templateId);
    await Taro.setStorage({
      key: FAVORITE_TEMPLATES_KEY,
      data: JSON.stringify(filtered),
    });
    console.log('[Storage] 已取消收藏模板:', templateId);
  } catch (error) {
    console.error('[Storage] 取消收藏失败:', error);
    throw error;
  }
};

export const getFavoriteTemplates = async (): Promise<FavoriteTemplate[]> => {
  try {
    const res = await Taro.getStorage({ key: FAVORITE_TEMPLATES_KEY });
    return res.data ? JSON.parse(res.data) : [];
  } catch {
    return [];
  }
};

export const isTemplateFavorited = async (templateId: string): Promise<boolean> => {
  try {
    const favorites = await getFavoriteTemplates();
    return favorites.some(f => f.templateId === templateId);
  } catch {
    return false;
  }
};

export const saveFeedback = async (
  type: 'bug' | 'feature' | 'suggestion' | 'other',
  content: string,
  contact?: string
): Promise<void> => {
  try {
    const records = await getFeedbackRecords();
    const now = Date.now();
    const record: FeedbackRecord = {
      id: `fb_${now}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      content,
      contact,
      createdAt: now,
      status: 'pending',
    };
    records.unshift(record);
    await Taro.setStorage({
      key: FEEDBACK_RECORDS_KEY,
      data: JSON.stringify(records),
    });
    console.log('[Storage] 反馈已保存:', record.id);
  } catch (error) {
    console.error('[Storage] 保存反馈失败:', error);
    throw error;
  }
};

export const getFeedbackRecords = async (): Promise<FeedbackRecord[]> => {
  try {
    const res = await Taro.getStorage({ key: FEEDBACK_RECORDS_KEY });
    return res.data ? JSON.parse(res.data) : [];
  } catch {
    return [];
  }
};

export const addFavoriteSticker = async (sticker: StickerItem): Promise<void> => {
  try {
    const favorites = await getFavoriteStickers();
    const existingIndex = favorites.findIndex(f => f.stickerId === sticker.id);
    if (existingIndex >= 0) {
      console.log('[Storage] 贴纸已收藏:', sticker.id);
      return;
    }
    const now = Date.now();
    const favorite: FavoriteSticker = {
      id: `favs_${now}_${Math.random().toString(36).substr(2, 9)}`,
      stickerId: sticker.id,
      sticker: { ...sticker },
      favoritedAt: now,
    };
    favorites.unshift(favorite);
    await Taro.setStorage({
      key: FAVORITE_STICKERS_KEY,
      data: JSON.stringify(favorites),
    });
    console.log('[Storage] 贴纸已收藏:', sticker.id);
  } catch (error) {
    console.error('[Storage] 收藏贴纸失败:', error);
    throw error;
  }
};

export const removeFavoriteSticker = async (stickerId: string): Promise<void> => {
  try {
    const favorites = await getFavoriteStickers();
    const filtered = favorites.filter(f => f.stickerId !== stickerId);
    await Taro.setStorage({
      key: FAVORITE_STICKERS_KEY,
      data: JSON.stringify(filtered),
    });
    console.log('[Storage] 已取消收藏贴纸:', stickerId);
  } catch (error) {
    console.error('[Storage] 取消收藏贴纸失败:', error);
    throw error;
  }
};

export const getFavoriteStickers = async (): Promise<FavoriteSticker[]> => {
  try {
    const res = await Taro.getStorage({ key: FAVORITE_STICKERS_KEY });
    return res.data ? JSON.parse(res.data) : [];
  } catch {
    return [];
  }
};

export const isStickerFavorited = async (stickerId: string): Promise<boolean> => {
  try {
    const favorites = await getFavoriteStickers();
    return favorites.some(f => f.stickerId === stickerId);
  } catch {
    return false;
  }
};
