'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabase/client'
import AutocompleteInput from '@/components/AutocompleteInput'
import { searchSantriAction, getAllSantriNamesAction, getAllUserEmailsAction } from '@/app/actions/santri'
import { Loader2, Globe, Shield, Users, UserCheck } from 'lucide-react'
import BackgroundEffects from '@/components/BackgroundEffects'

export default function Home() {
  const [activeTab, setActiveTab] = useState<'admin' | 'ortu'>('admin')
  
  // App initialization state
  const [isLoaded, setIsLoaded] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  // Auth states
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [kodeAkses, setKodeAkses] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [santriNames, setSantriNames] = useState<string[]>([])
  const [userEmails, setUserEmails] = useState<string[]>([])
  
  const router = useRouter()

  // Initial fade in effect (light grey to navy blue/slate)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true)
    }, 100) // Small delay to ensure render
    
    // Fetch names for autocomplete
    getAllSantriNamesAction().then(res => {
      if (res.data) setSantriNames(res.data)
    })
    
    // Fetch emails for autocomplete
    getAllUserEmailsAction().then(res => {
      if (res.data) setUserEmails(res.data)
    })

    return () => clearTimeout(timer)
  }, [])

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data.user) {
        setIsExiting(true)
        setTimeout(() => {
          window.location.href = '/admin'
        }, 800)
      }
    } catch (err: any) {
      setError(err.message || 'Invalid credentials.')
      setLoading(false)
    }
  }

  const handleOrtuLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!kodeAkses.trim()) return

    setLoading(true)
    setError(null)
    setSearchResults([])

    try {
      // Menggunakan server action agar bisa bypass RLS
      const result = await searchSantriAction(kodeAkses.trim())

      if (result.error) {
        setError(result.error)
      } else if (!result.data || result.data.length === 0) {
        setError('Siswa dengan nama tersebut tidak ditemukan.')
      } else {
        setSearchResults(result.data)
      }
    } catch (err: any) {
      setError('Terjadi kesalahan jaringan.')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectSantri = (santri: any) => {
    setIsExiting(true)
    localStorage.setItem('ortu_session_santri', JSON.stringify({
      id: santri.id,
      nama: santri.nama
    }))
    setTimeout(() => {
      window.location.href = `/ortu/dashboard/santri/${santri.id}`
    }, 800)
  }



  return (
    <div className={`relative min-h-screen flex flex-col items-center justify-center overflow-hidden transition-colors duration-1000 ease-in-out ${isExiting ? 'bg-gray-100' : isLoaded ? 'bg-slate' : 'bg-gray-100'}`}>
      
      {/* Background Effects */}
      {isLoaded && !isExiting && (
        <div className="absolute inset-0 pointer-events-none z-0 animate-in fade-in duration-1000">
           <BackgroundEffects />
        </div>
      )}



      {/* Main Login Form Container */}
      <div className={`relative z-10 w-full max-w-[420px] p-6 transition-all duration-1000 ease-out transform ${isExiting ? 'scale-95 opacity-0' : isLoaded ? 'scale-100 opacity-100' : 'scale-110 opacity-0 translate-y-12'}`}>
        
        <div className="bg-white/30 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.2)] p-8 backdrop-blur-2xl border border-white/40">
          
          <div className="flex flex-col items-center mb-8">
            <div className="flex flex-col items-center gap-4 mb-6">
              {/* Logo Utama */}
              <div className="w-24 h-24 drop-shadow-lg flex items-center justify-center">
                <img src="https://i.ibb.co.com/7JwV4rFL/Logo-Balon-Kreatif.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
              
              {/* 2 Logo Tambahan */}
              <div className="flex items-center justify-center gap-6 mt-1">
                <div className="w-20 h-20 drop-shadow-md flex items-center justify-center">
                  <img src="https://i.ibb.co.com/xqG6kNXc/Logo-SMP-Kreatif-MUDA.png" alt="Logo SMP Kreatif" className="w-full h-full object-contain" />
                </div>
                <div className="w-20 h-20 drop-shadow-md flex items-center justify-center">
                  <img src="https://i.ibb.co.com/n8tzc3HQ/Logo-KMBS-0.png" alt="Logo KMBS" className="w-full h-full object-contain scale-[1.35]" />
                </div>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-slate">Log-In</h2>
            <p className="text-slate/80 font-medium mt-2 text-sm text-center">untuk akses</p>
          </div>

          {/* Role Toggle */}
          <div className="flex bg-white/20 p-1.5 rounded-2xl mb-8 backdrop-blur-md border border-white/30">
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${
                activeTab === 'admin' 
                  ? 'bg-white/80 text-slate shadow-md backdrop-blur-xl' 
                  : 'text-gray-700 hover:bg-white/10 hover:text-gray-900'
              }`}
            >
              <Shield size={16} />
              Admin dan Asatidzah
            </button>
            <button
              onClick={() => setActiveTab('ortu')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${
                activeTab === 'ortu' 
                  ? 'bg-white/80 text-slate shadow-md backdrop-blur-xl' 
                  : 'text-gray-700 hover:bg-white/10 hover:text-gray-900'
              }`}
            >
              <Users size={16} />
              Wali Siswa
            </button>
          </div>

          {/* Forms */}
          {activeTab === 'admin' ? (
            <form onSubmit={handleAdminLogin} className="space-y-5 animate-in fade-in duration-300">
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm border border-red-100 text-center">
                  {error}
                </div>
              )}
              
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate ml-1">Email</label>
                <AutocompleteInput
                  value={email}
                  onChange={setEmail}
                  options={userEmails}
                  placeholder="admin@example.com"
                  className="w-full text-slate"
                />
              </div>
              
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate ml-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-emas focus:border-emas outline-none transition-all placeholder:text-gray-400"
                  placeholder="••••••••"
                />
              </div>

              <div className="flex items-center justify-between px-1 pt-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-slate focus:ring-slate cursor-pointer" />
                  <span className="text-sm font-medium text-slate/80 group-hover:text-slate transition-colors">Remember me</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emas hover:bg-emasHover text-slate font-bold py-4 rounded-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-6 shadow-[0_4px_14px_0_rgba(248,210,28,0.39)]"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : 'Login'}
              </button>
            </form>
          ) : (
            <div className="animate-in fade-in duration-300">
              <form onSubmit={handleOrtuLogin} className="space-y-5">
                {error && (
                  <div className="bg-amber-50 text-amber-700 p-3 rounded-xl text-sm border border-amber-100 text-center">
                    {error}
                  </div>
                )}
                
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate ml-1">Ketik Nama Siswa</label>
                  <AutocompleteInput
                    value={kodeAkses}
                    onChange={setKodeAkses}
                    options={santriNames}
                    placeholder="Nama Lengkap Siswa"
                    className="w-full text-slate"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emas hover:bg-emasHover text-slate font-bold py-4 rounded-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-6 shadow-[0_4px_14px_0_rgba(248,210,28,0.39)]"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : 'Cari Data Siswa'}
                </button>
              </form>

              {searchResults.length > 0 && (
                <div className="mt-6 space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <h4 className="text-xs font-bold text-slate/70 uppercase tracking-wider ml-1">Pilih Anak:</h4>
                  {searchResults.map((santri) => (
                    <div 
                      key={santri.id}
                      onClick={() => handleSelectSantri(santri)}
                      className="flex items-center justify-between p-4 bg-white hover:bg-emas/10 border border-gray-100 hover:border-emas rounded-2xl cursor-pointer transition-all group shadow-sm"
                    >
                      <div className="text-left">
                        <h4 className="font-bold text-slate group-hover:text-[#0a3ca3]">{santri.nama}</h4>
                        <p className="text-xs text-gray-500 mt-1">NIS: {santri.nis || '-'} • Kelas: {santri.kelas?.nama || '-'}</p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-emas group-hover:text-slate transition-colors">
                        <UserCheck size={16} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
