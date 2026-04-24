'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { RegisterForm } from '@/components/auth/RegisterForm'

export default function RegisterPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const redirectTimeoutRef = useRef<NodeJS.Timeout>()

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (!loading && user) {
      console.log('[RegisterPage] User detected, scheduling redirect to dashboard')
      
      // Clear any existing timeout
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current)
      }
      
      // Use a timeout to ensure state is fully settled
      redirectTimeoutRef.current = setTimeout(() => {
        console.log('[RegisterPage] Executing redirect to dashboard')
        try {
          router.push('/dashboard')
        } catch (err) {
          console.error('[RegisterPage] Redirect error:', err)
        }
      }, 300)
    }
    
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current)
      }
    }
  }, [user, loading, router])

  const handleSuccess = () => {
    console.log('[RegisterPage] Form success - redirect will be handled by useEffect')
    // Don't navigate here - let useEffect handle it based on user state
  }

  return <RegisterForm onSuccess={handleSuccess} />
}
