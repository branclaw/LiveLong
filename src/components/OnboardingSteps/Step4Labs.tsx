'use client';

import React, { useState } from 'react';
import { useOnboarding } from '@/lib/onboarding-context';
import { Upload } from 'lucide-react';

const BIOMARKERS = [
  'Glucose', 'Insulin', 'HbA1c', 'Total Cholesterol', 'LDL', 'HDL', 'Triglycerides',
  'TSH', 'Free T3', 'Free T4', 'Testosterone', 'DHEA-S', 'Cortisol',
  'Vitamin D', 'B12', 'Folate', 'Iron', 'Magnesium', 'Zinc',
  'C-Reactive Protein', 'Homocysteine', 'Apolipoprotein(a)',
];

export function Step4Labs() {
  const { nextStep, prevStep } = useOnboarding();
  const [isLoading, setIsLoading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      simulateUpload();
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      simulateUpload();
    }
  };

  const simulateUpload = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-white">The Data Vault</h2>
        <p className="text-slate-400">Upload your lab results for personalized insights</p>
      </div>

      {/* Drag and Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-12 text-center transition-all ${
          isDragActive
            ? 'border-blue-500 bg-blue-500/10'
            : 'border-slate-600 bg-slate-800/50 hover:border-slate-500'
        }`}
      >
        {isLoading ? (
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
            </div>
            <p className="text-blue-400 font-semibold">Scanning your labs for 22 longevity markers...</p>
          </div>
        ) : (
          <>
            <Upload className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <p className="text-white font-semibold mb-2">Drop your lab results here</p>
            <p className="text-sm text-slate-400 mb-4">or</p>
            <label className="inline-block">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileInput}
                className="hidden"
              />
              <span className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg cursor-pointer transition-colors">
                Browse Files
              </span>
            </label>
            <p className="text-xs text-slate-500 mt-4">Supported: PDF from Quest, LabCorp, Function Health</p>
          </>
        )}
      </div>

      {/* Biomarkers List */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-300">We'll extract these biomarkers:</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {BIOMARKERS.map(marker => (
            <div
              key={marker}
              className="px-3 py-2 bg-slate-800 border border-slate-700 rounded text-xs text-slate-300"
            >
              {marker}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-4 pt-4">
        <button
          onClick={prevStep}
          className="flex-1 py-3 rounded-lg font-semibold border-2 border-slate-700 text-slate-300 hover:border-slate-600 transition-all"
        >
          Back
        </button>
        <button
          onClick={nextStep}
          className="flex-1 py-3 rounded-lg font-semibold bg-blue-500 hover:bg-blue-600 text-white transition-all"
        >
          Skip for Now
        </button>
      </div>
    </div>
  );
}
