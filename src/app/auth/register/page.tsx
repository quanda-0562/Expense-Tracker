'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { RegisterForm } from '@/components/auth/RegisterForm'

export default function RegisterPage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  // If already logged in, redirect to dashboard
  useEffect(() => {
    console.log('[RegisterPage] Auth check:', { user: user?.email, loading })
    if (!loading && user) {
      console.log('[RegisterPage] User already logged in, redirecting to dashboard')
      router.replace('/dashboard')
    }
  }, [user, loading, router])

  const handleSuccess = () => {
    console.log('[RegisterPage] Registration success callback, redirecting...')
    router.replace('/dashboard')
  }

  return <RegisterForm onSuccess={handleSuccess} />
}
