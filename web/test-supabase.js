// Test file - run this to verify Supabase connection
// Paste this in browser console or create a test file

const supabaseUrl = 'https://jrvnjntywyjmwskrdbsm.supabase.co'
const supabaseKey = 'sb_publishable_9ANIc1muL5mqMJyQb5NEow_kZu6gF4a'

console.log('Testing Supabase connection...')
console.log('URL:', supabaseUrl)
console.log('Key length:', supabaseKey.length)

// Try a simple fetch to Supabase
fetch(`${supabaseUrl}/rest/v1/`, {
  headers: {
    'apikey': supabaseKey,
  }
})
  .then(res => {
    console.log('Status:', res.status)
    if (res.status === 401) {
      console.error('❌ Invalid API key or not authenticated')
    } else {
      console.log('✅ Connection successful!')
    }
    return res.json()
  })
  .catch(err => {
    console.error('❌ Connection failed:', err.message)
  })
