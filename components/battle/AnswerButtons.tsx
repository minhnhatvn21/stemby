export default function AnswerButtons({ options, onPick, disabled }: { options: string[]; onPick: (index: number) => void; disabled?: boolean }) {
  return (
    <div className="grid gap-2 mt-4">
      {options.map((opt, idx) => (
        <button key={opt} disabled={disabled} onClick={() => onPick(idx)} className="panel p-3 text-left hover:border-flame disabled:opacity-60">
          {String.fromCharCode(65 + idx)}. {opt}
        </button>
      ))}
    </div>
  );
}
