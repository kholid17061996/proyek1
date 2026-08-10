import { Users, UserCircle, BookOpen, Target } from 'lucide-react'

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Utama</h1>
        <p className="text-gray-500 mt-1">Ringkasan data sistem Mutaba'ah Tahfidz.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Stat Card 1 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <BookOpen size={28} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Santri</p>
            <p className="text-2xl font-bold text-gray-900">0</p>
          </div>
        </div>

        {/* Stat Card 2 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
            <UserCircle size={28} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Pengajar</p>
            <p className="text-2xl font-bold text-gray-900">0</p>
          </div>
        </div>

        {/* Stat Card 3 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Users size={28} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Orang Tua</p>
            <p className="text-2xl font-bold text-gray-900">0</p>
          </div>
        </div>

        {/* Stat Card 4 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-emas/10 text-yellow-600 flex items-center justify-center">
            <Target size={28} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Setoran Hari Ini</p>
            <p className="text-2xl font-bold text-gray-900">0</p>
          </div>
        </div>

      </div>

      {/* Placeholder for Data Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum ada data setoran hari ini</h3>
        <p className="text-gray-500">Santri yang melakukan setoran hari ini akan muncul di sini.</p>
      </div>
    </div>
  )
}
