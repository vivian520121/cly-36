import { StickerItem } from '@/types/journal';

export const STICKER_CATEGORIES = [
  { id: 'line', name: '线条' },
  { id: 'divider', name: '分割' },
  { id: 'icon', name: '图标' },
  { id: 'shape', name: '形状' },
];

const createSvg = (content: string, size: number = 48) => {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="currentColor">${content}</svg>`;
};

export const stickers: StickerItem[] = [
  {
    id: 'stk-001',
    type: 'line',
    name: '下划线',
    category: 'line',
    svgContent: createSvg('<line x1="4" y1="40" x2="44" y2="40" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>', 48),
  },
  {
    id: 'stk-002',
    type: 'line',
    name: '波浪线',
    category: 'line',
    svgContent: createSvg('<path d="M4 40 Q14 30 24 40 T44 40" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>', 48),
  },
  {
    id: 'stk-003',
    type: 'line',
    name: '箭头',
    category: 'line',
    svgContent: createSvg('<path d="M8 24 L40 24 M34 18 L40 24 L34 30" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>', 48),
  },
  {
    id: 'stk-004',
    type: 'divider',
    name: '花分隔',
    category: 'divider',
    svgContent: createSvg('<line x1="4" y1="24" x2="18" y2="24" stroke="currentColor" stroke-width="1.5"/><circle cx="24" cy="24" r="5" stroke="currentColor" stroke-width="1.5" fill="none"/><line x1="30" y1="24" x2="44" y2="24" stroke="currentColor" stroke-width="1.5"/>', 48),
  },
  {
    id: 'stk-005',
    type: 'divider',
    name: '星分隔',
    category: 'divider',
    svgContent: createSvg('<line x1="4" y1="24" x2="16" y2="24" stroke="currentColor" stroke-width="1.5"/><polygon points="24,18 26,22 30,22 27,25 28,30 24,27 20,30 21,25 18,22 22,22" stroke="currentColor" stroke-width="1" fill="none"/><line x1="32" y1="24" x2="44" y2="24" stroke="currentColor" stroke-width="1.5"/>', 48),
  },
  {
    id: 'stk-006',
    type: 'divider',
    name: '虚线',
    category: 'divider',
    svgContent: createSvg('<line x1="4" y1="24" x2="44" y2="24" stroke="currentColor" stroke-width="2" stroke-dasharray="4,4"/>', 48),
  },
  {
    id: 'stk-007',
    type: 'icon',
    name: '星星',
    category: 'icon',
    svgContent: createSvg('<polygon points="24,6 29,18 42,18 32,26 36,39 24,31 12,39 16,26 6,18 19,18" stroke="currentColor" stroke-width="2" fill="none" stroke-linejoin="round"/>', 48),
  },
  {
    id: 'stk-008',
    type: 'icon',
    name: '爱心',
    category: 'icon',
    svgContent: createSvg('<path d="M24 42 C10 30 6 20 12 14 C16 10 22 12 24 18 C26 12 32 10 36 14 C42 20 38 30 24 42Z" stroke="currentColor" stroke-width="2" fill="none" stroke-linejoin="round"/>', 48),
  },
  {
    id: 'stk-009',
    type: 'icon',
    name: '月亮',
    category: 'icon',
    svgContent: createSvg('<path d="M30 8 C18 10 10 20 12 32 C14 38 20 42 26 42 C18 40 12 34 12 26 C12 18 18 12 26 10 C28 10 30 8 30 8Z" stroke="currentColor" stroke-width="2" fill="none" stroke-linejoin="round"/>', 48),
  },
  {
    id: 'stk-010',
    type: 'icon',
    name: '叶子',
    category: 'icon',
    svgContent: createSvg('<path d="M8 40 C16 32 24 24 40 12 C36 28 28 36 8 40Z" stroke="currentColor" stroke-width="2" fill="none"/><line x1="14" y1="36" x2="32" y2="20" stroke="currentColor" stroke-width="1.5"/>', 48),
  },
  {
    id: 'stk-011',
    type: 'icon',
    name: '羽毛',
    category: 'icon',
    svgContent: createSvg('<path d="M38 8 C30 12 22 20 14 36 C18 32 26 26 38 24 C32 30 24 36 16 42 C20 38 28 34 40 34 C34 38 26 42 18 46 C24 44 32 42 42 40 L38 8Z" stroke="currentColor" stroke-width="1.5" fill="none"/>', 48),
  },
  {
    id: 'stk-012',
    type: 'shape',
    name: '方框',
    category: 'shape',
    svgContent: createSvg('<rect x="8" y="8" width="32" height="32" stroke="currentColor" stroke-width="2" fill="none" rx="2"/>', 48),
  },
  {
    id: 'stk-013',
    type: 'shape',
    name: '圆框',
    category: 'shape',
    svgContent: createSvg('<circle cx="24" cy="24" r="16" stroke="currentColor" stroke-width="2" fill="none"/>', 48),
  },
  {
    id: 'stk-014',
    type: 'shape',
    name: '菱形',
    category: 'shape',
    svgContent: createSvg('<polygon points="24,6 42,24 24,42 6,24" stroke="currentColor" stroke-width="2" fill="none"/>', 48),
  },
  {
    id: 'stk-015',
    type: 'shape',
    name: '六边形',
    category: 'shape',
    svgContent: createSvg('<polygon points="24,6 40,15 40,33 24,42 8,33 8,15" stroke="currentColor" stroke-width="2" fill="none"/>', 48),
  },
  {
    id: 'stk-016',
    type: 'icon',
    name: '小花',
    category: 'icon',
    svgContent: createSvg('<circle cx="24" cy="24" r="4" stroke="currentColor" stroke-width="1.5" fill="none"/><circle cx="24" cy="12" r="5" stroke="currentColor" stroke-width="1.5" fill="none"/><circle cx="24" cy="36" r="5" stroke="currentColor" stroke-width="1.5" fill="none"/><circle cx="12" cy="24" r="5" stroke="currentColor" stroke-width="1.5" fill="none"/><circle cx="36" cy="24" r="5" stroke="currentColor" stroke-width="1.5" fill="none"/>', 48),
  },
  {
    id: 'stk-017',
    type: 'icon',
    name: '音符',
    category: 'icon',
    svgContent: createSvg('<ellipse cx="14" cy="38" rx="6" ry="5" stroke="currentColor" stroke-width="2" fill="none"/><line x1="18" y1="38" x2="18" y2="12" stroke="currentColor" stroke-width="2"/><path d="M18 12 C26 12 34 16 34 22 C34 26 28 28 22 26" stroke="currentColor" stroke-width="2" fill="none"/>', 48),
  },
  {
    id: 'stk-018',
    type: 'icon',
    name: '咖啡',
    category: 'icon',
    svgContent: createSvg('<path d="M12 16 L12 36 C12 40 20 42 24 42 C28 42 36 40 36 36 L36 16 Z" stroke="currentColor" stroke-width="2" fill="none"/><path d="M36 22 C42 22 44 28 40 32 C38 34 36 34 36 30" stroke="currentColor" stroke-width="2" fill="none"/><line x1="16" y1="24" x2="32" y2="24" stroke="currentColor" stroke-width="1.5"/><line x1="16" y1="30" x2="28" y2="30" stroke="currentColor" stroke-width="1.5"/>', 48),
  },
];
