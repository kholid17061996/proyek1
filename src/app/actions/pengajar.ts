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

export async function upsertTargetSantri(data: {
  santri_id: string
  target_ziyadah: number
  target_murojaah: number
  target_tasmi: number
  target_pilihan: number
  target_hadits: number
  target_doa: number
}) {
  const supabaseAdmin = getAdminClient()
  try {
    const { data: result, error } = await supabaseAdmin
      .from('target_santri')
      .upsert({
        santri_id: data.santri_id,
        target_ziyadah: data.target_ziyadah,
        target_murojaah: data.target_murojaah,
        target_tasmi: data.target_tasmi,
        target_pilihan: data.target_pilihan,
        target_hadits: data.target_hadits,
        target_doa: data.target_doa,
        updated_at: new Date().toISOString()
      }, { onConflict: 'santri_id' })

    if (error) return { error: error.message }
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function insertLaporanPekanan(data: {
  santri_id: string
  tanggal_laporan: string
  kehadiran_persen: number
  predikat_adab: string
  komentar_guru: string
  saran_ortu: string
}) {
  const supabaseAdmin = getAdminClient()
  try {
    const { data: result, error } = await supabaseAdmin
      .from('laporan_pekanan')
      .insert({
        santri_id: data.santri_id,
        tanggal_laporan: data.tanggal_laporan,
        kehadiran_persen: data.kehadiran_persen,
        predikat_adab: data.predikat_adab,
        komentar_guru: data.komentar_guru,
        saran_ortu: data.saran_ortu
      })

    if (error) return { error: error.message }
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function getTargetSantri(santriId: string) {
  const supabaseAdmin = getAdminClient()
  try {
    const { data, error } = await supabaseAdmin
      .from('target_santri')
      .select('*')
      .eq('santri_id', santriId)
      .single()
    return { data }
  } catch (err: any) {
    return { error: err.message }
  }
}
