import { useEffect, useRef } from 'react'

export function useRealtime(subscribeFn, handler) {
  const unsubRef = useRef(null)

  useEffect(() => {
    if (!subscribeFn) return
    unsubRef.current = subscribeFn(handler)
    return () => {
      if (unsubRef.current) unsubRef.current()
    }
  }, [subscribeFn, handler])
}
