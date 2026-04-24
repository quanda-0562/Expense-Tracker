'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { LoginForm } from '@/components/auth/LoginForm'

export default function LoginPage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  // If already logged in, redirect to dashboard
  useEffect(() => {
    console.log('[LoginPage] Auth check:', { user: user?.email, loading })
    if (!loading && user) {
      console.log('[LoginPage] User already logged in, redirecting to dashboard')
      router.replace('/dashboard')
    }
  }, [user, loading, router])

  const handleSuccess = () => {
    console.log('[LoginPage] Login success callback, redirecting...')
    router.replace('/dashboard')
  }

  // Show login form while loading or if not authenticated
  return <LoginForm onSuccess={handleSuccess} />
}
