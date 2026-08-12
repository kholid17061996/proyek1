'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogOut, Home, User } from 'lucide-react'

export default function OrtuDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [santriData, setSantriData] = useState<{id: string, nama: string} | null>(null)

  useEffect(() => {
    const session = localStorage.getItem('ortu_session_santri')
    if (!session) {
      router.push('/')
    } else {
      setSantriData(JSON.parse(session))
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('ortu_session_santri')
    router.push('/')
  }

  if (!santriData) return null

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navbar */}
      <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl text-blue-900">
            <Home size={24} className="text-blue-600" />
            Portal Wali Santri
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-sm font-medium text-gray-700 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
              <User size={16} className="text-gray-400" />
              Siswa: {santriData.nama}
            </div>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-red-600 hover:bg-red-50 px-3 py-2 rounded-xl transition-colors font-semibold text-sm"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-5xl mx-auto p-4 md:p-6 pb-20">
        {children}
      </main>
    </div>
  )
}
