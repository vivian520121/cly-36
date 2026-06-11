import React, { useState, useCallback } from 'react';
import { View, Text, Button, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { useJournalStore } from '@/store/journalStore';
import { stickers } from '@/data/stickers';
import { saveDraft, saveExportRecord } from '@/utils/storage';
import {
  ExportCanvasSize,
  ExportQuality,
  EXPORT_SIZE_PRESETS,
  EXPORT_QUALITY_PRESETS,
} from '@/types/journal';
import styles from './index.module.scss';

const CANVAS_BASE_WIDTH = 686;
const CANVAS_BASE_HEIGHT = 900;

const canvasSizeOptions: { key: ExportCanvasSize; icon: string }[] = [
  { key: 'square', icon: '⬜' },
  { key: 'wallpaper', icon: '📱' },
  { key: 'card', icon: '🃏' },
];

const qualityOptions: { key: ExportQuality }[] = [
  { key: 'standard' },
  { key: 'hd' },
  { key: 'ultra' },
];

const ExportPreviewPage: React.FC = () => {
  const { currentJournal } = useJournalStore();
  const [canvasSize, setCanvasSize] = useState<ExportCanvasSize>('card');
  const [quality, setQuality] = useState<ExportQuality>('hd');
  const [saving, setSaving] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewDataUrl, setPreviewDataUrl] = useState<string>('');

  const getPreset = () => EXPORT_SIZE_PRESETS[canvasSize];
  const getScale = () => EXPORT_QUALITY_PRESETS[quality].scale;

  const getCanvasStyle = (): React.CSSProperties => {
    const { background, border } = currentJournal;
    const style: React.CSSProperties = {};

    if (background.type === 'solid' && background.color) {
      style.backgroundColor = background.color;
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
    const { textStyle } = currentJournal;
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

  const loadSvgImage = (svgContent: string, color: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const colored = svgContent
        .replace(/fill="currentColor"/g, `fill="${color}"`)
        .replace(/stroke="currentColor"/g, `stroke="${color}"`);
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(colored)));
    });
  };

  const renderToCanvas = useCallback(async (): Promise<string> => {
    const preset = getPreset();
    const scale = getScale();
    const width = preset.width * scale;
    const height = preset.height * scale;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('无法获取 Canvas 上下文');
    }

    const dpr = window.devicePixelRatio || 1;
    if (dpr > 1 && scale === 1) {
      canvas.style.width = `${width / dpr}px`;
      canvas.style.height = `${height / dpr}px`;
    }

    const { background, border, textStyle, content, stickers: placedStickers } = currentJournal;

    if (background.type === 'solid' && background.color) {
      ctx.fillStyle = background.color;
      ctx.fillRect(0, 0, width, height);
    }

    if (border.type !== 'none' && border.width > 0) {
      ctx.strokeStyle = border.color;
      ctx.lineWidth = border.width * scale;

      if (border.type === 'dashed') {
        ctx.setLineDash([10 * scale, 5 * scale]);
      } else if (border.type === 'dotted') {
        ctx.setLineDash([2 * scale, 3 * scale]);
      } else if (border.type === 'double') {
        ctx.lineWidth = (border.width * 3 / 2) * scale;
      }

      const br = border.radius * scale;
      const bw = border.width * scale / 2;
      ctx.beginPath();
      ctx.roundRect(bw, bw, width - bw * 2, height - bw * 2, br);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    const paddingX = 60 * scale;
    const paddingY = 60 * scale;
    const fontSize = textStyle.fontSize * scale;
    const lineHeight = textStyle.lineHeight * fontSize;

    ctx.font = `${textStyle.fontWeight} ${fontSize}px ${textStyle.fontFamily}`;
    ctx.fillStyle = textStyle.color;
    ctx.textBaseline = 'top';

    const lines = content.split('\n');
    let y = paddingY;

    lines.forEach((line) => {
      if (textStyle.textAlign === 'center') {
        const textWidth = ctx.measureText(line).width;
        const x = (width - textWidth) / 2;
        ctx.fillText(line, x, y);
      } else if (textStyle.textAlign === 'right') {
        const textWidth = ctx.measureText(line).width;
        const x = width - paddingX - textWidth;
        ctx.fillText(line, x, y);
      } else {
        ctx.fillText(line, paddingX, y);
      }
      y += lineHeight;
    });

    const stickerPromises = placedStickers.map(async (sticker) => {
      const stickerData = stickers.find(s => s.id === sticker.stickerId);
      if (!stickerData) return;

      const stickerSize = 80 * sticker.scale * scale;
      const x = (sticker.x / CANVAS_BASE_WIDTH) * width;
      const y = (sticker.y / CANVAS_BASE_HEIGHT) * height;

      try {
        const img = await loadSvgImage(stickerData.svgContent, sticker.color);
        ctx.save();
        ctx.translate(x + stickerSize / 2, y + stickerSize / 2);
        ctx.rotate((sticker.rotation * Math.PI) / 180);
        ctx.drawImage(img, -stickerSize / 2, -stickerSize / 2, stickerSize, stickerSize);
        ctx.restore();
      } catch (e) {
        console.warn('[ExportPreview] 贴纸渲染失败:', e);
      }
    });

    await Promise.all(stickerPromises);

    const dataUrl = canvas.toDataURL('image/png', 1.0);
    return dataUrl;
  }, [currentJournal, canvasSize, quality]);

  const downloadImageH5 = (dataUrl: string, filename: string) => {
    try {
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      const blob = dataURLtoBlob(dataUrl);
      if (blob) {
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => URL.revokeObjectURL(url), 5000);
      } else {
        Taro.showToast({ title: '保存失败，请长按图片保存', icon: 'none', duration: 3000 });
      }
    }
  };

  const dataURLtoBlob = (dataUrl: string): Blob | null => {
    try {
      const arr = dataUrl.split(',');
      const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new Blob([u8arr], { type: mime });
    } catch {
      return null;
    }
  };

  const handlePreview = useCallback(async () => {
    if (!currentJournal.content.trim()) {
      Taro.showToast({ title: '请先输入内容', icon: 'none' });
      return;
    }

    setSaving(true);
    try {
      await saveDraft(currentJournal);
      const dataUrl = await renderToCanvas();
      setPreviewDataUrl(dataUrl);
      setPreviewVisible(true);
    } catch (error) {
      console.error('[ExportPreview] 预览生成失败:', error);
      Taro.showToast({ title: '生成失败，请重试', icon: 'none', duration: 2000 });
    } finally {
      setSaving(false);
    }
  }, [currentJournal, renderToCanvas]);

  const handleConfirmSave = useCallback(async () => {
    if (!previewDataUrl) return;

    try {
      const filename = `手账_${Date.now()}.png`;
      downloadImageH5(previewDataUrl, filename);
      await saveExportRecord(currentJournal, previewDataUrl, canvasSize, quality);

      Taro.showToast({ title: '已保存到本地', icon: 'success', duration: 2000 });
      setPreviewVisible(false);
    } catch (error) {
      console.error('[ExportPreview] 保存失败:', error);
      Taro.showToast({ title: '保存失败，请重试', icon: 'none', duration: 2000 });
    }
  }, [previewDataUrl, currentJournal, canvasSize, quality]);

  const handleClosePreview = () => {
    setPreviewVisible(false);
    setPreviewDataUrl('');
  };

  const handleCancel = () => {
    Taro.navigateBack();
  };

  const preset = getPreset();

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.title}>导出设置</Text>
        <Text className={styles.subtitle}>选择尺寸和清晰度，预览后保存</Text>
      </View>

      <View className={styles.previewWrapper}>
        <View
          className={classnames(
            styles.previewCard,
            canvasSize === 'square' && styles.previewSquare,
            canvasSize === 'wallpaper' && styles.previewWallpaper,
            canvasSize === 'card' && styles.previewCardRatio
          )}
          style={getCanvasStyle()}
        >
          <View className={styles.previewContent}>
            <Text className={styles.textLayer} style={getTextStyle()}>
              {currentJournal.content || '在此预览你的文字...'}
            </Text>
            <View className={styles.stickerLayer}>
              {currentJournal.stickers.map((sticker) => {
                const stickerData = stickers.find(s => s.id === sticker.stickerId);
                if (!stickerData) return null;

                const svgContent = stickerData.svgContent
                  .replace(/fill="currentColor"/g, `fill="${sticker.color}"`)
                  .replace(/stroke="currentColor"/g, `stroke="${sticker.color}"`);

                const stickerSize = 80 * sticker.scale;

                return (
                  <View
                    key={sticker.id}
                    className={styles.sticker}
                    style={{
                      left: `${(sticker.x / CANVAS_BASE_WIDTH) * 100}%`,
                      top: `${(sticker.y / CANVAS_BASE_HEIGHT) * 100}%`,
                      width: `${(stickerSize / CANVAS_BASE_WIDTH) * 100}%`,
                      height: `${(stickerSize / CANVAS_BASE_HEIGHT) * 100}%`,
                      transform: `rotate(${sticker.rotation}deg)`,
                    }}
                    dangerouslySetInnerHTML={{ __html: svgContent }}
                  />
                );
              })}
            </View>
          </View>
        </View>
      </View>

      <View className={styles.options}>
        <Text className={styles.sectionTitle}>导出尺寸</Text>
        <View className={styles.sizeOptions}>
          {canvasSizeOptions.map((opt) => {
            const p = EXPORT_SIZE_PRESETS[opt.key];
            return (
              <Button
                key={opt.key}
                className={classnames(styles.sizeBtn, canvasSize === opt.key && styles.active)}
                onClick={() => setCanvasSize(opt.key)}
              >
                <Text className={styles.sizeBtnIcon}>{opt.icon}</Text>
                <Text className={styles.sizeBtnLabel}>{p.label}</Text>
                <Text className={styles.sizeBtnDesc}>{p.desc}</Text>
              </Button>
            );
          })}
        </View>
      </View>

      <View className={styles.options}>
        <Text className={styles.sectionTitle}>图片清晰度</Text>
        <View className={styles.qualityOptions}>
          {qualityOptions.map((opt) => {
            const q = EXPORT_QUALITY_PRESETS[opt.key];
            const outputW = preset.width * q.scale;
            const outputH = preset.height * q.scale;
            return (
              <Button
                key={opt.key}
                className={classnames(styles.qualityBtn, quality === opt.key && styles.active)}
                onClick={() => setQuality(opt.key)}
              >
                <Text className={styles.qualityLabel}>{q.label}</Text>
                <Text className={styles.qualityDesc}>{outputW}×{outputH}</Text>
              </Button>
            );
          })}
        </View>
      </View>

      <View className={styles.bottomBar}>
        <Button className={styles.cancelBtn} onClick={handleCancel}>
          返回
        </Button>
        <Button
          className={styles.saveBtn}
          onClick={handlePreview}
          disabled={saving || !currentJournal.content.trim()}
        >
          预览并保存
        </Button>
      </View>

      {saving && (
        <View className={styles.saving}>
          <View className={styles.spinner} />
          <Text className={styles.savingText}>正在生成图片...</Text>
        </View>
      )}

      {previewVisible && (
        <View className={styles.previewModal} onClick={handleClosePreview}>
          <View className={styles.previewModalContent} onClick={(e) => e.stopPropagation()}>
            <Text className={styles.previewModalTitle}>导出预览</Text>
            <View className={styles.previewModalInfo}>
              <Text className={styles.previewModalInfoText}>
                {preset.label} · {EXPORT_QUALITY_PRESETS[quality].label} · {preset.width * getScale()}×{preset.height * getScale()}
              </Text>
            </View>
            <View className={styles.previewModalImageWrap}>
              <Image
                className={styles.previewModalImage}
                src={previewDataUrl}
                mode="aspectFit"
              />
            </View>
            <View className={styles.previewModalActions}>
              <Button className={styles.previewCancelBtn} onClick={handleClosePreview}>
                取消
              </Button>
              <Button className={styles.previewConfirmBtn} onClick={handleConfirmSave}>
                确认保存
              </Button>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default ExportPreviewPage;
