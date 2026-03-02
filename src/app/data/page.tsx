'use client';

import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { Upload, FileText, AlertTriangle, CheckCircle, ChevronDown, ChevronUp, X, Activity, TrendingUp, TrendingDown, Minus, Pill, ExternalLink, ShoppingCart, Sparkles, Trash2 } from 'lucide-react';
import biomarkersDB from '@/data/biomarkers-master.json';
import compoundsData from '@/data/compounds.json';
import { getRecommendationsFromLabResults, type SupplementRecommendation } from '@/data/biomarker-supplement-map';
import { extractTextFromPDF, parseHealthGorillaText, parseLabText as parseLabTextFile, type ParsedBiomarker } from '@/lib/pdf-lab-parser';
import Link from 'next/link';

interface ParsedResult {
  name: string;
  value: string;
  numericValue: number | null;
  unit: string;
  referenceRange: string;
  flag: 'normal' | 'high' | 'low' | 'critical' | 'unknown';
  matchedId: string | null;
  matchedCategory: string | null;
  optimalLow: number | null;
  optimalHigh: number | null;
  standardLow: number | null;
  standardHigh: number | null;
  isOutOfRange: boolean;
  isOutOfOptimal: boolean;
}

interface UploadedReport {
  id: string;
  fileName: string;
  uploadDate: string;
  results: ParsedResult[];
  totalMarkers: number;
  outOfRange: number;
  outOfOptimal: number;
}

interface CompoundData {
  id: number;
  name: string;
  category: string;
  tier: string;
  tierNumber: number;
  longevityImpact: number;
  pricePerDay: number;
  pricePerMonth: number;
  primaryFunction: string;
  amazonLink: string;
  mechanism: string;
  targetBiomarkers: string;
  [key: string]: unknown;
}

const compoundsMap = new Map((compoundsData as CompoundData[]).map(c => [c.name, c]));

const STORAGE_KEY = 'llp-lab-reports';

function loadSavedReports(): UploadedReport[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch { /* ignore parse errors */ }
  return [];
}

function saveReports(reports: UploadedReport[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  } catch { /* ignore storage errors */ }
}

export default function DataPage() {
  const [reports, setReports] = useState<UploadedReport[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [expandedReport, setExpandedReport] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [browseCategory, setBrowseCategory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'results' | 'recommendations' | 'browse'>('results');
  const [loaded, setLoaded] = useState(false);
  const [selectedBiomarker, setSelectedBiomarker] = useState<ParsedResult | null>(null);
  const [parseNotice, setParseNotice] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load saved reports on mount
  useEffect(() => {
    const saved = loadSavedReports();
    if (saved.length > 0) {
      setReports(saved);
      setActiveTab('results');
    }
    setLoaded(true);
  }, []);

  // Persist reports whenever they change (after initial load)
  useEffect(() => {
    if (loaded) {
      saveReports(reports);
    }
  }, [reports, loaded]);

  const handleFiles = useCallback(async (files: FileList) => {
    setProcessing(true);
    const newReports: UploadedReport[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const lower = file.name.toLowerCase();
      if (!lower.endsWith('.pdf') && !lower.endsWith('.txt')) continue;

      try {
        let results: ParsedResult[];

        if (lower.endsWith('.pdf')) {
          // Use pdfjs-dist for proper PDF text extraction
          const pageTexts = await extractTextFromPDF(file);
          results = parseHealthGorillaText(pageTexts) as ParsedResult[];
        } else {
          // Plain text file
          const text = await file.text();
          results = parseLabTextFile(text) as ParsedResult[];
        }

        // Filter out biological age (user requested removal)
        results = results.filter(r => r.matchedId !== 'biological-age');

        const report: UploadedReport = {
          id: `report_${Date.now()}_${i}`,
          fileName: file.name,
          uploadDate: new Date().toISOString(),
          results,
          totalMarkers: results.length,
          outOfRange: results.filter(r => r.isOutOfRange).length,
          outOfOptimal: results.filter(r => r.isOutOfOptimal).length,
        };
        newReports.push(report);
      } catch (err) {
        console.error('Error parsing file:', file.name, err);
      }
    }

    // Check for files that had no results
    const emptyFiles = newReports.filter(r => r.totalMarkers === 0);
    const goodFiles = newReports.filter(r => r.totalMarkers > 0);

    if (emptyFiles.length > 0 && goodFiles.length === 0) {
      setParseNotice(`No biomarker results found in "${emptyFiles.map(f => f.fileName).join(', ')}". This may be a lab order or a format we don't support yet. Please upload your actual lab results PDF.`);
    } else if (emptyFiles.length > 0) {
      setParseNotice(`${emptyFiles.map(f => `"${f.fileName}"`).join(', ')} had no parseable results (may be a lab order, not results). ${goodFiles.length} file(s) parsed successfully.`);
    } else {
      setParseNotice(null);
    }

    // Only add reports that actually have results
    setReports(prev => [...prev, ...goodFiles]);
    setProcessing(false);
    if (goodFiles.length > 0) {
      setExpandedReport(goodFiles[0].id);
      setActiveTab('results');
    }
  }, []);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const removeReport = (id: string) => {
    setReports(prev => prev.filter(r => r.id !== id));
    if (expandedReport === id) setExpandedReport(null);
  };

  const clearAllData = () => {
    setReports([]);
    setExpandedReport(null);
    setSelectedBiomarker(null);
    setSelectedCategory('all');
    setActiveTab('results');
  };

  // Aggregate all results across reports
  const allResults = reports.flatMap(r => r.results);
  const categories = [...new Set(allResults.map(r => r.matchedCategory).filter(Boolean))] as string[];

  const filteredResults = selectedCategory === 'all'
    ? allResults
    : allResults.filter(r => r.matchedCategory === selectedCategory);

  // Get supplement recommendations based on out-of-range results
  const recommendations = useMemo(() => {
    if (allResults.length === 0) return [];
    return getRecommendationsFromLabResults(allResults);
  }, [allResults]);

  // Browse database categories
  const dbCategories = [...new Set(biomarkersDB.filter(b => b.id !== 'biological-age').map(b => b.category))].sort();

  const outOfRangeResults = allResults.filter(r => r.isOutOfRange);
  const outOfOptimalOnly = allResults.filter(r => r.isOutOfOptimal && !r.isOutOfRange);

  // Reports with actual results vs empty ones
  const reportsWithResults = reports.filter(r => r.totalMarkers > 0);

  return (
    <div className="min-h-screen bg-[#030712] pt-24 pb-24">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Data Analysis</h1>
            <p className="text-slate-400">Upload your lab results to get personalized analysis and supplement recommendations.</p>
          </div>
          {allResults.length > 0 && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 px-3 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 transition-colors"
              >
                <Upload className="w-4 h-4" />
                Add More
              </button>
              <button
                onClick={clearAllData}
                className="flex items-center gap-2 text-sm text-slate-400 hover:text-rose-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-rose-500/10"
              >
                <Trash2 className="w-4 h-4" />
                Clear All
              </button>
            </div>
          )}
        </div>

        {/* Upload Area - full size when no data, hidden file input when data exists */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.txt"
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />

        {allResults.length === 0 && (
          <div
            className={`relative border-2 border-dashed rounded-2xl p-12 mb-8 text-center transition-all cursor-pointer ${
              dragActive
                ? 'border-blue-400 bg-blue-500/10'
                : 'border-white/20 hover:border-blue-400/50 hover:bg-white/5'
            }`}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className={`w-12 h-12 mx-auto mb-4 ${dragActive ? 'text-blue-400' : 'text-slate-500'}`} />
            <h3 className="text-xl font-semibold text-white mb-2">
              {processing ? 'Processing...' : 'Upload Lab Results'}
            </h3>
            <p className="text-slate-400 mb-4">
              Drag & drop PDF or text files here, or click to browse.
              <br />
              <span className="text-slate-500 text-sm">Upload multiple files at once — supports Quest, LabCorp, Health Gorilla formats</span>
            </p>
            {processing && (
              <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto" />
            )}
          </div>
        )}

        {/* Parse notice - shown when files have no results */}
        {parseNotice && (
          <div className="mb-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-amber-300 text-sm">{parseNotice}</p>
            </div>
            <button onClick={() => setParseNotice(null)} className="text-amber-400/60 hover:text-amber-300 shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Processing indicator when data already exists */}
        {allResults.length > 0 && processing && (
          <div className="mb-4 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
            <span className="text-blue-300 text-sm">Processing new files...</span>
          </div>
        )}

        {/* Main content - show after results exist */}
        {allResults.length > 0 && (
          <>
            {/* Stats Cards - FIRST, right at top */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
              <StatCard label="Total Tested" value={allResults.length} color="blue" />
              <StatCard label="In Range" value={allResults.filter(r => !r.isOutOfRange && !r.isOutOfOptimal).length} color="green" />
              <StatCard label="Out of Optimal" value={outOfOptimalOnly.length} color="amber" />
              <StatCard label="Out of Range" value={outOfRangeResults.length} color="rose" />
            </div>

            {/* Source files - compact inline row */}
            <div className="flex flex-wrap items-center gap-2 mb-6 text-xs text-slate-500">
              <span>Sources:</span>
              {reportsWithResults.map(report => (
                <span key={report.id} className="inline-flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-lg">
                  <FileText className="w-3 h-3 text-blue-400" />
                  <span className="text-slate-300">{report.fileName}</span>
                  <span className="text-slate-500">({report.totalMarkers})</span>
                  <button
                    onClick={() => removeReport(report.id)}
                    className="text-slate-600 hover:text-rose-400 transition-colors ml-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 mb-6 border-b border-white/10 pb-0">
              <button
                onClick={() => setActiveTab('results')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-all ${
                  activeTab === 'results'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Activity className="w-4 h-4 inline-block mr-2" />
                Results ({allResults.length})
              </button>
              <button
                onClick={() => setActiveTab('recommendations')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-all ${
                  activeTab === 'recommendations'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Pill className="w-4 h-4 inline-block mr-2" />
                Supplement Recs ({recommendations.length})
                {recommendations.length > 0 && (
                  <span className="ml-2 bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full text-xs">New</span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('browse')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-all ${
                  activeTab === 'browse'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-4 h-4 inline-block mr-2" />
                Browse Database
              </button>
            </div>

            {/* Results Tab */}
            {activeTab === 'results' && (
              <div className="mb-8">
                {/* Category Filter */}
                <div className="flex flex-wrap gap-2 mb-6">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      selectedCategory === 'all'
                        ? 'bg-blue-500 text-white'
                        : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    All ({allResults.length})
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        selectedCategory === cat
                          ? 'bg-blue-500 text-white'
                          : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {cat} ({allResults.filter(r => r.matchedCategory === cat).length})
                    </button>
                  ))}
                </div>

                {/* Results Table */}
                <div className="glass-card rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/10 bg-white/5">
                          <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Biomarker</th>
                          <th className="text-center px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Value</th>
                          <th className="text-center px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Status</th>
                          <th className="text-center px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Ref Range</th>
                          <th className="text-center px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Optimal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredResults.map((result, idx) => (
                          <tr
                            key={idx}
                            className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                            onClick={() => setSelectedBiomarker(result)}
                          >
                            <td className="px-4 py-3">
                              <p className="text-white font-medium text-sm hover:text-blue-400 transition-colors">{result.name}</p>
                              {result.matchedCategory && (
                                <p className="text-xs text-slate-500">{result.matchedCategory}</p>
                              )}
                            </td>
                            <td className="text-center px-4 py-3">
                              <span className={`font-mono font-semibold ${
                                result.flag === 'high' ? 'text-rose-400' :
                                result.flag === 'low' ? 'text-amber-400' :
                                result.flag === 'critical' ? 'text-rose-500' :
                                'text-emerald-400'
                              }`}>
                                {result.value} <span className="text-xs text-slate-500">{result.unit}</span>
                              </span>
                            </td>
                            <td className="text-center px-4 py-3">
                              <StatusBadge flag={result.flag} isOutOfOptimal={result.isOutOfOptimal} />
                            </td>
                            <td className="text-center px-4 py-3 text-sm text-slate-400">
                              {result.standardLow !== null && result.standardHigh !== null
                                ? `${result.standardLow} - ${result.standardHigh}`
                                : result.referenceRange || '—'}
                            </td>
                            <td className="text-center px-4 py-3 text-sm text-blue-400">
                              {result.optimalLow !== null && result.optimalHigh !== null
                                ? `${result.optimalLow} - ${result.optimalHigh}`
                                : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Recommendations Tab */}
            {activeTab === 'recommendations' && (
              <div className="mb-8">
                {recommendations.length === 0 ? (
                  <div className="glass-card rounded-xl p-12 text-center">
                    <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">All Clear!</h3>
                    <p className="text-slate-400">All your biomarkers are within optimal range. No supplement recommendations needed.</p>
                  </div>
                ) : (
                  <>
                    <div className="mb-4 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                      <p className="text-blue-300 text-sm">
                        Based on your lab results, we identified <span className="font-bold text-white">{outOfRangeResults.length + outOfOptimalOnly.length} biomarkers</span> outside optimal range and matched them to <span className="font-bold text-white">{recommendations.length} supplements</span> that may help. Supplements addressing multiple biomarkers are ranked higher.
                      </p>
                    </div>

                    {/* Priority 1 - Out of Range */}
                    {recommendations.filter(r => r.priority === 1).length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-rose-400 mb-3 flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5" />
                          High Priority — Out of Standard Range
                        </h3>
                        <div className="grid gap-4 sm:grid-cols-2">
                          {recommendations.filter(r => r.priority === 1).map((rec, idx) => (
                            <SupplementCard key={idx} rec={rec} allResults={allResults} />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Priority 2+ - Optimization */}
                    {recommendations.filter(r => r.priority >= 2).length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-amber-400 mb-3 flex items-center gap-2">
                          <TrendingUp className="w-5 h-5" />
                          Optimization — Outside Optimal Range
                        </h3>
                        <div className="grid gap-4 sm:grid-cols-2">
                          {recommendations.filter(r => r.priority >= 2).map((rec, idx) => (
                            <SupplementCard key={idx} rec={rec} allResults={allResults} />
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-6 text-center">
                      <Link
                        href="/browse"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-xl transition-colors font-medium"
                      >
                        Browse Full Supplement Database
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Browse Database Tab */}
            {activeTab === 'browse' && (
              <div className="mb-8">
                <p className="text-slate-400 mb-6">Browse 109 biomarkers across {dbCategories.length} health categories with optimal and standard ranges.</p>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-6">
                  {dbCategories.map(cat => {
                    const count = biomarkersDB.filter(b => b.category === cat).length;
                    return (
                      <button
                        key={cat}
                        onClick={() => setBrowseCategory(browseCategory === cat ? null : cat)}
                        className={`p-4 rounded-xl text-left transition-all ${
                          browseCategory === cat
                            ? 'bg-blue-500/20 border border-blue-500/40'
                            : 'glass-card hover:bg-white/10'
                        }`}
                      >
                        <p className="font-semibold text-white text-sm">{cat}</p>
                        <p className="text-xs text-slate-400 mt-1">{count} markers</p>
                      </button>
                    );
                  })}
                </div>

                {browseCategory && (
                  <div className="glass-card rounded-xl p-4 space-y-3">
                    <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-3">{browseCategory}</h3>
                    {biomarkersDB
                      .filter(b => b.category === browseCategory && b.id !== 'biological-age')
                      .map(bm => (
                        <div key={bm.id} className="p-4 bg-white/5 rounded-lg">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h4 className="font-semibold text-white">{bm.name}</h4>
                              <p className="text-xs text-slate-400 mt-1">{bm.blurb}</p>
                            </div>
                            {bm.unit && (
                              <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-lg shrink-0">{bm.unit}</span>
                            )}
                          </div>
                          <div className="flex gap-4 mt-3">
                            {bm.standard_range_low !== null && bm.standard_range_high !== null && (
                              <div className="text-xs">
                                <span className="text-slate-500">Standard: </span>
                                <span className="text-slate-300">{bm.standard_range_low} – {bm.standard_range_high}</span>
                              </div>
                            )}
                            {bm.optimal_range_low !== null && bm.optimal_range_high !== null && (
                              <div className="text-xs">
                                <span className="text-blue-500">Optimal: </span>
                                <span className="text-blue-300">{bm.optimal_range_low} – {bm.optimal_range_high}</span>
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-2 leading-relaxed">{bm.summary}</p>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Browse Database - shown when no results yet */}
        {allResults.length === 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-white mb-2">Biomarker Reference Database</h2>
            <p className="text-slate-400 mb-6">Browse 109 biomarkers across {dbCategories.length} health categories with optimal and standard ranges.</p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-6">
              {dbCategories.map(cat => {
                const count = biomarkersDB.filter(b => b.category === cat).length;
                return (
                  <button
                    key={cat}
                    onClick={() => setBrowseCategory(browseCategory === cat ? null : cat)}
                    className={`p-4 rounded-xl text-left transition-all ${
                      browseCategory === cat
                        ? 'bg-blue-500/20 border border-blue-500/40'
                        : 'glass-card hover:bg-white/10'
                    }`}
                  >
                    <p className="font-semibold text-white text-sm">{cat}</p>
                    <p className="text-xs text-slate-400 mt-1">{count} markers</p>
                  </button>
                );
              })}
            </div>

            {browseCategory && (
              <div className="glass-card rounded-xl p-4 space-y-3">
                <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-3">{browseCategory}</h3>
                {biomarkersDB
                  .filter(b => b.category === browseCategory && b.id !== 'biological-age')
                  .map(bm => (
                    <div key={bm.id} className="p-4 bg-white/5 rounded-lg">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-semibold text-white">{bm.name}</h4>
                          <p className="text-xs text-slate-400 mt-1">{bm.blurb}</p>
                        </div>
                        {bm.unit && (
                          <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-lg shrink-0">{bm.unit}</span>
                        )}
                      </div>
                      <div className="flex gap-4 mt-3">
                        {bm.standard_range_low !== null && bm.standard_range_high !== null && (
                          <div className="text-xs">
                            <span className="text-slate-500">Standard: </span>
                            <span className="text-slate-300">{bm.standard_range_low} – {bm.standard_range_high}</span>
                          </div>
                        )}
                        {bm.optimal_range_low !== null && bm.optimal_range_high !== null && (
                          <div className="text-xs">
                            <span className="text-blue-500">Optimal: </span>
                            <span className="text-blue-300">{bm.optimal_range_low} – {bm.optimal_range_high}</span>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-2 leading-relaxed">{bm.summary}</p>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Biomarker Detail Panel */}
      {selectedBiomarker && (
        <BiomarkerDetailPanel
          result={selectedBiomarker}
          onClose={() => setSelectedBiomarker(null)}
        />
      )}
    </div>
  );
}

// ── Biomarker Detail Panel (slide-over) ──────────────────────

function BiomarkerDetailPanel({ result, onClose }: { result: ParsedResult; onClose: () => void }) {
  const dbEntry = result.matchedId
    ? biomarkersDB.find(b => b.id === result.matchedId)
    : null;

  // Get supplement recommendations for this biomarker
  const supplements = useMemo(() => {
    if (!result.matchedId) return [];
    const recs = getRecommendationsFromLabResults([result]);
    return recs;
  }, [result]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md bg-[#0a0f1a] border-l border-white/10 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-[#0a0f1a] border-b border-white/10 p-6 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">{result.name}</h2>
            {result.matchedCategory && (
              <p className="text-sm text-blue-400 mt-1">{result.matchedCategory}</p>
            )}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Value + Status */}
          <div className="flex items-center gap-4">
            <div className={`text-3xl font-bold font-mono ${
              result.flag === 'high' || result.flag === 'critical' ? 'text-rose-400' :
              result.flag === 'low' ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              {result.value}
              <span className="text-sm text-slate-500 ml-2">{result.unit}</span>
            </div>
            <StatusBadge flag={result.flag} isOutOfOptimal={result.isOutOfOptimal} />
          </div>

          {/* Range Visual */}
          {result.standardLow !== null && result.standardHigh !== null && result.numericValue !== null && (
            <div className="glass-card p-4 rounded-lg">
              <p className="text-xs text-slate-400 mb-3 font-semibold uppercase tracking-wider">Range Position</p>
              <RangeBar
                value={result.numericValue}
                standardLow={result.standardLow}
                standardHigh={result.standardHigh}
                optimalLow={result.optimalLow}
                optimalHigh={result.optimalHigh}
              />
              <div className="flex justify-between mt-2 text-xs text-slate-500">
                <span>Standard: {result.standardLow} – {result.standardHigh}</span>
              </div>
              {result.optimalLow !== null && result.optimalHigh !== null && (
                <div className="text-xs text-blue-400 mt-1">
                  Optimal: {result.optimalLow} – {result.optimalHigh}
                </div>
              )}
            </div>
          )}

          {/* Description from DB */}
          {dbEntry && (
            <div className="space-y-3">
              <p className="text-sm text-slate-300 leading-relaxed">{dbEntry.blurb}</p>
              <p className="text-xs text-slate-500 leading-relaxed">{dbEntry.summary}</p>
            </div>
          )}

          {/* Supplement Recommendations */}
          {supplements.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Pill className="w-4 h-4 text-blue-400" />
                Suggested Supplements
              </h3>
              <div className="space-y-2">
                {supplements.map((rec, idx) => {
                  const compound = compoundsMap.get(rec.compoundName);
                  return (
                    <div key={idx} className="p-3 glass-card rounded-lg border border-white/10">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-white">{rec.compoundName}</p>
                          {compound && (
                            <p className="text-xs text-slate-400">{compound.category} · ${compound.pricePerDay.toFixed(2)}/day</p>
                          )}
                        </div>
                        {compound?.amazonLink && (
                          <a
                            href={compound.amazonLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-400 hover:text-blue-300"
                          >
                            <ShoppingCart className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{rec.reasons[0]}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Range Bar Visual ─────────────────────────────────────────

function RangeBar({
  value, standardLow, standardHigh, optimalLow, optimalHigh
}: {
  value: number;
  standardLow: number;
  standardHigh: number;
  optimalLow: number | null;
  optimalHigh: number | null;
}) {
  // Calculate position as percentage within an extended range
  const margin = (standardHigh - standardLow) * 0.3;
  const rangeMin = standardLow - margin;
  const rangeMax = standardHigh + margin;
  const total = rangeMax - rangeMin;

  const valuePct = Math.max(0, Math.min(100, ((value - rangeMin) / total) * 100));
  const stdLowPct = ((standardLow - rangeMin) / total) * 100;
  const stdHighPct = ((standardHigh - rangeMin) / total) * 100;

  const optLowPct = optimalLow !== null ? ((optimalLow - rangeMin) / total) * 100 : null;
  const optHighPct = optimalHigh !== null ? ((optimalHigh - rangeMin) / total) * 100 : null;

  return (
    <div className="relative h-6">
      {/* Full bar background */}
      <div className="absolute inset-0 bg-white/5 rounded-full" />

      {/* Standard range */}
      <div
        className="absolute top-0 bottom-0 bg-emerald-500/20 rounded-full"
        style={{ left: `${stdLowPct}%`, width: `${stdHighPct - stdLowPct}%` }}
      />

      {/* Optimal range overlay */}
      {optLowPct !== null && optHighPct !== null && (
        <div
          className="absolute top-0 bottom-0 bg-blue-500/20 rounded-full border border-blue-500/30"
          style={{ left: `${optLowPct}%`, width: `${optHighPct - optLowPct}%` }}
        />
      )}

      {/* Value indicator */}
      <div
        className="absolute top-0 bottom-0 w-1 rounded-full bg-white shadow-lg shadow-white/20"
        style={{ left: `${valuePct}%` }}
      />
    </div>
  );
}

// ── Supplement Recommendation Card ────────────────────────────

function SupplementCard({ rec, allResults }: { rec: SupplementRecommendation; allResults: ParsedResult[] }) {
  const [expanded, setExpanded] = useState(false);
  const compound = compoundsMap.get(rec.compoundName);

  // Get the actual biomarker results that triggered this
  const triggeredResults = rec.biomarkerIds.map(id => {
    return allResults.find(r => r.matchedId === id);
  }).filter(Boolean) as ParsedResult[];

  return (
    <div className={`glass-card rounded-xl overflow-hidden border ${
      rec.priority === 1 ? 'border-rose-500/30' : 'border-amber-500/20'
    }`}>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Pill className={`w-4 h-4 ${rec.priority === 1 ? 'text-rose-400' : 'text-amber-400'}`} />
              <h4 className="font-bold text-white">{rec.compoundName}</h4>
            </div>
            {compound && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs bg-white/10 text-slate-300 px-2 py-0.5 rounded">{compound.category}</span>
                <span className="text-xs bg-white/10 text-slate-300 px-2 py-0.5 rounded">{compound.tier}</span>
                {compound.pricePerDay > 0 && (
                  <span className="text-xs text-slate-500">${compound.pricePerDay.toFixed(2)}/day</span>
                )}
              </div>
            )}
          </div>
          {rec.biomarkerIds.length > 1 && (
            <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-lg shrink-0">
              {rec.biomarkerIds.length} markers
            </span>
          )}
        </div>

        {/* Triggered Biomarkers */}
        <div className="space-y-2 mb-3">
          {triggeredResults.map((result, idx) => (
            <div key={idx} className={`flex items-center justify-between p-2 rounded-lg text-xs ${
              result.isOutOfRange ? 'bg-rose-500/10' : 'bg-amber-500/10'
            }`}>
              <div className="flex items-center gap-2">
                {result.flag === 'high' || result.flag === 'critical' ? (
                  <TrendingUp className="w-3 h-3 text-rose-400" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-amber-400" />
                )}
                <span className="text-white font-medium">{result.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`font-mono font-semibold ${
                  result.flag === 'high' || result.flag === 'critical' ? 'text-rose-400' : 'text-amber-400'
                }`}>
                  {result.value} {result.unit}
                </span>
                {result.optimalLow !== null && result.optimalHigh !== null && (
                  <span className="text-slate-500">
                    (optimal: {result.optimalLow}–{result.optimalHigh})
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Reason */}
        <p className="text-xs text-slate-400 leading-relaxed">{rec.reasons[0]}</p>

        {/* Compound details (expandable) */}
        {compound && (
          <>
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-xs text-blue-400 mt-3 hover:text-blue-300 transition-colors"
            >
              {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              {expanded ? 'Less details' : 'More details'}
            </button>

            {expanded && (
              <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
                <p className="text-xs text-slate-300">
                  <span className="text-slate-500">Function: </span>
                  {compound.primaryFunction}
                </p>
                <p className="text-xs text-slate-300">
                  <span className="text-slate-500">Mechanism: </span>
                  {compound.mechanism}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-slate-500">Longevity Impact:</span>
                  <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full"
                      style={{ width: `${compound.longevityImpact * 10}%` }}
                    />
                  </div>
                  <span className="text-xs text-blue-400 font-mono">{compound.longevityImpact}/10</span>
                </div>
                {compound.amazonLink && (
                  <a
                    href={compound.amazonLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 rounded-lg text-xs transition-colors"
                  >
                    <ShoppingCart className="w-3 h-3" />
                    View on Amazon
                  </a>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── Shared Components ─────────────────────────────────────────

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-500/15 border-blue-500/30 text-blue-400',
    green: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
    amber: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
    rose: 'bg-rose-500/15 border-rose-500/30 text-rose-400',
  };
  return (
    <div className={`p-4 rounded-xl border ${colors[color]}`}>
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-xs mt-1 opacity-80">{label}</p>
    </div>
  );
}

function StatusBadge({ flag, isOutOfOptimal }: { flag: string; isOutOfOptimal: boolean }) {
  if (flag === 'critical') return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-400">
      <AlertTriangle className="w-3 h-3" /> Critical
    </span>
  );
  if (flag === 'high') return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-400">
      <TrendingUp className="w-3 h-3" /> High
    </span>
  );
  if (flag === 'low') return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400">
      <TrendingDown className="w-3 h-3" /> Low
    </span>
  );
  if (isOutOfOptimal) return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400">
      <Minus className="w-3 h-3" /> Suboptimal
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400">
      <CheckCircle className="w-3 h-3" /> Optimal
    </span>
  );
}

function BiomarkerRow({ result }: { result: ParsedResult }) {
  return (
    <div className={`flex items-center justify-between p-3 rounded-lg ${
      result.isOutOfRange ? 'bg-rose-500/10 border border-rose-500/20' :
      result.isOutOfOptimal ? 'bg-amber-500/10 border border-amber-500/20' :
      'bg-white/5'
    }`}>
      <div>
        <p className="text-sm font-medium text-white">{result.name}</p>
        {result.matchedCategory && <p className="text-xs text-slate-500">{result.matchedCategory}</p>}
      </div>
      <div className="flex items-center gap-4">
        <span className={`font-mono text-sm font-semibold ${
          result.flag === 'high' || result.flag === 'critical' ? 'text-rose-400' :
          result.flag === 'low' ? 'text-amber-400' : 'text-emerald-400'
        }`}>
          {result.value} {result.unit}
        </span>
        <StatusBadge flag={result.flag} isOutOfOptimal={result.isOutOfOptimal} />
      </div>
    </div>
  );
}
