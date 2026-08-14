'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { supabase } from '@/utils/supabase/client'
import { Loader2, Target, Save, User, BookOpen, BookMarked, Mic, Star, Heart, BookText, CheckCircle, XCircle, ChevronDown } from 'lucide-react'
import { upsertTargetSantri, getTargetSantri } from '@/app/actions/pengajar'
import { DOA_HARIAN_DATA } from '@/utils/doaData'
import { HADITS_DATA } from '@/utils/haditsData'

type Toast = { type: 'success' | 'error'; message: string } | null
type Option = { no: number; label: string }

// ─── Bitmask helpers ────────────────────────────────────────────────────────
// items: no dimulai dari 1, bit posisi = no - 1
const toBitmask = (nos: number[]): number => nos.reduce((acc, n) => acc | (1 << (n - 1)), 0)
const fromBitmask = (mask: number, options: Option[]): number[] =>
  options.filter(o => (mask >> (o.no - 1)) & 1).map(o => o.no)

// ─── Data konstanta ─────────────────────────────────────────────────────────
const JUZ_OPTIONS = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 5]
const TASMI_OPTIONS = [1, 2, 3, 4, 5]
const AYAT_PILIHAN_OPTIONS: Option[] = [
  { no: 1, label: 'Al-Baqoroh (284-286)'  },
  { no: 2, label: 'Ali Imron (190-194)'   },
  { no: 3, label: 'Al-Isro (23-27)'       },
  { no: 4, label: 'Al-Isro (78-86)'       },
  { no: 5, label: 'Al-Qosos (77)'         },
  { no: 6, label: 'Ar-Ruum (41)'          },
  { no: 7, label: 'Al-Hujurat (13)'       },
  { no: 8, label: 'Al-Hasyr (18-24)'      },
]

// ─── CheckboxDropdown Component ─────────────────────────────────────────────
function CheckboxDropdown({
  options,
  selectedNos,
  onChange,
  placeholder = 'Pilih...',
  accentColor = 'teal',
}: {
  options: Option[]
  selectedNos: number[]
  onChange: (nos: number[]) => void
  placeholder?: string
  accentColor?: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const toggle = (no: number) => {
    onChange(selectedNos.includes(no) ? selectedNos.filter(n => n !== no) : [...selectedNos, no])
  }

  const selectedLabels = options.filter(o => selectedNos.includes(o.no))

  return (
    <div ref={ref} className="relative">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border border-white/20 bg-white/10 backdrop-blur text-white text-sm font-medium hover:bg-white/15 transition-all"
      >
        <span className="truncate text-left">
          {selectedLabels.length === 0
            ? <span className="text-white/40">{placeholder}</span>
            : selectedLabels.length === 1
              ? selectedLabels[0].label
              : `${selectedLabels.length} dipilih`
          }
        </span>
        <ChevronDown size={16} className={`text-white/50 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Selected badges */}
      {selectedLabels.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {selectedLabels.map(o => (
            <span key={o.no} className="inline-flex items-center gap-1 bg-white/15 border border-white/20 text-white/90 text-xs px-2 py-0.5 rounded-lg">
              {o.label}
              <button onClick={() => toggle(o.no)} className="hover:text-red-300 ml-0.5">×</button>
            </span>
          ))}
        </div>
      )}

      {/* Dropdown list */}
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-slate-800/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
          <div className="max-h-52 overflow-y-auto">
            {options.map(opt => {
              const checked = selectedNos.includes(opt.no)
              return (
                <label
                  key={opt.no}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/10 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(opt.no)}
                    className="w-4 h-4 rounded accent-teal-400 shrink-0"
                  />
                  <span className="text-white/90 text-sm">{opt.label}</span>
                </label>
              )
            })}
          </div>
          <div className="border-t border-white/10 px-4 py-2 flex justify-between items-center">
            <span className="text-white/40 text-xs">{selectedNos.length} dipilih</span>
            <button onClick={() => setOpen(false)} className="text-teal-400 text-xs font-bold hover:text-teal-300">Selesai</button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function TargetPage() {
  const [loading, setLoading] = useState(true)
  const [santriList, setSantriList] = useState<any[]>([])
  const [selectedSantriId, setSelectedSantriId] = useState('')
  const [loadingTarget, setLoadingTarget] = useState(false)

  // Numeric single-select fields
  const [ziyadah, setZiyadah] = useState(1)
  const [murojaah, setMurojaah] = useState(1)
  const [tasmi, setTaski] = useState(1)

  // Multi-select fields — simpan sebagai array of selected `no`
  const [selectedPilihan, setSelectedPilihan] = useState<number[]>([])
  const [selectedHadits, setSelectedHadits] = useState<number[]>([])
  const [selectedDoa, setSelectedDoa] = useState<number[]>([])

  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<Toast>(null)

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3500)
  }

  useEffect(() => { fetchSantri() }, [])

  const fetchSantri = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: pengajar } = await supabase
        .from('pengajar').select('id').eq('profile_id', user.id).single()
      if (pengajar) {
        const { data: santri } = await supabase
          .from('santri').select('id, nama, nis, kelas(nama)')
          .eq('pengajar_id', pengajar.id).eq('status', 'aktif').order('nama')
        if (santri) setSantriList(santri)
      }
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const selectedSantri = santriList.find(s => s.id === selectedSantriId)
  const targetKelas = useMemo(() => {
    const nm = Array.isArray(selectedSantri?.kelas)
      ? selectedSantri?.kelas[0]?.nama || '' : selectedSantri?.kelas?.nama || ''
    if (nm.includes('8')) return 8
    if (nm.includes('9')) return 9
    return 7
  }, [selectedSantri])

  const haditsOptions: Option[] = useMemo(
    () => HADITS_DATA.filter(h => h.targetKelas === targetKelas).map(h => ({ no: h.no, label: h.namaHadits })),
    [targetKelas]
  )
  const doaOptions: Option[] = useMemo(
    () => DOA_HARIAN_DATA.filter(d => d.targetKelas === targetKelas).map(d => ({ no: d.no, label: d.namaDoa })),
    [targetKelas]
  )

  const handleSelectSantri = async (santriId: string) => {
    setSelectedSantriId(santriId)
    if (!santriId) return
    setLoadingTarget(true)
    try {
      const { data } = await getTargetSantri(santriId)
      if (data) {
        setZiyadah(data.target_ziyadah || 1)
        setMurojaah(data.target_murojaah || 1)
        setTaski(data.target_tasmi || 1)
        setSelectedPilihan(fromBitmask(data.target_pilihan || 0, AYAT_PILIHAN_OPTIONS))
        // Hadits & Doa options depend on kelas — will be recomputed after santri is set
        setSelectedHadits(fromBitmask(data.target_hadits || 0, HADITS_DATA.map(h => ({ no: h.no, label: h.namaHadits }))))
        setSelectedDoa(fromBitmask(data.target_doa || 0, DOA_HARIAN_DATA.map(d => ({ no: d.no, label: d.namaDoa }))))
      } else {
        setZiyadah(1); setMurojaah(1); setTaski(1)
        setSelectedPilihan([]); setSelectedHadits([]); setSelectedDoa([])
      }
    } catch (e) { console.error(e) }
    finally { setLoadingTarget(false) }
  }

  const handleSave = async () => {
    if (!selectedSantriId) return
    setSaving(true)
    try {
      const res = await upsertTargetSantri({
        santri_id: selectedSantriId,
        target_ziyadah: ziyadah,
        target_murojaah: murojaah,
        target_tasmi: tasmi,
        target_pilihan: toBitmask(selectedPilihan),
        target_hadits: toBitmask(selectedHadits),
        target_doa: toBitmask(selectedDoa),
      })
      if (res.error) throw new Error(res.error)
      showToast('success', 'Target berhasil disimpan!')
    } catch (err: any) {
      showToast('error', 'Gagal menyimpan: ' + err.message)
    } finally { setSaving(false) }
  }

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <Loader2 className="animate-spin text-teal-300" size={32} />
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[9999] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border animate-in slide-in-from-top-2 duration-300 ${
          toast.type === 'success' ? 'bg-teal-500/90 backdrop-blur-xl border-teal-400/50 text-white' : 'bg-red-500/90 backdrop-blur-xl border-red-400/50 text-white'
        }`}>
          {toast.type === 'success' ? <CheckCircle size={20} className="shrink-0" /> : <XCircle size={20} className="shrink-0" />}
          <span className="font-semibold text-sm">{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="relative overflow-hidden bg-white/10 backdrop-blur-2xl text-white rounded-3xl p-7 border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-yellow-400/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-yellow-400/20 border border-yellow-300/30 flex items-center justify-center shrink-0">
            <Target size={24} className="text-yellow-300" />
          </div>
          <div>
            <p className="text-yellow-300 text-xs font-bold uppercase tracking-widest">Pengaturan</p>
            <h1 className="text-2xl font-bold text-white">Target Capaian Santri</h1>
            <p className="text-white/60 text-sm mt-0.5">Pilih target untuk masing-masing santri bimbingan Anda.</p>
            <div className="mt-3 inline-flex items-center gap-2 bg-white/10 border border-white/15 px-3 py-1.5 rounded-xl text-xs text-white/70">
              <span className="w-2 h-2 rounded-full bg-teal-400 inline-block shrink-0" />
              Target bersifat <strong className="text-white/90">permanen</strong> — berlaku terus sampai diubah manual.
            </div>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white/10 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.2)] space-y-8">

        {/* Pilih Santri */}
        <div>
          <label className="block text-sm font-bold text-white/80 mb-2 flex items-center gap-2">
            <User size={16} className="text-teal-300" /> Pilih Santri
          </label>
          <select
            value={selectedSantriId}
            onChange={e => handleSelectSantri(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-white/20 focus:ring-2 focus:ring-teal-400 outline-none font-bold text-white bg-white/10 backdrop-blur [color-scheme:dark]"
          >
            <option value="" className="bg-slate-800">-- Silakan Pilih Santri --</option>
            {santriList.map(s => (
              <option key={s.id} value={s.id} className="bg-slate-800">{s.nama} ({s.nis})</option>
            ))}
          </select>
          {santriList.length === 0 && (
            <p className="text-red-400 text-xs mt-2 font-medium">⚠ Tidak ada santri aktif terdaftar pada kelas Anda.</p>
          )}
        </div>

        {/* Form Target */}
        {selectedSantriId && (
          <div className="space-y-5 animate-in fade-in duration-300">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="text-base font-bold text-white">
                Target untuk: <span className="text-yellow-300">{selectedSantri?.nama}</span>
                {selectedSantri?.kelas && (
                  <span className="ml-2 text-xs text-white/50 font-normal">
                    ({Array.isArray(selectedSantri.kelas) ? selectedSantri.kelas[0]?.nama : selectedSantri.kelas?.nama})
                  </span>
                )}
              </h2>
              {loadingTarget && <Loader2 size={18} className="animate-spin text-white/50" />}
            </div>

            {/* ── Row 1: Single-value numeric selects ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

              {/* Ziyadah */}
              <div className="bg-teal-400/10 backdrop-blur rounded-2xl p-4 border border-teal-400/30 space-y-3">
                <div className="flex items-center gap-2">
                  <BookOpen size={15} className="text-teal-300" />
                  <span className="text-xs font-bold text-teal-300 uppercase tracking-wide">Ziyadah</span>
                </div>
                <select value={ziyadah} onChange={e => setZiyadah(parseFloat(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border border-white/20 focus:ring-2 focus:ring-teal-400 outline-none font-bold text-white text-lg bg-white/10 [color-scheme:dark]">
                  {JUZ_OPTIONS.map(v => <option key={v} value={v} className="bg-slate-800">{v} Juz</option>)}
                </select>
              </div>

              {/* Murojaah */}
              <div className="bg-blue-400/10 backdrop-blur rounded-2xl p-4 border border-blue-400/30 space-y-3">
                <div className="flex items-center gap-2">
                  <BookMarked size={15} className="text-blue-300" />
                  <span className="text-xs font-bold text-blue-300 uppercase tracking-wide">Muroja'ah</span>
                </div>
                <select value={murojaah} onChange={e => setMurojaah(parseFloat(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border border-white/20 focus:ring-2 focus:ring-blue-400 outline-none font-bold text-white text-lg bg-white/10 [color-scheme:dark]">
                  {JUZ_OPTIONS.map(v => <option key={v} value={v} className="bg-slate-800">{v} Juz</option>)}
                </select>
              </div>

              {/* Tasmi' */}
              <div className="bg-purple-400/10 backdrop-blur rounded-2xl p-4 border border-purple-400/30 space-y-3">
                <div className="flex items-center gap-2">
                  <Mic size={15} className="text-purple-300" />
                  <span className="text-xs font-bold text-purple-300 uppercase tracking-wide">Tasmi'</span>
                </div>
                <select value={tasmi} onChange={e => setTaski(parseInt(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border border-white/20 focus:ring-2 focus:ring-purple-400 outline-none font-bold text-white text-lg bg-white/10 [color-scheme:dark]">
                  {TASMI_OPTIONS.map(v => <option key={v} value={v} className="bg-slate-800">{v} Kali</option>)}
                </select>
              </div>
            </div>

            {/* ── Row 2: Multi-select checkbox dropdowns ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

              {/* Ayat Pilihan */}
              <div className="bg-orange-400/10 backdrop-blur rounded-2xl p-4 border border-orange-400/30 space-y-3">
                <div className="flex items-center gap-2">
                  <Star size={15} className="text-orange-300" />
                  <span className="text-xs font-bold text-orange-300 uppercase tracking-wide">Ayat Pilihan</span>
                </div>
                <CheckboxDropdown
                  options={AYAT_PILIHAN_OPTIONS}
                  selectedNos={selectedPilihan}
                  onChange={setSelectedPilihan}
                  placeholder="Pilih ayat..."
                />
              </div>

              {/* Hadits */}
              <div className="bg-emerald-400/10 backdrop-blur rounded-2xl p-4 border border-emerald-400/30 space-y-3">
                <div className="flex items-center gap-2">
                  <BookText size={15} className="text-emerald-300" />
                  <span className="text-xs font-bold text-emerald-300 uppercase tracking-wide">Hafalan Hadits</span>
                </div>
                <CheckboxDropdown
                  options={haditsOptions}
                  selectedNos={selectedHadits}
                  onChange={setSelectedHadits}
                  placeholder="Pilih hadits..."
                />
              </div>

              {/* Do'a Harian */}
              <div className="bg-pink-400/10 backdrop-blur rounded-2xl p-4 border border-pink-400/30 space-y-3">
                <div className="flex items-center gap-2">
                  <Heart size={15} className="text-pink-300" />
                  <span className="text-xs font-bold text-pink-300 uppercase tracking-wide">Do&#39;a Harian</span>
                </div>
                <CheckboxDropdown
                  options={doaOptions}
                  selectedNos={selectedDoa}
                  onChange={setSelectedDoa}
                  placeholder="Pilih do'a..."
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-teal-500/30 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed">
                {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                Simpan Target
              </button>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!selectedSantriId && (
          <div className="text-center py-12">
            <User size={48} className="mx-auto mb-3 text-white/20" />
            <p className="text-white/40 font-medium">Pilih santri untuk melihat dan mengatur target capaian.</p>
          </div>
        )}
      </div>
    </div>
  )
}
