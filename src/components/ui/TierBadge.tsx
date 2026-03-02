'use client';

interface TierBadgeProps {
  tierNumber: number;
  tier: string;
}

export function TierBadge({ tierNumber, tier }: TierBadgeProps) {
  const getTierStyle = (tierNum: number): string => {
    switch (tierNum) {
      case 1:
        return 'glass-card bg-blue-500/15 text-blue-300 border-blue-500/40';
      case 2:
        return 'glass-card bg-blue-500/15 text-blue-300 border-blue-500/40';
      case 3:
        return 'glass-card bg-amber-500/15 text-amber-300 border-amber-500/40';
      case 4:
        return 'glass-card bg-slate-500/15 text-slate-300 border-slate-500/40';
      default:
        return 'glass-card bg-slate-600/15 text-slate-300 border-slate-600/40';
    }
  };

  return (
    <span className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full backdrop-blur-md ${getTierStyle(tierNumber)}`}>
      {tier}
    </span>
  );
}
