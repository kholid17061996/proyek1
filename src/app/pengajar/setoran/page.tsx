'use client'

import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/utils/supabase/client'
import { Loader2, Search, Target, User, Save, ListTodo } from 'lucide-react'

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
    const { data } = await supabase
      .from('target_hafalan')
      .select('*, periode(nama)')
      .eq('santri_id', santriId)
      .order('created_at', { ascending: false })
    
    if (data) setRiwayatTarget(data)
  }

  // --- LOGIKA PINTAR AL-QURAN ---
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
        <Loader2 className="animate-spin text-teal-300" size={32} />
      </div>
    )
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-10rem)]">
      
      {/* Kiri: Daftar Santri */}
      <div className="w-full lg:w-1/3 bg-white/20 backdrop-blur-2xl rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] border border-white/30 flex flex-col overflow-hidden h-full">
        <div className="p-4 border-b border-white/20 bg-white/10">
          <h2 className="text-xl font-bold text-white mb-4">Pilih Santri</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" size={18} />
            <input 
              type="text" 
              placeholder="Cari santri..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-300 text-white placeholder-white/50"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredSantri.map(santri => (
            <button
              key={santri.id}
              onClick={() => setSelectedSantri(santri)}
              className={`w-full text-left p-3 rounded-xl transition-all duration-300 flex items-center gap-3 ${
                selectedSantri?.id === santri.id 
                  ? 'bg-white/30 shadow-lg border border-white/50' 
                  : 'hover:bg-white/10 border border-transparent text-white/80'
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-inner ${
                selectedSantri?.id === santri.id ? 'bg-teal-500 text-white' : 'bg-white/20 text-white'
              }`}>
                <User size={20} />
              </div>
              <div>
                <p className={`font-bold ${selectedSantri?.id === santri.id ? 'text-white' : 'text-white'}`}>{santri.nama}</p>
                <p className="text-xs text-white/60">NIS: {santri.nis || '-'}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Kanan: Form Target */}
      <div className="w-full lg:w-2/3 flex flex-col gap-6 overflow-y-auto h-full pr-2 pb-10">
        
        {!selectedSantri ? (
          <div className="bg-white/20 backdrop-blur-2xl rounded-3xl border border-white/30 p-10 flex flex-col items-center justify-center h-full text-center">
            <Target size={64} className="text-white/40 mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Belum Ada Santri Terpilih</h3>
            <p className="text-white/70">Pilih santri untuk menetapkan target hafalan periode ini.</p>
          </div>
        ) : (
          <>
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white">
              <h2 className="text-2xl font-bold text-gray-900">{selectedSantri.nama}</h2>
              <p className="text-teal-600 text-sm font-medium">Pengaturan Target Hafalan Santri</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white space-y-6">
              <h3 className="text-lg font-bold text-slate flex items-center gap-2 border-b pb-3">
                <Target size={20} /> Setel Target Baru
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Periode Akademik</label>
                  <select required value={periodeId} onChange={(e) => setPeriodeId(e.target.value)} className="w-full p-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-500 outline-none text-sm bg-gray-50">
                    <option value="">-- Pilih Periode --</option>
                    {periodeList.map(p => (
                      <option key={p.id} value={p.id}>{p.nama}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Status Target</label>
                  <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full p-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-500 outline-none text-sm">
                    <option value="belum_mulai">Belum Mulai</option>
                    <option value="berjalan">Berjalan (Progres)</option>
                    <option value="tercapai">Tercapai</option>
                  </select>
                </div>
              </div>

              <div className="bg-teal-50 p-6 rounded-2xl border border-teal-100 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Pilih Juz</label>
                  <select 
                    value={juz} 
                    onChange={(e) => setJuz(e.target.value ? Number(e.target.value) : '')} 
                    className="w-full sm:w-1/2 p-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-500 outline-none text-sm bg-white" 
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
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl">
                      <span className="text-xs font-bold text-teal-700">Pilih juz terlebih dahulu</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Surah</label>
                    <select 
                      value={surat} 
                      onChange={(e) => setSurat(e.target.value)} 
                      className="w-full p-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-500 outline-none text-sm bg-white" 
                      required
                    >
                      <option value="">-- Pilih --</option>
                      {availableSurah.map((q, idx) => (
                        <option key={idx} value={q.surah}>{q.surah}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Ayat Mulai</label>
                    <input 
                      type="number" 
                      required 
                      min={limits?.ayat_mulai || 1} 
                      max={limits?.ayat_selesai || 286} 
                      placeholder={limits ? `${limits.ayat_mulai} - ${limits.ayat_selesai}` : 'Mulai'} 
                      value={ayatMulai} 
                      onChange={(e) => setAyatMulai(e.target.value ? Number(e.target.value) : '')} 
                      className="w-full p-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-500 outline-none text-sm bg-white disabled:bg-gray-100" 
                      disabled={!surat}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Ayat Selesai</label>
                    <input 
                      type="number" 
                      required 
                      min={limits?.ayat_mulai || 1} 
                      max={limits?.ayat_selesai || 286} 
                      placeholder={limits ? `${limits.ayat_mulai} - ${limits.ayat_selesai}` : 'Selesai'} 
                      value={ayatSelesai} 
                      onChange={(e) => setAyatSelesai(e.target.value ? Number(e.target.value) : '')} 
                      className="w-full p-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-500 outline-none text-sm bg-white disabled:bg-gray-100" 
                      disabled={!surat}
                    />
                  </div>
                </div>
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2">
                {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                Simpan Target
              </button>
            </form>

            <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white">
              <h3 className="text-lg font-bold text-slate flex items-center gap-2 border-b pb-3 mb-4">
                <ListTodo size={20} /> Daftar Target Santri
              </h3>
              
              <div className="space-y-3">
                {riwayatTarget.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">Belum ada target yang disetel.</p>
                ) : (
                  riwayatTarget.map(target => (
                    <div key={target.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-gray-900">{target.surat} (Ayat {target.ayat_mulai} - {target.ayat_selesai})</p>
                        <p className="text-xs text-gray-500">Juz {target.juz} • {target.periode?.nama}</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs uppercase font-bold px-3 py-1 rounded-full ${
                          target.status === 'tercapai' ? 'bg-green-100 text-green-700' : 
                          target.status === 'berjalan' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-600'
                        }`}>
                          {target.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
