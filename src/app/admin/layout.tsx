'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabase/client'
import BackgroundEffects from '@/components/BackgroundEffects'
import { 
  BookOpen, 
  LayoutDashboard, 
  Users, 
  School,
  CalendarDays,
  LogOut, 
  Menu,
  X,
  UserCircle,
  Settings,
  ChevronDown
} from 'lucide-react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  // Auto-hide sidebar setelah 5 detik
  useEffect(() => {
    const timer = setTimeout(() => {
      setSidebarOpen(false)
    }, 5000)
    return () => clearTimeout(timer)
  }, [])

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Data Kelas', href: '/admin/kelas', icon: School },
    { name: 'Data Periode', href: '/admin/periode', icon: CalendarDays },
    { name: 'Data Pengajar', href: '/admin/pengajar', icon: UserCircle },
    { name: 'Data Siswa', href: '/admin/santri', icon: BookOpen },
  ]

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <div className="relative h-screen w-screen flex bg-slate overflow-hidden">
      <BackgroundEffects />

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-900/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Glassmorphism */}
      <div className={`
        fixed inset-y-0 left-0 z-50 bg-white/10 backdrop-blur-2xl border-r shadow-[8px_0_32px_rgba(0,0,0,0.1)] transition-all duration-500 ease-in-out lg:static lg:h-screen flex flex-col overflow-hidden whitespace-nowrap
        ${sidebarOpen 
          ? 'w-72 translate-x-0 border-white/20 opacity-100' 
          : 'w-72 -translate-x-full lg:translate-x-0 lg:w-20 border-white/20 opacity-0 lg:opacity-100'
        }
      `}>
        <div className={`flex items-center h-20 border-b border-white/10 bg-white/5 transition-all duration-300 ${sidebarOpen ? 'justify-between px-6 min-w-[18rem]' : 'justify-center w-20'}`}>
          <div className={`flex items-center gap-3 ${sidebarOpen ? '' : 'justify-center'}`}>
            <div className="w-10 h-10 bg-gradient-to-br from-emas to-yellow-600 rounded-xl flex items-center justify-center text-slate shadow-lg shadow-emas/30 shrink-0">
              <BookOpen size={24} />
            </div>
            <span className={`text-xl font-bold text-white tracking-wide ${sidebarOpen ? 'block' : 'hidden'}`}>Admin Panel</span>
          </div>
          <button 
            className={`text-gray-300 hover:text-white transition-transform hover:scale-110 ${sidebarOpen ? 'block' : 'hidden'}`}
            onClick={() => setSidebarOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        <div className={`py-4 flex flex-col h-[calc(100vh-5rem)] justify-between overflow-hidden transition-all duration-300 ${sidebarOpen ? 'px-4 min-w-[18rem]' : 'w-20 items-center'}`}>
          <nav className={`space-y-2 overflow-y-auto pb-4 ${sidebarOpen ? 'pr-2' : ''} w-full`}>
            {navigation.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center rounded-xl transition-all duration-300 font-bold ${
                    sidebarOpen ? 'gap-3 px-4 py-3' : 'justify-center p-3 w-12 mx-auto'
                  } ${
                    isActive 
                      ? 'bg-gradient-to-r from-emas to-yellow-600 text-slate shadow-lg shadow-emas/20 translate-x-2' 
                      : 'text-gray-300 hover:bg-white/10 hover:text-white hover:translate-x-1'
                  }`}
                  title={!sidebarOpen ? item.name : undefined}
                >
                  <Icon size={20} className={isActive ? 'text-slate' : 'text-gray-400 shrink-0'} />
                  <span className={sidebarOpen ? 'block' : 'hidden'}>{item.name}</span>
                </Link>
              )
            })}
          </nav>

          <div className={`pt-4 border-t border-white/10 shrink-0 w-full ${sidebarOpen ? '' : 'flex justify-center'}`}>
            <button 
              onClick={handleLogout}
              className={`flex items-center rounded-xl transition-colors font-bold text-red-400 hover:bg-red-500/10 hover:text-red-300 ${
                sidebarOpen ? 'w-full gap-3 px-4 py-3' : 'justify-center p-3 w-12 mx-auto'
              }`}
              title={!sidebarOpen ? 'Keluar' : undefined}
            >
              <LogOut size={20} className="shrink-0" />
              <span className={sidebarOpen ? 'block' : 'hidden'}>Keluar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden relative z-10 transition-all duration-500">
        {/* Top Header - Glassmorphism */}
        <header className="h-20 shrink-0 bg-white/10 backdrop-blur-xl border-b border-white/20 shadow-sm flex items-center justify-between px-6 lg:px-10 z-30">
          <div className="flex items-center gap-4">
            <button 
              className={`text-white hover:text-emas transition-colors ${sidebarOpen ? 'lg:hidden' : 'block'}`}
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            <div className="hidden lg:block">
              <h2 className="text-xl font-bold text-white tracking-wide">Recrutify <span className="text-emas font-light">Management</span></h2>
            </div>
          </div>

          <div className="relative">
            <button 
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="flex items-center gap-4 hover:bg-white/10 p-2 pr-4 rounded-full transition-all border border-transparent hover:border-white/20"
            >
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
                <UserCircle size={24} className="text-white" />
              </div>
              <div className="hidden md:block text-right">
                <p className="text-sm font-bold text-white leading-tight">Administrator</p>
                <p className="text-xs text-blue-200">Sistem Pusat</p>
              </div>
              <ChevronDown size={16} className={`text-white/70 transition-transform ${profileMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {profileMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setProfileMenuOpen(false)} 
                />
                <div className="absolute right-0 mt-3 w-56 bg-slate/95 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] z-50 overflow-hidden transform origin-top-right transition-all">
                  <div className="p-4 border-b border-white/10">
                    <p className="text-sm font-bold text-white">Akun Admin</p>
                    <p className="text-xs text-white/60 mt-1">Kelola data dan pengaturan</p>
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
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-10">
          {/* Glassmorphism wrapper for the children pages */}
          <div className="bg-white/95 backdrop-blur-3xl rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] border border-white p-6 min-h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
