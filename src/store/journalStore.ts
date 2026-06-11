import { create } from 'zustand';
import { JournalData, TextStyle, BackgroundStyle, BorderStyle, PlacedSticker, LayoutTemplate, DrawPath } from '@/types/journal';
import { generateId } from '@/utils/storage';

interface JournalState {
  currentJournal: JournalData;
  selectedStickerId: string | null;
  selectedStickerIds: Set<string>;
  multiSelectMode: boolean;
  activePanel: 'style' | 'sticker' | 'draw' | null;
  drawColor: string;
  drawWidth: number;
  createNewJournal: () => void;
  loadJournal: (data: JournalData) => void;
  updateContent: (content: string) => void;
  updateTextStyle: (style: Partial<TextStyle>) => void;
  updateBackground: (bg: Partial<BackgroundStyle>) => void;
  updateBorder: (border: Partial<BorderStyle>) => void;
  applyTemplate: (template: LayoutTemplate) => void;
  addSticker: (stickerId: string, color?: string) => void;
  updateSticker: (id: string, updates: Partial<PlacedSticker>) => void;
  removeSticker: (id: string) => void;
  selectSticker: (id: string | null) => void;
  toggleStickerSelection: (id: string) => void;
  clearStickerSelection: () => void;
  selectAllStickers: () => void;
  copySelectedStickers: () => void;
  copySticker: (id: string) => void;
  removeSelectedStickers: () => void;
  setMultiSelectMode: (enabled: boolean) => void;
  setActivePanel: (panel: 'style' | 'sticker' | 'draw' | null) => void;
  setDrawColor: (color: string) => void;
  setDrawWidth: (width: number) => void;
  addDrawPath: (path: Omit<DrawPath, 'id'>) => void;
  updateDrawPath: (id: string, updates: Partial<DrawPath>) => void;
  removeDrawPath: (id: string) => void;
  clearDrawPaths: () => void;
  resetJournal: () => void;
}

const createDefaultTextStyle = (): TextStyle => ({
  fontFamily: '"Songti SC", serif',
  fontSize: 28,
  fontWeight: 400,
  color: '#2D2A26',
  lineHeight: 2,
  textAlign: 'center',
  letterSpacing: 1,
});

const createDefaultBackground = (): BackgroundStyle => ({
  type: 'solid',
  color: '#FFFFFF',
});

const createDefaultBorder = (): BorderStyle => ({
  type: 'none',
  color: '#E8E2DB',
  width: 0,
  radius: 16,
});

const createDefaultJournal = (): JournalData => {
  const now = Date.now();
  return {
    id: generateId(),
    content: '',
    textStyle: createDefaultTextStyle(),
    background: createDefaultBackground(),
    border: createDefaultBorder(),
    stickers: [],
    drawPaths: [],
    createdAt: now,
    updatedAt: now,
  };
};

export const useJournalStore = create<JournalState>((set, get) => ({
  currentJournal: createDefaultJournal(),
  selectedStickerId: null,
  selectedStickerIds: new Set(),
  multiSelectMode: false,
  activePanel: null,
  drawColor: '#2D2A26',
  drawWidth: 3,

  createNewJournal: () => {
    set({
      currentJournal: createDefaultJournal(),
      selectedStickerId: null,
      selectedStickerIds: new Set(),
      multiSelectMode: false,
      activePanel: null,
    });
    console.log('[JournalStore] 创建新手账');
  },

  loadJournal: (data: JournalData) => {
    set({
      currentJournal: { ...data, drawPaths: data.drawPaths || [], updatedAt: Date.now() },
      selectedStickerId: null,
      selectedStickerIds: new Set(),
      multiSelectMode: false,
    });
    console.log('[JournalStore] 加载手账:', data.id);
  },

  updateContent: (content: string) => {
    set(state => ({
      currentJournal: {
        ...state.currentJournal,
        content,
        updatedAt: Date.now(),
      },
    }));
  },

  updateTextStyle: (style: Partial<TextStyle>) => {
    set(state => ({
      currentJournal: {
        ...state.currentJournal,
        textStyle: { ...state.currentJournal.textStyle, ...style },
        updatedAt: Date.now(),
      },
    }));
  },

  updateBackground: (bg: Partial<BackgroundStyle>) => {
    set(state => ({
      currentJournal: {
        ...state.currentJournal,
        background: { ...state.currentJournal.background, ...bg },
        updatedAt: Date.now(),
      },
    }));
  },

  updateBorder: (border: Partial<BorderStyle>) => {
    set(state => ({
      currentJournal: {
        ...state.currentJournal,
        border: { ...state.currentJournal.border, ...border },
        updatedAt: Date.now(),
      },
    }));
  },

  applyTemplate: (template: LayoutTemplate) => {
    set(state => ({
      currentJournal: {
        ...state.currentJournal,
        textStyle: { ...state.currentJournal.textStyle, ...template.defaultTextStyle },
        background: { ...template.defaultBackground },
        border: { ...template.defaultBorder },
        templateId: template.id,
        updatedAt: Date.now(),
      },
    }));
    console.log('[JournalStore] 应用模板:', template.name);
  },

  addSticker: (stickerId: string, color?: string) => {
    const newSticker: PlacedSticker = {
      id: generateId(),
      stickerId,
      x: 50,
      y: 50,
      rotation: 0,
      scale: 1,
      color: color || '#8B7355',
    };
    set(state => ({
      currentJournal: {
        ...state.currentJournal,
        stickers: [...state.currentJournal.stickers, newSticker],
        updatedAt: Date.now(),
      },
      selectedStickerId: newSticker.id,
    }));
    console.log('[JournalStore] 添加贴纸:', stickerId);
  },

  updateSticker: (id: string, updates: Partial<PlacedSticker>) => {
    set(state => ({
      currentJournal: {
        ...state.currentJournal,
        stickers: state.currentJournal.stickers.map(s =>
          s.id === id ? { ...s, ...updates } : s
        ),
        updatedAt: Date.now(),
      },
    }));
  },

  removeSticker: (id: string) => {
    set(state => {
      const newSelectedIds = new Set(state.selectedStickerIds);
      newSelectedIds.delete(id);
      return {
        currentJournal: {
          ...state.currentJournal,
          stickers: state.currentJournal.stickers.filter(s => s.id !== id),
          updatedAt: Date.now(),
        },
        selectedStickerId: state.selectedStickerId === id ? null : state.selectedStickerId,
        selectedStickerIds: newSelectedIds,
      };
    });
    console.log('[JournalStore] 删除贴纸:', id);
  },

  selectSticker: (id: string | null) => {
    const state = get();
    if (state.multiSelectMode && id) {
      get().toggleStickerSelection(id);
    } else {
      set({ selectedStickerId: id, selectedStickerIds: new Set() });
    }
  },

  toggleStickerSelection: (id: string) => {
    set(state => {
      const newSelectedIds = new Set(state.selectedStickerIds);
      if (newSelectedIds.has(id)) {
        newSelectedIds.delete(id);
      } else {
        newSelectedIds.add(id);
      }
      return {
        selectedStickerIds: newSelectedIds,
        selectedStickerId: newSelectedIds.size === 1 ? id : state.selectedStickerId,
      };
    });
  },

  clearStickerSelection: () => {
    set({ selectedStickerIds: new Set(), selectedStickerId: null });
  },

  selectAllStickers: () => {
    set(state => {
      const allIds = new Set(state.currentJournal.stickers.map(s => s.id));
      return { selectedStickerIds: allIds };
    });
  },

  copySticker: (id: string) => {
    set(state => {
      const original = state.currentJournal.stickers.find(s => s.id === id);
      if (!original) return state;

      const newSticker: PlacedSticker = {
        ...original,
        id: generateId(),
        x: Math.min(original.x + 20, 600),
        y: Math.min(original.y + 20, 800),
      };

      return {
        currentJournal: {
          ...state.currentJournal,
          stickers: [...state.currentJournal.stickers, newSticker],
          updatedAt: Date.now(),
        },
        selectedStickerId: newSticker.id,
      };
    });
    console.log('[JournalStore] 复制贴纸:', id);
  },

  copySelectedStickers: () => {
    set(state => {
      const { selectedStickerIds, currentJournal } = state;
      if (selectedStickerIds.size === 0) return state;

      const newStickers: PlacedSticker[] = [];
      currentJournal.stickers.forEach(sticker => {
        if (selectedStickerIds.has(sticker.id)) {
          newStickers.push({
            ...sticker,
            id: generateId(),
            x: Math.min(sticker.x + 20, 600),
            y: Math.min(sticker.y + 20, 800),
          });
        }
      });

      const newSelectedIds = new Set(newStickers.map(s => s.id));

      return {
        currentJournal: {
          ...currentJournal,
          stickers: [...currentJournal.stickers, ...newStickers],
          updatedAt: Date.now(),
        },
        selectedStickerIds: newSelectedIds,
        selectedStickerId: newStickers[0]?.id || null,
      };
    });
    console.log('[JournalStore] 批量复制贴纸:', get().selectedStickerIds.size);
  },

  removeSelectedStickers: () => {
    set(state => {
      const { selectedStickerIds, currentJournal } = state;
      if (selectedStickerIds.size === 0) return state;

      return {
        currentJournal: {
          ...currentJournal,
          stickers: currentJournal.stickers.filter(s => !selectedStickerIds.has(s.id)),
          drawPaths: currentJournal.drawPaths,
          updatedAt: Date.now(),
        },
        selectedStickerIds: new Set(),
        selectedStickerId: null,
      };
    });
    console.log('[JournalStore] 批量删除贴纸');
  },

  setMultiSelectMode: (enabled: boolean) => {
    set({ multiSelectMode: enabled });
    if (!enabled) {
      set({ selectedStickerIds: new Set() });
    }
  },

  setActivePanel: (panel: 'style' | 'sticker' | 'draw' | null) => {
    set({ activePanel: panel });
    if (panel !== 'draw') {
      set({ multiSelectMode: false, selectedStickerIds: new Set() });
    }
  },

  setDrawColor: (color: string) => {
    set({ drawColor: color });
  },

  setDrawWidth: (width: number) => {
    set({ drawWidth: width });
  },

  addDrawPath: (path: Omit<DrawPath, 'id'>) => {
    const newPath: DrawPath = {
      ...path,
      id: generateId(),
    };
    set(state => ({
      currentJournal: {
        ...state.currentJournal,
        drawPaths: [...state.currentJournal.drawPaths, newPath],
        updatedAt: Date.now(),
      },
    }));
  },

  updateDrawPath: (id: string, updates: Partial<DrawPath>) => {
    set(state => ({
      currentJournal: {
        ...state.currentJournal,
        drawPaths: state.currentJournal.drawPaths.map(p =>
          p.id === id ? { ...p, ...updates } : p
        ),
        updatedAt: Date.now(),
      },
    }));
  },

  removeDrawPath: (id: string) => {
    set(state => ({
      currentJournal: {
        ...state.currentJournal,
        drawPaths: state.currentJournal.drawPaths.filter(p => p.id !== id),
        updatedAt: Date.now(),
      },
    }));
  },

  clearDrawPaths: () => {
    set(state => ({
      currentJournal: {
        ...state.currentJournal,
        drawPaths: [],
        updatedAt: Date.now(),
      },
    }));
    console.log('[JournalStore] 清空绘制路径');
  },

  resetJournal: () => {
    set({
      currentJournal: createDefaultJournal(),
      selectedStickerId: null,
      selectedStickerIds: new Set(),
      multiSelectMode: false,
      activePanel: null,
      drawColor: '#2D2A26',
      drawWidth: 3,
    });
    console.log('[JournalStore] 重置手账');
  },
}));
