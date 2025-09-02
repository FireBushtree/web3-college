import type { ReactNode } from 'react'
import BackgroundIcons from './BackgroundIcons'
import Header from './Header'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative">
      <BackgroundIcons />
      <Header />
      <main className="container mx-auto px-4 pt-24 pb-8 relative z-10">
        {children}
      </main>
    </div>
  )
}
