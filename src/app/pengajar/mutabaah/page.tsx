'use client'

import { useState, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { supabase } from '@/utils/supabase/client'
import { Loader2, Save, Calendar, CheckSquare, BookOpen, Star, User, BookMarked, Mic, History, X, Pen, Trash2 } from 'lucide-react'

type Santri = {
  id: string
  nama: string
  nis: string
}

type MasterQuran = {
  juz: number
  surah: string
  ayat_mulai: number
  ayat_selesai: number
}

// --- KOMPONEN SUB-SETORAN (REUSABLE) ---
function SubSetoranCard({ 
  title, 
  icon: Icon,
  enabled, 
  setEnabled, 
  data, 
  setData, 
  masterQuran,
  showFractions = false,
  colorFrom = 'from-teal-500',
  colorTo = 'to-teal-600',
  borderColor = 'border-teal-200',
  lightBg = 'bg-teal-50/50',
  ringColor = 'focus:ring-teal-500',
  onSave
}: any) {
  
  const availableSurah = useMemo(() => {
    if (!data.juz) return []
    return masterQuran.filter((q: any) => q.juz === data.juz)
  }, [data.juz, masterQuran])

  const limitsMulai = useMemo(() => {
    if (!data.juz || !data.suratMulai) return null
    return masterQuran.find((q: any) => q.juz === data.juz && q.surah === data.suratMulai)
  }, [data.juz, data.suratMulai, masterQuran])

  const limitsSelesai = useMemo(() => {
    if (!data.juz || !data.suratSelesai) return null
    return masterQuran.find((q: any) => q.juz === data.juz && q.surah === data.suratSelesai)
  }, [data.juz, data.suratSelesai, masterQuran])

  const handleChange = (field: string, value: any) => {
    const newData = { ...data, [field]: value }
    if (field === 'juz') {
      newData.suratMulai = ''; newData.ayatMulai = '';
      newData.suratSelesai = ''; newData.ayatSelesai = '';
    }
    if (field === 'suratMulai') newData.ayatMulai = '';
    if (field === 'suratSelesai') newData.ayatSelesai = '';
    setData(newData)
  }

  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setEnabled(false)
    }
    if (enabled) {
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [enabled, setEnabled])

  if (!enabled || !mounted) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={() => setEnabled(false)}
    >
      <div 
        className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto border ${borderColor} bg-white shadow-2xl rounded-3xl animate-in zoom-in-95 duration-300 relative hide-scrollbar`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`bg-gradient-to-r ${colorFrom} ${colorTo} px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-md`}>
          <div className="flex items-center gap-3">
            <Icon className="text-white" size={20} />
            <h3 className="font-bold text-white text-lg tracking-wide">{title}</h3>
          </div>
          <button 
            type="button" 
            onClick={() => setEnabled(false)} 
            className="text-white hover:bg-white/20 p-2 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Pilih Juz</label>
            <select 
              value={data.juz}
              onChange={(e) => handleChange('juz', e.target.value ? Number(e.target.value) : '')}
              className={`w-full sm:w-1/3 px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 ${ringColor} outline-none font-bold text-gray-900 ${lightBg}`}
              required={enabled}
            >
              <option value="">-- Pilih Juz --</option>
              {Array.from({length: 30}, (_, i) => i + 1).map(num => (
                <option key={num} value={num}>Juz {num}</option>
              ))}
            </select>
          </div>

          {/* Kolom Khusus Tasmi: Fraksi 1/4 Juz */}
          {showFractions && data.juz && (
            <div className="animate-in fade-in duration-500">
              <label className="block text-sm font-bold text-gray-700 mb-3">Bagian Juz (Wajib diisi)</label>
              <div className="grid grid-cols-4 gap-3 sm:w-1/2">
                {['1/4', '2/4', '3/4', '4/4'].map(frac => (
                  <button
                    key={frac}
                    type="button"
                    onClick={() => handleChange('bagianJuz', frac)}
                    className={`py-2 rounded-xl font-bold transition-all ${
                      data.bagianJuz === frac 
                        ? `bg-gradient-to-r ${colorFrom} ${colorTo} text-white shadow-lg scale-105`
                        : 'bg-white border border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {frac}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 ${lightBg} p-6 rounded-2xl border ${borderColor} relative`}>
            {!data.juz && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center rounded-2xl">
                <p className={`text-sm font-bold text-gray-700 bg-white px-4 py-2 rounded-full shadow-sm border ${borderColor}`}>Silakan pilih Juz terlebih dahulu</p>
              </div>
            )}
            
            {/* Mulai */}
            <div className="space-y-4">
              <h3 className={`font-bold text-gray-900 border-b ${borderColor} pb-2`}>Mulai dari</h3>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Surah</label>
                <select 
                  value={data.suratMulai} 
                  onChange={(e) => handleChange('suratMulai', e.target.value)} 
                  className={`w-full p-3 rounded-xl border border-gray-300 focus:ring-2 ${ringColor} outline-none`} 
                  required={enabled}
                >
                  <option value="">-- Pilih Surah --</option>
                  {availableSurah.map((q: any, idx: number) => (
                    <option key={idx} value={q.surah}>{q.surah}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">
                  Ayat {limitsMulai && `(${limitsMulai.ayat_mulai} - ${limitsMulai.ayat_selesai})`}
                </label>
                <input 
                  type="number" 
                  min={limitsMulai?.ayat_mulai || 1}
                  max={limitsMulai?.ayat_selesai || 286}
                  placeholder={limitsMulai ? `${limitsMulai.ayat_mulai} - ${limitsMulai.ayat_selesai}` : 'Ayat'} 
                  value={data.ayatMulai} 
                  onChange={(e) => handleChange('ayatMulai', e.target.value ? Number(e.target.value) : '')} 
                  className={`w-full p-3 rounded-xl border border-gray-300 focus:ring-2 ${ringColor} outline-none disabled:bg-gray-100`} 
                  required={enabled}
                  disabled={!data.suratMulai}
                />
              </div>
            </div>

            {/* Sampai */}
            <div className="space-y-4">
              <h3 className={`font-bold text-gray-900 border-b ${borderColor} pb-2`}>Sampai dengan</h3>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Surah</label>
                <select 
                  value={data.suratSelesai} 
                  onChange={(e) => handleChange('suratSelesai', e.target.value)} 
                  className={`w-full p-3 rounded-xl border border-gray-300 focus:ring-2 ${ringColor} outline-none`} 
                  required={enabled}
                >
                  <option value="">-- Pilih Surah --</option>
                  {availableSurah.map((q: any, idx: number) => (
                    <option key={idx} value={q.surah}>{q.surah}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">
                  Ayat {limitsSelesai && `(${limitsSelesai.ayat_mulai} - ${limitsSelesai.ayat_selesai})`}
                </label>
                <input 
                  type="number" 
                  min={limitsSelesai?.ayat_mulai || 1}
                  max={limitsSelesai?.ayat_selesai || 286}
                  placeholder={limitsSelesai ? `${limitsSelesai.ayat_mulai} - ${limitsSelesai.ayat_selesai}` : 'Ayat'} 
                  value={data.ayatSelesai} 
                  onChange={(e) => handleChange('ayatSelesai', e.target.value ? Number(e.target.value) : '')} 
                  className={`w-full p-3 rounded-xl border border-gray-300 focus:ring-2 ${ringColor} outline-none disabled:bg-gray-100`} 
                  required={enabled}
                  disabled={!data.suratSelesai}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1">
                <Star size={16} className="text-emas" /> Predikat
              </label>
              <select 
                value={data.predikat}
                onChange={(e) => handleChange('predikat', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-yellow-300 focus:ring-2 focus:ring-yellow-500 outline-none bg-yellow-50 font-bold text-gray-800"
              >
                <option value="Mumtaz">Mumtaz (Sangat Baik)</option>
                <option value="Jayyid Jiddan">Jayyid Jiddan (Baik Sekali)</option>
                <option value="Jayyid">Jayyid (Baik)</option>
                <option value="Maqbul">Maqbul (Cukup)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Catatan</label>
            <textarea 
              placeholder={`Contoh: Perlu perbaikan bacaan pada ayat...`} 
              value={data.catatan} 
              onChange={(e) => handleChange('catatan', e.target.value)} 
              className={`w-full p-4 rounded-xl border border-gray-300 focus:ring-2 ${ringColor} outline-none min-h-[100px]`} 
            />
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button
              type="button"
              onClick={() => {
                if (enabled && !data.juz) {
                  alert("Mohon lengkapi Juz sebelum menyimpan.");
                  return;
                }
                if (onSave) {
                  onSave();
                } else {
                  setEnabled(false);
                }
              }}
              className={`px-8 py-3 rounded-xl text-white font-bold bg-gradient-to-r ${colorFrom} ${colorTo} hover:opacity-90 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5`}
            >
              Simpan & Tutup
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

const AYAT_PILIHAN_OPTIONS = [
  { label: 'Al-Baqoroh (284-286)', surat: 'Al-Baqoroh', min: 284, max: 286 },
  { label: 'Ali Imron (190-194)', surat: 'Ali Imron', min: 190, max: 194 },
  { label: 'Al-Isro (23-27)', surat: 'Al-Isro', min: 23, max: 27 },
  { label: 'Al-Isro (78-86)', surat: 'Al-Isro', min: 78, max: 86 },
  { label: 'Al-Qosos (77)', surat: 'Al-Qosos', min: 77, max: 77 },
  { label: 'Ar-Ruum (41)', surat: 'Ar-Ruum', min: 41, max: 41 },
  { label: 'Al-Hasyr (18-24)', surat: 'Al-Hasyr', min: 18, max: 24 },
]

function AyatPilihanCard({
  enabled, setEnabled, data, setData, onSave
}: any) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setEnabled(false)
    }
    if (enabled) window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [enabled, setEnabled])

  const handleChange = (field: string, value: any) => {
    setData({ ...data, [field]: value })
  }

  if (!enabled || !mounted) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={() => setEnabled(false)}
    >
      <div 
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto border border-orange-200 bg-white shadow-2xl rounded-3xl animate-in zoom-in-95 duration-300 relative hide-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-md">
          <div className="flex items-center gap-3">
            <BookOpen className="text-white" size={20} />
            <h3 className="font-bold text-white text-lg tracking-wide">Ayat Pilihan</h3>
          </div>
          <button 
            type="button" 
            onClick={() => setEnabled(false)} 
            className="text-white hover:bg-white/20 p-2 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Pilih Ayat</label>
            <select 
              value={data.pilihanIndex}
              onChange={(e) => {
                const val = e.target.value
                if (val !== '') {
                  const opt = AYAT_PILIHAN_OPTIONS[Number(val)]
                  setData({ ...data, pilihanIndex: val, ayatMulai: opt.min, ayatSelesai: opt.max })
                } else {
                  setData({ ...data, pilihanIndex: '', ayatMulai: '', ayatSelesai: '' })
                }
              }}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500 outline-none font-bold text-gray-900 bg-orange-50/50"
              required={enabled}
            >
              <option value="">-- Pilih Ayat Pilihan --</option>
              {AYAT_PILIHAN_OPTIONS.map((opt, idx) => (
                <option key={idx} value={idx}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Ayat Awal</label>
              <input 
                type="number" 
                min={data.pilihanIndex !== '' ? AYAT_PILIHAN_OPTIONS[Number(data.pilihanIndex)].min : 1}
                max={data.pilihanIndex !== '' ? AYAT_PILIHAN_OPTIONS[Number(data.pilihanIndex)].max : ''}
                placeholder={data.pilihanIndex !== '' ? String(AYAT_PILIHAN_OPTIONS[Number(data.pilihanIndex)].min) : 'Ayat'}
                value={data.ayatMulai} 
                onChange={(e) => handleChange('ayatMulai', e.target.value ? Number(e.target.value) : '')} 
                className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500 outline-none disabled:bg-gray-100" 
                required={enabled}
                disabled={data.pilihanIndex === ''}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Ayat Akhir</label>
              <input 
                type="number" 
                min={data.pilihanIndex !== '' ? AYAT_PILIHAN_OPTIONS[Number(data.pilihanIndex)].min : 1}
                max={data.pilihanIndex !== '' ? AYAT_PILIHAN_OPTIONS[Number(data.pilihanIndex)].max : ''}
                placeholder={data.pilihanIndex !== '' ? String(AYAT_PILIHAN_OPTIONS[Number(data.pilihanIndex)].max) : 'Ayat'}
                value={data.ayatSelesai} 
                onChange={(e) => handleChange('ayatSelesai', e.target.value ? Number(e.target.value) : '')} 
                className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500 outline-none disabled:bg-gray-100" 
                required={enabled}
                disabled={data.pilihanIndex === ''}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1">
              <Star size={16} className="text-emas" /> Predikat
            </label>
            <select 
              value={data.predikat}
              onChange={(e) => handleChange('predikat', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-yellow-300 focus:ring-2 focus:ring-yellow-500 outline-none bg-yellow-50 font-bold text-gray-800"
            >
              <option value="Mumtaz">Mumtaz (Sangat Baik)</option>
              <option value="Jayyid Jiddan">Jayyid Jiddan (Baik Sekali)</option>
              <option value="Jayyid">Jayyid (Baik)</option>
              <option value="Maqbul">Maqbul (Cukup)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Catatan</label>
            <textarea 
              placeholder="Catatan..." 
              value={data.catatan} 
              onChange={(e) => handleChange('catatan', e.target.value)} 
              className="w-full p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500 outline-none min-h-[100px]" 
            />
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button
              type="button"
              onClick={() => {
                if (enabled) {
                  if (data.pilihanIndex === '') {
                    alert("Mohon pilih ayat pilihan sebelum menyimpan.");
                    return;
                  }
                  
                  const opt = AYAT_PILIHAN_OPTIONS[Number(data.pilihanIndex)]
                  const mulai = Number(data.ayatMulai)
                  const selesai = Number(data.ayatSelesai)

                  if (!data.ayatMulai || mulai < opt.min || mulai > opt.max) {
                    alert(`Ayat Awal harus berada di antara batas ${opt.min} dan ${opt.max}.`);
                    return;
                  }
                  if (!data.ayatSelesai || selesai < opt.min || selesai > opt.max) {
                    alert(`Ayat Akhir harus berada di antara batas ${opt.min} dan ${opt.max}.`);
                    return;
                  }
                  if (mulai > selesai) {
                    alert("Ayat Akhir tidak boleh lebih kecil dari Ayat Awal.");
                    return;
                  }
                }
                if (onSave) {
                  onSave();
                } else {
                  setEnabled(false);
                }
              }}
              className="px-8 py-3 rounded-xl text-white font-bold bg-gradient-to-r from-orange-500 to-orange-600 hover:opacity-90 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
            >
              Simpan & Tutup
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

// --- MAIN PAGE ---
export default function SetoranUnifiedPage() {
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pengajarId, setPengajarId] = useState<string | null>(null)
  const [santriList, setSantriList] = useState<Santri[]>([])
  const [masterQuran, setMasterQuran] = useState<MasterQuran[]>([])
  const [riwayatHarian, setRiwayatHarian] = useState<any[]>([])

  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0])
  const [santriId, setSantriId] = useState('')
  const [kehadiran, setKehadiran] = useState('Hadir')

  const defaultSubData = {
    juz: '', suratMulai: '', ayatMulai: '', suratSelesai: '', ayatSelesai: '', predikat: 'Mumtaz', catatan: '', bagianJuz: ''
  }

  const [ziyadahOpen, setZiyadahOpen] = useState(false)
  const [ziyadah, setZiyadah] = useState(defaultSubData)

  const [murojaahOpen, setMurojaahOpen] = useState(false)
  const [murojaah, setMurojaah] = useState(defaultSubData)

  const [tasmiOpen, setTasmiOpen] = useState(false)
  const [tasmi, setTasmi] = useState(defaultSubData)

  const [ayatPilihanOpen, setAyatPilihanOpen] = useState(false)
  const [ayatPilihan, setAyatPilihan] = useState({ pilihanIndex: '', ayatMulai: '', ayatSelesai: '', predikat: 'Mumtaz', catatan: '' })

  const [editingRecord, setEditingRecord] = useState<any>(null)
  const [editData, setEditData] = useState<any>(defaultSubData)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  useEffect(() => {
    fetchInitialData()
  }, [])

  useEffect(() => {
    if (kehadiran !== 'Hadir') {
      setZiyadahOpen(false)
      setMurojaahOpen(false)
      setTasmiOpen(false)
      setAyatPilihanOpen(false)
      
      setZiyadah(defaultSubData)
      setMurojaah(defaultSubData)
      setTasmi(defaultSubData)
      setAyatPilihan({ pilihanIndex: '', ayatMulai: '', ayatSelesai: '', predikat: 'Mumtaz', catatan: '' })
    }
  }, [kehadiran])

  // Memuat Ulang Riwayat ketika Tanggal / Pengajar berubah
  useEffect(() => {
    if (pengajarId && tanggal) {
      fetchRiwayatHarian(tanggal, pengajarId)
    }
  }, [pengajarId, tanggal])

  const fetchInitialData = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: pData } = await supabase.from('pengajar').select('id').eq('profile_id', user.id).single()
      if (pData) {
        setPengajarId(pData.id)
        const [resSantri, resQuran] = await Promise.all([
          supabase.from('santri').select('id, nama, nis').eq('pengajar_id', pData.id).eq('status', 'aktif').order('nama'),
          supabase.from('master_quran').select('*').order('id')
        ])
        if (resSantri.data) setSantriList(resSantri.data)
        if (resQuran.data) setMasterQuran(resQuran.data)
      }
    }
    setLoading(false)
  }

  const fetchRiwayatHarian = async (tgl: string, pId: string) => {
    const { data } = await supabase
      .from('setoran_hafalan')
      .select('*, santri(nama)')
      .eq('pengajar_id', pId)
      .eq('tanggal_setoran', tgl)
      .order('created_at', { ascending: false })
    
    if (data) setRiwayatHarian(data)
  }

  const handleDeleteSetoran = async (id: string) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus data setoran ini?")) return
    const { error } = await supabase.from('setoran_hafalan').delete().eq('id', id)
    if (error) alert("Gagal menghapus: " + error.message)
    else if (pengajarId) fetchRiwayatHarian(tanggal, pengajarId)
  }

  const handleOpenEdit = (record: any) => {
    setEditingRecord(record)
    if (record.jenis_setoran === 'ayat_pilihan') {
      const idx = AYAT_PILIHAN_OPTIONS.findIndex(o => o.surat === record.surat && o.min === record.ayat_mulai)
      setEditData({
        pilihanIndex: idx >= 0 ? String(idx) : '',
        ayatMulai: record.ayat_mulai,
        ayatSelesai: record.ayat_selesai,
        predikat: record.predikat,
        catatan: record.catatan || ''
      })
    } else {
      setEditData({
        juz: record.juz || '',
        suratMulai: record.surat_mulai,
        ayatMulai: record.ayat_mulai,
        suratSelesai: record.surat_selesai,
        ayatSelesai: record.ayat_selesai,
        predikat: record.predikat,
        catatan: record.catatan || '',
        bagianJuz: record.bagian_juz || ''
      })
    }
    setIsEditModalOpen(true)
  }

  const handleUpdateSetoran = async () => {
    if (!editingRecord) return
    const id = editingRecord.id
    
    let payload: any = {}
    if (editingRecord.jenis_setoran === 'ayat_pilihan') {
      const opt = AYAT_PILIHAN_OPTIONS[Number(editData.pilihanIndex)]
      payload = {
        surat: opt.surat, surat_mulai: opt.surat, ayat_mulai: Number(editData.ayatMulai) || opt.min,
        surat_selesai: opt.surat, ayat_selesai: Number(editData.ayatSelesai) || opt.max,
        predikat: editData.predikat, catatan: editData.catatan
      }
    } else {
      payload = {
        juz: Number(editData.juz),
        surat: editData.suratMulai, surat_mulai: editData.suratMulai, ayat_mulai: Number(editData.ayatMulai),
        surat_selesai: editData.suratSelesai || editData.suratMulai, ayat_selesai: Number(editData.ayatSelesai),
        predikat: editData.predikat, catatan: editData.catatan,
        bagian_juz: editData.bagianJuz || null
      }
    }

    const { error } = await supabase.from('setoran_hafalan').update(payload).eq('id', id)
    if (error) alert("Gagal mengupdate: " + error.message)
    else {
      setIsEditModalOpen(false)
      setEditingRecord(null)
      if (pengajarId) fetchRiwayatHarian(tanggal, pengajarId)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!santriId || !pengajarId) return
    
    // Validasi khusus Tasmi
    if (tasmi.juz !== '' && !tasmi.bagianJuz) {
      alert("Untuk Tasmi', Anda wajib memilih Bagian Juz (1/4, 2/4, dll)!")
      return
    }

    setIsSubmitting(true)

    try {
      const { data: existingMutabaah } = await supabase
        .from('mutabaah_harian')
        .select('id')
        .eq('santri_id', santriId)
        .eq('tanggal', tanggal)
        .single()

      const mutabaahPayload = { santri_id: santriId, pengajar_id: pengajarId, tanggal, kehadiran }

      if (existingMutabaah) {
        await supabase.from('mutabaah_harian').update(mutabaahPayload).eq('id', existingMutabaah.id)
      } else {
        await supabase.from('mutabaah_harian').insert([mutabaahPayload])
      }

      const setoranPayloads = []

      if (ziyadah.juz !== '' && ziyadah.suratMulai !== '') {
        setoranPayloads.push({
          santri_id: santriId, pengajar_id: pengajarId, tanggal_setoran: tanggal,
          jenis_setoran: 'hafalan_baru', juz: Number(ziyadah.juz),
          surat: ziyadah.suratMulai, surat_mulai: ziyadah.suratMulai, ayat_mulai: Number(ziyadah.ayatMulai),
          surat_selesai: ziyadah.suratSelesai || ziyadah.suratMulai, ayat_selesai: Number(ziyadah.ayatSelesai),
          predikat: ziyadah.predikat, catatan: ziyadah.catatan
        })
      }

      if (murojaah.juz !== '' && murojaah.suratMulai !== '') {
        setoranPayloads.push({
          santri_id: santriId, pengajar_id: pengajarId, tanggal_setoran: tanggal,
          jenis_setoran: 'murojaah', juz: Number(murojaah.juz),
          surat: murojaah.suratMulai, surat_mulai: murojaah.suratMulai, ayat_mulai: Number(murojaah.ayatMulai),
          surat_selesai: murojaah.suratSelesai || murojaah.suratMulai, ayat_selesai: Number(murojaah.ayatSelesai),
          predikat: murojaah.predikat, catatan: murojaah.catatan
        })
      }

      if (tasmi.juz !== '' && tasmi.suratMulai !== '') {
        setoranPayloads.push({
          santri_id: santriId, pengajar_id: pengajarId, tanggal_setoran: tanggal,
          jenis_setoran: 'tasmi', juz: Number(tasmi.juz),
          bagian_juz: tasmi.bagianJuz, // Kolom Khusus Tasmi
          surat: tasmi.suratMulai, surat_mulai: tasmi.suratMulai, ayat_mulai: Number(tasmi.ayatMulai),
          surat_selesai: tasmi.suratSelesai || tasmi.suratMulai, ayat_selesai: Number(tasmi.ayatSelesai),
          predikat: tasmi.predikat, catatan: tasmi.catatan
        })
      }

      if (ayatPilihan.pilihanIndex !== '') {
        const opt = AYAT_PILIHAN_OPTIONS[Number(ayatPilihan.pilihanIndex)]
        if (opt) {
          setoranPayloads.push({
            santri_id: santriId, pengajar_id: pengajarId, tanggal_setoran: tanggal,
            jenis_setoran: 'ayat_pilihan', juz: null,
            surat: opt.surat, surat_mulai: opt.surat, ayat_mulai: Number(ayatPilihan.ayatMulai) || opt.min,
            surat_selesai: opt.surat, ayat_selesai: Number(ayatPilihan.ayatSelesai) || opt.max,
            predikat: ayatPilihan.predikat, catatan: ayatPilihan.catatan
          })
        }
      }

      if (setoranPayloads.length > 0) {
        const { error } = await supabase.from('setoran_hafalan').insert(setoranPayloads)
        if (error) throw error
      }

      alert(`Berhasil! Kehadiran dan ${setoranPayloads.length} record setoran tersimpan.`)
      
      setZiyadahOpen(false); setZiyadah(defaultSubData)
      setMurojaahOpen(false); setMurojaah(defaultSubData)
      setTasmiOpen(false); setTasmi(defaultSubData)
      setAyatPilihanOpen(false); setAyatPilihan({ pilihanIndex: '', ayatMulai: '', ayatSelesai: '', predikat: 'Mumtaz', catatan: '' })
      setSantriId('') // Kosongkan siswa agar bisa lanjut ke siswa berikutnya
      
      // Refresh daftar riwayat
      if (pengajarId) fetchRiwayatHarian(tanggal, pengajarId)
      
    } catch (err: any) {
      alert('Terjadi kesalahan: ' + err.message)
    }

    setIsSubmitting(false)
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin text-teal-300" size={32} />
      </div>
    )
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto relative items-start">
      
      {/* SISI KIRI: Form Input Utama */}
      <div className="w-full lg:w-2/3 space-y-6">
        <div className="text-left mb-4">
          <h1 className="text-3xl font-bold text-white mb-1 drop-shadow-md">Form Input Mutaba'ah</h1>
          <p className="text-blue-100">Kirim data setoran siswa dengan mudah dan cepat.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/90 backdrop-blur-3xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/50 space-y-8">
          
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-800 border-b border-gray-200 pb-2 flex items-center gap-2">
              <User size={20} className="text-teal-600" /> 1. Pilih Siswa & Tanggal
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Tanggal</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type="date" required value={tanggal} onChange={(e) => setTanggal(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-500 outline-none font-medium bg-gray-50" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Nama Siswa</label>
                <select required value={santriId} onChange={(e) => setSantriId(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-500 outline-none font-bold text-gray-900 bg-gray-50">
                  <option value="">-- Silakan Pilih Siswa --</option>
                  {santriList.map(s => <option key={s.id} value={s.id}>{s.nama} ({s.nis})</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-800 border-b border-gray-200 pb-2 flex items-center gap-2">
              <CheckSquare size={20} className="text-teal-600" /> 2. Status Kehadiran
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {['Hadir', 'Izin', 'Sakit', 'Alfa'].map(status => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setKehadiran(status)}
                  className={`py-3 rounded-xl font-bold transition-all ${
                    kehadiran === status
                      ? status === 'Hadir' ? 'bg-teal-500 text-white shadow-lg ring-2 ring-teal-200' :
                        status === 'Izin' ? 'bg-blue-500 text-white shadow-lg ring-2 ring-blue-200' :
                        status === 'Sakit' ? 'bg-yellow-500 text-white shadow-lg ring-2 ring-yellow-200' :
                        'bg-red-500 text-white shadow-lg ring-2 ring-red-200'
                      : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className={`space-y-6 transition-all duration-500 ${kehadiran !== 'Hadir' ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
            <div className="flex items-center justify-between border-b border-gray-200 pb-2">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <BookOpen size={20} className="text-teal-600" /> 3. Data Setoran
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                type="button"
                onClick={() => setZiyadahOpen(true)}
                className={`py-3 rounded-2xl font-bold transition-all duration-300 flex flex-col items-center justify-center gap-1 ${
                  ziyadah.juz !== ''
                    ? 'bg-gradient-to-br from-teal-400 to-teal-600 text-white shadow-lg shadow-teal-500/40 ring-4 ring-teal-100 scale-[1.02]'
                    : 'bg-white/80 backdrop-blur border border-gray-200 text-gray-500 hover:bg-white hover:shadow-md'
                }`}
              >
                <BookOpen size={20} className={ziyadah.juz !== '' ? 'text-white' : 'text-gray-400'} />
                Ziyadah (Baru)
              </button>

              <button
                type="button"
                onClick={() => setMurojaahOpen(true)}
                className={`py-3 rounded-2xl font-bold transition-all duration-300 flex flex-col items-center justify-center gap-1 ${
                  murojaah.juz !== ''
                    ? 'bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-lg shadow-blue-500/40 ring-4 ring-blue-100 scale-[1.02]'
                    : 'bg-white/80 backdrop-blur border border-gray-200 text-gray-500 hover:bg-white hover:shadow-md'
                }`}
              >
                <BookMarked size={20} className={murojaah.juz !== '' ? 'text-white' : 'text-gray-400'} />
                Muroja'ah (Ulang)
              </button>

              <button
                type="button"
                onClick={() => setTasmiOpen(true)}
                className={`py-3 rounded-2xl font-bold transition-all duration-300 flex flex-col items-center justify-center gap-1 ${
                  tasmi.juz !== ''
                    ? 'bg-gradient-to-br from-purple-400 to-purple-600 text-white shadow-lg shadow-purple-500/40 ring-4 ring-purple-100 scale-[1.02]'
                    : 'bg-white/80 backdrop-blur border border-gray-200 text-gray-500 hover:bg-white hover:shadow-md'
                }`}
              >
                <Mic size={20} className={tasmi.juz !== '' ? 'text-white' : 'text-gray-400'} />
                Tasmi' (Ujian)
              </button>

              <button
                type="button"
                onClick={() => setAyatPilihanOpen(true)}
                className={`py-3 rounded-2xl font-bold transition-all duration-300 flex flex-col items-center justify-center gap-1 ${
                  ayatPilihan.pilihanIndex !== ''
                    ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-lg shadow-orange-500/40 ring-4 ring-orange-100 scale-[1.02]'
                    : 'bg-white/80 backdrop-blur border border-gray-200 text-gray-500 hover:bg-white hover:shadow-md'
                }`}
              >
                <Star size={20} className={ayatPilihan.pilihanIndex !== '' ? 'text-white' : 'text-gray-400'} />
                Ayat Pilihan
              </button>
            </div>

          </div>

          <button 
            type="submit" 
            disabled={isSubmitting} 
            className="w-full py-4 bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white font-bold rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 text-lg disabled:opacity-70 disabled:cursor-not-allowed transform hover:scale-[1.02]"
          >
            {isSubmitting ? <Loader2 size={24} className="animate-spin" /> : <Save size={24} />}
            Kirim Data Harian
          </button>
        </form>
      </div>

      {/* SISI KANAN: Riwayat Setoran Harian */}
      <div className="w-full lg:w-1/3 bg-white/10 backdrop-blur-3xl rounded-3xl overflow-hidden border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.15)] flex flex-col sticky top-0 h-[calc(100vh-8rem)]">
        
        <div className="bg-white/10 p-5 border-b border-white/20 flex items-center justify-between shrink-0">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <History size={20} className="text-emas" /> Riwayat Harian
          </h2>
          <span className="text-xs font-semibold text-white/70 bg-black/20 px-3 py-1 rounded-full border border-white/10">
            {riwayatHarian.length} Record
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 hide-scrollbar">
          {riwayatHarian.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6">
              <BookOpen size={48} className="text-white/20 mb-4" />
              <p className="text-white/70 font-medium">Belum ada data setoran yang Anda masukkan pada tanggal ini.</p>
            </div>
          ) : (
            riwayatHarian.map(r => (
              <div key={r.id} className="bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-white/40">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-gray-900">{r.santri?.nama}</h3>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full text-white uppercase shadow-sm ${
                    r.jenis_setoran === 'hafalan_baru' ? 'bg-teal-500' :
                    r.jenis_setoran === 'murojaah' ? 'bg-blue-500' : 
                    r.jenis_setoran === 'tasmi' ? 'bg-purple-500' : 'bg-orange-500'
                  }`}>
                    {r.jenis_setoran === 'hafalan_baru' ? 'Ziyadah' : r.jenis_setoran === 'murojaah' ? "Muroja'ah" : r.jenis_setoran === 'tasmi' ? "Tasmi'" : "Ayat Pilihan"}
                  </span>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <button onClick={() => handleOpenEdit(r)} className="text-gray-400 hover:text-blue-500 transition-colors" title="Edit">
                      <Pen size={16} />
                    </button>
                    <button onClick={() => handleDeleteSetoran(r.id)} className="text-gray-400 hover:text-red-500 transition-colors" title="Hapus">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  <p>{r.juz ? `Juz ${r.juz} • ` : ''}{r.surat} (Ayat {r.ayat_mulai} - {r.ayat_selesai})</p>
                  {r.bagian_juz && <p className="font-semibold text-purple-700">Fraksi: {r.bagian_juz} Juz</p>}
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-emas bg-yellow-50 px-2 py-1 rounded-md inline-flex border border-yellow-200">
                  <Star size={12} className="fill-emas" /> {r.predikat}
                </div>
              </div>
            ))
          )}
        </div>

      </div>

      {/* MODALS RENDERED OUTSIDE FORM TO AVOID BACKDROP-BLUR TRAPPING FIXED POSITION */}
      <SubSetoranCard 
        title="Ziyadah (Hafalan Baru)" icon={BookOpen}
        enabled={ziyadahOpen} setEnabled={setZiyadahOpen}
        data={ziyadah} setData={setZiyadah} masterQuran={masterQuran}
        colorFrom="from-teal-500" colorTo="to-teal-600" borderColor="border-teal-200" lightBg="bg-teal-50/50" ringColor="focus:ring-teal-500"
      />

      <SubSetoranCard 
        title="Muroja'ah (Ulangan Hafalan Lama)" icon={BookMarked}
        enabled={murojaahOpen} setEnabled={setMurojaahOpen}
        data={murojaah} setData={setMurojaah} masterQuran={masterQuran}
        colorFrom="from-blue-500" colorTo="to-blue-600" borderColor="border-blue-200" lightBg="bg-blue-50/50" ringColor="focus:ring-blue-500"
      />

      <SubSetoranCard 
        title="Tasmi' (Ujian Hafalan)" icon={Mic}
        enabled={tasmiOpen} setEnabled={setTasmiOpen}
        data={tasmi} setData={setTasmi} masterQuran={masterQuran}
        showFractions={true}
        colorFrom="from-purple-500" colorTo="to-purple-600" borderColor="border-purple-200" lightBg="bg-purple-50/50" ringColor="focus:ring-purple-500"
      />

      <AyatPilihanCard 
        enabled={ayatPilihanOpen} setEnabled={setAyatPilihanOpen}
        data={ayatPilihan} setData={setAyatPilihan}
      />

      {/* EDIT MODAL DYNAMIC RENDERING */}
      {editingRecord && editingRecord.jenis_setoran === 'hafalan_baru' && (
        <SubSetoranCard title="Edit Ziyadah" icon={Pen} enabled={isEditModalOpen} setEnabled={setIsEditModalOpen} data={editData} setData={setEditData} masterQuran={masterQuran} colorFrom="from-teal-500" colorTo="to-teal-600" borderColor="border-teal-200" lightBg="bg-teal-50/50" ringColor="focus:ring-teal-500" onSave={handleUpdateSetoran} />
      )}
      {editingRecord && editingRecord.jenis_setoran === 'murojaah' && (
        <SubSetoranCard title="Edit Muroja'ah" icon={Pen} enabled={isEditModalOpen} setEnabled={setIsEditModalOpen} data={editData} setData={setEditData} masterQuran={masterQuran} colorFrom="from-blue-500" colorTo="to-blue-600" borderColor="border-blue-200" lightBg="bg-blue-50/50" ringColor="focus:ring-blue-500" onSave={handleUpdateSetoran} />
      )}
      {editingRecord && editingRecord.jenis_setoran === 'tasmi' && (
        <SubSetoranCard title="Edit Tasmi'" icon={Pen} enabled={isEditModalOpen} setEnabled={setIsEditModalOpen} data={editData} setData={setEditData} masterQuran={masterQuran} showFractions={true} colorFrom="from-purple-500" colorTo="to-purple-600" borderColor="border-purple-200" lightBg="bg-purple-50/50" ringColor="focus:ring-purple-500" onSave={handleUpdateSetoran} />
      )}
      {editingRecord && editingRecord.jenis_setoran === 'ayat_pilihan' && (
        <AyatPilihanCard enabled={isEditModalOpen} setEnabled={setIsEditModalOpen} data={editData} setData={setEditData} onSave={handleUpdateSetoran} />
      )}
    </div>
  )
}
