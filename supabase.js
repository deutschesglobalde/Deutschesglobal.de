/* _integration/supabase.js
   Supabase client + fallback helpers (injected by assistant).
   Supabase URL/key are baked in as requested.
*/
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const SUPABASE_URL = 'https://rggvojbfcgmhotxmiist.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJnZ3ZvamJmY2dtaG90eG1paXN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1MDM3NzMsImV4cCI6MjA3MzA3OTc3M30.OXXx6LGvRc59rh8LmpLWPxttPTIK8fZi8gwryXK0UvA'
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const FALLBACK_KEY = 'deutscheglobal:fallback:v1'

function readFallback() {
  try { return JSON.parse(localStorage.getItem(FALLBACK_KEY) || '{}') } catch(e){ return {} }
}
function writeFallback(obj) {
  try { localStorage.setItem(FALLBACK_KEY, JSON.stringify(obj)) } catch(e){ console.warn(e) }
}

export function saveToFallback(table, data) {
  const f = readFallback()
  if (!f[table]) f[table] = []
  f[table].push(Object.assign({ _savedAt: new Date().toISOString() }, data))
  writeFallback(f)
  return true
}

export function loadFallback(table) {
  const f = readFallback()
  return f[table] || []
}

export async function selectWithFallback(table, filters = {}) {
  try {
    let query = supabase.from(table).select('*')
    for (const [k,v] of Object.entries(filters)) {
      if (Array.isArray(v)) query = query.in(k, v)
      else query = query.eq(k, v)
    }
    const { data, error } = await query
    if (error) throw error
    return { data }
  } catch (err) {
    console.warn('Supabase select failed, using fallback', err)
    const data = loadFallback(table)
    // simple local filtering
    const keys = Object.keys(filters)
    const filtered = data.filter(row => keys.every(k => {
      const v = filters[k]
      if (Array.isArray(v)) return v.includes(row[k])
      return row[k] === v
    }))
    return { data: filtered, fallback: true }
  }
}

export async function insertWithFallback(table, row) {
  try {
    const { data, error } = await supabase.from(table).insert([row]).select()
    if (error) throw error
    return { ok: true, data }
  } catch (err) {
    console.warn('Supabase insert failed, saving to fallback', err)
    saveToFallback(table, row)
    return { ok: false, fallback: true, row }
  }
}

// Sync helper to push local fallback to Supabase (run manually)
export async function syncFallbackToSupabase() {
  const f = readFallback()
  const tables = Object.keys(f)
  const results = {}
  for (const t of tables) {
    const rows = f[t] || []
    const pushed = []
    for (const r of rows) {
      try {
        const { data, error } = await supabase.from(t).insert([r]).select()
        if (error) throw error
        pushed.push({ ok: true, data })
      } catch(e) {
        pushed.push({ ok: false, error: String(e) })
      }
    }
    results[t] = pushed
  }
  // If all ok, clear fallback
  const allOk = Object.values(results).every(arr => arr.every(x=>x.ok))
  if (allOk) localStorage.removeItem(FALLBACK_KEY)
  return results
}
