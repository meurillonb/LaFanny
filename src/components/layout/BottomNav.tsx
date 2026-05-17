import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material'
import { Home, Group, Leaderboard, Settings } from '@mui/icons-material'
import { useNavigate, useRouterState } from '@tanstack/react-router'

const NAV = [
  { to: '/',           label: 'Accueil',    icon: <Home /> },
  { to: '/joueurs',    label: 'Joueurs',    icon: <Group /> },
  { to: '/concours',   label: 'Classement', icon: <Leaderboard /> },
] as const

export function BottomNav() {
  const { location } = useRouterState()
  const navigate = useNavigate()

  const currentValue = NAV.findIndex((n) =>
    n.to === '/' ? location.pathname === '/' : location.pathname.startsWith(n.to),
  )

  return (
    <Paper sx={{ flexShrink: 0, zIndex: 50 }} elevation={3}>
      <BottomNavigation
        value={currentValue === -1 ? 0 : currentValue}
        onChange={(_, newValue: number) => void navigate({ to: NAV[newValue]!.to })}
      >
        {NAV.map((item) => (
          <BottomNavigationAction key={item.to} label={item.label} icon={item.icon} />
        ))}
      </BottomNavigation>
    </Paper>
  )
}
