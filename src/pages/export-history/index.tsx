import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Image, Button } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import dayjs from 'dayjs';
import { getExportRecords, deleteExportRecord, saveDraft } from '@/utils/storage';
import { ExportRecord, EXPORT_SIZE_PRESETS, EXPORT_QUALITY_PRESETS, ExportCanvasSize, ExportQuality } from '@/types/journal';
import { useJournalStore } from '@/store/journalStore';
import styles from './index.module.scss';

const ExportHistoryPage: React.FC = () => {
  const [records, setRecords] = useState<ExportRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewRecord, setPreviewRecord] = useState<ExportRecord | null>(null);
  const { loadJournal } = useJournalStore();

  const loadRecords = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getExportRecords();
      setRecords(data);
    } catch (error) {
      console.error('[ExportHistory] 加载记录失败:', error);
    } finally {
      setLoading(false);
      Taro.stopPullDownRefresh();
    }
  }, []);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  useDidShow(() => {
    loadRecords();
  });

  const formatDate = (timestamp: number) => {
    return dayjs(timestamp).format('YYYY-MM-DD HH:mm');
  };

  const getSizeLabel = (canvasSize: ExportCanvasSize) => {
    return EXPORT_SIZE_PRESETS[canvasSize]?.label || canvasSize;
  };

  const getQualityLabel = (quality: ExportQuality) => {
    return EXPORT_QUALITY_PRESETS[quality]?.label || quality;
  };

  const handlePreview = (record: ExportRecord) => {
    setPreviewRecord(record);
  };

  const handleClosePreview = () => {
    setPreviewRecord(null);
  };

  const handleEdit = async (record: ExportRecord) => {
    try {
      loadJournal(record.data);
      await saveDraft(record.data);
      Taro.showToast({
        title: '已加载到编辑页',
        icon: 'success',
      });
      setTimeout(() => {
        Taro.switchTab({ url: '/pages/create/index' });
      }, 800);
    } catch (error) {
      console.error('[ExportHistory] 编辑失败:', error);
      Taro.showToast({
        title: '加载失败，请重试',
        icon: 'none',
      });
    }
  };

  const handleDelete = async (record: ExportRecord) => {
    Taro.showModal({
      title: '删除记录',
      content: '确定要删除这条导出记录吗？',
      confirmColor: '#B86464',
      success: async (res) => {
        if (res.confirm) {
          try {
            await deleteExportRecord(record.id);
            setRecords(prev => prev.filter(r => r.id !== record.id));
            Taro.showToast({
              title: '已删除',
              icon: 'success',
            });
          } catch (error) {
            console.error('[ExportHistory] 删除失败:', error);
            Taro.showToast({
              title: '删除失败，请重试',
              icon: 'none',
            });
          }
        }
      },
    });
  };

  const handleGoCreate = () => {
    Taro.switchTab({ url: '/pages/create/index' });
  };

  return (
    <View className={styles.page}>
      {records.length === 0 && !loading ? (
        <View className={styles.empty}>
          <Text className={styles.icon}>📷</Text>
          <Text className={styles.text}>暂无导出记录</Text>
          <Button className={styles.btn} onClick={handleGoCreate}>
            去创作
          </Button>
        </View>
      ) : (
        <View className={styles.recordList}>
          {records.map((record) => (
            <View key={record.id} className={styles.recordItem}>
              <View className={styles.recordHeader}>
                <View className={styles.recordInfo}>
                  <Text className={styles.recordTitle}>{record.title}</Text>
                  <View className={styles.recordMeta}>
                    <Text className={styles.metaItem}>{formatDate(record.exportedAt)}</Text>
                    <Text className={styles.sizeTag}>{getSizeLabel(record.canvasSize)} · {getQualityLabel(record.quality)}</Text>
                  </View>
                </View>
              </View>

              <View
                className={styles.recordPreview}
                onClick={() => handlePreview(record)}
              >
                <Image
                  src={record.imageUrl}
                  mode="aspectFill"
                  lazyLoad
                />
              </View>

              <View className={styles.recordActions}>
                <Button
                  className={`${styles.actionBtn} ${styles.primary}`}
                  onClick={() => handleEdit(record)}
                >
                  再编辑
                </Button>
                <Button
                  className={`${styles.actionBtn} ${styles.danger}`}
                  onClick={() => handleDelete(record)}
                >
                  删除
                </Button>
              </View>
            </View>
          ))}
        </View>
      )}

      {previewRecord && (
        <View className={styles.previewModal} onClick={handleClosePreview}>
          <Button className={styles.closeBtn} onClick={handleClosePreview}>
            ✕
          </Button>
          <Image
            className={styles.previewImage}
            src={previewRecord.imageUrl}
            mode="widthFix"
          />
        </View>
      )}
    </View>
  );
};

export default ExportHistoryPage;
