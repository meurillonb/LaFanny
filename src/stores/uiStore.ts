import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
}

interface UIState {
  isOnline: boolean
  isSyncing: boolean
  toasts: Toast[]
  themeMode: 'light' | 'dark'
  addToast: (t: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
  setOnline: (v: boolean) => void
  setSyncing: (v: boolean) => void
  toggleTheme: () => void
  setThemeMode: (mode: 'light' | 'dark') => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      isOnline: navigator.onLine,
      isSyncing: false,
      toasts: [],
      themeMode: 'light',
      addToast: (t) => set((s) => ({ toasts: [...s.toasts, { ...t, id: crypto.randomUUID() }] })),
      removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
      setOnline:  (v) => set({ isOnline: v }),
      setSyncing: (v) => set({ isSyncing: v }),
      toggleTheme: () => set((s) => ({ themeMode: s.themeMode === 'light' ? 'dark' : 'light' })),
      setThemeMode: (mode) => set({ themeMode: mode }),
    }),
    {
      name: 'lafanny-theme',
      partialize: (s) => ({ themeMode: s.themeMode }),
    },
  ),
)

// Alias for callers that used useUiStore (lowercase)
export const useUiStore = useUIStore
