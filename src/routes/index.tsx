import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: () => (
    <div className="p-4 pt-20">
      <h1 className="text-2xl font-bold text-sky-600">Nogometne Lige</h1>
      <p className="text-gray-500">Odaberi ligu za detalje.</p>
      {/* Ovdje će ići lista liga */}
    </div>
  ),
})
