'use client'

import { useEffect, useState } from 'react'
import { TransactionList } from '@/components/transactions/TransactionList'
import { Category } from '@/types'
import { authenticatedFetch } from '@/lib/auth-fetch'

export default function TransactionsPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await authenticatedFetch('/api/categories')
        if (response.ok) {
          const data = await response.json()
          setCategories(data.data || [])
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Transactions</h1>
      <TransactionList categories={categories} />
    </div>
  )
}
