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

export interface FavoriteSticker {
  id: string;
  stickerId: string;
  sticker: StickerItem;
  favoritedAt: number;
}

export interface DrawPoint {
  x: number;
  y: number;
}

export interface DrawPath {
  id: string;
  points: DrawPoint[];
  color: string;
  width: number;
  opacity: number;
}

export interface DrawData {
  paths: DrawPath[];
  activePath: DrawPath | null;
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
  drawPaths: DrawPath[];
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

export type ExportClarity = '1x' | '2x' | '3x';

export type ExportShape = 'square' | 'wallpaper' | 'card';

export const EXPORT_SHAPE_CONFIG: Record<ExportShape, { label: string; width: number; height: number; desc: string }> = {
  square: { label: '正方形', width: 1080, height: 1080, desc: '1080×1080' },
  wallpaper: { label: '竖版壁纸', width: 1080, height: 1920, desc: '1080×1920' },
  card: { label: '方形卡片', width: 800, height: 1060, desc: '800×1060' },
};

export const EXPORT_CLARITY_CONFIG: Record<ExportClarity, { label: string; scale: number }> = {
  '1x': { label: '标准', scale: 1 },
  '2x': { label: '高清', scale: 2 },
  '3x': { label: '超清', scale: 3 },
};

export interface ExportRecord {
  id: string;
  title: string;
  preview: string;
  imageUrl: string;
  clarity: ExportClarity;
  shape: ExportShape;
  exportedAt: number;
  data: JournalData;
  size?: '1x' | '2x' | '3x';
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
