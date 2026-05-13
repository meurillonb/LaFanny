import { IconButton } from '@mui/material'
import { LightModeOutlined, DarkModeOutlined } from '@mui/icons-material'
import { useUIStore } from '@/stores/uiStore'

export function ThemeToggle() {
  const { themeMode, toggleTheme } = useUIStore()
  return (
    <IconButton
      onClick={toggleTheme}
      aria-label={themeMode === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
      color="inherit"
    >
      {themeMode === 'dark' ? <LightModeOutlined /> : <DarkModeOutlined />}
    </IconButton>
  )
}
