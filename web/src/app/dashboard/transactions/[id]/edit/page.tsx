'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { TransactionForm } from '@/components/transactions/TransactionForm'
import { Transaction, Category } from '@/types'
import { authenticatedFetch } from '@/lib/auth-fetch'

export default function EditTransactionPage() {
  const params = useParams()
  const [transaction, setTransaction] = useState<Transaction | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch transaction
        const txResponse = await authenticatedFetch(`/api/transactions/${params.id}`)
        if (!txResponse.ok) {
          setError('Transaction not found')
          return
        }
        const txData = await txResponse.json()
        setTransaction(txData.data)

        // Fetch categories
        const catResponse = await authenticatedFetch('/api/categories')
        if (catResponse.ok) {
          const catData = await catResponse.json()
          setCategories(catData.data || [])
        }
      } catch (err) {
        console.error('Failed to fetch data:', err)
        setError('Failed to load transaction')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchData()
    }
  }, [params.id])

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">{error}</div>
  }

  if (!transaction) {
    return <div className="text-center py-8">Transaction not found</div>
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Edit Transaction</h1>
      <TransactionForm categories={categories} initialData={transaction} />
    </div>
  )
}
