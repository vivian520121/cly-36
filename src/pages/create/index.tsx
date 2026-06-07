import React, { useCallback } from 'react';
import { View, Text, Button, ScrollView, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { useJournalStore } from '@/store/journalStore';
import { templates } from '@/data/templates';
import { saveDraft } from '@/utils/storage';
import JournalEditor from '@/components/JournalEditor';
import styles from './index.module.scss';

const CreatePage: React.FC = () => {
  const {
    currentJournal,
    selectedStickerId,
    updateContent,
    updateTextStyle,
    updateBackground,
    updateBorder,
    addSticker,
    updateSticker,
    removeSticker,
    selectSticker,
    applyTemplate,
    createNewJournal,
  } = useJournalStore();

  const handleApplyTemplate = useCallback((template: typeof templates[0]) => {
    applyTemplate(template);
    Taro.showToast({
      title: `已应用「${template.name}」`,
      icon: 'none',
      duration: 1500,
    });
  }, [applyTemplate]);

  const handleNew = useCallback(async () => {
    if (currentJournal.content.trim()) {
      await saveDraft(currentJournal);
    }
    createNewJournal();
    Taro.showToast({
      title: '已创建新手账',
      icon: 'success',
      duration: 1500,
    });
  }, [currentJournal, createNewJournal]);

  const handleExport = useCallback(() => {
    if (!currentJournal.content.trim()) {
      Taro.showToast({
        title: '请先输入内容',
        icon: 'none',
        duration: 2000,
      });
      return;
    }
    
    Taro.navigateTo({
      url: '/pages/export-preview/index',
    });
  }, [currentJournal.content]);

  const handleAddSticker = useCallback((stickerId: string, color: string) => {
    addSticker(stickerId);
    const lastSticker = currentJournal.stickers[currentJournal.stickers.length];
    if (lastSticker) {
      updateSticker(lastSticker.id, { color });
    }
  }, [addSticker, currentJournal.stickers, updateSticker]);

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.title}>短句手账</Text>
        <View className={styles.actions}>
          <Button className={styles.actionBtn} onClick={handleNew}>
            新建
          </Button>
        </View>
      </View>

      <View className={styles.templateBar}>
        <Text className={styles.templateBarTitle}>快速应用模板</Text>
        <ScrollView
          className={styles.templateScroll}
          scrollX
          showScrollbar={false}
        >
          {templates.slice(0, 6).map((template) => (
            <View
              key={template.id}
              className={styles.templateItem}
              onClick={() => handleApplyTemplate(template)}
            >
              <View
                className={classnames(
                  styles.templateThumb,
                  currentJournal.templateId === template.id && styles.active
                )}
              >
                <Image
                  src={template.thumbnail}
                  mode="aspectFill"
                  lazyLoad
                  onError={(e) => console.error('[CreatePage] 模板图片加载失败:', e)}
                />
              </View>
              <Text className={styles.templateName}>{template.name}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      <View className={styles.editorContainer}>
        <JournalEditor
          journal={currentJournal}
          onUpdateContent={updateContent}
          onUpdateTextStyle={updateTextStyle}
          onUpdateBackground={updateBackground}
          onUpdateBorder={updateBorder}
          onAddSticker={handleAddSticker}
          onUpdateSticker={updateSticker}
          onRemoveSticker={removeSticker}
          onSelectSticker={selectSticker}
          selectedStickerId={selectedStickerId}
          onExport={handleExport}
        />
      </View>
    </View>
  );
};

export default CreatePage;
