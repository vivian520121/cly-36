import React, { useRef, useState, useCallback, useEffect } from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { PlacedSticker } from '@/types/journal';
import { stickers } from '@/data/stickers';
import { isStickerFavorited, addFavoriteSticker, removeFavoriteSticker } from '@/utils/storage';
import styles from './index.module.scss';

interface DraggableStickerProps {
  sticker: PlacedSticker;
  selected: boolean;
  multiSelected: boolean;
  multiSelectMode: boolean;
  canvasWidth: number;
  canvasHeight: number;
  onSelect: (id: string) => void;
  onUpdate: (id: string, updates: Partial<PlacedSticker>) => void;
  onDelete: (id: string) => void;
  onCopy: (id: string) => void;
  onToggleMultiSelect: (id: string) => void;
}

const DraggableSticker: React.FC<DraggableStickerProps> = ({
  sticker,
  selected,
  multiSelected,
  multiSelectMode,
  canvasWidth,
  canvasHeight,
  onSelect,
  onUpdate,
  onDelete,
  onCopy,
  onToggleMultiSelect,
}) => {
  const stickerData = stickers.find(s => s.id === sticker.stickerId);
  const [isDragging, setIsDragging] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const startPosRef = useRef({ x: 0, y: 0, stickerX: 0, stickerY: 0 });
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  const stickerSize = 80 * sticker.scale;

  useEffect(() => {
    if (stickerData) {
      isStickerFavorited(stickerData.id).then(setIsFavorited);
    }
  }, [stickerData]);

  const handleTouchStart = useCallback((e: any) => {
    e.stopPropagation();
    
    if (multiSelectMode) {
      onToggleMultiSelect(sticker.id);
      return;
    }

    longPressTimerRef.current = setTimeout(() => {
      onToggleMultiSelect(sticker.id);
      Taro.vibrateShort({ type: 'light' });
    }, 500);

    onSelect(sticker.id);
    setIsDragging(true);
    const touch = e.touches[0];
    startPosRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      stickerX: sticker.x,
      stickerY: sticker.y,
    };
  }, [sticker.id, sticker.x, sticker.y, onSelect, multiSelectMode, onToggleMultiSelect]);

  const handleTouchMove = useCallback((e: any) => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    if (!isDragging || multiSelectMode) return;
    e.stopPropagation();
    e.preventDefault();
    
    const touch = e.touches[0];
    const dx = touch.clientX - startPosRef.current.x;
    const dy = touch.clientY - startPosRef.current.y;
    
    const scaleX = canvasWidth / 686;
    const scaleY = canvasHeight / 900;
    
    let newX = startPosRef.current.stickerX + dx / scaleX;
    let newY = startPosRef.current.stickerY + dy / scaleY;
    
    newX = Math.max(0, Math.min(686 - stickerSize, newX));
    newY = Math.max(0, Math.min(900 - stickerSize, newY));
    
    onUpdate(sticker.id, { x: newX, y: newY });
  }, [isDragging, canvasWidth, canvasHeight, stickerSize, sticker.id, onUpdate, multiSelectMode]);

  const handleTouchEnd = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    setIsDragging(false);
  }, []);

  const handleDelete = (e: any) => {
    e.stopPropagation();
    onDelete(sticker.id);
  };

  const handleCopy = (e: any) => {
    e.stopPropagation();
    onCopy(sticker.id);
    Taro.showToast({ title: '已复制', icon: 'success' });
  };

  const handleToggleFavorite = async (e: any) => {
    e.stopPropagation();
    if (!stickerData) return;
    
    try {
      if (isFavorited) {
        await removeFavoriteSticker(stickerData.id);
        setIsFavorited(false);
        Taro.showToast({ title: '已取消收藏', icon: 'success' });
      } else {
        await addFavoriteSticker(stickerData);
        setIsFavorited(true);
        Taro.showToast({ title: '已收藏', icon: 'success' });
      }
    } catch (error) {
      console.error('[DraggableSticker] 收藏操作失败:', error);
      Taro.showToast({ title: '操作失败', icon: 'none' });
    }
  };

  const handleCheckboxClick = (e: any) => {
    e.stopPropagation();
    onToggleMultiSelect(sticker.id);
  };

  if (!stickerData) return null;

  const svgContent = stickerData.svgContent.replace(
    /fill="currentColor"/g,
    `fill="${sticker.color}"`
  ).replace(
    /stroke="currentColor"/g,
    `stroke="${sticker.color}"`
  );

  const isActive = selected || multiSelected;

  return (
    <View
      className={classnames(
        styles.sticker,
        selected && styles.selected,
        multiSelected && styles.multiSelected
      )}
      style={{
        left: `${(sticker.x / 686) * 100}%`,
        top: `${(sticker.y / 900) * 100}%`,
        width: `${(stickerSize / 686) * 100}%`,
        height: `${(stickerSize / 900) * 100}%`,
        transform: `rotate(${sticker.rotation}deg)`,
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={() => onSelect(sticker.id)}
    >
      <View dangerouslySetInnerHTML={{ __html: svgContent }} />
      
      {(isActive || multiSelectMode) && (
        <Button
          className={classnames(
            styles.selectionCheckbox,
            multiSelected && styles.checked
          )}
          onClick={handleCheckboxClick}
        >
          {multiSelected ? '✓' : ''}
        </Button>
      )}
      
      {selected && !multiSelectMode && (
        <>
          <Button
            className={classnames(styles.favoriteHandle, isFavorited && styles.favorited)}
            onClick={handleToggleFavorite}
          >
            {isFavorited ? '★' : '☆'}
          </Button>
          <Button
            className={styles.copyHandle}
            onClick={handleCopy}
          >
            ⎘
          </Button>
          <Text className={styles.deleteHandle} onClick={handleDelete}>×</Text>
        </>
      )}
    </View>
  );
};

export default DraggableSticker;
