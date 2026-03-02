'use client';

interface ScoreBarProps {
  value: number;
  label: string;
}

export function ScoreBar({ value, label }: ScoreBarProps) {
  // Clamp value between 0 and 10
  const clampedValue = Math.min(Math.max(value, 0), 10);
  const percentage = (clampedValue / 10) * 100;

  const getBarGradient = (val: number): string => {
    if (val > 7) return 'bg-gradient-to-r from-blue-500 to-blue-400';
    if (val >= 4) return 'bg-gradient-to-r from-amber-500 to-amber-400';
    return 'bg-gradient-to-r from-rose-500 to-rose-400';
  };

  const getGlowColor = (val: number): string => {
    if (val > 7) return 'shadow-blue-500/40';
    if (val >= 4) return 'shadow-amber-500/40';
    return 'shadow-rose-500/40';
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-300">{label}</span>
        <span className="text-xs font-semibold text-slate-200">{clampedValue.toFixed(1)}/10</span>
      </div>
      <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/10 backdrop-blur-sm">
        <div
          className={`h-full ${getBarGradient(clampedValue)} transition-all duration-300 shadow-lg ${getGlowColor(clampedValue)} rounded-full`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
