import { useEffect, useState } from 'react';

export default function SaveIndicator({ isSaving, lastSaved }) {
  const [showTick, setShowTick] = useState(false);

  useEffect(() => {
    if (isSaving) {
      setShowTick(false);
    } else if (lastSaved) {
      setShowTick(true);
      const timeout = setTimeout(() => setShowTick(false), 2000);
      return () => clearTimeout(timeout);
    }
  }, [isSaving, lastSaved]);

  return (
    <div className="save-indicator">
      {isSaving ? (
        <>
          <span className="indicator-dot indicator-dot-saving"></span>
          <span className="indicator-text">Menyimpan...</span>
        </>
      ) : showTick ? (
        <>
          <span className="indicator-dot indicator-dot-saved">✓</span>
          <span className="indicator-text">Tersimpan otomatis</span>
        </>
      ) : null}
    </div>
  );
}
