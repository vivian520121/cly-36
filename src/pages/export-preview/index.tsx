import React, { useState, useCallback } from 'react';
import { View, Text, Button, Image as TaroImage } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { useJournalStore } from '@/store/journalStore';
import { stickers } from '@/data/stickers';
import { saveDraft, saveExportRecord } from '@/utils/storage';
import {
  ExportShape,
  ExportClarity,
  EXPORT_SHAPE_CONFIG,
  EXPORT_CLARITY_CONFIG,
} from '@/types/journal';
import styles from './index.module.scss';

const shapeOptions: { value: ExportShape; icon: string }[] = [
  { value: 'square', icon: '⬜' },
  { value: 'wallpaper', icon: '📱' },
  { value: 'card', icon: '🃏' },
];

const clarityOptions: { value: ExportClarity }[] = [
  { value: '1x' },
  { value: '2x' },
  { value: '3x' },
];

const ExportPreviewPage: React.FC = () => {
  const { currentJournal } = useJournalStore();
  const [exportShape, setExportShape] = useState<ExportShape>('card');
  const [exportClarity, setExportClarity] = useState<ExportClarity>('2x');
  const [saving, setSaving] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState('');

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

  const getPreviewAspect = () => {
    const config = EXPORT_SHAPE_CONFIG[exportShape];
    return `${config.width} / ${config.height}`;
  };

  const renderToCanvas = useCallback(async (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (process.env.TARO_ENV === 'h5') {
        try {
          const shapeConfig = EXPORT_SHAPE_CONFIG[exportShape];
          const clarityConfig = EXPORT_CLARITY_CONFIG[exportClarity];
          const dpr = window.devicePixelRatio || 1;
          const scale = clarityConfig.scale;

          const baseWidth = shapeConfig.width;
          const baseHeight = shapeConfig.height;
          const pixelWidth = baseWidth * scale;
          const pixelHeight = baseHeight * scale;

          const canvas = document.createElement('canvas');
          canvas.width = Math.round(pixelWidth * dpr);
          canvas.height = Math.round(pixelHeight * dpr);
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            reject(new Error('无法获取 Canvas 上下文'));
            return;
          }

          ctx.scale(dpr, dpr);

          const { background, border, textStyle, content, stickers: placedStickers, drawPaths } = currentJournal;

          if (background.type === 'solid' && background.color) {
            ctx.fillStyle = background.color;
            ctx.fillRect(0, 0, pixelWidth, pixelHeight);
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
            if (ctx.roundRect) {
              ctx.roundRect(bw, bw, pixelWidth - bw * 2, pixelHeight - bw * 2, br);
            } else {
              ctx.rect(bw, bw, pixelWidth - bw * 2, pixelHeight - bw * 2);
            }
            ctx.stroke();
            ctx.setLineDash([]);
          }

          const paddingX = (baseWidth * 0.087) * scale;
          const paddingY = (baseHeight * 0.067) * scale;
          const maxWidth = pixelWidth - paddingX * 2;
          const fontSize = textStyle.fontSize * scale;
          const lineHeight = textStyle.lineHeight * fontSize;

          ctx.font = `${textStyle.fontWeight} ${fontSize}px ${textStyle.fontFamily}`;
          ctx.fillStyle = textStyle.color;
          ctx.textBaseline = 'top';

          const lines = content.split('\n');
          let y = paddingY;

          lines.forEach((line) => {
            if (!line) {
              y += lineHeight;
              return;
            }

            const words = line.split('');
            let currentLine = '';

            for (let i = 0; i < words.length; i++) {
              const testLine = currentLine + words[i];
              const metrics = ctx.measureText(testLine);

              if (metrics.width > maxWidth && currentLine) {
                drawTextLine(ctx, currentLine, y, pixelWidth, paddingX, textStyle.textAlign);
                currentLine = words[i];
                y += lineHeight;
              } else {
                currentLine = testLine;
              }
            }

            if (currentLine) {
              drawTextLine(ctx, currentLine, y, pixelWidth, paddingX, textStyle.textAlign);
              y += lineHeight;
            }
          });

          const stickerPromises = placedStickers.map((sticker) => {
            return new Promise<void>((stickerResolve) => {
              const stickerData = stickers.find(s => s.id === sticker.stickerId);
              if (!stickerData) {
                stickerResolve();
                return;
              }

              const stickerSize = 80 * sticker.scale * scale;
              const x = (sticker.x / 686) * pixelWidth;
              const y = (sticker.y / 900) * pixelHeight;

              const svgContent = stickerData.svgContent
                .replace(/fill="currentColor"/g, `fill="${sticker.color}"`)
                .replace(/stroke="currentColor"/g, `stroke="${sticker.color}"`);

              const img = new Image();
              img.onload = () => {
                ctx.save();
                ctx.translate(x + stickerSize / 2, y + stickerSize / 2);
                ctx.rotate((sticker.rotation * Math.PI) / 180);
                ctx.drawImage(img, -stickerSize / 2, -stickerSize / 2, stickerSize, stickerSize);
                ctx.restore();
                stickerResolve();
              };
              img.onerror = () => {
                stickerResolve();
              };
              img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgContent)));
            });
          });

          Promise.all(stickerPromises).then(() => {
            drawPaths.forEach((path) => {
              if (path.points.length < 2) return;

              ctx.beginPath();
              ctx.strokeStyle = path.color;
              ctx.lineWidth = path.width * scale;
              ctx.lineCap = 'round';
              ctx.lineJoin = 'round';
              ctx.globalAlpha = path.opacity;

              const firstPoint = path.points[0];
              const startX = (firstPoint.x / 686) * pixelWidth;
              const startY = (firstPoint.y / 900) * pixelHeight;
              ctx.moveTo(startX, startY);

              for (let i = 1; i < path.points.length; i++) {
                const point = path.points[i];
                const x = (point.x / 686) * pixelWidth;
                const y = (point.y / 900) * pixelHeight;
                ctx.lineTo(x, y);
              }
              ctx.stroke();
            });

            ctx.globalAlpha = 1;

            const dataUrl = canvas.toDataURL('image/png', 1.0);
            resolve(dataUrl);
          });
        } catch (err) {
          reject(err);
        }
      } else {
        reject(new Error('当前平台暂不支持导出'));
      }
    });
  }, [currentJournal, exportShape, exportClarity]);

  const drawTextLine = (
    ctx: CanvasRenderingContext2D,
    text: string,
    y: number,
    canvasWidth: number,
    paddingX: number,
    align: string
  ) => {
    if (align === 'center') {
      const textWidth = ctx.measureText(text).width;
      ctx.fillText(text, (canvasWidth - textWidth) / 2, y);
    } else if (align === 'right') {
      const textWidth = ctx.measureText(text).width;
      ctx.fillText(text, canvasWidth - paddingX - textWidth, y);
    } else {
      ctx.fillText(text, paddingX, y);
    }
  };

  const handlePreview = useCallback(async () => {
    if (!currentJournal.content.trim() && currentJournal.stickers.length === 0 && currentJournal.drawPaths.length === 0) {
      Taro.showToast({ title: '请先添加内容', icon: 'none' });
      return;
    }

    setSaving(true);
    try {
      const dataUrl = await renderToCanvas();
      setPreviewImageUrl(dataUrl);
      setPreviewVisible(true);
    } catch (error) {
      console.error('[ExportPreview] 预览生成失败:', error);
      Taro.showToast({ title: '预览生成失败', icon: 'none' });
    } finally {
      setSaving(false);
    }
  }, [currentJournal, renderToCanvas]);

  const handleConfirmSave = useCallback(async () => {
    setSaving(true);
    try {
      await saveDraft(currentJournal);

      if (process.env.TARO_ENV === 'h5') {
        try {
          const link = document.createElement('a');
          link.download = `手账_${Date.now()}.png`;
          link.href = previewImageUrl;

          if (typeof link.download !== 'undefined') {
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          } else {
            window.open(previewImageUrl, '_blank');
          }
        } catch (downloadErr) {
          console.warn('[ExportPreview] 下载失败，尝试备选方案:', downloadErr);
          try {
            const res = await fetch(previewImageUrl);
            const blob = await res.blob();
            const blobUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = `手账_${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
          } catch (blobErr) {
            console.warn('[ExportPreview] Blob下载也失败:', blobErr);
            window.open(previewImageUrl, '_blank');
          }
        }

        await saveExportRecord(currentJournal, previewImageUrl, exportClarity, exportShape);

        Taro.showToast({ title: '已保存到本地', icon: 'success', duration: 2000 });
      } else {
        Taro.showToast({ title: '当前仅支持H5端导出', icon: 'none', duration: 2000 });
      }
    } catch (error) {
      console.error('[ExportPreview] 导出失败:', error);
      Taro.showToast({ title: '导出失败，请重试', icon: 'none', duration: 2000 });
    } finally {
      setSaving(false);
      setPreviewVisible(false);
    }
  }, [currentJournal, exportClarity, exportShape, previewImageUrl]);

  const handleCancelPreview = () => {
    setPreviewVisible(false);
    setPreviewImageUrl('');
  };

  const handleCancel = () => {
    Taro.navigateBack();
  };

  const currentShapeConfig = EXPORT_SHAPE_CONFIG[exportShape];
  const currentClarityConfig = EXPORT_CLARITY_CONFIG[exportClarity];

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.title}>导出设置</Text>
        <Text className={styles.subtitle}>选择尺寸与清晰度后预览并保存</Text>
      </View>

      <View className={styles.previewWrapper}>
        <View
          className={styles.previewCard}
          style={{ ...getCanvasStyle(), aspectRatio: getPreviewAspect() }}
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
                      left: `${(sticker.x / 686) * 100}%`,
                      top: `${(sticker.y / 900) * 100}%`,
                      width: `${(stickerSize / 686) * 100}%`,
                      height: `${(stickerSize / 900) * 100}%`,
                      transform: `rotate(${sticker.rotation}deg)`,
                    }}
                    dangerouslySetInnerHTML={{ __html: svgContent }}
                  />
                );
              })}
            </View>
          </View>
        </View>
        <Text className={styles.dimensionHint}>
          {currentShapeConfig.desc} · {currentClarityConfig.label} · {currentShapeConfig.width * currentClarityConfig.scale}×{currentShapeConfig.height * currentClarityConfig.scale}px
        </Text>
      </View>

      <View className={styles.options}>
        <Text className={styles.sectionTitle}>导出尺寸</Text>
        <View className={styles.shapeOptions}>
          {shapeOptions.map((opt) => {
            const config = EXPORT_SHAPE_CONFIG[opt.value];
            return (
              <Button
                key={opt.value}
                className={classnames(styles.shapeBtn, exportShape === opt.value && styles.active)}
                onClick={() => setExportShape(opt.value)}
              >
                <Text className={styles.shapeIcon}>{opt.icon}</Text>
                <Text className={styles.shapeLabel}>{config.label}</Text>
                <Text className={styles.shapeDesc}>{config.desc}</Text>
              </Button>
            );
          })}
        </View>
      </View>

      <View className={styles.options}>
        <Text className={styles.sectionTitle}>导出清晰度</Text>
        <View className={styles.sizeOptions}>
          {clarityOptions.map((opt) => {
            const config = EXPORT_CLARITY_CONFIG[opt.value];
            return (
              <Button
                key={opt.value}
                className={classnames(styles.sizeBtn, exportClarity === opt.value && styles.active)}
                onClick={() => setExportClarity(opt.value)}
              >
                {config.label}
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
          className={styles.previewBtn}
          onClick={handlePreview}
          disabled={saving || !currentJournal.content.trim()}
        >
          预览并保存
        </Button>
      </View>

      {previewVisible && (
        <View className={styles.previewModal} onClick={handleCancelPreview}>
          <View className={styles.previewModalContent} onClick={(e) => e.stopPropagation}>
            <View className={styles.previewModalHeader}>
              <Text className={styles.previewModalTitle}>导出预览</Text>
              <Button className={styles.previewCloseBtn} onClick={handleCancelPreview}>
                ✕
              </Button>
            </View>
            <View className={styles.previewModalBody}>
              <TaroImage
                className={styles.previewModalImage}
                src={previewImageUrl}
                mode="aspectFit"
              />
            </View>
            <View className={styles.previewModalFooter}>
              <Text className={styles.previewModalInfo}>
                {currentShapeConfig.label} · {currentClarityConfig.label} · {currentShapeConfig.width * currentClarityConfig.scale}×{currentShapeConfig.height * currentClarityConfig.scale}px
              </Text>
              <View className={styles.previewModalActions}>
                <Button className={styles.previewModalCancel} onClick={handleCancelPreview}>
                  取消
                </Button>
                <Button className={styles.previewModalConfirm} onClick={handleConfirmSave}>
                  确认保存
                </Button>
              </View>
            </View>
          </View>
        </View>
      )}

      {saving && !previewVisible && (
        <View className={styles.saving}>
          <View className={styles.spinner} />
          <Text>正在生成图片...</Text>
        </View>
      )}
    </View>
  );
};

export default ExportPreviewPage;
