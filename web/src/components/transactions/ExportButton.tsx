'use client'

import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { authenticatedFetch } from '@/lib/auth-fetch'
import { downloadCSV, generateCSVFilename } from '@/lib/csv-export'

interface ExportButtonProps {
  startDate?: string
  endDate?: string
  categoryId?: string
  type?: 'income' | 'expense'
  className?: string
}

/**
 * Export Button Component
 * Exports filtered transactions as CSV
 */
export function ExportButton({
  startDate,
  endDate,
  categoryId,
  type,
  className = '',
}: ExportButtonProps) {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleExport = async () => {
    if (!user) {
      setError('Please login to export')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Build query parameters
      const params = new URLSearchParams()
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)
      if (categoryId) params.append('categoryId', categoryId)
      if (type) params.append('type', type)

      // Fetch CSV from API
      const response = await authenticatedFetch(
        `/api/export/csv?${params.toString()}`,
        {
          method: 'GET',
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to export CSV')
      }

      // Get CSV content as text
      const csv = await response.text()

      // Trigger download in browser
      downloadCSV(csv, generateCSVFilename())
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Export failed'
      setError(errorMsg)
      console.error('Export error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleExport}
        disabled={isLoading || !user}
        className={`
          px-4 py-2 rounded-lg font-medium
          transition-colors duration-200
          ${
            isLoading || !user
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
          }
          ${className}
        `}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Exporting...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            📥
            Export CSV
          </span>
        )}
      </button>

      {error && <p className="text-red-600 text-sm">{error}</p>}
    </div>
  )
}
