import { useEffect, useRef, useCallback } from 'react';
import { JournalData } from '@/types/journal';
import { saveDraft } from '@/utils/storage';

interface UseAutoSaveOptions {
  data: JournalData;
  enabled?: boolean;
  delay?: number;
  onSaved?: () => void;
}

export const useAutoSave = ({
  data,
  enabled = true,
  delay = 3000,
  onSaved,
}: UseAutoSaveOptions) => {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef<number>(0);
  const isSavingRef = useRef(false);

  const performSave = useCallback(async () => {
    if (isSavingRef.current || !data.content.trim()) {
      return;
    }

    const now = Date.now();
    if (now - lastSavedRef.current < 1000) {
      return;
    }

    isSavingRef.current = true;
    try {
      await saveDraft(data);
      lastSavedRef.current = now;
      onSaved?.();
      console.log('[AutoSave] 自动保存成功');
    } catch (error) {
      console.error('[AutoSave] 自动保存失败:', error);
    } finally {
      isSavingRef.current = false;
    }
  }, [data, onSaved]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      performSave();
    }, delay);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [data.content, data.updatedAt, enabled, delay, performSave]);

  const saveNow = useCallback(async () => {
    await performSave();
  }, [performSave]);

  return { saveNow };
};
