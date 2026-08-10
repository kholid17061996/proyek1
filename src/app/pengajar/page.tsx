'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabase/client'
import { CheckSquare, Target, Users, BookOpen, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function PengajarDashboard() {
  const [profile, setProfile] = useState<any>(null)
  const [pengajarData, setPengajarData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalSantri: 0,
    setoranHariIni: 0,
    mutabaahHariIni: 0
  })

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      // 1. Ambil Profile
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(prof)

      // 2. Ambil data Pengajar terkait profil ini
      const { data: pData } = await supabase.from('pengajar').select('*').eq('profile_id', user.id).single()
      setPengajarData(pData)

      if (pData) {
        const today = new Date().toISOString().split('T')[0]

        // 3. Ambil statistik
        const [resSantri, resSetoran, resMutabaah] = await Promise.all([
          supabase.from('santri').select('id', { count: 'exact' }).eq('pengajar_id', pData.id),
          supabase.from('setoran_hafalan').select('id', { count: 'exact' }).eq('pengajar_id', pData.id).eq('tanggal_setoran', today),
          supabase.from('mutabaah_harian').select('id', { count: 'exact' }).eq('pengajar_id', pData.id).eq('tanggal', today)
        ])

        setStats({
          totalSantri: resSantri.count || 0,
          setoranHariIni: resSetoran.count || 0,
          mutabaahHariIni: resMutabaah.count || 0
        })
      }
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-900 to-slate text-white rounded-3xl p-8 shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Ahlan wa Sahlan, {profile?.full_name || 'Ustaz/Ustazah'}</h1>
        <p className="text-blue-100 opacity-90">
          Selamat datang di Dashboard Pengajar. Semoga Allah memberkahi waktu Anda dalam membersamai para penghafal Al-Qur'an.
        </p>
        
        {pengajarData && (
          <div className="mt-6 inline-flex gap-4 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl text-sm">
            <span><strong>Kode:</strong> {pengajarData.kode_pengajar}</span>
            <span>|</span>
            <span><strong>Kelas/Kelompok:</strong> {pengajarData.kelas || 'Belum diatur'}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {/* Stat Card 1 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users size={28} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Santri Bimbingan</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalSantri}</p>
          </div>
        </div>

        {/* Stat Card 2 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
            <CheckSquare size={28} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Mutaba'ah Hari Ini</p>
            <p className="text-2xl font-bold text-gray-900">{stats.mutabaahHariIni}</p>
          </div>
        </div>

        {/* Stat Card 3 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-emas/10 text-yellow-600 flex items-center justify-center">
            <Target size={28} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Setoran Hari Ini</p>
            <p className="text-2xl font-bold text-gray-900">{stats.setoranHariIni}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <Link href="/pengajar/mutabaah" className="group block bg-white rounded-3xl border border-gray-100 p-8 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
            <CheckSquare size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Mutaba'ah Harian</h3>
          <p className="text-gray-500 text-sm">Input data kehadiran, kedisiplinan, dan laporan amalan yaumi santri setiap harinya.</p>
        </Link>
        
        <Link href="/pengajar/setoran" className="group block bg-white rounded-3xl border border-gray-100 p-8 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
          <div className="w-16 h-16 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
            <BookOpen size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Input Setoran Hafalan</h3>
          <p className="text-gray-500 text-sm">Catat capaian target, hafalan baru (ziyadah), dan kelancaran murojaah santri.</p>
        </Link>
      </div>
    </div>
  )
}
