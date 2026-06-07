import React, { useState, useCallback } from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { templates, TEMPLATE_CATEGORIES } from '@/data/templates';
import TemplateCard from '@/components/TemplateCard';
import { useJournalStore } from '@/store/journalStore';
import styles from './index.module.scss';

const TemplatesPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const { applyTemplate } = useJournalStore();

  const filteredTemplates = activeCategory === 'all'
    ? templates
    : templates.filter(t => t.category === activeCategory);

  const handleTemplateClick = useCallback((template: typeof templates[0]) => {
    Taro.navigateTo({
      url: `/pages/template-detail/index?id=${template.id}`,
    });
  }, []);

  const handleQuickUse = useCallback((template: typeof templates[0]) => {
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
  }, [applyTemplate]);

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.title}>模板库</Text>
        <Text className={styles.subtitle}>精选文艺手账模板，一键套用</Text>
      </View>

      <View className={styles.categoryTabs}>
        {TEMPLATE_CATEGORIES.map((cat) => (
          <Button
            key={cat.id}
            className={classnames(styles.categoryTab, activeCategory === cat.id && styles.active)}
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.name}
          </Button>
        ))}
      </View>

      <View className={styles.templateGrid}>
        {filteredTemplates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            onClick={handleTemplateClick}
          />
        ))}
      </View>

      {filteredTemplates.length === 0 && (
        <View style={{ textAlign: 'center', padding: '80rpx 0', color: '#9C958D' }}>
          <Text>暂无该分类模板</Text>
        </View>
      )}
    </View>
  );
};

export default TemplatesPage;
