import React, { useState, useRef, useCallback } from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { useJournalStore } from '@/store/journalStore';
import { stickers } from '@/data/stickers';
import { saveDraft } from '@/utils/storage';
import styles from './index.module.scss';

const ExportPreviewPage: React.FC = () => {
  const { currentJournal } = useJournalStore();
  const [exportSize, setExportSize] = useState<'1x' | '2x' | '3x'>('2x');
  const [saving, setSaving] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const sizeOptions = [
    { label: '标准', value: '1x' as const },
    { label: '高清', value: '2x' as const },
    { label: '超清', value: '3x' as const },
  ];

  const getCanvasStyle = () => {
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

  const renderToCanvas = useCallback(async (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (process.env.TARO_ENV === 'h5') {
        const scale = exportSize === '1x' ? 1 : exportSize === '2x' ? 2 : 3;
        const width = 686 * scale;
        const height = 900 * scale;

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('无法获取 Canvas 上下文'));
          return;
        }

        const { background, border, textStyle, content, stickers } = currentJournal;

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
        const maxWidth = width - paddingX * 2;
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

        stickers.forEach((sticker) => {
          const stickerData = stickers.find(s => s.id === sticker.stickerId);
          if (!stickerData) return;

          const stickerSize = 80 * sticker.scale * scale;
          const x = (sticker.x / 686) * width;
          const y = (sticker.y / 900) * height;

          ctx.save();
          ctx.translate(x + stickerSize / 2, y + stickerSize / 2);
          ctx.rotate((sticker.rotation * Math.PI) / 180);
          ctx.translate(-stickerSize / 2, -stickerSize / 2);

          const svgContent = stickerData.svgContent
            .replace(/fill="currentColor"/g, `fill="${sticker.color}"`)
            .replace(/stroke="currentColor"/g, `stroke="${sticker.color}"`);

          const img = new Image();
          img.onload = () => {
            ctx.drawImage(img, 0, 0, stickerSize, stickerSize);
          };
          img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgContent)));

          ctx.restore();
        });

        setTimeout(() => {
          const dataUrl = canvas.toDataURL('image/png');
          resolve(dataUrl);
        }, 500);
      } else {
        reject(new Error('当前平台暂不支持导出'));
      }
    });
  }, [currentJournal, exportSize]);

  const handleSave = useCallback(async () => {
    if (!currentJournal.content.trim()) {
      Taro.showToast({
        title: '请先输入内容',
        icon: 'none',
      });
      return;
    }

    setSaving(true);
    try {
      await saveDraft(currentJournal);

      if (process.env.TARO_ENV === 'h5') {
        const dataUrl = await renderToCanvas();
        
        const link = document.createElement('a');
        link.download = `手账_${Date.now()}.png`;
        link.href = dataUrl;
        link.click();

        Taro.showToast({
          title: '已保存到本地',
          icon: 'success',
          duration: 2000,
        });
      } else {
        Taro.showToast({
          title: 'H5端支持图片导出',
          icon: 'none',
          duration: 2000,
        });
      }
    } catch (error) {
      console.error('[ExportPreview] 导出失败:', error);
      Taro.showToast({
        title: '导出失败，请重试',
        icon: 'none',
        duration: 2000,
      });
    } finally {
      setSaving(false);
    }
  }, [currentJournal, renderToCanvas]);

  const handleCancel = () => {
    Taro.navigateBack();
  };

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.title}>预览效果</Text>
        <Text className={styles.subtitle}>确认效果后保存图片</Text>
      </View>

      <View className={styles.previewWrapper}>
        <View className={styles.previewCard} style={getCanvasStyle()}>
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
      </View>

      <View className={styles.options}>
        <Text className={styles.sectionTitle}>导出清晰度</Text>
        <View className={styles.sizeOptions}>
          {sizeOptions.map((opt) => (
            <Button
              key={opt.value}
              className={classnames(styles.sizeBtn, exportSize === opt.value && styles.active)}
              onClick={() => setExportSize(opt.value)}
            >
              {opt.label}
            </Button>
          ))}
        </View>
      </View>

      <View className={styles.bottomBar}>
        <Button className={styles.cancelBtn} onClick={handleCancel}>
          返回
        </Button>
        <Button
          className={styles.saveBtn}
          onClick={handleSave}
          disabled={saving || !currentJournal.content.trim()}
        >
          保存图片
        </Button>
      </View>

      {saving && (
        <View className={styles.saving}>
          <View className={styles.spinner} />
          <Text>正在生成图片...</Text>
        </View>
      )}
    </View>
  );
};

export default ExportPreviewPage;
