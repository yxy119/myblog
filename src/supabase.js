import { createClient } from '@supabase/supabase-js'

console.log('import.meta.env', import.meta.env)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY
console.log('supabaseUrl', supabaseUrl)
console.log('supabaseKey', supabaseKey)
if (!supabaseUrl || !supabaseKey) {
  const errorMsg =
    'Supabase 环境变量未配置，请在 .env 中设置 VITE_SUPABASE_URL 与 VITE_SUPABASE_ANON_KEY'
  // eslint-disable-next-line no-console
  console.error(errorMsg)
  throw new Error(errorMsg)
  
}

export const supabase = createClient(supabaseUrl, supabaseKey)

