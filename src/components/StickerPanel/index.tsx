import React, { useState } from 'react';
import { View, Text, Button } from '@tarojs/components';
import classnames from 'classnames';
import { stickers, STICKER_CATEGORIES } from '@/data/stickers';
import { COLORS } from '@/types/journal';
import styles from './index.module.scss';

interface StickerPanelProps {
  visible: boolean;
  selectedColor: string;
  onClose: () => void;
  onAddSticker: (stickerId: string, color: string) => void;
  onColorChange: (color: string) => void;
}

const StickerPanel: React.FC<StickerPanelProps> = ({
  visible,
  selectedColor,
  onClose,
  onAddSticker,
  onColorChange,
}) => {
  const [activeCategory, setActiveCategory] = useState('line');

  if (!visible) return null;

  const filteredStickers = stickers.filter(s => s.category === activeCategory);

  const handleStickerClick = (stickerId: string) => {
    onAddSticker(stickerId, selectedColor);
  };

  return (
    <View className={styles.panel}>
      <View className={styles.header}>
        <Text className={styles.title}>贴纸装饰</Text>
        <Button className={styles.closeBtn} onClick={onClose}>×</Button>
      </View>

      <View className={styles.tabs}>
        {STICKER_CATEGORIES.map((cat) => (
          <Button
            key={cat.id}
            className={classnames(styles.tab, activeCategory === cat.id && styles.active)}
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.name}
          </Button>
        ))}
      </View>

      <View className={styles.stickerGrid}>
        {filteredStickers.map((sticker) => (
          <View
            key={sticker.id}
            className={styles.stickerItem}
            onClick={() => handleStickerClick(sticker.id)}
            dangerouslySetInnerHTML={{ __html: sticker.svgContent }}
          />
        ))}
      </View>

      <View className={styles.colorSection}>
        <Text className={styles.sectionTitle}>贴纸颜色</Text>
        <View className={styles.colorRow}>
          {COLORS.slice(0, 8).map((color) => (
            <View
              key={color}
              className={classnames(styles.colorItem, selectedColor === color && styles.active)}
              style={{ backgroundColor: color }}
              onClick={() => onColorChange(color)}
            />
          ))}
        </View>
      </View>

      <Text className={styles.tip}>点击贴纸添加到画布，可拖拽调整位置</Text>
    </View>
  );
};

export default StickerPanel;
