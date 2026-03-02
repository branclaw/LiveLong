'use client';

import React, { useState, useMemo } from 'react';
import { FilterBar } from '@/components/FilterBar';
import { CompoundCard } from '@/components/CompoundCard';
import { CompoundDetailPanel } from '@/components/CompoundDetailPanel';
import { FilterState, Compound } from '@/types';
import { getAllCompounds, filterAndSortCompounds, getStats } from '@/lib/data';
import { useProtocol } from '@/lib/protocol-context';

export default function BrowsePage() {
  const { selectedCompoundIds, toggleCompound } = useProtocol();
  const [filters, setFilters] = useState<FilterState>({
    tiers: [],
    categories: [],
    sources: [],
    maxPrice: 0,
    searchQuery: '',
    takingToday: false,
    sortBy: 'longevityImpact',
    sortDirection: 'desc',
  });
  const [selectedCompound, setSelectedCompound] = useState<Compound | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  const stats = useMemo(() => getStats(), []);
  const allCompounds = useMemo(() => getAllCompounds(), []);
  const filteredCompounds = useMemo(() => filterAndSortCompounds(filters), [filters]);

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setSearchInput(newFilters.searchQuery);
  };

  const handleSearchInputChange = (query: string) => {
    setSearchInput(query);
    const newFilters = { ...filters, searchQuery: query };
    setFilters(newFilters);
  };

  const handleOpenDetail = (compound: Compound) => {
    setSelectedCompound(compound);
    setIsPanelOpen(true);
  };

  const handleCloseDetail = () => {
    setIsPanelOpen(false);
    setTimeout(() => setSelectedCompound(null), 300); // Wait for animation
  };

  return (
    <div className="min-h-screen bg-[#030712] text-white pt-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Supplement Database</h1>
          <p className="text-slate-400">
            {stats.total} compounds across {stats.categories} categories
          </p>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filter Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <FilterBar onChange={handleFilterChange} initialFilters={filters} />
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {/* Sticky Search Bar */}
            <div className="sticky top-20 z-40 mb-6 glass-card p-4 rounded-lg">
              <input
                type="text"
                placeholder="Quick search compounds..."
                value={searchInput}
                onChange={(e) => handleSearchInputChange(e.target.value)}
                className="w-full px-4 py-2.5 glass-subtle bg-white/5 text-white placeholder-slate-400 rounded-lg border border-white/10 focus:border-blue-500 focus:outline-none transition-colors focus:bg-white/8 focus:ring-0"
              />
            </div>

            {/* Results Count */}
            <div className="mb-6 text-slate-400">
              Showing {filteredCompounds.length} of {stats.total} compounds
            </div>

            {/* Grid */}
            {filteredCompounds.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCompounds.map(compound => (
                  <CompoundCard
                    key={compound.id}
                    compound={compound}
                    isSelected={selectedCompoundIds.has(compound.id)}
                    onToggleSelect={toggleCompound}
                    onOpenDetail={handleOpenDetail}
                  />
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center min-h-96 glass-subtle rounded-lg border border-white/10">
                <div className="text-center">
                  <p className="text-xl text-slate-400 mb-2">No compounds found</p>
                  <p className="text-sm text-slate-500">Try adjusting your filters</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detail Panel */}
      <CompoundDetailPanel
        compound={selectedCompound}
        isOpen={isPanelOpen}
        onClose={handleCloseDetail}
        isSelected={selectedCompound ? selectedCompoundIds.has(selectedCompound.id) : false}
        onToggleSelect={toggleCompound}
      />
    </div>
  );
}
