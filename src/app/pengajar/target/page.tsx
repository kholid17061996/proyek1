'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase/client'
import { Loader2, Target, Save, User } from 'lucide-react'
import { upsertTargetSantri, getTargetSantri } from '@/app/actions/pengajar'

export default function TargetPage() {
  const [loading, setLoading] = useState(true)
  const [santriList, setSantriList] = useState<any[]>([])
  const [selectedSantriId, setSelectedSantriId] = useState('')
  
  const [target, setTarget] = useState({
    ziyadah: 5,
    murojaah: 5,
    tasmi: 5,
    pilihan: 20,
    hadits: 15,
    doa: 20
  })

  const [saving, setSaving] = useState(false)

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
        .eq('user_id', user.id)
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

  const handleSelectSantri = async (santriId: string) => {
    setSelectedSantriId(santriId)
    if (!santriId) return

    setLoading(true)
    try {
      const { data } = await getTargetSantri(santriId)
      if (data) {
        setTarget({
          ziyadah: data.target_ziyadah,
          murojaah: data.target_murojaah,
          tasmi: data.target_tasmi,
          pilihan: data.target_pilihan,
          hadits: data.target_hadits,
          doa: data.target_doa
        })
      } else {
        // default
        setTarget({ ziyadah: 5, murojaah: 5, tasmi: 5, pilihan: 20, hadits: 15, doa: 20 })
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!selectedSantriId) return
    setSaving(true)
    try {
      const res = await upsertTargetSantri({
        santri_id: selectedSantriId,
        target_ziyadah: target.ziyadah,
        target_murojaah: target.murojaah,
        target_tasmi: target.tasmi,
        target_pilihan: target.pilihan,
        target_hadits: target.hadits,
        target_doa: target.doa
      })
      if (res.error) throw new Error(res.error)
      alert('Target berhasil disimpan!')
    } catch (err: any) {
      alert('Gagal menyimpan target: ' + err.message)
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
          <Target size={32} className="text-yellow-400" /> Pengaturan Target Capaian
        </h1>
        <p className="text-blue-100">Atur target individual untuk masing-masing santri bimbingan Anda.</p>
      </div>

      <div className="bg-white/90 backdrop-blur-3xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/50">
        <div className="mb-8">
          <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
            <User size={18} className="text-teal-600" /> Pilih Santri
          </label>
          <select 
            value={selectedSantriId}
            onChange={(e) => handleSelectSantri(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-500 outline-none font-bold text-gray-900 bg-gray-50"
          >
            <option value="">-- Silakan Pilih Siswa --</option>
            {santriList.map(s => (
              <option key={s.id} value={s.id}>{s.nama} ({s.nis})</option>
            ))}
          </select>
        </div>

        {selectedSantriId && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-gray-800 border-b border-gray-200 pb-2">Nilai Target</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">Target Ziyadah (Juz)</label>
                <input type="number" step="0.5" value={target.ziyadah} onChange={e => setTarget({...target, ziyadah: parseFloat(e.target.value)})} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-500 outline-none font-bold text-gray-900" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">Target Muroja'ah (Juz)</label>
                <input type="number" step="0.5" value={target.murojaah} onChange={e => setTarget({...target, murojaah: parseFloat(e.target.value)})} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-500 outline-none font-bold text-gray-900" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">Target Tasmi' (Kali)</label>
                <input type="number" value={target.tasmi} onChange={e => setTarget({...target, tasmi: parseFloat(e.target.value)})} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-500 outline-none font-bold text-gray-900" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">Target Ayat Pilihan (Ayat)</label>
                <input type="number" value={target.pilihan} onChange={e => setTarget({...target, pilihan: parseFloat(e.target.value)})} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-500 outline-none font-bold text-gray-900" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">Target Hadits (Hadits)</label>
                <input type="number" value={target.hadits} onChange={e => setTarget({...target, hadits: parseFloat(e.target.value)})} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-500 outline-none font-bold text-gray-900" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">Target Do'a Harian (Do'a)</label>
                <input type="number" value={target.doa} onChange={e => setTarget({...target, doa: parseFloat(e.target.value)})} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-500 outline-none font-bold text-gray-900" />
              </div>

            </div>

            <div className="pt-6 border-t border-gray-200 flex justify-end">
              <button 
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                Simpan Target
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
