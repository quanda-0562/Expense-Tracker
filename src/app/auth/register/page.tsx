'use client'

import { useRouter } from 'next/navigation'
import { RegisterForm } from '@/components/auth/RegisterForm'

export default function RegisterPage() {
  const router = useRouter()

  const handleSuccess = () => {
    router.push('/dashboard')
  }

  return <RegisterForm onSuccess={handleSuccess} />
}
