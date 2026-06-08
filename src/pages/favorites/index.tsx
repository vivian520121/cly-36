import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Image, Button } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import dayjs from 'dayjs';
import { getFavoriteTemplates, removeFavoriteTemplate } from '@/utils/storage';
import { FavoriteTemplate } from '@/types/journal';
import styles from './index.module.scss';

const FavoritesPage: React.FC = () => {
  const [favorites, setFavorites] = useState<FavoriteTemplate[]>([]);
  const [loading, setLoading] = useState(false);

  const loadFavorites = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getFavoriteTemplates();
      setFavorites(data);
    } catch (error) {
      console.error('[Favorites] 加载收藏失败:', error);
    } finally {
      setLoading(false);
      Taro.stopPullDownRefresh();
    }
  }, []);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  useDidShow(() => {
    loadFavorites();
  });

  const getCategoryLabel = (category: string) => {
    const map: Record<string, string> = {
      simple: '简约',
      warm: '温暖',
      fresh: '清新',
      retro: '复古',
    };
    return map[category] || category;
  };

  const formatDate = (timestamp: number) => {
    return dayjs(timestamp).format('YYYY-MM-DD');
  };

  const handleCardClick = (favorite: FavoriteTemplate) => {
    Taro.navigateTo({
      url: `/pages/template-detail/index?id=${favorite.templateId}`,
    });
  };

  const handleRemoveFavorite = (e: any, favorite: FavoriteTemplate) => {
    e.stopPropagation();
    Taro.showModal({
      title: '取消收藏',
      content: '确定要取消收藏这个模板吗？',
      confirmColor: '#B86464',
      success: async (res) => {
        if (res.confirm) {
          try {
            await removeFavoriteTemplate(favorite.templateId);
            setFavorites(prev => prev.filter(f => f.id !== favorite.id));
            Taro.showToast({
              title: '已取消收藏',
              icon: 'success',
            });
          } catch (error) {
            console.error('[Favorites] 取消收藏失败:', error);
            Taro.showToast({
              title: '操作失败，请重试',
              icon: 'none',
            });
          }
        }
      },
    });
  };

  const handleGoTemplates = () => {
    Taro.switchTab({ url: '/pages/templates/index' });
  };

  return (
    <View className={styles.page}>
      {favorites.length === 0 && !loading ? (
        <View className={styles.empty}>
          <Text className={styles.icon}>❤️</Text>
          <Text className={styles.text}>还没有收藏任何模板</Text>
          <Button className={styles.btn} onClick={handleGoTemplates}>
            去看看
          </Button>
        </View>
      ) : (
        <View className={styles.grid}>
          {favorites.map((favorite) => (
            <View
              key={favorite.id}
              className={styles.card}
              onClick={() => handleCardClick(favorite)}
            >
              <View className={styles.cover}>
                <Image
                  src={favorite.template.thumbnail}
                  mode="aspectFill"
                  lazyLoad
                />
                <Button
                  className={styles.favoriteBtn}
                  onClick={(e) => handleRemoveFavorite(e, favorite)}
                >
                  ❤️
                </Button>
              </View>
              <View className={styles.info}>
                <Text className={styles.name}>{favorite.template.name}</Text>
                <Text className={styles.category}>
                  {getCategoryLabel(favorite.template.category)}
                </Text>
                <Text className={styles.favoritedAt}>
                  收藏于 {formatDate(favorite.favoritedAt)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

export default FavoritesPage;
