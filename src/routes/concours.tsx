import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/concours')({
  component: ConcoursLayout,
})

function ConcoursLayout() {
  return <Outlet />
}
