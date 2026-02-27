export default function MapGrid({ size = 4, owners }: { size?: number; owners: Record<string, string> }) {
  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}>
      {Array.from({ length: size * size }).map((_, idx) => (
        <div key={idx} className="h-14 rounded border border-orange-400/40 flex items-center justify-center text-xs" style={{ backgroundColor: owners[idx] || "#2a2a2a" }}>
          {idx + 1}
        </div>
      ))}
    </div>
  );
}
