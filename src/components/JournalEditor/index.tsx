import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, Textarea, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { JournalData, TextStyle, BackgroundStyle, BorderStyle, PlacedSticker, DrawPath } from '@/types/journal';
import { useAutoSave } from '@/hooks/useAutoSave';
import StylePanel from '@/components/StylePanel';
import StickerPanel from '@/components/StickerPanel';
import DraggableSticker from '@/components/DraggableSticker';
import FreeDraw from '@/components/FreeDraw';
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
  onCopySticker: (id: string) => void;
  onSelectSticker: (id: string | null) => void;
  onToggleStickerSelection: (id: string) => void;
  onClearStickerSelection: () => void;
  onSelectAllStickers: () => void;
  onCopySelectedStickers: () => void;
  onRemoveSelectedStickers: () => void;
  onSetMultiSelectMode: (enabled: boolean) => void;
  selectedStickerId: string | null;
  selectedStickerIds: Set<string>;
  multiSelectMode: boolean;
  onExport: () => void;
  drawPaths: DrawPath[];
  drawColor: string;
  drawWidth: number;
  onAddDrawPath: (path: Omit<DrawPath, 'id'>) => void;
  onRemoveDrawPath: (id: string) => void;
  onClearDrawPaths: () => void;
  onSetDrawColor: (color: string) => void;
  onSetDrawWidth: (width: number) => void;
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
  onCopySticker,
  onSelectSticker,
  onToggleStickerSelection,
  onClearStickerSelection,
  onSelectAllStickers,
  onCopySelectedStickers,
  onRemoveSelectedStickers,
  onSetMultiSelectMode,
  selectedStickerId,
  selectedStickerIds,
  multiSelectMode,
  onExport,
  drawPaths,
  drawColor,
  drawWidth,
  onAddDrawPath,
  onRemoveDrawPath,
  onClearDrawPaths,
  onSetDrawColor,
  onSetDrawWidth,
}) => {
  const [activePanel, setActivePanel] = useState<'style' | 'sticker' | 'draw' | null>(null);
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

  const handleToolClick = (panel: 'style' | 'sticker' | 'draw') => {
    if (activePanel === panel) {
      setActivePanel(null);
      if (panel === 'draw') {
        onSetMultiSelectMode(false);
      }
    } else {
      setActivePanel(panel);
      onSelectSticker(null);
      onClearStickerSelection();
      if (panel !== 'draw') {
        onSetMultiSelectMode(false);
      }
    }
  };

  const handleOverlayClick = () => {
    setActivePanel(null);
    onSelectSticker(null);
    if (!multiSelectMode) {
      onClearStickerSelection();
    }
  };

  const handleCanvasClick = () => {
    if (!multiSelectMode && activePanel !== 'draw') {
      onSelectSticker(null);
      onClearStickerSelection();
    }
  };

  const handleAddSticker = (stickerId: string, color: string) => {
    onAddSticker(stickerId, color);
  };

  const handleExportClick = () => {
    setActivePanel(null);
    onSelectSticker(null);
    onClearStickerSelection();
    onSetMultiSelectMode(false);
    onExport();
  };

  const handleBatchCopy = () => {
    if (selectedStickerIds.size === 0) {
      Taro.showToast({ title: '请选择贴纸', icon: 'none' });
      return;
    }
    onCopySelectedStickers();
    Taro.showToast({ title: `已复制 ${selectedStickerIds.size} 个`, icon: 'success' });
  };

  const handleBatchDelete = () => {
    if (selectedStickerIds.size === 0) {
      Taro.showToast({ title: '请选择贴纸', icon: 'none' });
      return;
    }
    Taro.showModal({
      title: '删除贴纸',
      content: `确定要删除选中的 ${selectedStickerIds.size} 个贴纸吗？`,
      confirmColor: '#B86464',
      success: (res) => {
        if (res.confirm) {
          onRemoveSelectedStickers();
          Taro.showToast({ title: '已删除', icon: 'success' });
        }
      },
    });
  };

  const handleSelectAll = () => {
    onSelectAllStickers();
  };

  const handleCancelMultiSelect = () => {
    onSetMultiSelectMode(false);
    onClearStickerSelection();
  };

  const createIconSvg = (type: string) => {
    const svgMap: Record<string, string> = {
      style: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/></svg>',
      sticker: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12V7a2 2 0 0 0-2-2h-5l-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4"/><circle cx="18" cy="18" r="3"/></svg>',
      draw: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>',
      template: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>',
    };
    return svgMap[type] || '';
  };

  return (
    <View className={styles.editor}>
      {multiSelectMode && (
        <View className={styles.multiActionBar}>
          <Text className={styles.multiActionInfo}>
            已选择 {selectedStickerIds.size} 个贴纸
          </Text>
          <View className={styles.multiActionBtns}>
            <Button
              className={styles.multiActionBtn}
              onClick={handleSelectAll}
            >
              全选
            </Button>
            <Button
              className={classnames(styles.multiActionBtn, styles.primary)}
              onClick={handleBatchCopy}
            >
              复制
            </Button>
            <Button
              className={classnames(styles.multiActionBtn, styles.danger)}
              onClick={handleBatchDelete}
            >
              删除
            </Button>
            <Button
              className={styles.multiActionBtn}
              onClick={handleCancelMultiSelect}
            >
              取消
            </Button>
          </View>
        </View>
      )}

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
            disabled={activePanel === 'draw'}
          />

          <View className={styles.stickerLayer}>
            {journal.stickers.map((sticker) => (
              <DraggableSticker
                key={sticker.id}
                sticker={sticker}
                selected={selectedStickerId === sticker.id}
                multiSelected={selectedStickerIds.has(sticker.id)}
                multiSelectMode={multiSelectMode}
                canvasWidth={canvasSize.width}
                canvasHeight={canvasSize.height}
                onSelect={onSelectSticker}
                onUpdate={onUpdateSticker}
                onDelete={onRemoveSticker}
                onCopy={onCopySticker}
                onToggleMultiSelect={onToggleStickerSelection}
              />
            ))}
          </View>

          <View className={styles.drawLayer}>
            <FreeDraw
              active={activePanel === 'draw'}
              paths={drawPaths}
              color={drawColor}
              width={drawWidth}
              canvasWidth={canvasSize.width}
              canvasHeight={canvasSize.height}
              onAddPath={onAddDrawPath}
              onRemovePath={onRemoveDrawPath}
              onClearPaths={onClearDrawPaths}
              onColorChange={onSetDrawColor}
              onWidthChange={onSetDrawWidth}
            />
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
          className={classnames(styles.toolBtn, activePanel === 'draw' && styles.active)}
          onClick={() => handleToolClick('draw')}
        >
          <View
            className={styles.toolIcon}
            dangerouslySetInnerHTML={{ __html: createIconSvg('draw') }}
          />
          <Text>绘制</Text>
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
