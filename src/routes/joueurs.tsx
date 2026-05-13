import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/joueurs')({
  component: JoueursLayout,
})

function JoueursLayout() {
  return <Outlet />
}
