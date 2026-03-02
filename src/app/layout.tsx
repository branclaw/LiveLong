import type { Metadata } from 'next'
import { Outfit, Work_Sans } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/Providers'
import { Navbar } from '@/components/Navbar'
import { BudgetFooter } from '@/components/BudgetFooter'

const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' })
const workSans = Work_Sans({ subsets: ['latin'], variable: '--font-work-sans' })

export const metadata: Metadata = {
  title: 'The Longevity Navigator — Clinical Supplement Protocol Engine',
  description:
    'Build your personalized longevity protocol from 113 compounds ranked by peer-reviewed science. Replace guesswork with data-driven supplementation for optimal healthspan.',
  keywords: [
    'longevity',
    'supplements',
    'protocol',
    'NAD+',
    'clinical',
    'resveratrol',
    'NMN',
    'healthspan',
    'optimization',
  ],
  authors: [{ name: 'The Longevity Navigator' }],
  creator: 'The Longevity Navigator',
  metadataBase: new URL('https://longevity-navigator.com'),

  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://longevity-navigator.com',
    siteName: 'The Longevity Navigator',
    title: 'Build Your Personalized Longevity Protocol',
    description:
      'Clinical-grade supplement recommendations ranked by peer-reviewed science. Stop overpaying for marketing hype.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'The Longevity Navigator',
        type: 'image/png',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'The Longevity Navigator — Clinical Supplement Protocol',
    description:
      'Personalized longevity protocols from 113 compounds. Science over marketing.',
    images: ['/og-image.png'],
    creator: '@longevity_nav',
  },

  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
    'max-snippet': -1,
    'max-video-preview': -1,
  },

  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Longevity Navigator',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#030712" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <script
          async
          src="https://cdn.splitbee.io/sb.js"
          suppressHydrationWarning
        ></script>
      </head>
      <body className={`${outfit.variable} ${workSans.variable} font-sans`}>
        <Providers>
          {/* Ambient gradient orbs - Biomimetic Dark */}
          <div className="fixed inset-0 pointer-events-none overflow-hidden">
            {/* DNA Blue orb - top left */}
            <div className="absolute -top-32 -left-32 w-[700px] h-[700px] rounded-full blur-[120px] opacity-[0.12] bg-gradient-to-br from-blue-500 via-blue-600 to-transparent float-orb-1" />

            {/* Violet orb - center right */}
            <div className="absolute top-1/4 -right-32 w-[600px] h-[600px] rounded-full blur-[100px] opacity-[0.08] bg-gradient-to-bl from-violet-500 via-purple-600 to-transparent float-orb-2" />

            {/* Coral orb - bottom left */}
            <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] rounded-full blur-[100px] opacity-[0.06] bg-gradient-to-t from-orange-500 via-amber-500 to-transparent float-orb-3" />

            {/* Life green orb - bottom right */}
            <div className="absolute bottom-1/3 right-1/3 w-[400px] h-[400px] rounded-full blur-[80px] opacity-[0.06] bg-gradient-to-tl from-green-500 via-emerald-500 to-transparent" style={{ animation: 'floatOrb 28s ease-in-out infinite', animationDelay: '1s' }} />
          </div>

          <Navbar />
          <main className="relative min-h-screen bg-[#030712] text-white pt-16 pb-24">
            {children}
          </main>
          <BudgetFooter />
        </Providers>
      </body>
    </html>
  )
}
