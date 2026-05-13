import { createTheme } from '@mui/material/styles'

export function createLaFannyTheme(mode: 'light' | 'dark') {
  return createTheme({
    palette: {
      mode,
      ...(mode === 'light'
        ? {
            background: { default: '#F8F9FA', paper: '#FFFFFF' },
            primary:   { main: '#E67E22', contrastText: '#FFFFFF' },
            secondary: { main: '#2C3E50', contrastText: '#FFFFFF' },
            success:   { main: '#27AE60' },
            warning:   { main: '#F39C12' },
            error:     { main: '#E74C3C' },
            text:      { primary: '#2C3E50', secondary: '#95A5A6' },
          }
        : {
            background: { default: '#121212', paper: '#1E1E1E' },
            primary:   { main: '#FF9F43', contrastText: '#121212' },
            secondary: { main: '#34495E' },
            text:      { primary: '#E0E0E0', secondary: '#7F8C8D' },
          }),
    },
    typography: {
      fontFamily: "'Inter', system-ui, sans-serif",
      h1: { fontFamily: "'Oswald', system-ui, sans-serif" },
      h2: { fontFamily: "'Oswald', system-ui, sans-serif" },
      h3: { fontFamily: "'Oswald', system-ui, sans-serif" },
    },
    shape: { borderRadius: 12 },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 999,
            textTransform: 'none',
            fontWeight: 600,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: ({ theme }) => ({
            borderRadius: 16,
            ...(theme.palette.mode === 'dark' && {
              boxShadow: 'none',
              border: `1px solid ${theme.palette.divider}`,
            }),
          }),
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { borderRadius: 8 },
        },
      },
    },
  })
}
