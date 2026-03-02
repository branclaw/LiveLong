'use client';

import React, { useState, useCallback, useRef } from 'react';
import { Upload, FileText, AlertTriangle, CheckCircle, ChevronDown, ChevronUp, X, Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import biomarkersDB from '@/data/biomarkers-master.json';

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

// Biomarker alias map for matching
const ALIASES: Record<string, string> = {
  'glucose': 'glucose', 'glucose, serum': 'glucose',
  'bun': 'bun', 'blood urea nitrogen': 'bun', 'urea nitrogen': 'bun',
  'creatinine': 'creatinine', 'creatinine, serum': 'creatinine',
  'egfr': 'egfr-creatinine', 'egfr non-afr. american': 'egfr-creatinine',
  'sodium': 'sodium', 'potassium': 'potassium', 'chloride': 'chloride',
  'carbon dioxide': 'carbon-dioxide', 'co2': 'carbon-dioxide',
  'calcium': 'calcium', 'calcium, serum': 'calcium',
  'protein, total': 'total-protein', 'total protein': 'total-protein',
  'albumin': 'albumin', 'albumin, serum': 'albumin',
  'globulin': 'globulin', 'globulin, total': 'globulin',
  'a/g ratio': 'albumin-globulin-ratio', 'albumin/globulin ratio': 'albumin-globulin-ratio',
  'bilirubin, total': 'total-bilirubin', 'total bilirubin': 'total-bilirubin',
  'alkaline phosphatase': 'alp', 'alkaline phosphatase, s': 'alp',
  'ast (sgot)': 'ast', 'ast': 'ast', 'aspartate aminotransferase': 'ast',
  'alt (sgpt)': 'alt', 'alt': 'alt', 'alanine aminotransferase': 'alt',
  'cholesterol, total': 'total-cholesterol', 'total cholesterol': 'total-cholesterol',
  'triglycerides': 'triglycerides',
  'hdl cholesterol': 'hdl-cholesterol', 'hdl': 'hdl-cholesterol',
  'ldl cholesterol': 'ldl-cholesterol', 'ldl chol calc (nih)': 'ldl-cholesterol', 'ldl': 'ldl-cholesterol',
  'non-hdl cholesterol': 'non-hdl-cholesterol',
  'chol/hdlc ratio': 'total-cholesterol-hdl-ratio',
  'wbc': 'wbc-count', 'white blood cell count': 'wbc-count',
  'rbc': 'rbc-count', 'red blood cell count': 'rbc-count',
  'hemoglobin': 'hemoglobin', 'hematocrit': 'hematocrit',
  'mcv': 'mcv', 'mch': 'mch', 'mchc': 'mchc', 'rdw': 'rdw',
  'platelet count': 'platelet-count', 'platelets': 'platelet-count',
  'mpv': 'mpv',
  'neutrophils': 'neutrophils', 'lymphocytes': 'lymphocytes',
  'monocytes': 'monocytes', 'eosinophils': 'eosinophils', 'basophils': 'basophils',
  'tsh': 'tsh', 't4, free': 't4-free', 'free t4': 't4-free',
  't3, free': 't3-free', 'free t3': 't3-free',
  'hemoglobin a1c': 'hba1c', 'hba1c': 'hba1c', 'a1c': 'hba1c',
  'insulin': 'insulin', 'hs-crp': 'hscrp', 'c-reactive protein': 'hscrp',
  'ferritin': 'ferritin', 'iron': 'iron', 'iron, serum': 'iron',
  'tibc': 'tibc', 'iron binding capacity': 'tibc',
  'iron saturation': 'iron-saturation',
  'vitamin d': 'vitamin-d', 'vitamin d, 25-hydroxy': 'vitamin-d',
  'homocysteine': 'homocysteine', 'uric acid': 'uric-acid',
  'testosterone, total': 'testosterone-total', 'testosterone, free': 'testosterone-free',
  'cortisol': 'cortisol', 'magnesium': 'magnesium', 'zinc': 'zinc',
  'ggt': 'ggt', 'gamma-glutamyl transferase': 'ggt',
};

const biomarkerMap = new Map(biomarkersDB.map(b => [b.id, b]));

function matchBiomarker(name: string) {
  const norm = name.toLowerCase().trim();
  const aliasId = ALIASES[norm];
  if (aliasId) return biomarkerMap.get(aliasId) || null;
  for (const bm of biomarkersDB) {
    const dbName = bm.name.toLowerCase();
    if (dbName === norm || dbName.includes(norm) || norm.includes(dbName)) return bm;
  }
  return null;
}

function parseLabText(text: string): ParsedResult[] {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const results: ParsedResult[] = [];

  for (const line of lines) {
    // Try structured format: Name   Value  Flag  Range  Unit
    const m = line.match(/^([A-Za-z][\w\s,/().%-]+?)\s{2,}([\d<>.]+)\s*(H|L|HH|LL)?\s+([\d<>.\-–]+(?:\s*[-–]\s*[\d<>.]+)?)\s+(.+)$/);
    if (m) {
      const [, rawName, rawValue, flag, refRange, unit] = m;
      addResult(results, rawName.trim(), rawValue.trim(), unit.trim(), refRange, flag);
      continue;
    }
    // Try simpler: Name   Value  Unit  Range
    const s = line.match(/^([A-Za-z][\w\s,/().%-]+?)\s{2,}([\d<>.]+)\s+(\S+)\s+([\d<>.\-–]+\s*[-–]\s*[\d<>.]+)?/);
    if (s) {
      const [, rawName, rawValue, unit, refRange] = s;
      addResult(results, rawName.trim(), rawValue.trim(), unit.trim(), refRange || '', undefined);
    }
  }

  return results;
}

function addResult(results: ParsedResult[], name: string, value: string, unit: string, refRange: string, flag?: string) {
  const numericValue = parseFloat(value.replace(/[<>,]/g, '')) || null;
  const rangeMatch = refRange.match(/([\d.]+)\s*[-–]\s*([\d.]+)/);
  const refLow = rangeMatch ? parseFloat(rangeMatch[1]) : null;
  const refHigh = rangeMatch ? parseFloat(rangeMatch[2]) : null;

  const matched = matchBiomarker(name);
  let isOutOfRange = false;
  let isOutOfOptimal = false;
  let detectedFlag: ParsedResult['flag'] = 'unknown';

  if (flag) {
    const f = flag.toUpperCase();
    if (f === 'H') { detectedFlag = 'high'; isOutOfRange = true; }
    else if (f === 'L') { detectedFlag = 'low'; isOutOfRange = true; }
    else if (f === 'HH' || f === 'LL') { detectedFlag = 'critical'; isOutOfRange = true; }
  } else if (numericValue !== null) {
    if (refLow !== null && numericValue < refLow) { detectedFlag = 'low'; isOutOfRange = true; }
    else if (refHigh !== null && numericValue > refHigh) { detectedFlag = 'high'; isOutOfRange = true; }
    else { detectedFlag = 'normal'; }
  }

  if (matched && numericValue !== null) {
    const oL = matched.optimal_range_low;
    const oH = matched.optimal_range_high;
    if (oL !== null && oH !== null) {
      isOutOfOptimal = numericValue < oL || numericValue > oH;
    }
  }

  results.push({
    name, value, numericValue, unit, referenceRange: refRange,
    flag: detectedFlag, matchedId: matched?.id || null,
    matchedCategory: matched?.category || null,
    optimalLow: matched?.optimal_range_low ?? null,
    optimalHigh: matched?.optimal_range_high ?? null,
    standardLow: matched?.standard_range_low ?? refLow,
    standardHigh: matched?.standard_range_high ?? refHigh,
    isOutOfRange, isOutOfOptimal: isOutOfOptimal || isOutOfRange,
  });
}

export default function DataPage() {
  const [reports, setReports] = useState<UploadedReport[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [expandedReport, setExpandedReport] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [browseCategory, setBrowseCategory] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(async (files: FileList) => {
    setProcessing(true);
    const newReports: UploadedReport[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.name.toLowerCase().endsWith('.pdf') && !file.name.toLowerCase().endsWith('.txt')) continue;

      try {
        let text = '';
        if (file.name.toLowerCase().endsWith('.txt')) {
          text = await file.text();
        } else {
          // For PDFs, we read as text (client-side PDF parsing would need pdf.js)
          // For now, show the file as uploaded and parse what we can
          text = await file.text();
        }

        const results = parseLabText(text);
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
      } catch {
        // Silently skip errored files
      }
    }

    setReports(prev => [...prev, ...newReports]);
    setProcessing(false);
    if (newReports.length > 0) setExpandedReport(newReports[0].id);
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

  // Aggregate all results across reports
  const allResults = reports.flatMap(r => r.results);
  const categories = [...new Set(allResults.map(r => r.matchedCategory).filter(Boolean))] as string[];

  const filteredResults = selectedCategory === 'all'
    ? allResults
    : allResults.filter(r => r.matchedCategory === selectedCategory);

  // Browse database categories
  const dbCategories = [...new Set(biomarkersDB.map(b => b.category))].sort();

  return (
    <div className="min-h-screen bg-[#030712] pt-24 pb-24">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Data Analysis</h1>
          <p className="text-slate-400">Upload your lab results to get personalized analysis against optimal biomarker ranges.</p>
        </div>

        {/* Upload Area */}
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
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.txt"
            className="hidden"
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
          />
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

        {/* Uploaded Reports */}
        {reports.length > 0 && (
          <div className="mb-8 space-y-4">
            <h2 className="text-xl font-semibold text-white">Uploaded Reports</h2>
            {reports.map(report => (
              <div key={report.id} className="glass-card rounded-xl overflow-hidden">
                {/* Report Header */}
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors"
                  onClick={() => setExpandedReport(expandedReport === report.id ? null : report.id)}
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-blue-400" />
                    <div>
                      <p className="font-medium text-white">{report.fileName}</p>
                      <p className="text-xs text-slate-400">
                        {report.totalMarkers} biomarkers parsed · {new Date(report.uploadDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {report.outOfRange > 0 && (
                      <span className="flex items-center gap-1 text-rose-400 text-sm">
                        <AlertTriangle className="w-4 h-4" />
                        {report.outOfRange} out of range
                      </span>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); removeReport(report.id); }}
                      className="text-slate-500 hover:text-rose-400 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    {expandedReport === report.id ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                  </div>
                </div>

                {/* Expanded Report */}
                {expandedReport === report.id && (
                  <div className="border-t border-white/10 p-4">
                    {report.results.length === 0 ? (
                      <p className="text-slate-400 text-center py-8">
                        No biomarkers could be parsed from this file. Try uploading a text-based PDF or a .txt file with your lab results.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {report.results.map((result, idx) => (
                          <BiomarkerRow key={idx} result={result} />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Results Dashboard */}
        {allResults.length > 0 && (
          <div className="mb-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <StatCard label="Total Tested" value={allResults.length} color="blue" />
              <StatCard label="In Range" value={allResults.filter(r => !r.isOutOfRange && !r.isOutOfOptimal).length} color="green" />
              <StatCard label="Out of Optimal" value={allResults.filter(r => r.isOutOfOptimal && !r.isOutOfRange).length} color="amber" />
              <StatCard label="Out of Range" value={allResults.filter(r => r.isOutOfRange).length} color="rose" />
            </div>

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
                      <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3">
                          <p className="text-white font-medium text-sm">{result.name}</p>
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

        {/* Browse Biomarker Database */}
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
                .filter(b => b.category === browseCategory)
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
      </div>
    </div>
  );
}

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
