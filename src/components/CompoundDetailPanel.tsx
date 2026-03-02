'use client';

import React from 'react';
import { Compound } from '@/types';
import { TierBadge } from './ui/TierBadge';
import { SourceBadge } from './ui/SourceBadge';
import { ScoreBar } from './ui/ScoreBar';
import { LongevityGauge } from './LongevityGauge';
import { Button } from './ui/Button';
import { X, ExternalLink } from 'lucide-react';

interface CompoundDetailPanelProps {
  compound: Compound | null;
  isOpen: boolean;
  onClose: () => void;
  isSelected: boolean;
  onToggleSelect: (id: number) => void;
}

export function CompoundDetailPanel({
  compound,
  isOpen,
  onClose,
  isSelected,
  onToggleSelect,
}: CompoundDetailPanelProps) {
  if (!compound) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-fade-in-up"
          onClick={handleBackdropClick}
        />
      )}

      {/* Side Panel */}
      <div
        className={`fixed right-0 top-0 h-screen w-full sm:w-[500px] glass-elevated border-l border-white/10 z-50 overflow-y-auto shadow-2xl transition-transform duration-300 ${
          isOpen ? 'translate-x-0 animate-slide-in-right' : 'translate-x-full'
        }`}
      >
        <div className="relative">
          {/* Header */}
          <div className="sticky top-0 glass-card bg-white/8 border-b border-white/10 p-6 flex items-start justify-between mb-6 z-10">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-2">{compound.name}</h2>
              <p className="text-slate-400">{compound.category}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 pb-32 space-y-6">
            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              <TierBadge tierNumber={compound.tierNumber} tier={compound.tier} />
              <SourceBadge source={compound.source} />
            </div>

            {/* Primary Function */}
            <div>
              <h3 className="text-sm font-semibold text-slate-400 mb-2">Primary Function</h3>
              <p className="text-white leading-relaxed">{compound.primaryFunction}</p>
            </div>

            {/* Mechanism */}
            <div className="glass-subtle p-4 rounded-lg border border-white/10">
              <h3 className="text-sm font-semibold text-slate-300 mb-2">Mechanism of Action</h3>
              <p className="text-sm text-slate-300 leading-relaxed">{compound.mechanism}</p>
            </div>

            {/* Target Biomarkers */}
            <div className="glass-subtle p-4 rounded-lg border border-white/10">
              <h3 className="text-sm font-semibold text-slate-300 mb-2">Target Biomarkers</h3>
              <p className="text-sm text-slate-300 leading-relaxed">{compound.targetBiomarkers}</p>
            </div>

            {/* Longevity Gauge */}
            <div className="flex justify-center pt-4">
              <LongevityGauge score={compound.longevityImpact * 10} size="md" />
            </div>

            {/* Scores */}
            <div className="space-y-3">
              <ScoreBar value={compound.longevityImpact / 10} label="Longevity Impact" />
              <ScoreBar value={compound.efficiencyScore / 10} label="Efficiency Score" />
            </div>

            {/* Pricing */}
            <div className="glass-subtle p-4 rounded-lg border border-white/10">
              <h3 className="text-sm font-semibold text-slate-300 mb-4">Pricing</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Per Day</p>
                  <p className="text-lg font-bold text-blue-400">${compound.pricePerDay.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Per Month</p>
                  <p className="text-lg font-bold text-blue-400">${compound.pricePerMonth.toFixed(0)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Status</p>
                  <p className={`text-lg font-bold ${compound.takingToday ? 'text-blue-400' : 'text-slate-500'}`}>
                    {compound.takingToday ? '✓ Taking' : '—'}
                  </p>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-3 pt-4 sticky bottom-0 bg-gradient-to-t from-slate-950/95 to-transparent pb-6">
              {/* Buy on Amazon Button */}
              {compound.amazonLink && (
                <a href={compound.amazonLink} target="_blank" rel="noopener noreferrer">
                  <Button
                    variant="secondary"
                    size="lg"
                    className="w-full"
                    icon={<ExternalLink size={18} />}
                    iconPosition="right"
                  >
                    Buy on Amazon
                  </Button>
                </a>
              )}

              {/* Add to Protocol Button */}
              <Button
                variant={isSelected ? 'danger' : 'primary'}
                size="lg"
                className="w-full"
                onClick={() => onToggleSelect(compound.id)}
              >
                {isSelected ? 'Remove from Protocol' : 'Add to Protocol'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
