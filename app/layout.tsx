import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const inter = Inter({ subsets: ['latin'] })

const BASE_URL = 'https://www.resumenow.in'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Resume Expert — India's Best Resume Templates",
    template: '%s | Resume Expert',
  },
  description: 'Download ATS-friendly, recruiter-approved resume templates designed for Indian job seekers. Get hired 2x faster with professional PDF format.',
  keywords: ['resume templates India', 'ATS resume', 'professional resume', 'CV templates India', 'resume download', 'job resume India'],
  authors: [{ name: 'Resume Expert' }],
  creator: 'Resume Expert',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: BASE_URL,
    siteName: 'Resume Expert',
    title: "Resume Expert — India's Best Resume Templates",
    description: 'ATS-friendly resume templates for Indian job seekers. Download in PDF. Trusted by 1,000+ professionals.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Resume Expert — Resume Templates' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Resume Expert — India's Best Resume Templates",
    description: 'ATS-friendly resume templates for Indian job seekers.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  alternates: {
    canonical: BASE_URL,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-white text-gray-900 antialiased`}>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
