/**
 * CSV Export utility for transactions
 * Converts transaction data to CSV format
 */

export interface TransactionForExport {
  date: string
  type: 'income' | 'expense'
  amount: number
  category_name: string
  description: string | null
}

/**
 * Convert transactions to CSV string
 */
export function transactionsToCSV(transactions: TransactionForExport[]): string {
  // CSV headers
  const headers = ['Date', 'Type', 'Amount', 'Category', 'Description']
  
  // Convert each transaction to CSV row
  const rows = transactions.map(tx => [
    escapeCSVField(tx.date),
    escapeCSVField(tx.type),
    escapeCSVField(tx.amount.toFixed(2)),
    escapeCSVField(tx.category_name),
    escapeCSVField(tx.description || ''),
  ])

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(',')),
  ].join('\n')

  return csvContent
}

/**
 * Escape CSV field values (handle commas, quotes, newlines)
 */
function escapeCSVField(field: string | number): string {
  const stringField = String(field)
  
  // If field contains comma, newline, or quote, wrap in quotes and escape quotes
  if (stringField.includes(',') || stringField.includes('\n') || stringField.includes('"')) {
    return `"${stringField.replace(/"/g, '""')}"` // Escape quotes by doubling them
  }
  
  return stringField
}

/**
 * Generate CSV blob for download
 */
export function generateCSVBlob(csv: string): Blob {
  return new Blob([csv], { type: 'text/csv;charset=utf-8;' })
}

/**
 * Trigger CSV download in browser
 */
export function downloadCSV(csv: string, filename: string = 'transactions.csv'): void {
  const blob = generateCSVBlob(csv)
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Generate filename with current date
 */
export function generateCSVFilename(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  
  return `transactions-${year}-${month}-${day}.csv`
}
