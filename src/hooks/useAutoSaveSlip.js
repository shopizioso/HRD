import { useEffect, useRef } from 'react';

const STORAGE_KEY = 'payrollSlip_autosave';
const SAVE_DELAY = 500; // milliseconds

export function useAutoSaveSlip(slipData, onSave) {
  const saveTimeoutRef = useRef(null);
  const lastSavedRef = useRef(null);

  useEffect(() => {
    if (!slipData) return;

    // Clear previous timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Check if data actually changed
    const currentJson = JSON.stringify(slipData);
    if (lastSavedRef.current === currentJson) {
      return;
    }

    // Set new timeout for debounced save
    saveTimeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(slipData));
        lastSavedRef.current = currentJson;
        if (onSave) {
          onSave();
        }
      } catch (error) {
        console.error('Failed to auto-save:', error);
      }
    }, SAVE_DELAY);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [slipData, onSave]);

  return {
    save: () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(slipData));
        lastSavedRef.current = JSON.stringify(slipData);
      } catch (error) {
        console.error('Failed to save:', error);
      }
    },
    load: () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : null;
      } catch (error) {
        console.error('Failed to load:', error);
        return null;
      }
    },
    clear: () => {
      try {
        localStorage.removeItem(STORAGE_KEY);
        lastSavedRef.current = null;
      } catch (error) {
        console.error('Failed to clear:', error);
      }
    },
  };
}
