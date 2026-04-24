/**
 * Helper function to make authenticated API calls
 * Extracts session token and includes it in Authorization header
 */

import { supabase } from '@/lib/supabase'

export async function authenticatedFetch(
  url: string,
  options?: RequestInit
): Promise<Response> {
  const { data: { session } } = await supabase.auth.getSession()

  const headers = new Headers(options?.headers || {})

  if (session?.access_token) {
    headers.set('Authorization', `Bearer ${session.access_token}`)
  }

  return fetch(url, {
    ...options,
    headers,
  })
}
