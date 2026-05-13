import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'
import { Box } from '@mui/material'
import { TopBar } from '@/components/layout/TopBar'
import { BottomNav } from '@/components/layout/BottomNav'

interface RouterContext { queryClient: QueryClient }

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
})

function RootLayout() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100dvh', overflow: 'hidden' }}>
      <TopBar />
      <Box
        component="main"
        sx={{
          flex: 1,
          overflowY: 'auto',
          px: 2,
          pt: 2,
          pb: 2,
          maxWidth: 'sm',
          mx: 'auto',
          width: '100%',
        }}
      >
        <Outlet />
      </Box>
      <BottomNav />
    </Box>
  )
}
