'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabase/client'
import { 
  BookOpen, 
  LayoutDashboard, 
  Users, 
  School,
  CalendarDays,
  LogOut, 
  Menu,
  X,
  UserCircle
} from 'lucide-react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
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
    { name: 'Data Orang Tua', href: '/admin/ortu', icon: Users },
    { name: 'Data Siswa', href: '/admin/santri', icon: BookOpen },
  ]

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  // Generate stable particles to prevent hydration errors
  const [particles, setParticles] = useState<any[]>([])
  useEffect(() => {
    setParticles(Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 15}s`,
      animationDuration: `${10 + Math.random() * 10}s`,
      size: `${4 + Math.random() * 8}px`,
    })))
  }, [])

  return (
    <div className="relative h-screen w-screen flex bg-slate overflow-hidden">
      
      {/* Background Particles (Emas) */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute bg-emas rounded-full opacity-0 animate-float-up shadow-[0_0_8px_rgba(248,210,28,0.6)]"
            style={{
              left: p.left,
              width: p.size,
              height: p.size,
              animationDelay: p.animationDelay,
              animationDuration: p.animationDuration,
            }}
          />
        ))}
      </div>

      {/* Abstract Waves at the bottom (White/Grey Gradient) */}
      <div className="fixed bottom-0 w-full opacity-30 z-0 pointer-events-none">
        <svg viewBox="0 0 1440 320" className="w-full h-auto">
          <path fill="#ffffff" fillOpacity="0.4" d="M0,160L48,170.7C96,181,192,203,288,197.3C384,192,480,160,576,160C672,160,768,192,864,208C960,224,1056,224,1152,202.7C1248,181,1344,139,1392,117.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          <path fill="#ffffff" fillOpacity="0.7" d="M0,96L48,122.7C96,149,192,203,288,208C384,213,480,171,576,149.3C672,128,768,128,864,154.7C960,181,1056,235,1152,245.3C1248,256,1344,224,1392,208L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>

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
          : 'w-72 -translate-x-full lg:translate-x-0 lg:w-0 border-transparent opacity-0 lg:opacity-100'
        }
      `}>
        <div className="flex items-center justify-between h-20 px-6 border-b border-white/10 bg-white/5 min-w-[18rem]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emas to-yellow-600 rounded-xl flex items-center justify-center text-slate shadow-lg shadow-emas/30">
              <BookOpen size={24} />
            </div>
            <span className="text-xl font-bold text-white tracking-wide">Admin Panel</span>
          </div>
          <button 
            className="text-gray-300 hover:text-white transition-transform hover:scale-110"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-4 flex flex-col h-[calc(100vh-5rem)] justify-between min-w-[18rem] overflow-hidden">
          <nav className="space-y-2 overflow-y-auto pr-2 pb-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-bold ${
                    isActive 
                      ? 'bg-gradient-to-r from-emas to-yellow-600 text-slate shadow-lg shadow-emas/20 translate-x-2' 
                      : 'text-gray-300 hover:bg-white/10 hover:text-white hover:translate-x-1'
                  }`}
                >
                  <Icon size={20} className={isActive ? 'text-slate' : 'text-gray-400'} />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          <div className="pt-4 border-t border-white/10 shrink-0">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-colors font-bold"
            >
              <LogOut size={20} />
              Keluar
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

          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
              <UserCircle size={24} className="text-white" />
            </div>
            <div className="hidden md:block text-right">
              <p className="text-sm font-bold text-white">Administrator</p>
              <p className="text-xs text-blue-200">Sistem Pusat</p>
            </div>
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
