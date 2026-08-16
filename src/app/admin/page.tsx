import { Users, UserCircle, BookOpen, Target } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'
import ToleransiToggle from '@/components/ToleransiToggle'

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
        <h1 className="text-2xl font-bold text-white">Dashboard Utama</h1>
        <p className="text-white/80 mt-1">Ringkasan data sistem Mutaba'ah Tahfidz secara langsung (Real-Time).</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Stat Card 1 */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.1)] border border-white/20 flex items-center gap-4 hover:bg-white/20 transition-colors cursor-default">
          <div className="w-14 h-14 rounded-xl bg-white/20 text-white flex items-center justify-center shadow-inner border border-white/30">
            <BookOpen size={28} />
          </div>
          <div>
            <p className="text-sm text-white/80 font-medium">Total Santri</p>
            <p className="text-2xl font-bold text-white">{totalSantri}</p>
          </div>
        </div>

        {/* Stat Card 2 */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.1)] border border-white/20 flex items-center gap-4 hover:bg-white/20 transition-colors cursor-default">
          <div className="w-14 h-14 rounded-xl bg-white/20 text-white flex items-center justify-center shadow-inner border border-white/30">
            <UserCircle size={28} />
          </div>
          <div>
            <p className="text-sm text-white/80 font-medium">Total Pengajar</p>
            <p className="text-2xl font-bold text-white">{totalPengajar}</p>
          </div>
        </div>

        {/* Stat Card 3 */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.1)] border border-white/20 flex items-center gap-4 hover:bg-white/20 transition-colors cursor-default">
          <div className="w-14 h-14 rounded-xl bg-emas text-slate flex items-center justify-center shadow-inner border border-emas/50">
            <Target size={28} />
          </div>
          <div>
            <p className="text-sm text-white/80 font-medium">Setoran Hari Ini</p>
            <p className="text-2xl font-bold text-white">{setoranHariIni}</p>
          </div>
        </div>

      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] border border-white/20 p-8 text-center mt-8 hover:bg-white/20 transition-colors cursor-default">
        <h3 className="text-lg font-semibold text-white mb-2">Pantau Aktivitas</h3>
        <p className="text-white/80">Anda dapat melihat daftar riwayat capaian santri secara lengkap di menu "Data Santri".</p>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold text-white mb-4">Pengaturan Sistem Khusus</h2>
        <ToleransiToggle />
      </div>
    </div>
  )
}
