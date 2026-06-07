import React, { useState, useEffect } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { getDrafts } from '@/utils/storage';
import styles from './index.module.scss';

const MinePage: React.FC = () => {
  const [stats, setStats] = useState({ drafts: 0, templates: 8 });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const drafts = await getDrafts();
      setStats(prev => ({ ...prev, drafts: drafts.length }));
    } catch (error) {
      console.error('[MinePage] 加载统计失败:', error);
    }
  };

  const createIconSvg = (type: string) => {
    const svgMap: Record<string, string> = {
      draft: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
      export: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
      template: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>',
      feedback: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
      about: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
      arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>',
    };
    return svgMap[type] || '';
  };

  const menuItems = [
    {
      icon: 'draft',
      text: '我的草稿',
      onClick: () => Taro.switchTab({ url: '/pages/drafts/index' }),
    },
    {
      icon: 'export',
      text: '导出记录',
      onClick: () => Taro.showToast({ title: '功能开发中', icon: 'none' }),
    },
    {
      icon: 'template',
      text: '收藏模板',
      onClick: () => Taro.showToast({ title: '功能开发中', icon: 'none' }),
    },
    {
      icon: 'feedback',
      text: '意见反馈',
      onClick: () => Taro.showToast({ title: '功能开发中', icon: 'none' }),
    },
    {
      icon: 'about',
      text: '关于我们',
      onClick: () => Taro.showModal({
        title: '短句手账',
        content: '一款文艺小众的手账创作工具\n\n用文字记录生活，用排版表达态度。',
        showCancel: false,
        confirmColor: '#8B7355',
      }),
    },
  ];

  return (
    <View className={styles.page}>
      <View className={styles.profile}>
        <View className={styles.profileCard}>
          <View className={styles.avatar}>✍️</View>
          <Text className={styles.name}>文艺青年</Text>
          <Text className={styles.bio}>记录生活的点滴美好</Text>
          
          <View className={styles.stats}>
            <View className={styles.statItem}>
              <Text className={styles.statNum}>{stats.drafts}</Text>
              <Text className={styles.statLabel}>草稿</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={styles.statNum}>{stats.templates}</Text>
              <Text className={styles.statLabel}>可用模板</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={styles.statNum}>0</Text>
              <Text className={styles.statLabel}>导出</Text>
            </View>
          </View>
        </View>
      </View>

      <View className={styles.menuSection}>
        <Text className={styles.sectionTitle}>常用功能</Text>
        <View className={styles.menuList}>
          {menuItems.slice(0, 3).map((item, index) => (
            <View key={index} className={styles.menuItem} onClick={item.onClick}>
              <View className={styles.menuLeft}>
                <View
                  className={styles.menuIcon}
                  dangerouslySetInnerHTML={{ __html: createIconSvg(item.icon) }}
                />
                <Text className={styles.menuText}>{item.text}</Text>
              </View>
              <View className={styles.menuRight}>
                <View
                  className={styles.arrow}
                  dangerouslySetInnerHTML={{ __html: createIconSvg('arrow') }}
                />
              </View>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.menuSection}>
        <Text className={styles.sectionTitle}>其他</Text>
        <View className={styles.menuList}>
          {menuItems.slice(3).map((item, index) => (
            <View key={index} className={styles.menuItem} onClick={item.onClick}>
              <View className={styles.menuLeft}>
                <View
                  className={styles.menuIcon}
                  dangerouslySetInnerHTML={{ __html: createIconSvg(item.icon) }}
                />
                <Text className={styles.menuText}>{item.text}</Text>
              </View>
              <View className={styles.menuRight}>
                <View
                  className={styles.arrow}
                  dangerouslySetInnerHTML={{ __html: createIconSvg('arrow') }}
                />
              </View>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.about}>
        <Text className={styles.version}>短句手账 v1.0.0</Text>
        <Text className={styles.copyright}>© 2024 Made with ❤️</Text>
      </View>
    </View>
  );
};

export default MinePage;
