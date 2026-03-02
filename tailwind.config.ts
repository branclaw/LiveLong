import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        midnight: '#030712',
        emerald: '#22C55E',
        rose: '#F43F5E',
        dna: {
          blue: '#3B82F6',
          deep: '#1D4ED8',
          light: '#60A5FA',
          glow: '#93C5FD',
        },
        coral: {
          DEFAULT: '#F97316',
          light: '#FB923C',
          dark: '#EA580C',
        },
        life: {
          green: '#22C55E',
          light: '#4ADE80',
          dark: '#16A34A',
        },
        bio: {
          50: '#F0F9FF',
          100: '#E0F2FE',
          200: '#BAE6FD',
          300: '#7DD3FC',
          400: '#38BDF8',
          500: '#0EA5E9',
          600: '#0284C7',
          700: '#0369A1',
          800: '#075985',
          900: '#0C4A6E',
          950: '#082F49',
        },
        slate: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
          950: '#020617',
        },
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
        body: ['Work Sans', 'sans-serif'],
        heading: ['Outfit', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-dna': 'linear-gradient(135deg, #3B82F6, #8B5CF6, #F97316)',
        'gradient-bio': 'linear-gradient(135deg, #0EA5E9, #3B82F6, #8B5CF6)',
        'gradient-life': 'linear-gradient(135deg, #22C55E, #0EA5E9, #3B82F6)',
      },
      boxShadow: {
        'dna': '0 0 30px rgba(59, 130, 246, 0.15)',
        'coral': '0 0 30px rgba(249, 115, 22, 0.15)',
        'life': '0 0 30px rgba(34, 197, 94, 0.15)',
        'glow-blue': '0 0 40px rgba(59, 130, 246, 0.25)',
        'glow-coral': '0 0 40px rgba(249, 115, 22, 0.25)',
      },
    },
  },
  plugins: [],
}
export default config
