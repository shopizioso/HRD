import { useEffect, useRef } from 'react';
import { upsertRow } from '../lib/supabase';

const STORAGE_KEY = 'payrollSlip_autosave';
const SAVE_DELAY = 500; // milliseconds

export function useAutoSaveSlip(slipData, onSave) {
  const saveTimeoutRef = useRef(null);
  const lastSavedRef = useRef(null);

  const useSupabase = Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);

  useEffect(() => {
    if (!slipData) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    const currentJson = JSON.stringify(slipData);
    if (lastSavedRef.current === currentJson) {
      return;
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        if (useSupabase) {
          // upsert to payrolls table; rely on `id` when present
          await upsertRow('payrolls', { ...slipData });
        } else {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(slipData));
        }

        lastSavedRef.current = currentJson;
        if (onSave) onSave();
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
    save: async () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      try {
        if (useSupabase) {
          await upsertRow('payrolls', { ...slipData });
        } else {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(slipData));
        }
        lastSavedRef.current = JSON.stringify(slipData);
      } catch (error) {
        console.error('Failed to save:', error);
      }
    },
    load: () => {
      try {
        if (useSupabase) {
          // Loading from Supabase should be done via service (not here)
          return null;
        }
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : null;
      } catch (error) {
        console.error('Failed to load:', error);
        return null;
      }
    },
    clear: async () => {
      try {
        if (useSupabase) {
          // clearing server-side autosave is a no-op here; use service to delete if needed
          lastSavedRef.current = null;
        } else {
          localStorage.removeItem(STORAGE_KEY);
          lastSavedRef.current = null;
        }
      } catch (error) {
        console.error('Failed to clear:', error);
      }
    },
  };
}
