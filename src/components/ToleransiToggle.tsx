'use client'

import { useState, useEffect } from 'react'
import { getPengaturanBoolean, setPengaturanBoolean } from '@/app/actions/pengaturan'

export default function ToleransiToggle() {
  const [isActive, setIsActive] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPengaturanBoolean('toleransi_kls9_smt2_2026').then((val) => {
      setIsActive(val)
      setLoading(false)
    })
  }, [])

  const toggle = async () => {
    setLoading(true)
    const nextVal = !isActive
    const res = await setPengaturanBoolean(
      'toleransi_kls9_smt2_2026', 
      nextVal, 
      'Izinkan kelas 9 tahun 2026/2027 menyetorkan target semester 1 di semester 2'
    )
    if (res.success) {
      setIsActive(nextVal)
    } else {
      alert('Gagal menyimpan pengaturan: ' + res.error)
    }
    setLoading(false)
  }

  if (loading && !isActive) return <div className="text-white/50 text-sm">Memuat pengaturan...</div>

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.1)] border border-white/20 hover:bg-white/20 transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Toleransi Target Kelas 9 (T.A. 2026/2027)</h3>
          <p className="text-sm text-white/70 mt-1">
            Fungsi: Mengingat target kelas 9 tahun ini diborong semua di Semester 1, jika diaktifkan saat Semester 2 berjalan, maka target-target yang belum selesai akan tetap muncul di akun pengajar agar kelas 9 masih boleh menyetorkannya.
          </p>
        </div>
        <button 
          onClick={toggle}
          disabled={loading}
          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors shrink-0 ${isActive ? 'bg-teal-500' : 'bg-slate-500'}`}
        >
          <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${isActive ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
      </div>
      <div className="mt-3 text-sm font-medium">
        Status: {isActive ? <span className="text-teal-400">Aktif (Diizinkan)</span> : <span className="text-red-400">Tidak Aktif</span>}
      </div>
    </div>
  )
}
