import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/src/routes/pretraga')({
  component: () => <div className="p-4 pt-20 text-center text-xl">Pretraži klubove ili utakmice</div>,
})
