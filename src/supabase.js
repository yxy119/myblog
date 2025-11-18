import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY

if (!supabaseUrl || !supabaseKey) {
  // eslint-disable-next-line no-console
  console.warn('Supabase 环境变量未配置，请在 .env 中设置 VITE_SUPABASE_URL 和 VITE_SUPABASE_KEY')
}

export const supabase = createClient(supabaseUrl ?? '', supabaseKey ?? '')

