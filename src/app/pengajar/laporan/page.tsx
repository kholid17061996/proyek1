'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase/client'
import { Loader2, BookOpen, Save, User, Calendar, CheckSquare, Star, MessageSquare, HandHeart } from 'lucide-react'
import { insertLaporanPekanan } from '@/app/actions/pengajar'

export default function LaporanPekananPage() {
  const [loading, setLoading] = useState(true)
  const [santriList, setSantriList] = useState<any[]>([])
  const [selectedSantriId, setSelectedSantriId] = useState('')
  
  const [laporan, setLaporan] = useState({
    tanggal_laporan: new Date().toISOString().split('T')[0],
    kehadiran_persen: 100,
    predikat_adab: 'Jayyid Jiddan',
    komentar_guru: '',
    saran_ortu: ''
  })

  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (selectedSantriId && laporan.tanggal_laporan) {
      calculateAttendance()
    }
  }, [selectedSantriId, laporan.tanggal_laporan])

  const calculateAttendance = async () => {
    try {
      // Calculate date 6 days ago
      const endDate = new Date(laporan.tanggal_laporan);
      const startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - 6);
      const startStr = startDate.toISOString().split('T')[0];
      const endStr = endDate.toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('mutabaah_harian')
        .select('kehadiran')
        .eq('santri_id', selectedSantriId)
        .gte('tanggal', startStr)
        .lte('tanggal', endStr);

      if (data && data.length > 0) {
        const total = data.length;
        const hadir = data.filter(d => d.kehadiran === 'Hadir').length;
        const pct = Math.round((hadir / total) * 100);
        setLaporan(prev => ({ ...prev, kehadiran_persen: pct }));
      } else {
        setLaporan(prev => ({ ...prev, kehadiran_persen: 0 }));
      }
    } catch (err) {
      console.error('Failed to calculate attendance', err);
    }
  }


  useEffect(() => {
    fetchSantri()
  }, [])

  const fetchSantri = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: pengajar } = await supabase
        .from('pengajar')
        .select('id')
        .eq('profile_id', user.id)
        .single()

      if (pengajar) {
        const { data: santri } = await supabase
          .from('santri')
          .select('id, nama, nis')
          .eq('pengajar_id', pengajar.id)
          .eq('status', 'aktif')
          .order('nama', { ascending: true })
        if (santri) setSantriList(santri)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!selectedSantriId) {
      alert("Silakan pilih santri terlebih dahulu.")
      return
    }
    setSaving(true)
    try {
      const res = await insertLaporanPekanan({
        santri_id: selectedSantriId,
        ...laporan
      })
      if (res.error) throw new Error(res.error)
      alert('Laporan pekanan berhasil disimpan!')
      setLaporan({...laporan, komentar_guru: '', saran_ortu: ''}) // reset form
    } catch (err: any) {
      alert('Gagal menyimpan laporan: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading && santriList.length === 0) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-teal-500" size={32} /></div>
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-md flex items-center gap-2">
          <BookOpen size={32} className="text-blue-300" /> Form Laporan Pekanan
        </h1>
        <p className="text-blue-100">Kirim evaluasi berkala untuk ditampilkan di Dashboard Orang Tua.</p>
      </div>

      <div className="bg-white/90 backdrop-blur-3xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/50 space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-gray-200 pb-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
              <User size={18} className="text-teal-600" /> Pilih Siswa
            </label>
            <select 
              value={selectedSantriId}
              onChange={(e) => setSelectedSantriId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-500 outline-none font-bold text-gray-900 bg-gray-50"
            >
              <option value="">-- Silakan Pilih Siswa --</option>
              {santriList.map(s => (
                <option key={s.id} value={s.id}>{s.nama} ({s.nis})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
              <Calendar size={18} className="text-teal-600" /> Tanggal Laporan
            </label>
            <input 
              type="date" 
              value={laporan.tanggal_laporan} 
              onChange={e => setLaporan({...laporan, tanggal_laporan: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-500 outline-none font-bold text-gray-900 bg-gray-50" 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
              <CheckSquare size={18} className="text-teal-600" /> Kehadiran Pekan Ini (%)
            </label>
            <div className="relative">
              <input 
                type="number" 
                min="0" max="100"
                value={laporan.kehadiran_persen} 
                readOnly
                className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-100 outline-none font-bold text-gray-900 cursor-not-allowed" 
              />
              <span className="absolute right-3 top-3 text-xs font-bold text-teal-600 bg-teal-100 px-2 py-1 rounded">Otomatis</span>
            </div>
            <p className="text-[10px] text-gray-500 mt-1">Dihitung otomatis dari 7 hari terakhir.</p>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
              <Star size={18} className="text-yellow-500 fill-yellow-500" /> Predikat Sikap & Adab
            </label>
            <select 
              value={laporan.predikat_adab}
              onChange={e => setLaporan({...laporan, predikat_adab: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-yellow-300 focus:ring-2 focus:ring-yellow-500 outline-none font-bold text-gray-900 bg-yellow-50"
            >
              <option value="Mumtaz">Mumtaz (Sangat Baik)</option>
              <option value="Jayyid Jiddan">Jayyid Jiddan (Baik Sekali)</option>
              <option value="Jayyid">Jayyid (Baik)</option>
              <option value="Maqbul">Maqbul (Cukup)</option>
              <option value="Perlu Pembinaan">Perlu Pembinaan</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
            <MessageSquare size={18} className="text-blue-500" /> Komentar Pengajar
          </label>
          <textarea 
            rows={3}
            placeholder="Tuliskan motivasi, apresiasi, atau pencapaian ananda pekan ini..."
            value={laporan.komentar_guru}
            onChange={e => setLaporan({...laporan, komentar_guru: e.target.value})}
            className="w-full p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
            <HandHeart size={18} className="text-pink-500" /> Saran untuk Wali Siswa (Opsional)
          </label>
          <textarea 
            rows={2}
            placeholder="Misal: Mohon dampingi ananda untuk muroja'ah ba'da maghrib..."
            value={laporan.saran_ortu}
            onChange={e => setLaporan({...laporan, saran_ortu: e.target.value})}
            className="w-full p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-pink-500 outline-none"
          />
        </div>

        <div className="pt-6 border-t border-gray-200 flex justify-end">
          <button 
            onClick={handleSave}
            disabled={saving || !selectedSantriId}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            Kirim Laporan
          </button>
        </div>
      </div>
    </div>
  )
}
