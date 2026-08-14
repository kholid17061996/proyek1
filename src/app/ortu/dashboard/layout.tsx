'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogOut, Home, User, Settings, ChevronDown } from 'lucide-react'

export default function OrtuDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [santriData, setSantriData] = useState<{id: string, nama: string} | null>(null)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)

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
          
          <div className="flex items-center gap-4 relative">
            <button 
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:bg-gray-100 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200 transition-colors"
            >
              <User size={16} className="text-blue-600" />
              <span className="hidden sm:inline">Siswa: {santriData.nama}</span>
              <ChevronDown size={14} className={`text-gray-400 transition-transform ${profileMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {profileMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setProfileMenuOpen(false)} 
                />
                <div className="absolute right-0 top-12 mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden transform origin-top-right transition-all">
                  <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                    <p className="text-sm font-bold text-gray-900">Akun Wali Santri</p>
                    <p className="text-xs text-gray-500 mt-1">Siswa: {santriData.nama}</p>
                  </div>
                  <div className="p-2 space-y-1">
                    <button 
                      onClick={() => {
                        setProfileMenuOpen(false)
                        alert("Fitur Pengaturan Profil akan segera hadir!")
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors text-sm font-medium"
                    >
                      <Settings size={16} />
                      Pengaturan Profil
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-600 hover:bg-red-50 transition-colors text-sm font-bold"
                    >
                      <LogOut size={16} />
                      Keluar (Log Out)
                    </button>
                  </div>
                </div>
              </>
            )}
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
