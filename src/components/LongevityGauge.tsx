'use client';

import React, { useMemo } from 'react';

interface LongevityGaugeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

export function LongevityGauge({ score, size = 'md' }: LongevityGaugeProps) {
  // Clamp score between 0 and 100
  const clampedScore = Math.min(Math.max(score, 0), 100);
  
  // Determine dimensions based on size
  const sizeConfig = {
    sm: { width: 120, height: 120, radius: 50, strokeWidth: 4, fontSize: '24px', labelSize: 'text-sm' },
    md: { width: 200, height: 200, radius: 85, strokeWidth: 6, fontSize: '48px', labelSize: 'text-base' },
    lg: { width: 280, height: 280, radius: 120, strokeWidth: 8, fontSize: '64px', labelSize: 'text-lg' },
  };
  
  const config = sizeConfig[size];
  const circumference = 2 * Math.PI * config.radius;
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;
  
  // Determine color based on score
  const getColor = (s: number) => {
    if (s <= 30) return '#F43F5E'; // rose
    if (s <= 60) return '#F59E0B'; // amber-500
    if (s <= 80) return '#3B82F6'; // blue-500
    return '#60A5FA'; // blue-400
  };
  
  const color = getColor(clampedScore);
  
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative">
        {/* Glow effect background */}
        <div className="absolute inset-0 rounded-full blur-xl opacity-40" style={{
          background: `radial-gradient(circle, ${color}33 0%, transparent 70%)`,
          width: config.width + 40,
          height: config.height + 40,
          left: -20,
          top: -20,
        }} />

        <svg
          width={config.width}
          height={config.height}
          viewBox={`0 0 ${config.width} ${config.height}`}
          className="drop-shadow-2xl relative z-10"
        >
          {/* Background circle */}
          <circle
            cx={config.width / 2}
            cy={config.height / 2}
            r={config.radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth={config.strokeWidth}
          />

          {/* Progress circle with gradient */}
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="1" />
              <stop offset="100%" stopColor={color} stopOpacity="0.7" />
            </linearGradient>
          </defs>

          <circle
            cx={config.width / 2}
            cy={config.height / 2}
            r={config.radius}
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth={config.strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 0.8s ease-out, stroke 0.3s ease-out',
              transform: 'rotate(-90deg)',
              transformOrigin: `${config.width / 2}px ${config.height / 2}px`,
              filter: `drop-shadow(0 0 8px ${color}80)`,
            }}
          />

          {/* Center text */}
          <text
            x={config.width / 2}
            y={config.height / 2 - 12}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={config.fontSize}
            fontWeight="bold"
            fill="#f1f5f9"
            className="pointer-events-none"
          >
            {clampedScore}
          </text>

          {/* Unit text */}
          <text
            x={config.width / 2}
            y={config.height / 2 + 20}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={parseInt(config.fontSize) * 0.35}
            fill="#94a3b8"
            className="pointer-events-none"
          >
            /100
          </text>
        </svg>
      </div>

      {/* Label below */}
      <p className={`mt-4 font-semibold text-slate-300 ${config.labelSize}`}>
        Protocol Efficiency
      </p>
    </div>
  );
}
