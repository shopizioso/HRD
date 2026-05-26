import { useEffect } from 'react';

export function useKeyboardShortcuts(shortcuts) {
  useEffect(() => {
    const handleKeydown = (e) => {
      for (const [keys, callback] of Object.entries(shortcuts)) {
        const keyCombo = keys.toLowerCase();
        const pressed = [];

        if (e.ctrlKey || e.metaKey) pressed.push('ctrl');
        if (e.altKey) pressed.push('alt');
        if (e.shiftKey) pressed.push('shift');
        pressed.push(e.key.toLowerCase());

        const pressedStr = pressed.join('+');

        if (pressedStr === keyCombo) {
          e.preventDefault();
          callback(e);
        }
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [shortcuts]);
}

export const SHORTCUTS = {
  'ctrl+s': 'Simpan (Save)',
  'ctrl+e': 'Edit Slip',
  'ctrl+p': 'Print / PDF',
  'ctrl+k': 'Pencarian Cepat',
  'esc': 'Tutup Modal',
};
