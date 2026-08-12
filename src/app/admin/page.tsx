import { Users, UserCircle, BookOpen, Target } from 'lucide-react'
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

export const revalidate = 0; // Disable caching to always show live stats

export default async function AdminDashboard() {
  const supabaseAdmin = getAdminClient()

  const today = new Date().toISOString().split('T')[0]

  const [resSantri, resPengajar, resSetoran] = await Promise.all([
    supabaseAdmin.from('santri').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('pengajar').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('setoran_hafalan').select('id', { count: 'exact', head: true }).eq('tanggal_setoran', today)
  ])

  const totalSantri = resSantri.count || 0
  const totalPengajar = resPengajar.count || 0
  const setoranHariIni = resSetoran.count || 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Utama</h1>
        <p className="text-gray-500 mt-1">Ringkasan data sistem Mutaba'ah Tahfidz secara langsung (Real-Time).</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Stat Card 1 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <BookOpen size={28} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Santri</p>
            <p className="text-2xl font-bold text-gray-900">{totalSantri}</p>
          </div>
        </div>

        {/* Stat Card 2 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
            <UserCircle size={28} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Pengajar</p>
            <p className="text-2xl font-bold text-gray-900">{totalPengajar}</p>
          </div>
        </div>

        {/* Stat Card 3 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-emas/10 text-yellow-600 flex items-center justify-center">
            <Target size={28} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Setoran Hari Ini</p>
            <p className="text-2xl font-bold text-gray-900">{setoranHariIni}</p>
          </div>
        </div>

      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Pantau Aktivitas</h3>
        <p className="text-gray-500">Anda dapat melihat daftar riwayat capaian santri secara lengkap di menu "Data Santri".</p>
      </div>
    </div>
  )
}
