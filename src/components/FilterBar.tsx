'use client';

import React, { useState, useCallback } from 'react';
import { FilterState, TierNumber } from '@/types';
import { getUniqueCategories, getUniqueSources } from '@/lib/data';

const TIER_OPTIONS: TierNumber[] = [1, 2, 3, 4];
const SOURCE_OPTIONS = ['Huberman', 'Attia', 'Patrick', 'Johnson', 'Clinical', 'Research'];

interface FilterBarProps {
  onChange: (filters: FilterState) => void;
  initialFilters?: Partial<FilterState>;
}

export function FilterBar({ onChange, initialFilters }: FilterBarProps) {
  const [searchQuery, setSearchQuery] = useState(initialFilters?.searchQuery || '');
  const [selectedTiers, setSelectedTiers] = useState<TierNumber[]>(initialFilters?.tiers || []);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialFilters?.categories || []);
  const [selectedSources, setSelectedSources] = useState<string[]>(initialFilters?.sources || []);
  const [maxPrice, setMaxPrice] = useState(initialFilters?.maxPrice || 0);
  const [sortBy, setSortBy] = useState<'longevityImpact' | 'efficiencyScore' | 'pricePerDay' | 'name'>(
    initialFilters?.sortBy || 'longevityImpact'
  );
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(initialFilters?.sortDirection || 'desc');
  const [takingToday, setTakingToday] = useState(initialFilters?.takingToday || null);

  const categories = getUniqueCategories();

  const emitChange = useCallback(() => {
    onChange({
      searchQuery,
      tiers: selectedTiers,
      categories: selectedCategories,
      sources: selectedSources,
      maxPrice,
      sortBy,
      sortDirection,
      takingToday: takingToday === null ? false : takingToday,
    });
  }, [searchQuery, selectedTiers, selectedCategories, selectedSources, maxPrice, sortBy, sortDirection, takingToday, onChange]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setTimeout(() => {
      onChange({
        searchQuery: value,
        tiers: selectedTiers,
        categories: selectedCategories,
        sources: selectedSources,
        maxPrice,
        sortBy,
        sortDirection,
        takingToday: takingToday === null ? false : takingToday,
      });
    }, 0);
  };

  const toggleTier = (tier: TierNumber) => {
    const newTiers = selectedTiers.includes(tier)
      ? selectedTiers.filter(t => t !== tier)
      : [...selectedTiers, tier].sort() as TierNumber[];
    setSelectedTiers(newTiers);
  };

  const toggleCategory = (cat: string) => {
    const newCats = selectedCategories.includes(cat)
      ? selectedCategories.filter(c => c !== cat)
      : [...selectedCategories, cat].sort();
    setSelectedCategories(newCats);
  };

  const toggleSource = (source: string) => {
    const newSources = selectedSources.includes(source)
      ? selectedSources.filter(s => s !== source)
      : [...selectedSources, source].sort();
    setSelectedSources(newSources);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedTiers([]);
    setSelectedCategories([]);
    setSelectedSources([]);
    setMaxPrice(0);
    setSortBy('longevityImpact');
    setSortDirection('desc');
    setTakingToday(null);
    onChange({
      searchQuery: '',
      tiers: [],
      categories: [],
      sources: [],
      maxPrice: 0,
      sortBy: 'longevityImpact',
      sortDirection: 'desc',
      takingToday: false,
    });
  };

  return (
    <div className="space-y-6 p-6 glass-card bg-white/8 rounded-lg border border-white/10">
      {/* Search */}
      <div className="flex-1">
        <label className="block text-sm font-medium text-slate-200 mb-2">Search</label>
        <input
          type="text"
          placeholder="Search by name, category, or function..."
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full px-4 py-2 glass-subtle bg-white/5 text-white placeholder-slate-400 rounded-lg border border-white/10 focus:border-blue-500 focus:outline-none transition-colors focus:bg-white/8"
        />
      </div>

      {/* Tier Filter */}
      <div>
        <label className="block text-sm font-medium text-slate-200 mb-3">Tier</label>
        <div className="flex flex-wrap gap-2">
          {TIER_OPTIONS.map(tier => (
            <button
              key={tier}
              onClick={() => {
                toggleTier(tier);
                setTimeout(emitChange, 0);
              }}
              className={`px-4 py-2 rounded-full font-semibold text-sm transition-all backdrop-blur-sm border ${
                selectedTiers.includes(tier)
                  ? 'bg-blue-500/30 text-blue-300 border-blue-500/50'
                  : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              Tier {tier}
            </button>
          ))}
        </div>
      </div>

      {/* Category Filter */}
      <div>
        <label className="block text-sm font-medium text-slate-200 mb-2">Category</label>
        <select
          multiple
          value={selectedCategories}
          onChange={(e) => {
            const selected = Array.from(e.target.selectedOptions, option => option.value);
            setSelectedCategories(selected);
            setTimeout(() => {
              onChange({
                searchQuery,
                tiers: selectedTiers,
                categories: selected,
                sources: selectedSources,
                maxPrice,
                sortBy,
                sortDirection,
                takingToday: takingToday === null ? false : takingToday,
              });
            }, 0);
          }}
          className="w-full px-4 py-2 glass-subtle bg-white/5 text-white rounded-lg border border-white/10 focus:border-blue-500 focus:outline-none transition-colors focus:bg-white/8"
          size={6}
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Source Filter */}
      <div>
        <label className="block text-sm font-medium text-slate-200 mb-3">Source</label>
        <div className="flex flex-wrap gap-2">
          {SOURCE_OPTIONS.map(source => (
            <button
              key={source}
              onClick={() => {
                toggleSource(source);
                setTimeout(emitChange, 0);
              }}
              className={`px-3 py-1 rounded-full font-semibold text-sm transition-all backdrop-blur-sm border ${
                selectedSources.includes(source)
                  ? 'bg-blue-500/30 text-blue-300 border-blue-500/50'
                  : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              {source}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-sm font-medium text-slate-200 mb-2">
          Max Price Per Day {maxPrice > 0 && <span className="text-blue-400 font-bold">${maxPrice.toFixed(2)}</span>}
        </label>
        <input
          type="range"
          min="0"
          max="20"
          step="0.5"
          value={maxPrice}
          onChange={(e) => {
            const val = parseFloat(e.target.value) || 0;
            setMaxPrice(val);
            setTimeout(() => {
              onChange({
                searchQuery,
                tiers: selectedTiers,
                categories: selectedCategories,
                sources: selectedSources,
                maxPrice: val,
                sortBy,
                sortDirection,
                takingToday: takingToday === null ? false : takingToday,
              });
            }, 0);
          }}
          className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-400"
        />
        <div className="flex justify-between text-xs text-slate-500 mt-1">
          <span>All</span>
          <span>$20/day</span>
        </div>
      </div>

      {/* Sort */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-200 mb-2">Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value as any);
              setTimeout(emitChange, 0);
            }}
            className="w-full px-4 py-2 glass-subtle bg-white/5 text-white rounded-lg border border-white/10 focus:border-blue-500 focus:outline-none transition-colors focus:bg-white/8"
          >
            <option value="longevityImpact">Longevity Impact</option>
            <option value="pricePerDay">Price</option>
            <option value="name">Name</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-200 mb-2">Order</label>
          <button
            onClick={() => {
              setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
              setTimeout(emitChange, 0);
            }}
            className="w-full px-4 py-2 glass-subtle bg-white/5 text-white rounded-lg border border-white/10 hover:bg-white/10 hover:border-white/20 transition-colors font-medium"
          >
            {sortDirection === 'asc' ? '↑ Ascending' : '↓ Descending'}
          </button>
        </div>
      </div>

      {/* Taking Today Filter */}
      <div>
        <button
          onClick={() => {
            const newVal = takingToday === null ? true : null;
            setTakingToday(newVal);
            setTimeout(() => {
              onChange({
                searchQuery,
                tiers: selectedTiers,
                categories: selectedCategories,
                sources: selectedSources,
                maxPrice,
                sortBy,
                sortDirection,
                takingToday: newVal === null ? false : newVal,
              });
            }, 0);
          }}
          className={`w-full px-4 py-2 rounded-lg font-semibold transition-all backdrop-blur-sm border ${
            takingToday
              ? 'bg-blue-500/30 text-blue-300 border-blue-500/50'
              : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:border-white/20'
          }`}
        >
          {takingToday === null ? '☐ Show All' : '☑ Taking Today Only'}
        </button>
      </div>

      {/* Reset Filters */}
      <button
        onClick={handleResetFilters}
        className="w-full px-4 py-2 glass-subtle bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 rounded-lg font-semibold transition-colors border border-rose-500/30 hover:border-rose-500/50"
      >
        Reset Filters
      </button>
    </div>
  );
}
