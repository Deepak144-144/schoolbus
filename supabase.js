import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rybiazjythzsmzlgrqlm.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_J7V9QxX_otsBZb4TMwgsjg_ZIWujU1s'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)