import React, { useRef, useState, useCallback, useEffect } from 'react';
import { View, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { DrawPath, DrawPoint, COLORS } from '@/types/journal';
import styles from './index.module.scss';

interface FreeDrawProps {
  active: boolean;
  paths: DrawPath[];
  color: string;
  width: number;
  canvasWidth: number;
  canvasHeight: number;
  onAddPath: (path: Omit<DrawPath, 'id'>) => void;
  onRemovePath: (id: string) => void;
  onClearPaths: () => void;
  onColorChange: (color: string) => void;
  onWidthChange: (width: number) => void;
}

const DRAW_COLORS = COLORS.slice(0, 8);
const DRAW_WIDTHS = [2, 4, 6, 10];

const FreeDraw: React.FC<FreeDrawProps> = ({
  active,
  paths,
  color,
  width,
  canvasWidth,
  canvasHeight,
  onAddPath,
  onRemovePath,
  onClearPaths,
  onColorChange,
  onWidthChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const currentPathRef = useRef<DrawPoint[]>([]);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const [showTip, setShowTip] = useState(true);

  useEffect(() => {
    if (active) {
      setShowTip(true);
      const timer = setTimeout(() => setShowTip(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [active]);

  useEffect(() => {
    if (!canvasRef.current || !active) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const dpr = Taro.getSystemInfoSync().pixelRatio || 2;
    canvas.width = canvasWidth * dpr;
    canvas.height = canvasHeight * dpr;
    ctx.scale(dpr, dpr);
    
    ctxRef.current = ctx;
    redrawAllPaths();
  }, [active, canvasWidth, canvasHeight, paths]);

  const getCanvasPoint = useCallback((e: any): DrawPoint => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    let clientX: number, clientY: number;
    
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if (e.clientX !== undefined) {
      clientX = e.clientX;
      clientY = e.clientY;
    } else {
      return { x: 0, y: 0 };
    }
    
    const x = ((clientX - rect.left) / rect.width) * 686;
    const y = ((clientY - rect.top) / rect.height) * 900;
    
    return { x: Math.max(0, Math.min(686, x)), y: Math.max(0, Math.min(900, y)) };
  }, []);

  const redrawAllPaths = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    paths.forEach(path => {
      if (path.points.length < 2) return;
      
      ctx.beginPath();
      ctx.strokeStyle = path.color;
      ctx.lineWidth = path.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.globalAlpha = path.opacity;
      
      ctx.moveTo(path.points[0].x, path.points[0].y);
      for (let i = 1; i < path.points.length; i++) {
        ctx.lineTo(path.points[i].x, path.points[i].y);
      }
      ctx.stroke();
    });
    
    ctx.globalAlpha = 1;
  }, [paths, canvasWidth, canvasHeight]);

  const startDrawing = useCallback((e: any) => {
    if (!active) return;
    e.preventDefault();
    e.stopPropagation();
    
    setIsDrawing(true);
    const point = getCanvasPoint(e);
    currentPathRef.current = [point];
    
    const ctx = ctxRef.current;
    if (ctx) {
      ctx.beginPath();
      ctx.strokeStyle = tool === 'eraser' ? 'rgba(255,255,255,0.01)' : color;
      ctx.lineWidth = tool === 'eraser' ? width * 3 : width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.globalAlpha = tool === 'eraser' ? 0 : 1;
      ctx.moveTo(point.x, point.y);
    }
  }, [active, getCanvasPoint, color, width, tool]);

  const draw = useCallback((e: any) => {
    if (!isDrawing || !active) return;
    e.preventDefault();
    e.stopPropagation();
    
    const point = getCanvasPoint(e);
    currentPathRef.current = [...currentPathRef.current, point];
    
    const ctx = ctxRef.current;
    if (ctx) {
      ctx.lineTo(point.x, point.y);
      ctx.stroke();
    }
  }, [isDrawing, active, getCanvasPoint]);

  const endDrawing = useCallback(() => {
    if (!isDrawing) return;
    setIsDrawing(false);
    
    if (currentPathRef.current.length >= 2) {
      if (tool === 'eraser') {
        const erasePath = currentPathRef.current;
        paths.forEach((path) => {
          const shouldRemove = path.points.some(p1 => 
            erasePath.some(p2 => {
              const dist = Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
              return dist < width * 2;
            })
          );
          if (shouldRemove) {
            onRemovePath(path.id);
          }
        });
      } else {
        onAddPath({
          points: currentPathRef.current,
          color,
          width,
          opacity: 1,
        });
      }
    }
    
    currentPathRef.current = [];
    redrawAllPaths();
  }, [isDrawing, tool, paths, width, color, onAddPath, onRemovePath, redrawAllPaths]);

  const handleUndo = () => {
    if (paths.length > 0) {
      const lastPath = paths[paths.length - 1];
      onRemovePath(lastPath.id);
      Taro.showToast({ title: '已撤销', icon: 'success' });
    }
  };

  const handleClear = () => {
    if (paths.length === 0) {
      Taro.showToast({ title: '没有可清除的内容', icon: 'none' });
      return;
    }
    Taro.showModal({
      title: '清除绘制',
      content: '确定要清除所有绘制内容吗？',
      confirmColor: '#B86464',
      success: (res) => {
        if (res.confirm) {
          onClearPaths();
          Taro.showToast({ title: '已清除', icon: 'success' });
        }
      },
    });
  };

  const pointsToSvgPath = (points: DrawPoint[]): string => {
    if (points.length < 2) return '';
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      d += ` L ${points[i].x} ${points[i].y}`;
    }
    return d;
  };

  if (!active) return null;

  return (
    <View className={classnames(styles.container, styles.active)}>
      {showTip && (
        <View className={styles.tip}>
          ✏️  在画布上自由绘制，点击底部工具栏调整画笔
        </View>
      )}

      <canvas
        ref={canvasRef as any}
        className={styles.canvas}
        style={{ width: canvasWidth, height: canvasHeight }}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={endDrawing}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={endDrawing}
        onMouseLeave={endDrawing}
      />

      <View className={styles.pathsLayer} style={{ width: 686, height: 900 }}>
        <svg width="100%" height="100%" viewBox="0 0 686 900">
          {paths.map((path) => (
            <path
              key={path.id}
              className={styles.svgPath}
              d={pointsToSvgPath(path.points)}
              stroke={path.color}
              strokeWidth={path.width}
              opacity={path.opacity}
            />
          ))}
        </svg>
      </View>

      <View className={styles.toolbar}>
        <Button
          className={classnames(styles.toolBtn, tool === 'pen' && styles.active)}
          onClick={() => setTool('pen')}
        >
          ✏️
        </Button>
        <Button
          className={classnames(styles.toolBtn, tool === 'eraser' && styles.active)}
          onClick={() => setTool('eraser')}
        >
          🧹
        </Button>

        <View className={styles.divider} />

        <View className={styles.colorPicker}>
          {DRAW_COLORS.map((c) => (
            <View
              key={c}
              className={classnames(styles.colorItem, color === c && styles.active)}
              style={{ backgroundColor: c }}
              onClick={() => {
                onColorChange(c);
                setTool('pen');
              }}
            />
          ))}
        </View>

        <View className={styles.divider} />

        <View className={styles.widthPicker}>
          {DRAW_WIDTHS.map((w) => (
            <Button
              key={w}
              className={classnames(styles.widthItem, width === w && styles.active)}
              onClick={() => onWidthChange(w)}
            >
              <View
                className={styles.widthDot}
                style={{ width: w * 2, height: w * 2 }}
              />
            </Button>
          ))}
        </View>

        <View className={styles.divider} />

        <Button
          className={styles.toolBtn}
          onClick={handleUndo}
          disabled={paths.length === 0}
        >
          ↩️
        </Button>
        <Button
          className={classnames(styles.toolBtn, styles.danger)}
          onClick={handleClear}
          disabled={paths.length === 0}
        >
          🗑️
        </Button>
      </View>
    </View>
  );
};

export default FreeDraw;
