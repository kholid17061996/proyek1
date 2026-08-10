'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase/client'
import { Plus, Edit2, Trash2, Search, Loader2 } from 'lucide-react'

type Kelas = {
  id: string
  nama: string
  keterangan: string
  status: string
}

export default function DataKelasPage() {
  const [kelasList, setKelasList] = useState<Kelas[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  
  // Form states
  const [nama, setNama] = useState('')
  const [keterangan, setKeterangan] = useState('')
  const [status, setStatus] = useState('aktif')

  useEffect(() => {
    fetchKelas()
  }, [])

  const fetchKelas = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('kelas')
      .select('*')
      .order('nama', { ascending: true })
    
    if (data) setKelasList(data)
    setLoading(false)
  }

  const handleOpenModal = (kelas?: Kelas) => {
    if (kelas) {
      setEditId(kelas.id)
      setNama(kelas.nama)
      setKeterangan(kelas.keterangan || '')
      setStatus(kelas.status)
    } else {
      setEditId(null)
      setNama('')
      setKeterangan('')
      setStatus('aktif')
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

    const payload = { nama, keterangan, status }

    if (editId) {
      // Update
      const { error } = await supabase.from('kelas').update(payload).eq('id', editId)
      if (!error) {
        fetchKelas()
        handleCloseModal()
      } else {
        alert('Gagal mengupdate data: ' + error.message)
      }
    } else {
      // Insert
      const { error } = await supabase.from('kelas').insert([payload])
      if (!error) {
        fetchKelas()
        handleCloseModal()
      } else {
        alert('Gagal menambah data: ' + error.message)
      }
    }
    
    setIsSubmitting(false)
  }

  const handleDelete = async (id: string, namaKelas: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus kelas ${namaKelas}?`)) {
      const { error } = await supabase.from('kelas').delete().eq('id', id)
      if (!error) {
        fetchKelas()
      } else {
        alert('Gagal menghapus data: ' + error.message)
      }
    }
  }

  const filteredKelas = kelasList.filter(k => 
    k.nama.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Kelas / Kelompok</h1>
          <p className="text-gray-500 mt-1">Kelola data kelas atau kelompok tahfidz.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-slate hover:bg-slateHover text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <Plus size={18} />
          Tambah Kelas
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari nama kelas..." 
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
                <th className="p-4 font-semibold">Nama Kelas</th>
                <th className="p-4 font-semibold">Keterangan</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">
                    <Loader2 className="animate-spin mx-auto mb-2" size={24} />
                    Memuat data...
                  </td>
                </tr>
              ) : filteredKelas.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">
                    Belum ada data kelas yang ditemukan.
                  </td>
                </tr>
              ) : (
                filteredKelas.map((kelas) => (
                  <tr key={kelas.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 font-medium text-gray-900">{kelas.nama}</td>
                    <td className="p-4 text-gray-600">{kelas.keterangan || '-'}</td>
                    <td className="p-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                        kelas.status === 'aktif' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {kelas.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button 
                        onClick={() => handleOpenModal(kelas)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors inline-flex"
                        title="Edit"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(kelas.id, kelas.nama)}
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
                {editId ? 'Edit Kelas' : 'Tambah Kelas Baru'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kelas</label>
                <input 
                  type="text" 
                  required
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emas focus:border-emas outline-none"
                  placeholder="Misal: Kelas Abu Bakar"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan (Opsional)</label>
                <textarea 
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emas focus:border-emas outline-none"
                  placeholder="Deskripsi singkat..."
                  rows={3}
                ></textarea>
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
                  {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
