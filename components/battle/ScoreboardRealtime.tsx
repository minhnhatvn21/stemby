export default function ScoreboardRealtime({ scores }: { scores: Record<string, number> }) {
  return (
    <div className="panel p-4">
      <h3 className="font-heading mb-3">Realtime Leaderboard</h3>
      <ul className="space-y-1 text-sm">
        {Object.entries(scores)
          .sort((a, b) => b[1] - a[1])
          .map(([key, value]) => (
            <li key={key} className="flex justify-between border-b border-white/10 pb-1"><span>{key}</span><strong>{value}</strong></li>
          ))}
      </ul>
    </div>
  );
}
