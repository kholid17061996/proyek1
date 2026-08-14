'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogOut, Home, User, Settings, ChevronDown } from 'lucide-react'
import BackgroundEffects from '@/components/BackgroundEffects'

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
    <div className="min-h-screen bg-slate flex flex-col relative overflow-hidden">
      <BackgroundEffects />

      {/* Top Navbar */}
      <nav className="bg-white/10 backdrop-blur-xl border-b border-white/20 shadow-sm sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl text-white">
            <Home size={24} className="text-emas" />
            Portal Wali Santri
          </div>
          
          <div className="flex items-center gap-4 relative">
            <button 
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="flex items-center gap-2 text-sm font-medium text-white hover:bg-white/10 bg-white/5 px-3 py-1.5 rounded-full border border-white/20 transition-colors"
            >
              <User size={16} className="text-emas" />
              <span className="hidden sm:inline">Siswa: {santriData.nama}</span>
              <ChevronDown size={14} className={`text-white/70 transition-transform ${profileMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {profileMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setProfileMenuOpen(false)} 
                />
                <div className="absolute right-0 top-12 mt-2 w-56 bg-slate/95 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] z-50 overflow-hidden transform origin-top-right transition-all">
                  <div className="p-4 border-b border-white/10">
                    <p className="text-sm font-bold text-white">Akun Wali Santri</p>
                    <p className="text-xs text-white/60 mt-1">Siswa: {santriData.nama}</p>
                  </div>
                  <div className="p-2 space-y-1">
                    <button 
                      onClick={() => {
                        setProfileMenuOpen(false)
                        alert("Fitur Pengaturan Profil akan segera hadir!")
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/80 hover:bg-white/10 hover:text-white transition-colors text-sm font-medium"
                    >
                      <Settings size={16} />
                      Pengaturan Profil
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors text-sm font-bold"
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
      <main className="flex-1 w-full max-w-5xl mx-auto p-4 md:p-6 pb-20 relative z-10">
        <div className="bg-white/95 backdrop-blur-3xl rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] border border-white p-6 min-h-full">
          {children}
        </div>
      </main>
    </div>
  )
}
