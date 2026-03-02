'use client';

import React from 'react';
import { Compound } from '@/types';
import { TierBadge } from './ui/TierBadge';
import { SourceBadge } from './ui/SourceBadge';
import { ScoreBar } from './ui/ScoreBar';

interface CompoundCardProps {
  compound: Compound;
  isSelected: boolean;
  onToggleSelect: (id: number) => void;
  onOpenDetail?: (compound: Compound) => void;
}

export function CompoundCard({ compound, isSelected, onToggleSelect, onOpenDetail }: CompoundCardProps) {
  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent detail panel from opening when clicking the checkbox
    if ((e.target as HTMLElement).closest('input[type="checkbox"]')) {
      return;
    }
    onOpenDetail?.(compound);
  };

  return (
    <div
      className={`glass-card p-4 rounded-lg transition-all cursor-pointer group ${
        isSelected
          ? 'bg-blue-500/20 border-blue-500/50'
          : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/8'
      }`}
      onClick={handleCardClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 group-hover:text-blue-300 transition-colors">
          <h3 className="font-semibold text-white text-lg mb-1">{compound.name}</h3>
          <p className="text-sm text-slate-400">{compound.category}</p>
        </div>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(compound.id)}
          className="w-5 h-5 mt-1 cursor-pointer accent-blue-500"
        />
      </div>

      {/* Tier and Source */}
      <div className="flex gap-2 mb-3 flex-wrap">
        <TierBadge tierNumber={compound.tierNumber} tier={compound.tier} />
        <SourceBadge source={compound.source} />
      </div>

      {/* Primary Function */}
      <p className="text-sm text-slate-300 mb-3">{compound.primaryFunction}</p>

      {/* Scores */}
      <div className="space-y-2 mb-4">
        <ScoreBar value={compound.longevityImpact / 10} label="Longevity Impact" />
        <ScoreBar value={compound.efficiencyScore / 10} label="Efficiency" />
      </div>

      {/* Price */}
      <div className="pt-3 border-t border-white/10">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs text-slate-500">Daily</p>
            <p className="text-sm font-semibold text-white">${compound.pricePerDay.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Monthly</p>
            <p className="text-sm font-semibold text-white">${compound.pricePerMonth.toFixed(0)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Taking</p>
            <p className={`text-sm font-semibold ${compound.takingToday ? 'text-blue-400' : 'text-slate-500'}`}>
              {compound.takingToday ? '✓' : '—'}
            </p>
          </div>
        </div>
      </div>

      {/* Amazon Link */}
      {compound.amazonLink && (
        <a
          href={compound.amazonLink}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-block mt-3 text-xs text-blue-400 hover:text-blue-300 hover:underline transition-colors"
        >
          View on Amazon →
        </a>
      )}
    </div>
  );
}
