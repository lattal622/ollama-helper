export const MatchCard = ({ home, away, time }: any) => (
  <div className="bg-white p-4 rounded-xl shadow-md border-l-4 border-sky-500 flex justify-between items-center my-3 mx-2">
    <div className="font-bold text-gray-700">{home}</div>
    <div className="text-xs bg-sky-100 text-sky-700 px-2 py-1 rounded-md font-mono">{time}</div>
    <div className="font-bold text-gray-700">{away}</div>
  </div>
)
