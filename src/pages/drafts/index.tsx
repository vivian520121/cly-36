import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Button, ScrollView } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { getDrafts, deleteDraft } from '@/utils/storage';
import { useJournalStore } from '@/store/journalStore';
import { DraftItem } from '@/types/journal';
import DraftCard from '@/components/DraftCard';
import styles from './index.module.scss';

const DraftsPage: React.FC = () => {
  const [drafts, setDrafts] = useState<DraftItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { loadJournal } = useJournalStore();

  const loadDrafts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getDrafts();
      setDrafts(data);
      console.log('[DraftsPage] 加载草稿:', data.length);
    } catch (error) {
      console.error('[DraftsPage] 加载草稿失败:', error);
      Taro.showToast({
        title: '加载失败',
        icon: 'none',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDrafts();
  }, [loadDrafts]);

  useDidShow(() => {
    loadDrafts();
  });

  const handleRefresh = () => {
    loadDrafts();
  };

  const handleDraftClick = useCallback((draft: DraftItem) => {
    loadJournal(draft.data);
    Taro.switchTab({
      url: '/pages/create/index',
      success: () => {
        Taro.showToast({
          title: '已加载草稿',
          icon: 'success',
          duration: 1500,
        });
      },
    });
  }, [loadJournal]);

  const handleDelete = useCallback(async (id: string) => {
    try {
      await deleteDraft(id);
      setDrafts(prev => prev.filter(d => d.id !== id));
      Taro.showToast({
        title: '已删除',
        icon: 'success',
        duration: 1500,
      });
    } catch (error) {
      console.error('[DraftsPage] 删除草稿失败:', error);
      Taro.showToast({
        title: '删除失败',
        icon: 'none',
      });
    }
  }, []);

  const handleCreate = () => {
    Taro.switchTab({
      url: '/pages/create/index',
    });
  };

  const emptyIconSvg = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="8" y1="13" x2="16" y2="13"/>
      <line x1="8" y1="17" x2="16" y2="17"/>
    </svg>
  `;

  const refreshIconSvg = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
    </svg>
  `;

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <View className={styles.headerLeft}>
          <Text className={styles.title}>草稿箱</Text>
          <Text className={styles.subtitle}>自动保存你的创作灵感</Text>
        </View>
        <View 
          className={styles.refreshBtn}
          onClick={handleRefresh}
          dangerouslySetInnerHTML={{ __html: refreshIconSvg }}
        />
      </View>

      {loading ? (
        <View className={styles.loading}>
          <Text>加载中...</Text>
        </View>
      ) : drafts.length > 0 ? (
        <View className={styles.draftList}>
          {drafts.map((draft) => (
            <DraftCard
              key={draft.id}
              draft={draft}
              onClick={handleDraftClick}
              onDelete={handleDelete}
            />
          ))}
        </View>
      ) : (
        <View className={styles.emptyState}>
          <View
            className={styles.emptyIcon}
            dangerouslySetInnerHTML={{ __html: emptyIconSvg }}
          />
          <Text className={styles.emptyText}>还没有草稿</Text>
          <Button className={styles.createBtn} onClick={handleCreate}>
            去创作
          </Button>
        </View>
      )}
    </View>
  );
};

export default DraftsPage;
