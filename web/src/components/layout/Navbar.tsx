'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

export function Navbar() {
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/auth/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  if (!user) {
    return null
  }

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/dashboard" className="text-2xl font-bold text-blue-600">
              💰 Expense Tracker
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-4">
            <Link
              href="/dashboard"
              className="text-gray-700 hover:text-blue-600 font-medium"
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/transactions"
              className="text-gray-700 hover:text-blue-600 font-medium"
            >
              Transactions
            </Link>
            <Link
              href="/dashboard/reports"
              className="text-gray-700 hover:text-blue-600 font-medium"
            >
              Reports
            </Link>
            <Link
              href="/dashboard/budgets"
              className="text-gray-700 hover:text-blue-600 font-medium"
            >
              Budgets
            </Link>
            <Link
              href="/dashboard/recurring"
              className="text-gray-700 hover:text-blue-600 font-medium"
            >
              Recurring
            </Link>

            {/* User Menu */}
            <div className="flex items-center space-x-4 border-l pl-4">
              <span className="text-sm text-gray-600">{user.email}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
