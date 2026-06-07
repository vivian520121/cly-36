import React, { useRef, useState, useCallback } from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import { PlacedSticker } from '@/types/journal';
import { stickers } from '@/data/stickers';
import styles from './index.module.scss';

interface DraggableStickerProps {
  sticker: PlacedSticker;
  selected: boolean;
  canvasWidth: number;
  canvasHeight: number;
  onSelect: (id: string) => void;
  onUpdate: (id: string, updates: Partial<PlacedSticker>) => void;
  onDelete: (id: string) => void;
}

const DraggableSticker: React.FC<DraggableStickerProps> = ({
  sticker,
  selected,
  canvasWidth,
  canvasHeight,
  onSelect,
  onUpdate,
  onDelete,
}) => {
  const stickerData = stickers.find(s => s.id === sticker.stickerId);
  const [isDragging, setIsDragging] = useState(false);
  const startPosRef = useRef({ x: 0, y: 0, stickerX: 0, stickerY: 0 });
  const rotateStartRef = useRef({ angle: 0, stickerRotation: 0 });

  const stickerSize = 80 * sticker.scale;

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.stopPropagation();
    onSelect(sticker.id);
    setIsDragging(true);
    const touch = e.touches[0];
    startPosRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      stickerX: sticker.x,
      stickerY: sticker.y,
    };
  }, [sticker.id, sticker.x, sticker.y, onSelect]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return;
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
  }, [isDragging, canvasWidth, canvasHeight, stickerSize, sticker.id, onUpdate]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(sticker.id);
  };

  if (!stickerData) return null;

  const svgContent = stickerData.svgContent.replace(
    /fill="currentColor"/g,
    `fill="${sticker.color}"`
  ).replace(
    /stroke="currentColor"/g,
    `stroke="${sticker.color}"`
  );

  return (
    <View
      className={classnames(styles.sticker, selected && styles.selected)}
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
      
      {selected && (
        <>
          <Text className={styles.deleteHandle} onClick={handleDelete}>×</Text>
        </>
      )}
    </View>
  );
};

export default DraggableSticker;
