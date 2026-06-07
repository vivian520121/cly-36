import React from 'react';
import { View, Text, Button, Slider } from '@tarojs/components';
import classnames from 'classnames';
import { TextStyle, BackgroundStyle, BorderStyle, FONT_FAMILIES, COLORS, BG_COLORS, BORDER_TYPES } from '@/types/journal';
import styles from './index.module.scss';

interface StylePanelProps {
  visible: boolean;
  textStyle: TextStyle;
  background: BackgroundStyle;
  border: BorderStyle;
  onClose: () => void;
  onTextStyleChange: (style: Partial<TextStyle>) => void;
  onBackgroundChange: (bg: Partial<BackgroundStyle>) => void;
  onBorderChange: (border: Partial<BorderStyle>) => void;
}

const StylePanel: React.FC<StylePanelProps> = ({
  visible,
  textStyle,
  background,
  border,
  onClose,
  onTextStyleChange,
  onBackgroundChange,
  onBorderChange,
}) => {
  if (!visible) return null;

  const fontWeights = [
    { label: '细', value: 300 },
    { label: '常规', value: 400 },
    { label: '中等', value: 500 },
    { label: '粗', value: 700 },
  ];

  const textAligns = [
    { label: '左', value: 'left' as const },
    { label: '中', value: 'center' as const },
    { label: '右', value: 'right' as const },
  ];

  return (
    <View className={styles.panel}>
      <View className={styles.header}>
        <Text className={styles.title}>样式美化</Text>
        <Button className={styles.closeBtn} onClick={onClose}>×</Button>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>字体</Text>
        <View className={styles.row}>
          {FONT_FAMILIES.map((font) => (
            <Text
              key={font.value}
              className={classnames(styles.fontItem, textStyle.fontFamily === font.value && styles.active)}
              style={{ fontFamily: font.value }}
              onClick={() => onTextStyleChange({ fontFamily: font.value })}
            >
              {font.label}
            </Text>
          ))}
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>字重</Text>
        <View className={styles.fontWeightRow}>
          {fontWeights.map((w) => (
            <Button
              key={w.value}
              className={classnames(styles.weightBtn, textStyle.fontWeight === w.value && styles.active)}
              onClick={() => onTextStyleChange({ fontWeight: w.value })}
            >
              {w.label}
            </Button>
          ))}
        </View>
      </View>

      <View className={styles.sliderSection}>
        <View className={styles.sliderLabel}>
          <Text>字号</Text>
          <Text>{textStyle.fontSize}px</Text>
        </View>
        <Slider
          className={styles.slider}
          min={18}
          max={48}
          value={textStyle.fontSize}
          activeColor="#8B7355"
          backgroundColor="#E8E2DB"
          blockSize={20}
          onChange={(e) => onTextStyleChange({ fontSize: e.detail.value })}
        />
      </View>

      <View className={styles.sliderSection}>
        <View className={styles.sliderLabel}>
          <Text>行高</Text>
          <Text>{textStyle.lineHeight.toFixed(1)}</Text>
        </View>
        <Slider
          className={styles.slider}
          min={1.2}
          max={3}
          step={0.1}
          value={textStyle.lineHeight}
          activeColor="#8B7355"
          backgroundColor="#E8E2DB"
          blockSize={20}
          onChange={(e) => onTextStyleChange({ lineHeight: e.detail.value })}
        />
      </View>

      <View className={styles.sliderSection}>
        <View className={styles.sliderLabel}>
          <Text>字间距</Text>
          <Text>{textStyle.letterSpacing}px</Text>
        </View>
        <Slider
          className={styles.slider}
          min={0}
          max={10}
          value={textStyle.letterSpacing}
          activeColor="#8B7355"
          backgroundColor="#E8E2DB"
          blockSize={20}
          onChange={(e) => onTextStyleChange({ letterSpacing: e.detail.value })}
        />
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>对齐方式</Text>
        <View className={styles.alignRow}>
          {textAligns.map((a) => (
            <Button
              key={a.value}
              className={classnames(styles.alignBtn, textStyle.textAlign === a.value && styles.active)}
              onClick={() => onTextStyleChange({ textAlign: a.value })}
            >
              {a.label}
            </Button>
          ))}
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>文字颜色</Text>
        <View className={styles.row}>
          {COLORS.map((color) => (
            <View
              key={color}
              className={classnames(styles.colorItem, textStyle.color === color && styles.active)}
              style={{ backgroundColor: color }}
              onClick={() => onTextStyleChange({ color })}
            />
          ))}
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>背景颜色</Text>
        <View className={styles.row}>
          {BG_COLORS.map((color) => (
            <View
              key={color}
              className={classnames(styles.colorItem, background.color === color && styles.active)}
              style={{ backgroundColor: color, border: '1px solid #E8E2DB' }}
              onClick={() => onBackgroundChange({ type: 'solid', color })}
            />
          ))}
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>边框样式</Text>
        <View className={styles.borderTypeRow}>
          {BORDER_TYPES.map((type) => (
            <Button
              key={type.value}
              className={classnames(styles.borderBtn, border.type === type.value && styles.active)}
              onClick={() => onBorderChange({ type: type.value as BorderStyle['type'] })}
            >
              {type.label}
            </Button>
          ))}
        </View>
      </View>

      {border.type !== 'none' && (
        <>
          <View className={styles.sliderSection}>
            <View className={styles.sliderLabel}>
              <Text>边框粗细</Text>
              <Text>{border.width}px</Text>
            </View>
            <Slider
              className={styles.slider}
              min={1}
              max={8}
              value={border.width}
              activeColor="#8B7355"
              backgroundColor="#E8E2DB"
              blockSize={20}
              onChange={(e) => onBorderChange({ width: e.detail.value })}
            />
          </View>

          <View className={styles.sliderSection}>
            <View className={styles.sliderLabel}>
              <Text>圆角</Text>
              <Text>{border.radius}px</Text>
            </View>
            <Slider
              className={styles.slider}
              min={0}
              max={32}
              value={border.radius}
              activeColor="#8B7355"
              backgroundColor="#E8E2DB"
              blockSize={20}
              onChange={(e) => onBorderChange({ radius: e.detail.value })}
            />
          </View>

          <View className={styles.section}>
            <Text className={styles.sectionTitle}>边框颜色</Text>
            <View className={styles.row}>
              {COLORS.map((color) => (
                <View
                  key={color}
                  className={classnames(styles.colorItem, border.color === color && styles.active)}
                  style={{ backgroundColor: color }}
                  onClick={() => onBorderChange({ color })}
                />
              ))}
            </View>
          </View>
        </>
      )}
    </View>
  );
};

export default StylePanel;
