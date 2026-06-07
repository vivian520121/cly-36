import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, Textarea, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { JournalData, TextStyle, BackgroundStyle, BorderStyle, PlacedSticker } from '@/types/journal';
import { useAutoSave } from '@/hooks/useAutoSave';
import StylePanel from '@/components/StylePanel';
import StickerPanel from '@/components/StickerPanel';
import DraggableSticker from '@/components/DraggableSticker';
import styles from './index.module.scss';

interface JournalEditorProps {
  journal: JournalData;
  onUpdateContent: (content: string) => void;
  onUpdateTextStyle: (style: Partial<TextStyle>) => void;
  onUpdateBackground: (bg: Partial<BackgroundStyle>) => void;
  onUpdateBorder: (border: Partial<BorderStyle>) => void;
  onAddSticker: (stickerId: string, color: string) => void;
  onUpdateSticker: (id: string, updates: Partial<PlacedSticker>) => void;
  onRemoveSticker: (id: string) => void;
  onSelectSticker: (id: string | null) => void;
  selectedStickerId: string | null;
  onExport: () => void;
}

const JournalEditor: React.FC<JournalEditorProps> = ({
  journal,
  onUpdateContent,
  onUpdateTextStyle,
  onUpdateBackground,
  onUpdateBorder,
  onAddSticker,
  onUpdateSticker,
  onRemoveSticker,
  onSelectSticker,
  selectedStickerId,
  onExport,
}) => {
  const [activePanel, setActivePanel] = useState<'style' | 'sticker' | null>(null);
  const [stickerColor, setStickerColor] = useState('#8B7355');
  const [isSaving, setIsSaving] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const canvasRef = useRef<HTMLElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSaved = useCallback(() => {
    setIsSaving(false);
  }, []);

  useAutoSave({
    data: journal,
    enabled: true,
    delay: 3000,
    onSaved: handleSaved,
  });

  useEffect(() => {
    const query = Taro.createSelectorQuery();
    query.select(`.${styles.canvas}`).boundingClientRect((rect: any) => {
      if (rect) {
        setCanvasSize({ width: rect.width, height: rect.height });
      }
    }).exec();
  }, []);

  const getCanvasStyle = () => {
    const { background, border } = journal;
    const style: React.CSSProperties = {};

    if (background.type === 'solid' && background.color) {
      style.backgroundColor = background.color;
    } else if (background.type === 'image' && background.imageUrl) {
      style.backgroundImage = `url(${background.imageUrl})`;
      style.backgroundSize = 'cover';
      style.backgroundPosition = 'center';
    }

    if (border.type !== 'none') {
      style.borderStyle = border.type;
      style.borderWidth = `${border.width}px`;
      style.borderColor = border.color;
      style.borderRadius = `${border.radius}px`;
    } else if (border.radius > 0) {
      style.borderRadius = `${border.radius}px`;
    }

    return style;
  };

  const getTextStyle = (): React.CSSProperties => {
    const { textStyle } = journal;
    return {
      fontFamily: textStyle.fontFamily,
      fontSize: `${textStyle.fontSize}px`,
      fontWeight: textStyle.fontWeight,
      color: textStyle.color,
      lineHeight: textStyle.lineHeight,
      textAlign: textStyle.textAlign,
      letterSpacing: `${textStyle.letterSpacing}px`,
    };
  };

  const handleContentChange = (e: any) => {
    const content = e.detail.value;
    onUpdateContent(content);
    setIsSaving(true);
  };

  const handleToolClick = (panel: 'style' | 'sticker') => {
    if (activePanel === panel) {
      setActivePanel(null);
    } else {
      setActivePanel(panel);
      onSelectSticker(null);
    }
  };

  const handleOverlayClick = () => {
    setActivePanel(null);
    onSelectSticker(null);
  };

  const handleCanvasClick = () => {
    onSelectSticker(null);
  };

  const handleAddSticker = (stickerId: string, color: string) => {
    onAddSticker(stickerId, color);
    setActivePanel(null);
  };

  const handleExportClick = () => {
    setActivePanel(null);
    onSelectSticker(null);
    onExport();
  };

  const createIconSvg = (type: string) => {
    const svgMap: Record<string, string> = {
      style: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/></svg>',
      sticker: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12V7a2 2 0 0 0-2-2h-5l-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4"/><circle cx="18" cy="18" r="3"/></svg>',
      template: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>',
    };
    return svgMap[type] || '';
  };

  return (
    <View className={styles.editor}>
      <View className={styles.canvasWrapper} ref={canvasRef as any}>
        <View className={styles.autoSaveTip + (isSaving ? ' ' + styles.saving : '')}>
          <View className={styles.dot} />
          <Text>{isSaving ? '保存中...' : '已自动保存'}</Text>
        </View>

        <View
          className={styles.canvas}
          style={getCanvasStyle()}
          onClick={handleCanvasClick}
        >
          <Textarea
            ref={textareaRef as any}
            className={styles.textArea}
            style={getTextStyle()}
            value={journal.content}
            onInput={handleContentChange}
            placeholder="在此输入你的文字..."
            autoHeight={false}
            maxlength={-1}
            confirmType="done"
          />

          <View className={styles.stickerLayer}>
            {journal.stickers.map((sticker) => (
              <DraggableSticker
                key={sticker.id}
                sticker={sticker}
                selected={selectedStickerId === sticker.id}
                canvasWidth={canvasSize.width}
                canvasHeight={canvasSize.height}
                onSelect={onSelectSticker}
                onUpdate={onUpdateSticker}
                onDelete={onRemoveSticker}
              />
            ))}
          </View>
        </View>
      </View>

      <View className={styles.toolbar}>
        <Button
          className={classnames(styles.toolBtn, activePanel === 'style' && styles.active)}
          onClick={() => handleToolClick('style')}
        >
          <View
            className={styles.toolIcon}
            dangerouslySetInnerHTML={{ __html: createIconSvg('style') }}
          />
          <Text>样式</Text>
        </Button>

        <Button
          className={classnames(styles.toolBtn, activePanel === 'sticker' && styles.active)}
          onClick={() => handleToolClick('sticker')}
        >
          <View
            className={styles.toolIcon}
            dangerouslySetInnerHTML={{ __html: createIconSvg('sticker') }}
          />
          <Text>贴纸</Text>
        </Button>

        <Button
          className={styles.exportBtn}
          onClick={handleExportClick}
        >
          导出图片
        </Button>
      </View>

      {activePanel && (
        <>
          <View className={styles.panelOverlay} onClick={handleOverlayClick} />
          <View className={styles.panelContainer}>
            <StylePanel
              visible={activePanel === 'style'}
              textStyle={journal.textStyle}
              background={journal.background}
              border={journal.border}
              onClose={() => setActivePanel(null)}
              onTextStyleChange={onUpdateTextStyle}
              onBackgroundChange={onUpdateBackground}
              onBorderChange={onUpdateBorder}
            />
            <StickerPanel
              visible={activePanel === 'sticker'}
              selectedColor={stickerColor}
              onClose={() => setActivePanel(null)}
              onAddSticker={handleAddSticker}
              onColorChange={setStickerColor}
            />
          </View>
        </>
      )}
    </View>
  );
};

export default JournalEditor;
