import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/src/routes/src/routes/predvidanja')({
  component: () => <div className="p-4 pt-20 text-center text-xl">AI Predviđanja utakmica</div>,
})
