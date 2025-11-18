import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY

if (!supabaseUrl || !supabaseKey) {
  const errorMsg = 'Supabase 环境变量未配置，请在 .env 中设置 VITE_SUPABASE_URL 和 VITE_SUPABASE_KEY'
  // eslint-disable-next-line no-console
  console.error(errorMsg)
  throw new Error(errorMsg)
}

export const supabase = createClient(supabaseUrl, supabaseKey)

