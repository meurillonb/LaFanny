import { ThemeProvider, CssBaseline } from '@mui/material'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useMemo, useEffect, type ReactNode } from 'react'
import { createLaFannyTheme } from '@/lib/muiTheme'
import { useUIStore } from '@/stores/uiStore'

interface Props { children: ReactNode; queryClient: QueryClient }

export function AppProviders({ children, queryClient }: Props) {
  const themeMode = useUIStore((s) => s.themeMode)
  const theme = useMemo(() => createLaFannyTheme(themeMode), [themeMode])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', themeMode === 'dark')
  }, [themeMode])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </ThemeProvider>
  )
}
