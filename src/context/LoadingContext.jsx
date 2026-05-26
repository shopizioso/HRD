import { createContext, useContext, useState } from 'react'

const LoadingContext = createContext()

export function LoadingProvider({ children }) {
  const [loadingCount, setLoadingCount] = useState(0)

  const start = () => setLoadingCount((c) => c + 1)
  const stop = () => setLoadingCount((c) => Math.max(0, c - 1))

  return (
    <LoadingContext.Provider value={{ loading: loadingCount > 0, start, stop }}>
      {children}
    </LoadingContext.Provider>
  )
}

export function useLoading() {
  const ctx = useContext(LoadingContext)
  if (!ctx) throw new Error('useLoading must be used within LoadingProvider')
  return ctx
}
