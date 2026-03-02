'use client';

interface SourceBadgeProps {
  source: string;
}

export function SourceBadge({ source }: SourceBadgeProps) {
  const getSourceStyle = (src: string): string => {
    const lowerSource = src.toLowerCase();

    if (lowerSource.includes('huberman')) {
      return 'glass-card bg-purple-500/15 text-purple-300 border-purple-500/40';
    }
    if (lowerSource.includes('attia')) {
      return 'glass-card bg-blue-500/15 text-blue-300 border-blue-500/40';
    }
    if (lowerSource.includes('patrick')) {
      return 'glass-card bg-pink-500/15 text-pink-300 border-pink-500/40';
    }
    if (lowerSource.includes('johnson')) {
      return 'glass-card bg-orange-500/15 text-orange-300 border-orange-500/40';
    }
    if (lowerSource.includes('clinical')) {
      return 'glass-card bg-blue-500/15 text-blue-300 border-blue-500/40';
    }
    if (lowerSource.includes('research consensus')) {
      return 'glass-card bg-slate-500/15 text-slate-300 border-slate-500/40';
    }
    if (lowerSource.includes('research')) {
      return 'glass-card bg-slate-500/15 text-slate-300 border-slate-500/40';
    }

    return 'glass-card bg-slate-500/15 text-slate-300 border-slate-500/40';
  };

  return (
    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-lg backdrop-blur-md ${getSourceStyle(source)}`}>
      {source}
    </span>
  );
}
