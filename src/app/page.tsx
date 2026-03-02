'use client'

import Link from 'next/link'
import { ChevronRight, Zap, Database, CheckCircle2, BarChart3, Sparkles, TrendingUp, Shield, Compass, Layers } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { useState, useEffect } from 'react'

function AnimatedCounter({ end, duration = 2000 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setCount(Math.floor(end * progress));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [end, duration]);

  return <>{count}</>;
}

export default function Home() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden pt-8">
        {/* Animated gradient glow background */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="absolute w-[800px] h-[800px] bg-gradient-to-r from-blue-900/25 via-transparent to-rose-900/25 rounded-full blur-3xl opacity-40 animate-pulse"></div>
          <div className="absolute w-[600px] h-[600px] bg-gradient-to-r from-rose-900/20 via-transparent to-blue-900/20 rounded-full blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {/* Subtle badge */}
          <div className="mb-6 flex justify-center">
            <Badge variant="emerald" size="sm">
              <Sparkles size={14} />
              Clinical-Grade Protocol Engine
            </Badge>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-8 leading-tight tracking-tight">
            <span className="bg-gradient-to-r from-white via-blue-200 to-blue-300 bg-clip-text text-transparent">
              Stop Guessing.
            </span>
            <br />
            <span className="bg-gradient-to-r from-violet-300 via-white to-blue-200 bg-clip-text text-transparent">
              Start Optimizing.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed">
            The clinical-grade longevity protocol engine that builds your optimal supplement stack — ranked by science, not marketing.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link href="/onboarding">
              <Button size="lg" className="transform hover:scale-105">
                <Zap size={20} />
                Build My Protocol
              </Button>
            </Link>
            <Link href="/browse">
              <Button variant="secondary" size="lg" className="transform hover:scale-105">
                <Database size={20} />
                Browse Database
              </Button>
            </Link>
          </div>

          <p className="text-sm text-slate-400">
            No credit card. No commitment. Just peer-reviewed science.
          </p>
        </div>
      </section>

      {/* Stats Bar with Animated Counters */}
      <section className="glass border-y border-white/10 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: 113, label: 'Compounds Analyzed' },
              { number: 4, label: 'Evidence Tiers' },
              { number: 24, label: 'Health Categories' },
              { label: 'Daily Range', static: '$0.10–$4.66' },
            ].map((stat, idx) => (
              <div key={idx} className="text-center group cursor-pointer">
                <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-400 to-violet-300 bg-clip-text text-transparent mb-2 transition-transform group-hover:scale-110">
                  {'number' in stat && stat.number !== undefined ? <AnimatedCounter end={stat.number} /> : stat.static}
                </div>
                <div className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-12 leading-tight">
            What You Can Do
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <Compass size={28} className="text-blue-400" />,
                title: 'Browse Database',
                description: 'Explore 113 compounds with peer-reviewed research, pricing, and efficacy scores.',
                href: '/browse',
                cta: 'Explore',
              },
              {
                icon: <Zap size={28} className="text-blue-400" />,
                title: 'Get Recommendations',
                description: 'Answer a few questions and receive a personalized longevity protocol backed by science.',
                href: '/recommend',
                cta: 'Start',
              },
              {
                icon: <Layers size={28} className="text-blue-400" />,
                title: 'Compare Stacks',
                description: 'Build and compare different supplement protocols side-by-side to find your ideal mix.',
                href: '/compare',
                cta: 'Compare',
              },
            ].map((feature, idx) => (
              <Card key={idx} hover={true}>
                <div className="flex flex-col h-full">
                  <div className="mb-4 p-3 w-fit rounded-lg bg-blue-500/10 border border-blue-500/30">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-slate-400 mb-6 flex-grow">
                    {feature.description}
                  </p>
                  <Link
                    href={feature.href}
                    className="inline-flex items-center gap-2 text-blue-400 font-semibold hover:text-blue-300 transition-colors group"
                  >
                    {feature.cta}
                    <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white text-center mb-16 leading-tight">
            Three Steps to Clinical Optimization
          </h2>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connection lines (hidden on mobile) */}
            <div className="hidden md:block absolute top-20 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-blue-600/20 via-violet-600/40 to-blue-600/20"></div>

            {[
              {
                step: 1,
                icon: <Zap className="text-white" size={28} />,
                title: 'Tell us your goals',
                description: 'Answer targeted questions about your age, health markers, and longevity priorities.',
              },
              {
                step: 2,
                icon: <BarChart3 className="text-white" size={28} />,
                title: 'We analyze the science',
                description: 'Our algorithm evaluates 113 compounds against peer-reviewed longevity research and your goals.',
              },
              {
                step: 3,
                icon: <CheckCircle2 className="text-white" size={28} />,
                title: 'Get your protocol',
                description: 'Receive a custom protocol with compounds, dosages, timing, and sourcing in your budget.',
              },
            ].map((item, idx) => (
              <div key={idx} className="relative">
                <Card className="h-full">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-14 h-14 glass-subtle bg-blue-500/15 border border-blue-500/40 rounded-full flex items-center justify-center mb-6">
                      {item.icon}
                    </div>
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-violet-500 rounded-full flex items-center justify-center text-white font-bold text-sm mb-4 shadow-lg shadow-blue-500/50">
                      {item.step}
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-3">
                      {item.title}
                    </h3>
                    <p className="text-slate-400 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Problem Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white/5 backdrop-blur-md">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-16 leading-tight">
            <span className="text-rose-400">You're Overpaying</span> for Pixie Dust
          </h2>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Popular Stack Card */}
            <Card variant="default">
              <div className="space-y-1 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="rose" size="sm">
                    Most People
                  </Badge>
                </div>
                <h3 className="text-2xl font-bold text-white">Popular Stack</h3>
              </div>

              <div className="space-y-3 mb-8 pb-8 border-b border-white/10">
                <div className="flex justify-between items-center text-slate-300 hover:text-slate-100 transition-colors">
                  <span>AG1 (marketing-driven)</span>
                  <span className="font-semibold text-rose-400">$79/mo</span>
                </div>
                <div className="flex justify-between items-center text-slate-300 hover:text-slate-100 transition-colors">
                  <span>Ka'Chava (bulk powder)</span>
                  <span className="font-semibold text-rose-400">$40/mo</span>
                </div>
                <div className="flex justify-between items-center text-slate-300 hover:text-slate-100 transition-colors">
                  <span>Random supplements</span>
                  <span className="font-semibold text-rose-400">$50/mo</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">Total Monthly</span>
                <span className="text-2xl font-bold text-rose-400">$169/mo</span>
              </div>
              <p className="text-xs text-slate-500 mt-2">~$5.63/day with unclear impact</p>
            </Card>

            {/* Your Protocol Card */}
            <Card variant="elevated">
              <div className="space-y-1 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="emerald" size="sm" dot>
                    Science-Optimized
                  </Badge>
                </div>
                <h3 className="text-2xl font-bold text-white">Your Protocol</h3>
              </div>

              <div className="space-y-3 mb-8 pb-8 border-b border-white/10">
                <div className="flex justify-between items-center text-slate-300 hover:text-slate-100 transition-colors">
                  <span>Tier 1 Essentials (8)</span>
                  <span className="font-semibold text-blue-400">~$25/mo</span>
                </div>
                <div className="flex justify-between items-center text-slate-300 hover:text-slate-100 transition-colors">
                  <span>Tier 2 Impactful (optional)</span>
                  <span className="font-semibold text-blue-400">$0–10/mo</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">Total Monthly</span>
                <span className="text-2xl font-bold text-blue-400">$25–35/mo</span>
              </div>
              <p className="text-xs text-blue-300/70 mt-2">~$0.80–1.16/day with quantified impact</p>
            </Card>
          </div>

          <div className="text-center">
            <Link href="/browse">
              <Button variant="ghost" className="group">
                <span>See the full ingredient breakdown</span>
                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Expert-Backed Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-4">
            Protocols Informed by Leading Researchers
          </h2>
          <p className="text-slate-400 text-center mb-12 text-lg">
            Our compound selection and dosing are grounded in peer-reviewed longevity science
          </p>

          <Card>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { name: 'Andrew Huberman', field: 'Neuroscience' },
                { name: 'Peter Attia', field: 'Longevity Medicine' },
                { name: 'Paul Hopkins', field: 'NAD+ Research' },
                { name: 'Bryan Johnson', field: 'Blueprint' },
                { name: 'Meta-Analysis', field: 'Clinical Consensus' },
              ].map((researcher, idx) => (
                <div
                  key={idx}
                  className="glass-subtle p-4 rounded-lg border border-white/10 hover:border-blue-500/30 hover:bg-blue-500/10 transition-all duration-300"
                >
                  <div className="text-blue-400 font-semibold text-sm truncate">
                    {researcher.name}
                  </div>
                  <div className="text-xs text-slate-500 mt-1 truncate">
                    {researcher.field}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      {/* Tier System Preview */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white/5 backdrop-blur-md">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-4">
            The 4-Tier Evidence System
          </h2>
          <p className="text-slate-400 text-center mb-12 text-lg">
            We rank compounds by evidence strength and impact potential
          </p>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                tier: 'Tier 1',
                badge: 'emerald',
                title: 'Essential',
                subtitle: 'Non-negotiable foundations',
                description: 'High-evidence longevity compounds with proven safety profiles.',
              },
              {
                tier: 'Tier 2',
                badge: 'blue',
                title: 'Impactful',
                subtitle: 'High-impact targeting',
                description: 'Strong evidence with specific longevity benefits.',
              },
              {
                tier: 'Tier 3',
                badge: 'amber',
                title: 'Nice to Have',
                subtitle: 'Advanced optimization',
                description: 'Moderate evidence for fine-tuning protocols.',
              },
              {
                tier: 'Tier 4',
                badge: 'slate',
                title: 'Not Worth It',
                subtitle: 'Low ROI compounds',
                description: 'We tell you which hypes to skip.',
              },
            ].map((item, idx) => (
              <Card key={idx} variant="default" hover={true}>
                <div className="flex flex-col h-full">
                  <Badge
                    variant={item.badge as any}
                    size="sm"
                    className="w-fit mb-3"
                  >
                    {item.tier}
                  </Badge>
                  <h3 className="text-xl font-semibold text-white mb-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-400 mb-4 flex-grow">
                    {item.subtitle}
                  </p>
                  <p className="text-sm text-slate-400">
                    {item.description}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Database Preview */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-4">
            Built on Clinical Data
          </h2>
          <p className="text-slate-400 text-center mb-12 text-lg">
            Every compound analyzed across multiple longevity dimensions
          </p>

          <div className="grid md:grid-cols-4 gap-6 mb-12">
            {[
              {
                name: 'NMN',
                benefit: 'NAD+ Precursor',
                cost: '$0.45/day',
                tier: '1',
              },
              {
                name: 'Resveratrol',
                benefit: 'Sirtuin Activator',
                cost: '$0.35/day',
                tier: '1',
              },
              {
                name: 'Metformin',
                benefit: 'mTOR Inhibitor',
                cost: '$0.15/day',
                tier: '1',
              },
              {
                name: 'Omega-3 (Fish Oil)',
                benefit: 'Brain & Cardio',
                cost: '$0.30/day',
                tier: '1',
              },
            ].map((compound, idx) => (
              <Card key={idx} variant="default" hover={true}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {compound.name}
                    </h3>
                    <Badge variant="emerald" size="sm" className="mt-2">
                      Tier {compound.tier}
                    </Badge>
                  </div>
                  <Database size={18} className="text-blue-400" />
                </div>
                <p className="text-sm text-slate-400 mb-4">{compound.benefit}</p>
                <div className="pt-4 border-t border-slate-700/50">
                  <p className="text-blue-400 font-semibold text-sm">
                    {compound.cost}
                  </p>
                </div>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Link href="/browse">
              <Button variant="ghost" className="group">
                <span>Explore all 113 compounds</span>
                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative py-16 sm:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-b from-slate-900/30 to-slate-950/50">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="absolute w-[600px] h-[600px] bg-gradient-to-r from-blue-900/20 via-transparent to-rose-900/20 rounded-full blur-3xl opacity-25"></div>
        </div>

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-5xl font-bold text-white mb-6 leading-tight">
            Your personalized longevity protocol awaits
          </h2>
          <p className="text-lg text-slate-300 mb-12">
            Start optimizing in 5 minutes. Begin seeing results in weeks.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/onboarding">
              <Button size="lg" className="transform hover:scale-105">
                <Shield size={20} />
                Get Started Free
              </Button>
            </Link>
            <Link href="/browse">
              <Button variant="secondary" size="lg">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
