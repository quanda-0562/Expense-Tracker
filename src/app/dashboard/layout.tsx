'use client'

import { ReactNode, useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)

  // Only run checks after component is mounted to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return
    
    console.log('[Dashboard] Auth state:', { user: user?.email, loading })
    
    // Only redirect if we've finished loading AND there's no user
    if (!loading && !user) {
      console.log('[Dashboard] No user found, redirecting to login')
      router.push('/auth/login')
    }
  }, [loading, user, isMounted, router])

  // Show loading state
  if (loading || !isMounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // If no user after loading, show nothing (router will redirect)
  if (!user) {
    return null
  }

  // Show dashboard
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
