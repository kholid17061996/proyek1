'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase/client'
import { Plus, Edit2, Trash2, Search, Loader2, KeyRound } from 'lucide-react'

type Ortu = {
  id: string
  nama: string
  kode_akses: string
  no_hp: string
  status: string
}

export default function DataOrtuPage() {
  const [ortuList, setOrtuList] = useState<Ortu[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  
  // Form states
  const [nama, setNama] = useState('')
  const [kodeAkses, setKodeAkses] = useState('')
  const [noHp, setNoHp] = useState('')
  const [status, setStatus] = useState('aktif')

  useEffect(() => {
    fetchOrtu()
  }, [])

  const fetchOrtu = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('ortu')
      .select('*')
      .order('nama', { ascending: true })
    
    if (data) setOrtuList(data)
    setLoading(false)
  }

  const generateKodeAkses = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let kode = ''
    for (let i = 0; i < 6; i++) {
      if (i === 3) kode += '-'
      kode += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setKodeAkses(kode)
  }

  const handleOpenModal = (ortu?: Ortu) => {
    if (ortu) {
      setEditId(ortu.id)
      setNama(ortu.nama)
      setKodeAkses(ortu.kode_akses)
      setNoHp(ortu.no_hp || '')
      setStatus(ortu.status)
    } else {
      setEditId(null)
      setNama('')
      setNoHp('')
      setStatus('aktif')
      generateKodeAkses() // Auto generate on new
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditId(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const payload = { 
      nama, 
      kode_akses: kodeAkses,
      no_hp: noHp,
      status 
    }

    if (editId) {
      const { error } = await supabase.from('ortu').update(payload).eq('id', editId)
      if (!error) {
        fetchOrtu()
        handleCloseModal()
      } else {
        alert('Gagal mengupdate data: ' + error.message)
      }
    } else {
      const { error } = await supabase.from('ortu').insert([payload])
      if (!error) {
        fetchOrtu()
        handleCloseModal()
      } else {
        alert('Gagal menambah data: ' + error.message)
      }
    }
    
    setIsSubmitting(false)
  }

  const handleDelete = async (id: string, namaOrtu: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus data Orang Tua ${namaOrtu}?`)) {
      const { error } = await supabase.from('ortu').delete().eq('id', id)
      if (!error) {
        fetchOrtu()
      } else {
        alert('Gagal menghapus data: ' + error.message)
      }
    }
  }

  const filteredOrtu = ortuList.filter(o => 
    o.nama.toLowerCase().includes(search.toLowerCase()) ||
    o.kode_akses.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Orang Tua</h1>
          <p className="text-gray-500 mt-1">Kelola data wali santri dan berikan kode akses.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-slate hover:bg-slateHover text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <Plus size={18} />
          Tambah Orang Tua
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari nama atau kode akses..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emas focus:border-emas"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-100">
                <th className="p-4 font-semibold">Nama Orang Tua</th>
                <th className="p-4 font-semibold">Kode Akses</th>
                <th className="p-4 font-semibold">No. HP</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    <Loader2 className="animate-spin mx-auto mb-2" size={24} />
                    Memuat data...
                  </td>
                </tr>
              ) : filteredOrtu.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    Belum ada data orang tua yang ditemukan.
                  </td>
                </tr>
              ) : (
                filteredOrtu.map((ortu) => (
                  <tr key={ortu.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 font-medium text-gray-900">{ortu.nama}</td>
                    <td className="p-4">
                      <div className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg border border-amber-100 font-mono font-bold tracking-widest text-sm">
                        <KeyRound size={14} />
                        {ortu.kode_akses}
                      </div>
                    </td>
                    <td className="p-4 text-gray-600">{ortu.no_hp || '-'}</td>
                    <td className="p-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                        ortu.status === 'aktif' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {ortu.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button 
                        onClick={() => handleOpenModal(ortu)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors inline-flex"
                        title="Edit"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(ortu.id, ortu.nama)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors inline-flex"
                        title="Hapus"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={handleCloseModal}></div>
          <div className="bg-white rounded-2xl w-full max-w-md relative z-10 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">
                {editId ? 'Edit Data Orang Tua' : 'Tambah Orang Tua Baru'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Orang Tua / Wali</label>
                <input 
                  type="text" 
                  required
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emas focus:border-emas outline-none"
                  placeholder="Nama Lengkap..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kode Akses Aplikasi</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    required
                    value={kodeAkses}
                    onChange={(e) => setKodeAkses(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emas focus:border-emas outline-none font-mono font-bold tracking-widest uppercase bg-amber-50"
                  />
                  <button 
                    type="button"
                    onClick={generateKodeAkses}
                    className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors border border-gray-300"
                  >
                    Regenerate
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1.5">
                  Kode ini akan diberikan ke Orang Tua untuk login ke aplikasi tanpa password.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nomor HP</label>
                <input 
                  type="text" 
                  value={noHp}
                  onChange={(e) => setNoHp(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emas focus:border-emas outline-none"
                  placeholder="0812345..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select 
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emas focus:border-emas outline-none"
                >
                  <option value="aktif">Aktif</option>
                  <option value="nonaktif">Nonaktif</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 bg-emas hover:bg-emasHover text-slate font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : 'Simpan Data'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
