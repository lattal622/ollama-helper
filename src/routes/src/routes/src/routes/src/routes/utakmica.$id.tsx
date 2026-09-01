import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/utakmica/$id')({
  component: () => <div className="p-4 pt-20 text-center">Detalji utakmice</div>,
})
