'use server'

import { createClient } from '@supabase/supabase-js'

const getAdminClient = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    throw new Error('Kunci konfigurasi SUPABASE_SERVICE_ROLE_KEY belum disetel.')
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

export async function getPengaturanBoolean(key: string): Promise<boolean> {
  const supabaseAdmin = getAdminClient()
  try {
    const { data } = await supabaseAdmin
      .from('pengaturan')
      .select('value')
      .eq('key', key)
      .maybeSingle()
      
    if (data && data.value === 'true') {
      return true
    }
    return false
  } catch (err) {
    console.error('Error fetching pengaturan:', err)
    return false
  }
}

export async function setPengaturanBoolean(key: string, value: boolean, description?: string) {
  const supabaseAdmin = getAdminClient()
  try {
    const { error } = await supabaseAdmin
      .from('pengaturan')
      .upsert({
        key,
        value: value ? 'true' : 'false',
        description: description || '',
        updated_at: new Date().toISOString()
      }, { onConflict: 'key' })
      
    if (error) return { error: error.message }
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}
