import React from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import dayjs from 'dayjs';
import { DraftItem } from '@/types/journal';
import styles from './index.module.scss';

interface DraftCardProps {
  draft: DraftItem;
  onClick?: (draft: DraftItem) => void;
  onDelete?: (id: string) => void;
}

const DraftCard: React.FC<DraftCardProps> = ({ draft, onClick, onDelete }) => {
  const handleClick = () => {
    onClick?.(draft);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    Taro.showModal({
      title: '删除草稿',
      content: '确定要删除这篇草稿吗？',
      confirmColor: '#B86464',
      success: (res) => {
        if (res.confirm) {
          onDelete?.(draft.id);
        }
      },
    });
  };

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    return dayjs(timestamp).format('MM-DD HH:mm');
  };

  return (
    <View className={styles.card} onClick={handleClick}>
      <View className={styles.header}>
        <Text className={styles.title}>{draft.title || '未命名手账'}</Text>
        <Button className={styles.deleteBtn} onClick={handleDelete}>
          ×
        </Button>
      </View>
      <Text className={styles.preview}>{draft.preview || '暂无内容'}</Text>
      <View className={styles.footer}>
        <Text className={styles.time}>{formatTime(draft.updatedAt)}</Text>
        <Text className={styles.stickerCount}>
          {draft.data.stickers.length} 个贴纸
        </Text>
      </View>
    </View>
  );
};

export default DraftCard;
