import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { stickers, STICKER_CATEGORIES } from '@/data/stickers';
import { COLORS, StickerItem, FavoriteSticker } from '@/types/journal';
import { getFavoriteStickers, addFavoriteSticker, removeFavoriteSticker } from '@/utils/storage';
import styles from './index.module.scss';

interface StickerPanelProps {
  visible: boolean;
  selectedColor: string;
  onClose: () => void;
  onAddSticker: (stickerId: string, color: string) => void;
  onColorChange: (color: string) => void;
}

const FAVORITE_CATEGORY = { id: 'favorite', name: '收藏' };

const StickerPanel: React.FC<StickerPanelProps> = ({
  visible,
  selectedColor,
  onClose,
  onAddSticker,
  onColorChange,
}) => {
  const [activeCategory, setActiveCategory] = useState('line');
  const [favoriteStickers, setFavoriteStickers] = useState<FavoriteSticker[]>([]);
  const [favoritedIds, setFavoritedIds] = useState<Set<string>>(new Set());
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const loadFavorites = useCallback(async () => {
    try {
      const favorites = await getFavoriteStickers();
      setFavoriteStickers(favorites);
      const ids = new Set(favorites.map(f => f.stickerId));
      setFavoritedIds(ids);
    } catch (error) {
      console.error('[StickerPanel] 加载收藏失败:', error);
    }
  }, []);

  useEffect(() => {
    if (visible) {
      loadFavorites();
    }
  }, [visible, loadFavorites]);

  if (!visible) return null;

  const allCategories = [...STICKER_CATEGORIES, FAVORITE_CATEGORY];

  const getFilteredStickers = (): StickerItem[] => {
    if (activeCategory === 'favorite') {
      return favoriteStickers.map(f => f.sticker);
    }
    return stickers.filter(s => s.category === activeCategory);
  };

  const filteredStickers = getFilteredStickers();

  const handleStickerClick = (stickerId: string) => {
    if (multiSelectMode) {
      const newSelected = new Set(selectedIds);
      if (newSelected.has(stickerId)) {
        newSelected.delete(stickerId);
      } else {
        newSelected.add(stickerId);
      }
      setSelectedIds(newSelected);
    } else {
      onAddSticker(stickerId, selectedColor);
    }
  };

  const handleStickerLongPress = (stickerId: string) => {
    if (!multiSelectMode) {
      setMultiSelectMode(true);
      setSelectedIds(new Set([stickerId]));
      Taro.vibrateShort({ type: 'light' });
    }
  };

  const handleToggleFavorite = async (e: any, sticker: StickerItem) => {
    if (e && e.stopPropagation) {
      e.stopPropagation();
    }
    try {
      if (favoritedIds.has(sticker.id)) {
        await removeFavoriteSticker(sticker.id);
        const newFavorited = new Set(favoritedIds);
        newFavorited.delete(sticker.id);
        setFavoritedIds(newFavorited);
        if (activeCategory === 'favorite') {
          setFavoriteStickers(prev => prev.filter(f => f.stickerId !== sticker.id));
        }
        Taro.showToast({ title: '已取消收藏', icon: 'success' });
      } else {
        await addFavoriteSticker(sticker);
        const newFavorited = new Set(favoritedIds);
        newFavorited.add(sticker.id);
        setFavoritedIds(newFavorited);
        Taro.showToast({ title: '已收藏', icon: 'success' });
      }
    } catch (error) {
      console.error('[StickerPanel] 操作收藏失败:', error);
      Taro.showToast({ title: '操作失败', icon: 'none' });
    }
  };

  const handleBatchAdd = () => {
    if (selectedIds.size === 0) {
      Taro.showToast({ title: '请选择贴纸', icon: 'none' });
      return;
    }
    selectedIds.forEach(id => {
      onAddSticker(id, selectedColor);
    });
    setMultiSelectMode(false);
    setSelectedIds(new Set());
    Taro.showToast({ title: `已添加 ${selectedIds.size} 个贴纸`, icon: 'success' });
  };

  const handleBatchFavorite = async () => {
    if (selectedIds.size === 0) {
      Taro.showToast({ title: '请选择贴纸', icon: 'none' });
      return;
    }
    try {
      const selectedStickers = filteredStickers.filter(s => selectedIds.has(s.id));
      for (const sticker of selectedStickers) {
        if (!favoritedIds.has(sticker.id)) {
          await addFavoriteSticker(sticker);
        }
      }
      await loadFavorites();
      setMultiSelectMode(false);
      setSelectedIds(new Set());
      Taro.showToast({ title: `已收藏 ${selectedIds.size} 个贴纸`, icon: 'success' });
    } catch (error) {
      console.error('[StickerPanel] 批量收藏失败:', error);
      Taro.showToast({ title: '操作失败', icon: 'none' });
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredStickers.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredStickers.map(s => s.id)));
    }
  };

  const handleCancelMultiSelect = () => {
    setMultiSelectMode(false);
    setSelectedIds(new Set());
  };

  const handleStickerItemClick = (stickerId: string) => {
    handleStickerClick(stickerId);
  };

  return (
    <View className={styles.panel}>
      <View className={styles.header}>
        <Text className={styles.title}>贴纸装饰</Text>
        <Button className={styles.closeBtn} onClick={onClose}>×</Button>
      </View>

      <View className={styles.tabs}>
        {allCategories.map((cat) => (
          <Button
            key={cat.id}
            className={classnames(styles.tab, activeCategory === cat.id && styles.active)}
            onClick={() => {
              setActiveCategory(cat.id);
              setMultiSelectMode(false);
              setSelectedIds(new Set());
            }}
          >
            {cat.name}
            {cat.id === 'favorite' && favoriteStickers.length > 0 && ` (${favoriteStickers.length})`}
          </Button>
        ))}
      </View>

      {multiSelectMode && (
        <View className={styles.actionBar}>
          <Button
            className={styles.actionBtn}
            onClick={handleSelectAll}
          >
            {selectedIds.size === filteredStickers.length ? '取消全选' : '全选'}
          </Button>
          <Button
            className={classnames(styles.actionBtn, styles.primary)}
            onClick={handleBatchAdd}
          >
            添加 ({selectedIds.size})
          </Button>
          <Button
            className={classnames(styles.actionBtn, styles.primary)}
            onClick={handleBatchFavorite}
          >
            收藏
          </Button>
          <Button
            className={classnames(styles.actionBtn, styles.danger)}
            onClick={handleCancelMultiSelect}
          >
            取消
          </Button>
        </View>
      )}

      {filteredStickers.length === 0 ? (
        <View className={styles.emptyState}>
          <Text className={styles.emptyIcon}>⭐</Text>
          <Text className={styles.emptyText}>
            {activeCategory === 'favorite' ? '还没有收藏的贴纸\n长按贴纸可以收藏哦' : '暂无贴纸'}
          </Text>
        </View>
      ) : (
        <View className={styles.stickerGrid}>
          {filteredStickers.map((sticker) => (
            <View
              key={sticker.id}
              className={classnames(
                styles.stickerItem,
                multiSelectMode && selectedIds.has(sticker.id) && styles.selected
              )}
              onClick={() => handleStickerItemClick(sticker.id)}
              onLongPress={() => handleStickerLongPress(sticker.id)}
            >
              <View dangerouslySetInnerHTML={{ __html: sticker.svgContent }} />
              {favoritedIds.has(sticker.id) && (
                <Text className={styles.favoriteIcon}>⭐</Text>
              )}
              <Button
                className={styles.stickerFavoriteBtn}
                onClick={(e) => handleToggleFavorite(e, sticker)}
              >
                {favoritedIds.has(sticker.id) ? '★' : '☆'}
              </Button>
            </View>
          ))}
        </View>
      )}

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

      <Text className={styles.tip}>
        {multiSelectMode
          ? '点击选择贴纸，可批量添加或收藏'
          : '点击添加贴纸，长按进入批量选择，点击★收藏'}
      </Text>
    </View>
  );
};

export default StickerPanel;
