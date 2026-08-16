'use server'

import { createClient } from '@supabase/supabase-js'
import { getCurrentAcademicPeriod } from '@/utils/dateHelpers'

export async function searchSantriAction(query: string) {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    return { error: 'Kunci konfigurasi SUPABASE_SERVICE_ROLE_KEY belum disetel.' }
  }

  // Gunakan admin client agar bisa membypass RLS saat belum login
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  try {
    const { data, error } = await supabaseAdmin
      .from('santri')
      .select('id, nama, nis, kelas(nama)')
      .ilike('nama', `%${query}%`)
      .eq('status', 'aktif')
      .limit(5)

    if (error) {
      return { error: 'Gagal mencari data: ' + error.message }
    }

    return { data }
  } catch (err: any) {
    return { error: 'Terjadi kesalahan sistem.' }
  }
}

export async function getSantriDashboardData(santriId: string) {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    return { error: 'Kunci konfigurasi SUPABASE_SERVICE_ROLE_KEY belum disetel.' }
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  try {
    const { semester, tahun_ajaran } = getCurrentAcademicPeriod()
    
    const [resSantri, resCapaian, resTarget, resLaporan, resQuran] = await Promise.all([
      supabaseAdmin.from('santri').select('*, kelas(nama), pengajar(nama)').eq('id', santriId).single(),
      supabaseAdmin.from('setoran_hafalan').select('*').eq('santri_id', santriId).order('created_at', { ascending: false }),
      supabaseAdmin.from('target_santri')
        .select('*')
        .eq('santri_id', santriId)
        .eq('semester', semester)
        .eq('tahun_ajaran', tahun_ajaran)
        .maybeSingle(),
      supabaseAdmin.from('laporan_pekanan').select('*').eq('santri_id', santriId).order('tanggal_laporan', { ascending: false }).limit(1).maybeSingle(),
      supabaseAdmin.from('master_quran').select('*')
    ])

    if (resSantri.error) {
      return { error: 'Gagal memuat data santri: ' + resSantri.error.message }
    }

    return { 
      data: {
        santri: resSantri.data,
        riwayatCapaian: resCapaian.data || [],
        targetSantri: resTarget.data,
        laporanTerakhir: resLaporan.data,
        masterQuran: resQuran.data || []
      }
    }
  } catch (err: any) {
    return { error: 'Terjadi kesalahan sistem.' }
  }
}

export async function getAllSantriNamesAction() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    return { error: 'Kunci konfigurasi SUPABASE_SERVICE_ROLE_KEY belum disetel.' }
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  try {
    const { data, error } = await supabaseAdmin
      .from('santri')
      .select('nama')
      .eq('status', 'aktif')

    if (error) {
      return { error: 'Gagal mengambil data: ' + error.message }
    }

    const names = data.map(s => s.nama)
    return { data: names }
  } catch (err: any) {
    return { error: 'Terjadi kesalahan sistem.' }
  }
}

export async function getAllUserEmailsAction() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    return { error: 'Kunci konfigurasi SUPABASE_SERVICE_ROLE_KEY belum disetel.' }
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  try {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers()

    if (error) {
      return { error: 'Gagal mengambil data email.' }
    }

    const emails = data.users.map(u => u.email).filter(Boolean) as string[]
    return { data: emails }
  } catch (err: any) {
    return { error: 'Terjadi kesalahan sistem.' }
  }
}
