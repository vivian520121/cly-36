import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { LayoutTemplate } from '@/types/journal';
import styles from './index.module.scss';

interface TemplateCardProps {
  template: LayoutTemplate;
  onClick?: (template: LayoutTemplate) => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, onClick }) => {
  const handleClick = () => {
    onClick?.(template);
  };

  const getCategoryLabel = (category: string) => {
    const map: Record<string, string> = {
      simple: '简约',
      warm: '温暖',
      fresh: '清新',
      retro: '复古',
    };
    return map[category] || category;
  };

  return (
    <View className={styles.card} onClick={handleClick}>
      <View className={styles.thumbnail}>
        <Image
          src={template.thumbnail}
          mode="aspectFill"
          lazyLoad
          onError={(e) => console.error('[TemplateCard] 图片加载失败:', e)}
        />
      </View>
      <View className={styles.info}>
        <Text className={styles.name}>{template.name}</Text>
        <View>
          <Text className={styles.category}>{getCategoryLabel(template.category)}</Text>
        </View>
      </View>
    </View>
  );
};

export default TemplateCard;
