'use client'

import { useRouter } from 'next/navigation'
import { LoginForm } from '@/components/auth/LoginForm'

export default function LoginPage() {
  const router = useRouter()

  const handleSuccess = () => {
    router.push('/dashboard')
  }

  return <LoginForm onSuccess={handleSuccess} />
}
