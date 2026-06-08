import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Button, Image } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { templates } from '@/data/templates';
import { LayoutTemplate } from '@/types/journal';
import { useJournalStore } from '@/store/journalStore';
import { addFavoriteTemplate, removeFavoriteTemplate, isTemplateFavorited } from '@/utils/storage';
import classnames from 'classnames';
import styles from './index.module.scss';

const TemplateDetailPage: React.FC = () => {
  const router = useRouter();
  const [template, setTemplate] = useState<LayoutTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const { applyTemplate } = useJournalStore();

  useEffect(() => {
    const templateId = router.params.id;
    const found = templates.find(t => t.id === templateId);
    if (found) {
      setTemplate(found);
      checkFavorite(templateId);
    }
    setLoading(false);
  }, [router.params.id]);

  const checkFavorite = async (templateId: string) => {
    try {
      const favorited = await isTemplateFavorited(templateId);
      setIsFavorited(favorited);
    } catch (error) {
      console.error('[TemplateDetail] 检查收藏状态失败:', error);
    }
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

  const createIconSvg = (type: string) => {
    const svgMap: Record<string, string> = {
      font: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>',
      palette: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r="1.5"/><circle cx="17.5" cy="10.5" r="1.5"/><circle cx="8.5" cy="7.5" r="1.5"/><circle cx="6.5" cy="12.5" r="1.5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.555C21.965 6.012 17.461 2 12 2z"/></svg>',
      layout: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>',
      heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
    };
    return svgMap[type] || '';
  };

  const handleUseTemplate = useCallback(() => {
    if (!template) return;
    
    applyTemplate(template);
    Taro.showToast({
      title: `已应用「${template.name}」`,
      icon: 'success',
      duration: 1500,
    });
    
    setTimeout(() => {
      Taro.switchTab({
        url: '/pages/create/index',
      });
    }, 800);
  }, [template, applyTemplate]);

  const handleFavorite = useCallback(async () => {
    if (!template) return;

    try {
      if (isFavorited) {
        await removeFavoriteTemplate(template.id);
        setIsFavorited(false);
        Taro.showToast({
          title: '已取消收藏',
          icon: 'success',
          duration: 1500,
        });
      } else {
        await addFavoriteTemplate(template);
        setIsFavorited(true);
        Taro.showToast({
          title: '已收藏',
          icon: 'success',
          duration: 1500,
        });
      }
    } catch (error) {
      console.error('[TemplateDetail] 收藏操作失败:', error);
      Taro.showToast({
        title: '操作失败，请重试',
        icon: 'none',
      });
    }
  }, [template, isFavorited]);

  if (loading) {
    return (
      <View className={styles.page}>
        <View className={styles.loading}>
          <Text>加载中...</Text>
        </View>
      </View>
    );
  }

  if (!template) {
    return (
      <View className={styles.page}>
        <View className={styles.loading}>
          <Text>模板不存在</Text>
        </View>
      </View>
    );
  }

  const features = [
    `字体：${template.defaultTextStyle.fontFamily?.includes('Songti') ? '宋体' : 
            template.defaultTextStyle.fontFamily?.includes('Kaiti') ? '楷体' :
            template.defaultTextStyle.fontFamily?.includes('PingFang') ? '黑体' :
            template.defaultTextStyle.fontFamily?.includes('Yuanti') ? '圆体' : '等宽'}`,
    `字号：${template.defaultTextStyle.fontSize}px`,
    `对齐：${template.defaultTextStyle.textAlign === 'center' ? '居中' : template.defaultTextStyle.textAlign === 'left' ? '左对齐' : '右对齐'}`,
    `边框：${template.defaultBorder.type === 'none' ? '无' : template.defaultBorder.type === 'solid' ? '实线' : template.defaultBorder.type === 'dashed' ? '虚线' : '点线'}`,
  ];

  return (
    <View className={styles.page}>
      <View className={styles.previewSection}>
        <Text className={styles.previewTitle}>模板预览</Text>
        <View className={styles.previewCard}>
          <View className={styles.previewImage}>
            <Image
              src={template.thumbnail}
              mode="aspectFill"
              onError={(e) => console.error('[TemplateDetail] 图片加载失败:', e)}
            />
          </View>
          <View className={styles.previewOverlay}>
            <Text className={styles.previewName}>{template.name}</Text>
            <Text className={styles.previewCategory}>{getCategoryLabel(template.category)}</Text>
          </View>
        </View>
      </View>

      <View className={styles.infoSection}>
        <View className={styles.infoCard}>
          <View className={styles.infoRow}>
            <View
              className={styles.infoIcon}
              dangerouslySetInnerHTML={{ __html: createIconSvg('font') }}
            />
            <View className={styles.infoContent}>
              <Text className={styles.infoLabel}>文字样式</Text>
              <View className={styles.featureList}>
                {features.slice(0, 3).map((f, i) => (
                  <Text key={i} className={styles.featureTag}>{f}</Text>
                ))}
              </View>
            </View>
          </View>

          <View className={styles.infoRow}>
            <View
              className={styles.infoIcon}
              dangerouslySetInnerHTML={{ __html: createIconSvg('palette') }}
            />
            <View className={styles.infoContent}>
              <Text className={styles.infoLabel}>配色方案</Text>
              <Text className={styles.infoValue}>
                背景：{template.defaultBackground.color}
              </Text>
              <Text className={styles.infoValue}>
                文字：{template.defaultTextStyle.color}
              </Text>
            </View>
          </View>

          <View className={styles.infoRow}>
            <View
              className={styles.infoIcon}
              dangerouslySetInnerHTML={{ __html: createIconSvg('layout') }}
            />
            <View className={styles.infoContent}>
              <Text className={styles.infoLabel}>版式特点</Text>
              <Text className={styles.infoValue}>
                内边距 {template.textArea.x}rpx，行高 {template.defaultTextStyle.lineHeight}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View className={styles.bottomBar}>
        <Button
          className={classnames(styles.favoriteBtn, isFavorited && styles.favorited)}
          onClick={handleFavorite}
          dangerouslySetInnerHTML={{ __html: createIconSvg('heart') }}
        />
        <Button className={styles.useBtn} onClick={handleUseTemplate}>
          使用模板
        </Button>
      </View>
    </View>
  );
};

export default TemplateDetailPage;
