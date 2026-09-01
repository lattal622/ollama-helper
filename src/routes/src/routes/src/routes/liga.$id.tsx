import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/liga/$id')({
  component: () => <div className="p-4 pt-20 text-center">Detalji lige</div>,
})
