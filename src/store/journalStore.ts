import { create } from 'zustand';
import { JournalData, TextStyle, BackgroundStyle, BorderStyle, PlacedSticker, LayoutTemplate } from '@/types/journal';
import { generateId } from '@/utils/storage';

interface JournalState {
  currentJournal: JournalData;
  selectedStickerId: string | null;
  activePanel: 'style' | 'sticker' | null;
  createNewJournal: () => void;
  loadJournal: (data: JournalData) => void;
  updateContent: (content: string) => void;
  updateTextStyle: (style: Partial<TextStyle>) => void;
  updateBackground: (bg: Partial<BackgroundStyle>) => void;
  updateBorder: (border: Partial<BorderStyle>) => void;
  applyTemplate: (template: LayoutTemplate) => void;
  addSticker: (stickerId: string) => void;
  updateSticker: (id: string, updates: Partial<PlacedSticker>) => void;
  removeSticker: (id: string) => void;
  selectSticker: (id: string | null) => void;
  setActivePanel: (panel: 'style' | 'sticker' | null) => void;
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
    createdAt: now,
    updatedAt: now,
  };
};

export const useJournalStore = create<JournalState>((set, get) => ({
  currentJournal: createDefaultJournal(),
  selectedStickerId: null,
  activePanel: null,

  createNewJournal: () => {
    set({ currentJournal: createDefaultJournal(), selectedStickerId: null, activePanel: null });
    console.log('[JournalStore] 创建新手账');
  },

  loadJournal: (data: JournalData) => {
    set({ currentJournal: { ...data, updatedAt: Date.now() }, selectedStickerId: null });
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

  addSticker: (stickerId: string) => {
    const newSticker: PlacedSticker = {
      id: generateId(),
      stickerId,
      x: 50,
      y: 50,
      rotation: 0,
      scale: 1,
      color: '#8B7355',
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
    set(state => ({
      currentJournal: {
        ...state.currentJournal,
        stickers: state.currentJournal.stickers.filter(s => s.id !== id),
        updatedAt: Date.now(),
      },
      selectedStickerId: state.selectedStickerId === id ? null : state.selectedStickerId,
    }));
    console.log('[JournalStore] 删除贴纸:', id);
  },

  selectSticker: (id: string | null) => {
    set({ selectedStickerId: id });
  },

  setActivePanel: (panel: 'style' | 'sticker' | null) => {
    set({ activePanel: panel });
  },

  resetJournal: () => {
    set({
      currentJournal: createDefaultJournal(),
      selectedStickerId: null,
      activePanel: null,
    });
    console.log('[JournalStore] 重置手账');
  },
}));
