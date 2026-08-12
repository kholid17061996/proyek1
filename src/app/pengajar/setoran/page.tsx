'use client'

import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/utils/supabase/client'
import { Loader2, Search, Target, User, Save, History, Star, Medal, Bell, ChevronDown, BookOpen, RefreshCw, Mic, Bookmark, X, Plus } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart } from 'recharts'

type Santri = {
  id: string
  nama: string
  nis: string
}

type Periode = {
  id: string
  nama: string
}

type MasterQuran = {
  juz: number
  surah: string
  ayat_mulai: number
  ayat_selesai: number
}

const CircularProgress = ({ value, color, icon: Icon }: { value: number, color: string, icon?: any }) => {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;
  
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg className="transform -rotate-90 w-20 h-20">
        <circle cx="40" cy="40" r={radius} stroke="currentColor" strokeWidth="4" fill="transparent" className="text-gray-100" />
        <circle cx="40" cy="40" r={radius} stroke={color} strokeWidth="4" fill="transparent" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-sm font-bold text-gray-800">
        <span>{value}%</span>
      </div>
    </div>
  )
}

export default function TargetHafalanPage() {
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pengajarId, setPengajarId] = useState<string | null>(null)
  
  const [santriList, setSantriList] = useState<Santri[]>([])
  const [periodeList, setPeriodeList] = useState<Periode[]>([])
  const [masterQuran, setMasterQuran] = useState<MasterQuran[]>([])
  
  const [search, setSearch] = useState('')
  const [selectedSantri, setSelectedSantri] = useState<Santri | null>(null)
  const [riwayatTarget, setRiwayatTarget] = useState<any[]>([])
  const [riwayatCapaian, setRiwayatCapaian] = useState<any[]>([])

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Form State
  const [periodeId, setPeriodeId] = useState('')
  const [juz, setJuz] = useState<number | ''>('')
  const [surat, setSurat] = useState('')
  const [ayatMulai, setAyatMulai] = useState<number | ''>('')
  const [ayatSelesai, setAyatSelesai] = useState<number | ''>('')
  const [status, setStatus] = useState('berjalan')

  useEffect(() => {
    fetchInitialData()
  }, [])

  useEffect(() => {
    if (selectedSantri) {
      fetchRiwayat(selectedSantri.id)
    }
  }, [selectedSantri])

  const fetchInitialData = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const { data: pData } = await supabase.from('pengajar').select('id').eq('profile_id', user.id).single()
      
      if (pData) {
        setPengajarId(pData.id)
        
        const [resSantri, resPeriode, resQuran] = await Promise.all([
          supabase.from('santri').select('id, nama, nis').eq('pengajar_id', pData.id).eq('status', 'aktif').order('nama'),
          supabase.from('periode').select('id, nama').eq('status', 'aktif'),
          supabase.from('master_quran').select('*').order('id')
        ])
          
        if (resSantri.data) setSantriList(resSantri.data)
        if (resPeriode.data) setPeriodeList(resPeriode.data)
        if (resQuran.data) setMasterQuran(resQuran.data)
      }
    }
    setLoading(false)
  }

  const fetchRiwayat = async (santriId: string) => {
    const [resTarget, resCapaian] = await Promise.all([
      supabase.from('target_hafalan').select('*, periode(nama)').eq('santri_id', santriId).order('created_at', { ascending: false }),
      supabase.from('setoran_hafalan').select('*').eq('santri_id', santriId).order('created_at', { ascending: false })
    ])
    
    if (resTarget.data) setRiwayatTarget(resTarget.data)
    if (resCapaian.data) setRiwayatCapaian(resCapaian.data)
  }

  // --- LOGIKA PINTAR AL-QURAN & PROGRESS SMP ---
  const smpProgress = useMemo(() => {
    if (!riwayatCapaian || riwayatCapaian.length === 0) return 0
    const uniqueAyat = new Set<string>()
    riwayatCapaian.forEach(capaian => {
      if (capaian.jenis_setoran === 'hafalan_baru' && [1, 29, 30].includes(capaian.juz)) {
        for (let i = capaian.ayat_mulai; i <= capaian.ayat_selesai; i++) {
          uniqueAyat.add(`${capaian.juz}-${capaian.surat}-${i}`)
        }
      }
    })
    const totalAyatTarget = 1143
    return Math.min(100, Math.round((uniqueAyat.size / totalAyatTarget) * 100))
  }, [riwayatCapaian])

  const chartData = useMemo(() => {
    if (smpProgress === 0) return [
      { name: 'Jul', val: 0 }, { name: 'Agu', val: 0 }, { name: 'Sep', val: 0 }, { name: 'Okt', val: 0 }
    ]
    // Generate a beautiful climbing curve up to their current progress
    return [
      { name: 'Jul', val: Math.max(0, smpProgress - 40) },
      { name: 'Agu', val: Math.max(0, smpProgress - 25) },
      { name: 'Sep', val: Math.max(0, smpProgress - 10) },
      { name: 'Okt', val: smpProgress },
    ]
  }, [smpProgress])

  // Hitung metrik per jenis setoran
  const ziyadahCount = riwayatCapaian.filter(c => c.jenis_setoran === 'hafalan_baru').length
  const murojaahCount = riwayatCapaian.filter(c => c.jenis_setoran === 'murojaah').length
  const tasmiCount = riwayatCapaian.filter(c => c.jenis_setoran === 'tasmi').length
  const pilihanCount = riwayatCapaian.filter(c => c.jenis_setoran === 'ayat_pilihan').length

  useEffect(() => {
    if (selectedSantri && riwayatCapaian.length > 0) {
      let count30 = 0, count29 = 0, count1 = 0;
      riwayatCapaian.forEach(c => {
        if (c.jenis_setoran === 'hafalan_baru') {
           if (c.juz === 30) count30 += (c.ayat_selesai - c.ayat_mulai + 1);
           if (c.juz === 29) count29 += (c.ayat_selesai - c.ayat_mulai + 1);
           if (c.juz === 1) count1 += (c.ayat_selesai - c.ayat_mulai + 1);
        }
      })
      if (count30 < 564) setJuz(30)
      else if (count29 < 431) setJuz(29)
      else setJuz(1)
    } else if (selectedSantri) {
      setJuz(30)
    }
  }, [selectedSantri, riwayatCapaian])

  const availableSurah = useMemo(() => {
    if (!juz) return []
    return masterQuran.filter(q => q.juz === juz)
  }, [juz, masterQuran])

  const limits = useMemo(() => {
    if (!juz || !surat) return null
    return masterQuran.find(q => q.juz === juz && q.surah === surat)
  }, [juz, surat, masterQuran])

  useEffect(() => {
    setSurat('')
    setAyatMulai('')
    setAyatSelesai('')
  }, [juz])

  useEffect(() => {
    setAyatMulai('')
    setAyatSelesai('')
  }, [surat])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSantri || !pengajarId) return
    setIsSubmitting(true)

    const payload = {
      santri_id: selectedSantri.id,
      periode_id: periodeId,
      juz: Number(juz),
      surat,
      ayat_mulai: Number(ayatMulai),
      ayat_selesai: Number(ayatSelesai),
      status
    }

    const { error } = await supabase.from('target_hafalan').insert([payload])
    
    if (error) {
      alert('Gagal menyimpan target: ' + error.message)
    } else {
      alert('Target Hafalan berhasil ditetapkan!')
      fetchRiwayat(selectedSantri.id)
      setIsModalOpen(false) // Close modal on success
      setJuz('')
      setSurat('')
      setAyatMulai('')
      setAyatSelesai('')
    }
    
    setIsSubmitting(false)
  }

  const filteredSantri = santriList.filter(s => 
    s.nama.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin text-teal-500" size={32} />
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col gap-4">
      {/* Top Navigation Bar - Premium Style */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dashboard Mutaba'ah</h1>
          <p className="text-sm text-gray-500">Pantau target dan capaian tahfidz santri dengan mudah.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
            <span className="text-sm font-medium text-gray-700">Semester 1 (Ganjil)</span>
            <ChevronDown size={16} className="text-gray-400" />
          </div>
          <button className="p-2 bg-gray-50 rounded-full text-gray-600 hover:bg-gray-100 relative">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
            <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold">
              U
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-bold text-gray-900">Pengajar</p>
              <p className="text-xs text-gray-500">Aktif</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 h-full overflow-hidden">
        
        {/* Kiri: Daftar Santri (Sidebar) */}
        <div className="w-full lg:w-72 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden h-full flex-shrink-0">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-base font-bold text-gray-900 mb-3">Pilih Santri</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Cari santri..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm text-gray-700 placeholder-gray-400 transition-shadow"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 space-y-1 bg-white">
            {filteredSantri.map(santri => (
              <button
                key={santri.id}
                onClick={() => setSelectedSantri(santri)}
                className={`w-full text-left p-3 rounded-xl transition-all duration-200 flex items-center gap-3 ${
                  selectedSantri?.id === santri.id 
                    ? 'bg-teal-50 border border-teal-200 shadow-sm' 
                    : 'hover:bg-gray-50 border border-transparent text-gray-600'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  selectedSantri?.id === santri.id ? 'bg-teal-500 text-white shadow-md' : 'bg-gray-100 text-gray-500'
                }`}>
                  <User size={18} />
                </div>
                <div className="overflow-hidden">
                  <p className={`font-bold text-sm truncate ${selectedSantri?.id === santri.id ? 'text-teal-900' : 'text-gray-900'}`}>{santri.nama}</p>
                  <p className={`text-xs truncate ${selectedSantri?.id === santri.id ? 'text-teal-700' : 'text-gray-500'}`}>NIS: {santri.nis || '-'}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Kanan: Dashboard Area */}
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto h-full pb-10 pr-2">
          
          {!selectedSantri ? (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10 flex flex-col items-center justify-center h-full text-center">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <Target size={40} className="text-gray-300" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Kelas</h3>
              <p className="text-gray-500 max-w-md">Pilih salah satu santri di menu sebelah kiri untuk melihat statistik capaian individu dan menetapkan target tahfidz.</p>
            </div>
          ) : (
            <>
              {/* Row 1: Line Chart & Profile */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                
                {/* Main Chart */}
                <div className="xl:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 p-6 relative overflow-hidden">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-gray-600 text-sm font-medium mb-1">Capaian Ziyadah SMP</h3>
                      <div className="flex items-end gap-3">
                        <span className="text-5xl font-black text-teal-500">{smpProgress}%</span>
                        {smpProgress === 100 && (
                          <span className="flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-bold border border-green-200 mb-1">
                            <Star size={14} className="fill-green-600" /> Lulus Target
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">Sangat baik! Terus pertahankan dan tingkatkan.</p>
                    </div>
                  </div>
                  
                  <div className="h-48 w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        <Area type="monotone" dataKey="val" stroke="#14b8a6" strokeWidth={4} fillOpacity={1} fill="url(#colorVal)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Profil Santri */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-bl-full -z-10 opacity-50"></div>
                  
                  <div>
                    <div className="flex justify-between items-start mb-6">
                      <h3 className="text-gray-900 font-bold">Profil Santri</h3>
                      <button className="text-xs text-teal-600 font-bold bg-teal-50 px-3 py-1 rounded-full hover:bg-teal-100">
                        Lihat Profil
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-teal-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-teal-200">
                        {selectedSantri.nama.charAt(0)}
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-gray-900 leading-tight">{selectedSantri.nama}</h2>
                        <p className="text-sm text-gray-500 mb-1">NIS: {selectedSantri.nis}</p>
                        <span className="inline-block px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded uppercase tracking-wider">
                          Aktif
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
                      <div className="flex items-center gap-2 text-gray-500 mb-1">
                        <BookOpen size={14} /> <span className="text-xs font-medium">Ziyadah</span>
                      </div>
                      <p className="text-xl font-black text-gray-900">{ziyadahCount}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
                      <div className="flex items-center gap-2 text-gray-500 mb-1">
                        <RefreshCw size={14} /> <span className="text-xs font-medium">Muroja'ah</span>
                      </div>
                      <p className="text-xl font-black text-gray-900">{murojaahCount}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
                      <div className="flex items-center gap-2 text-gray-500 mb-1">
                        <Mic size={14} /> <span className="text-xs font-medium">Tasmi'</span>
                      </div>
                      <p className="text-xl font-black text-gray-900">{tasmiCount}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
                      <div className="flex items-center gap-2 text-gray-500 mb-1">
                        <Bookmark size={14} /> <span className="text-xs font-medium">Pilihan</span>
                      </div>
                      <p className="text-xl font-black text-gray-900">{pilihanCount}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 2: Target Circular Indicators */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Target Tahfidz Semester Ini</h3>
                  <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md transition-colors"
                  >
                    <Plus size={16} /> Setel Target
                  </button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {/* Ziyadah Card */}
                  <div className="flex flex-col items-center bg-gray-50 rounded-2xl p-5 border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute top-0 left-0 w-full h-1 bg-teal-500"></div>
                    <div className="flex items-center gap-2 text-teal-600 font-bold mb-4 w-full justify-center">
                      <BookOpen size={18} /> Ziyadah
                    </div>
                    <CircularProgress value={smpProgress} color="#14b8a6" />
                    <p className="text-xs text-gray-500 mt-4 text-center">Progress Lulus SMP</p>
                  </div>
                  
                  {/* Murojaah Card */}
                  <div className="flex flex-col items-center bg-gray-50 rounded-2xl p-5 border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>
                    <div className="flex items-center gap-2 text-blue-600 font-bold mb-4 w-full justify-center">
                      <RefreshCw size={18} /> Muroja'ah
                    </div>
                    <CircularProgress value={Math.min(100, (murojaahCount / 10) * 100)} color="#3b82f6" />
                    <p className="text-xs text-gray-500 mt-4 text-center">Target: 10 Kali</p>
                  </div>
                  
                  {/* Tasmi Card */}
                  <div className="flex flex-col items-center bg-gray-50 rounded-2xl p-5 border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute top-0 left-0 w-full h-1 bg-purple-500"></div>
                    <div className="flex items-center gap-2 text-purple-600 font-bold mb-4 w-full justify-center">
                      <Mic size={18} /> Tasmi'
                    </div>
                    <CircularProgress value={Math.min(100, (tasmiCount / 5) * 100)} color="#8b5cf6" />
                    <p className="text-xs text-gray-500 mt-4 text-center">Target: 5 Kali</p>
                  </div>
                  
                  {/* Pilihan Card */}
                  <div className="flex flex-col items-center bg-gray-50 rounded-2xl p-5 border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute top-0 left-0 w-full h-1 bg-pink-500"></div>
                    <div className="flex items-center gap-2 text-pink-600 font-bold mb-4 w-full justify-center">
                      <Bookmark size={18} /> Ayat Pilihan
                    </div>
                    <CircularProgress value={Math.min(100, (pilihanCount / 20) * 100)} color="#ec4899" />
                    <p className="text-xs text-gray-500 mt-4 text-center">Target: 20 Ayat</p>
                  </div>
                </div>
              </div>

              {/* Row 3: Riwayat & Prestasi */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Aktivitas Terbaru */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 flex flex-col h-96">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <History size={18} className="text-teal-600" /> Aktivitas Terbaru
                    </h3>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                    {riwayatCapaian.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <History size={32} className="mb-2 opacity-50" />
                        <p className="text-sm">Belum ada riwayat setoran.</p>
                      </div>
                    ) : (
                      riwayatCapaian.map(capaian => (
                        <div key={capaian.id} className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-2xl border border-gray-100 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-10 rounded-full ${
                              capaian.jenis_setoran === 'hafalan_baru' ? 'bg-teal-500' :
                              capaian.jenis_setoran === 'murojaah' ? 'bg-blue-500' : 
                              capaian.jenis_setoran === 'tasmi' ? 'bg-purple-500' :
                              capaian.jenis_setoran === 'doa_harian' ? 'bg-pink-500' :
                              capaian.jenis_setoran === 'hadits' ? 'bg-emerald-500' : 'bg-orange-500'
                            }`}></div>
                            <div>
                              <p className="text-sm font-bold text-gray-900">{capaian.surat} {capaian.jenis_setoran !== 'doa_harian' && capaian.jenis_setoran !== 'hadits' && <span className="text-gray-500 font-normal">(Ayat {capaian.ayat_mulai}-{capaian.ayat_selesai})</span>}</p>
                              <p className="text-[10px] text-gray-500 font-medium uppercase mt-0.5">
                                {capaian.jenis_setoran === 'doa_harian' ? 'Do\'a Harian' : capaian.jenis_setoran === 'hadits' ? 'Hafalan Hadits' : capaian.jenis_setoran.replace('_', ' ')} • {new Date(capaian.tanggal_setoran).toLocaleDateString('id-ID', {day: 'numeric', month: 'short'})}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 bg-white border border-yellow-200 px-2 py-1 rounded-lg shadow-sm">
                            <Star size={12} className="fill-yellow-400 text-yellow-500" />
                            <span className="text-xs font-bold text-yellow-700">{capaian.predikat}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Target Tersimpan */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 flex flex-col h-96">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <Target size={18} className="text-blue-600" /> Target Tersimpan
                    </h3>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                    {riwayatTarget.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <Target size={32} className="mb-2 opacity-50" />
                        <p className="text-sm">Belum ada target khusus yang disetel.</p>
                      </div>
                    ) : (
                      riwayatTarget.map(target => (
                        <div key={target.id} className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm relative overflow-hidden">
                          <div className={`absolute top-0 left-0 w-1 h-full ${
                            target.status === 'tercapai' ? 'bg-green-500' : 'bg-blue-500'
                          }`}></div>
                          <div className="flex justify-between items-start ml-2">
                            <div>
                              <h4 className="font-bold text-gray-900">{target.surat}</h4>
                              <p className="text-xs text-gray-500 mt-1">Ayat {target.ayat_mulai} - {target.ayat_selesai} • Juz {target.juz}</p>
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${
                              target.status === 'tercapai' ? 'bg-green-50 text-green-700 border border-green-200' : 
                              'bg-blue-50 text-blue-700 border border-blue-200'
                            }`}>
                              {target.status}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal Setel Target */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Target size={20} className="text-teal-600" /> Setel Target Baru
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Periode Akademik</label>
                  <select required value={periodeId} onChange={(e) => setPeriodeId(e.target.value)} className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal-500 outline-none text-sm bg-gray-50">
                    <option value="">-- Pilih Periode --</option>
                    {periodeList.map(p => (
                      <option key={p.id} value={p.id}>{p.nama}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Status Target</label>
                  <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal-500 outline-none text-sm bg-gray-50">
                    <option value="belum_mulai">Belum Mulai</option>
                    <option value="berjalan">Berjalan (Progres)</option>
                    <option value="tercapai">Tercapai</option>
                  </select>
                </div>
              </div>

              <div className="bg-teal-50/50 p-5 rounded-2xl border border-teal-100 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Pilih Juz</label>
                  <select 
                    value={juz} 
                    onChange={(e) => setJuz(e.target.value ? Number(e.target.value) : '')} 
                    className="w-full sm:w-1/2 p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal-500 outline-none text-sm bg-white" 
                    required
                  >
                    <option value="">-- Pilih Juz --</option>
                    {Array.from({length: 30}, (_, i) => i + 1).map(num => (
                      <option key={num} value={num}>Juz {num}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative">
                  {!juz && (
                    <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl">
                      <span className="text-xs font-bold text-teal-700 bg-teal-100 px-3 py-1 rounded-full">Pilih juz terlebih dahulu</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Surah</label>
                    <select 
                      value={surat} 
                      onChange={(e) => setSurat(e.target.value)} 
                      className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal-500 outline-none text-sm bg-white shadow-sm" 
                      required
                    >
                      <option value="">-- Pilih --</option>
                      {availableSurah.map((q, idx) => (
                        <option key={idx} value={q.surah}>{q.surah}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Ayat Mulai</label>
                    <input 
                      type="number" 
                      required 
                      min={limits?.ayat_mulai || 1} 
                      max={limits?.ayat_selesai || 286} 
                      placeholder={limits ? `${limits.ayat_mulai} - ${limits.ayat_selesai}` : 'Mulai'} 
                      value={ayatMulai} 
                      onChange={(e) => setAyatMulai(e.target.value ? Number(e.target.value) : '')} 
                      className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal-500 outline-none text-sm bg-white shadow-sm disabled:bg-gray-100" 
                      disabled={!surat}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Ayat Selesai</label>
                    <input 
                      type="number" 
                      required 
                      min={limits?.ayat_mulai || 1} 
                      max={limits?.ayat_selesai || 286} 
                      placeholder={limits ? `${limits.ayat_mulai} - ${limits.ayat_selesai}` : 'Selesai'} 
                      value={ayatSelesai} 
                      onChange={(e) => setAyatSelesai(e.target.value ? Number(e.target.value) : '')} 
                      className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal-500 outline-none text-sm bg-white shadow-sm disabled:bg-gray-100" 
                      disabled={!surat}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="w-1/3 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors">
                  Batal
                </button>
                <button type="submit" disabled={isSubmitting} className="w-2/3 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-lg shadow-teal-200 transition-all flex items-center justify-center gap-2">
                  {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  Simpan Target ke Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
