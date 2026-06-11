export interface TextStyle {
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  color: string;
  lineHeight: number;
  textAlign: 'left' | 'center' | 'right';
  letterSpacing: number;
}

export interface BackgroundStyle {
  type: 'solid' | 'image';
  color?: string;
  imageUrl?: string;
}

export interface BorderStyle {
  type: 'none' | 'solid' | 'dashed' | 'dotted' | 'double';
  color: string;
  width: number;
  radius: number;
}

export interface StickerItem {
  id: string;
  type: 'line' | 'icon' | 'divider' | 'shape';
  name: string;
  category: string;
  svgContent: string;
}

export interface PlacedSticker {
  id: string;
  stickerId: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  color: string;
}

export interface LayoutTemplate {
  id: string;
  name: string;
  category: string;
  thumbnail: string;
  textArea: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  defaultTextStyle: Partial<TextStyle>;
  defaultBackground: BackgroundStyle;
  defaultBorder: BorderStyle;
}

export interface JournalData {
  id: string;
  content: string;
  textStyle: TextStyle;
  background: BackgroundStyle;
  border: BorderStyle;
  stickers: PlacedSticker[];
  templateId?: string;
  createdAt: number;
  updatedAt: number;
}

export interface DraftItem {
  id: string;
  title: string;
  preview: string;
  updatedAt: number;
  data: JournalData;
}

export const FONT_FAMILIES = [
  { label: '宋体', value: '"Songti SC", "Noto Serif SC", serif' },
  { label: '楷体', value: '"Kaiti SC", "KaiTi", serif' },
  { label: '黑体', value: '"PingFang SC", "Microsoft YaHei", sans-serif' },
  { label: '圆体', value: '"Yuanti SC", "STYuant", sans-serif' },
  { label: '等宽', value: '"Courier New", monospace' },
];

export const COLORS = [
  '#2D2A26', '#8B7355', '#6B8E7A', '#C49A6C', '#B86464',
  '#7A8B9E', '#6B6560', '#9C958D', '#FFFFFF', '#FAF7F2',
];

export const BG_COLORS = [
  '#FFFFFF', '#FAF7F2', '#FDF8F3', '#F5F0EA', '#E8D4C4',
  '#D4C5B5', '#A8B5A0', '#6B8E7A', '#8B7355', '#2D2A26',
];

export const BORDER_TYPES = [
  { label: '无', value: 'none' },
  { label: '实线', value: 'solid' },
  { label: '虚线', value: 'dashed' },
  { label: '点线', value: 'dotted' },
  { label: '双线', value: 'double' },
];

export type ExportCanvasSize = 'square' | 'wallpaper' | 'card';

export const EXPORT_SIZE_PRESETS: Record<ExportCanvasSize, { label: string; desc: string; width: number; height: number }> = {
  square: { label: '正方形', desc: '1:1', width: 1080, height: 1080 },
  wallpaper: { label: '竖版壁纸', desc: '9:16', width: 1080, height: 1920 },
  card: { label: '方形卡片', desc: '3:4', width: 1080, height: 1440 },
};

export type ExportQuality = 'standard' | 'hd' | 'ultra';

export const EXPORT_QUALITY_PRESETS: Record<ExportQuality, { label: string; scale: number }> = {
  standard: { label: '标准', scale: 1 },
  hd: { label: '高清', scale: 2 },
  ultra: { label: '超清', scale: 3 },
};

export interface ExportRecord {
  id: string;
  title: string;
  preview: string;
  imageUrl: string;
  canvasSize: ExportCanvasSize;
  quality: ExportQuality;
  exportedAt: number;
  data: JournalData;
}

export interface FavoriteTemplate {
  id: string;
  templateId: string;
  template: LayoutTemplate;
  favoritedAt: number;
}

export interface FeedbackRecord {
  id: string;
  type: 'bug' | 'feature' | 'suggestion' | 'other';
  content: string;
  contact?: string;
  createdAt: number;
  status: 'pending' | 'processing' | 'resolved';
}
