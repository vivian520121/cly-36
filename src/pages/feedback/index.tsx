import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Textarea, Input, Button } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import dayjs from 'dayjs';
import { saveFeedback, getFeedbackRecords } from '@/utils/storage';
import { FeedbackRecord } from '@/types/journal';
import styles from './index.module.scss';

type FeedbackType = 'bug' | 'feature' | 'suggestion' | 'other';

const typeOptions = [
  { value: 'bug' as const, label: 'Bug反馈', icon: '🐛' },
  { value: 'feature' as const, label: '功能建议', icon: '✨' },
  { value: 'suggestion' as const, label: '体验优化', icon: '💡' },
  { value: 'other' as const, label: '其他', icon: '📝' },
];

const FeedbackPage: React.FC = () => {
  const [type, setType] = useState<FeedbackType>('suggestion');
  const [content, setContent] = useState('');
  const [contact, setContact] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [history, setHistory] = useState<FeedbackRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getFeedbackRecords();
      setHistory(data);
    } catch (error) {
      console.error('[Feedback] 加载历史记录失败:', error);
    } finally {
      setLoading(false);
      Taro.stopPullDownRefresh();
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  useDidShow(() => {
    loadHistory();
  });

  const getTypeLabel = (typeValue: string) => {
    const map: Record<string, string> = {
      bug: 'Bug反馈',
      feature: '功能建议',
      suggestion: '体验优化',
      other: '其他',
    };
    return map[typeValue] || typeValue;
  };

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      pending: '待处理',
      processing: '处理中',
      resolved: '已处理',
    };
    return map[status] || status;
  };

  const formatDate = (timestamp: number) => {
    return dayjs(timestamp).format('YYYY-MM-DD HH:mm');
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      Taro.showToast({
        title: '请输入反馈内容',
        icon: 'none',
      });
      return;
    }

    if (content.trim().length < 10) {
      Taro.showToast({
        title: '请输入至少10个字',
        icon: 'none',
      });
      return;
    }

    setSubmitting(true);
    try {
      await saveFeedback(type, content.trim(), contact.trim());
      Taro.showToast({
        title: '提交成功',
        icon: 'success',
      });
      setContent('');
      setContact('');
      loadHistory();
    } catch (error) {
      console.error('[Feedback] 提交失败:', error);
      Taro.showToast({
        title: '提交失败，请重试',
        icon: 'none',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = content.trim().length >= 10;

  return (
    <View className={styles.page}>
      <View className={styles.section}>
        <Text className={styles.sectionTitle}>我要反馈</Text>
        <View className={styles.formCard}>
          <View className={styles.typeGrid}>
            {typeOptions.map((opt) => (
            <View
              key={opt.value}
              className={`${styles.typeItem} ${type === opt.value && styles.active}`}
              onClick={() => setType(opt.value)}
            >
              <Text className={styles.icon}>{opt.icon}</Text>
              <Text className={styles.label}>{opt.label}</Text>
            </View>
          ))}
          </View>

          <Text className={styles.label}>反馈内容</Text>
          <Textarea
            className={styles.textarea}
            placeholder="请详细描述您的问题或建议，我们会认真对待每一条反馈"
            value={content}
            onInput={(e) => setContent(e.detail.value)}
            maxlength={500}
            autoHeight
          />
          <Text className={styles.tip}>{content.length}/500，至少输入10个字</Text>

          <Text className={styles.label} style={{ marginTop: '32rpx' }}>联系方式（选填）</Text>
          <Input
            className={styles.input}
            placeholder="手机号或邮箱，方便我们联系您"
            value={contact}
            onInput={(e) => setContact(e.detail.value)}
            maxlength={50}
          />
          <Text className={styles.tip}>我们会严格保护您的隐私</Text>

          <Button
            className={styles.submitBtn}
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
          >
            提交反馈
          </Button>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>反馈历史</Text>
        {history.length === 0 && !loading ? (
          <View className={styles.empty}>
            <Text className={styles.icon}>📋</Text>
            <Text className={styles.text}>暂无反馈记录</Text>
          </View>
        ) : (
          <View className={styles.historyList}>
            {history.map((record) => (
              <View key={record.id} className={styles.historyItem}>
                <View className={styles.historyHeader}>
                  <Text className={`${styles.historyType} ${styles[record.type]}`}>
                    {getTypeLabel(record.type)}
                  </Text>
                  <Text className={`${styles.historyStatus} ${styles[record.status]}`}>
                    {getStatusLabel(record.status)}
                  </Text>
                </View>
                <Text className={styles.historyContent}>{record.content}</Text>
                {record.contact && (
                  <Text className={styles.historyContact}>联系方式：{record.contact}</Text>
                )}
                <Text className={styles.historyDate}>{formatDate(record.createdAt)}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {submitting && (
        <View className={styles.submitting}>
          <View className={styles.content}>
            <View className={styles.spinner} />
            <Text className={styles.text}>正在提交...</Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default FeedbackPage;
