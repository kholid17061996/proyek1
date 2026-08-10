'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase/client'
import { Plus, Edit2, Trash2, Search, Loader2, Key } from 'lucide-react'
import { createPengajarAccount } from '@/app/actions/auth'

type Pengajar = {
  id: string
  profile_id: string | null
  nama: string
  kode_pengajar: string
  kelas: string
  no_hp: string
  status: string
}

type Profile = {
  id: string
  full_name: string
  email: string
}

export default function DataPengajarPage() {
  const [pengajarList, setPengajarList] = useState<Pengajar[]>([])
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  
  // Form states
  const [nama, setNama] = useState('')
  const [kodePengajar, setKodePengajar] = useState('')
  const [kelas, setKelas] = useState('')
  const [noHp, setNoHp] = useState('')
  const [status, setStatus] = useState('aktif')
  
  // Auth states
  const [profileId, setProfileId] = useState<string>('')
  const [buatAkunOtomatis, setBuatAkunOtomatis] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    
    // Fetch Pengajar
    const { data: pengajarData } = await supabase
      .from('pengajar')
      .select('*')
      .order('nama', { ascending: true })
    
    if (pengajarData) setPengajarList(pengajarData)

    // Fetch Profiles for linking
    const { data: profileData } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('role', 'pengajar')
      
    if (profileData) setProfiles(profileData)

    setLoading(false)
  }

  const handleOpenModal = (pengajar?: Pengajar) => {
    if (pengajar) {
      setEditId(pengajar.id)
      setNama(pengajar.nama)
      setKodePengajar(pengajar.kode_pengajar)
      setKelas(pengajar.kelas || '')
      setNoHp(pengajar.no_hp || '')
      setStatus(pengajar.status)
      setProfileId(pengajar.profile_id || '')
      setBuatAkunOtomatis(false)
    } else {
      setEditId(null)
      setNama('')
      setKodePengajar(`PGJ-${Math.floor(1000 + Math.random() * 9000)}`) // Auto generate simple code
      setKelas('')
      setNoHp('')
      setStatus('aktif')
      setProfileId('')
      setBuatAkunOtomatis(false)
      setEmail('')
      setPassword('')
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

    let finalProfileId = profileId === '' ? null : profileId

    // Jika Buat Akun Otomatis dicentang, kita panggil Server Action
    if (!editId && buatAkunOtomatis) {
      const formData = new FormData()
      formData.append('email', email)
      formData.append('password', password)
      formData.append('nama', nama)

      const result = await createPengajarAccount(formData)
      if (result.error) {
        alert(result.error)
        setIsSubmitting(false)
        return
      }
      if (result.success && result.profileId) {
        finalProfileId = result.profileId
      }
    }

    const payload = { 
      nama, 
      kode_pengajar: kodePengajar,
      kelas,
      no_hp: noHp,
      status,
      profile_id: finalProfileId
    }

    if (editId) {
      const { error } = await supabase.from('pengajar').update(payload).eq('id', editId)
      if (!error) {
        fetchData()
        handleCloseModal()
      } else {
        alert('Gagal mengupdate data: ' + error.message)
      }
    } else {
      const { error } = await supabase.from('pengajar').insert([payload])
      if (!error) {
        fetchData()
        handleCloseModal()
      } else {
        alert('Gagal menambah data: ' + error.message)
      }
    }
    
    setIsSubmitting(false)
  }

  const handleDelete = async (id: string, namaPengajar: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus data pengajar ${namaPengajar}?`)) {
      const { error } = await supabase.from('pengajar').delete().eq('id', id)
      if (!error) {
        fetchData()
      } else {
        alert('Gagal menghapus data: ' + error.message)
      }
    }
  }

  const filteredPengajar = pengajarList.filter(p => 
    p.nama.toLowerCase().includes(search.toLowerCase()) || 
    p.kode_pengajar.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Pengajar</h1>
          <p className="text-gray-500 mt-1">Kelola data ustaz/ustazah dan hubungkan ke akun login.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-slate hover:bg-slateHover text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <Plus size={18} />
          Tambah Pengajar
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari nama atau kode pengajar..." 
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
                <th className="p-4 font-semibold">Kode</th>
                <th className="p-4 font-semibold">Nama Pengajar</th>
                <th className="p-4 font-semibold">Kelas/Kelompok</th>
                <th className="p-4 font-semibold">Kontak</th>
                <th className="p-4 font-semibold">Akun Terhubung</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    <Loader2 className="animate-spin mx-auto mb-2" size={24} />
                    Memuat data...
                  </td>
                </tr>
              ) : filteredPengajar.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    Belum ada data pengajar yang ditemukan.
                  </td>
                </tr>
              ) : (
                filteredPengajar.map((pengajar) => {
                  const linkedProfile = profiles.find(p => p.id === pengajar.profile_id)
                  return (
                    <tr key={pengajar.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4 text-gray-600 font-mono text-sm">{pengajar.kode_pengajar}</td>
                      <td className="p-4 font-medium text-gray-900">{pengajar.nama}</td>
                      <td className="p-4 text-gray-600">{pengajar.kelas || '-'}</td>
                      <td className="p-4 text-gray-600">{pengajar.no_hp || '-'}</td>
                      <td className="p-4">
                        {linkedProfile ? (
                          <div className="flex items-center gap-1.5 text-xs text-green-700 bg-green-50 px-2 py-1 rounded-md w-max border border-green-100">
                            <Key size={14} />
                            {linkedProfile.email}
                          </div>
                        ) : (
                          <span className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded-md border border-red-100">Belum Terhubung</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                          pengajar.status === 'aktif' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {pengajar.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button 
                          onClick={() => handleOpenModal(pengajar)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors inline-flex"
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(pengajar.id, pengajar.nama)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors inline-flex"
                          title="Hapus"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm overflow-y-auto pt-20 pb-10" onClick={handleCloseModal}></div>
          <div className="bg-white rounded-2xl w-full max-w-lg relative z-10 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 sticky top-0 z-20">
              <h2 className="text-xl font-bold text-gray-900">
                {editId ? 'Edit Data Pengajar' : 'Tambah Pengajar Baru'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kode Pengajar</label>
                  <input 
                    type="text" 
                    required
                    value={kodePengajar}
                    onChange={(e) => setKodePengajar(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-gray-50 focus:ring-2 focus:ring-emas focus:border-emas outline-none font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                  <input 
                    type="text" 
                    required
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emas focus:border-emas outline-none"
                    placeholder="Nama ustaz/ustazah..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kelas/Kelompok</label>
                  <input 
                    type="text" 
                    value={kelas}
                    onChange={(e) => setKelas(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emas focus:border-emas outline-none"
                    placeholder="Misal: Kelompok A"
                  />
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
              </div>

              {/* Seksi Pembuatan Akun Auth */}
              <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-blue-800 font-medium text-sm">
                    <Key size={16} /> Akses Login Aplikasi
                  </div>
                  
                  {!editId && (
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={buatAkunOtomatis}
                        onChange={(e) => {
                          setBuatAkunOtomatis(e.target.checked)
                          setProfileId('')
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                      />
                      <span className="text-blue-900 font-medium">Buatkan Akun Baru</span>
                    </label>
                  )}
                </div>

                {!buatAkunOtomatis ? (
                  <div>
                    <select 
                      value={profileId}
                      onChange={(e) => setProfileId(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-blue-200 bg-white focus:ring-2 focus:ring-blue-400 outline-none text-sm"
                    >
                      <option value="">-- Tidak Terhubung (Pilih Profil Jika Ada) --</option>
                      {profiles.map(p => (
                        <option key={p.id} value={p.id}>{p.full_name} ({p.email})</option>
                      ))}
                    </select>
                    <p className="text-xs text-blue-600 mt-1.5 leading-relaxed">
                      Pilih dari akun yang sudah ada, atau centang "Buatkan Akun Baru" di atas.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4 mt-2 animate-in fade-in duration-300">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Email Login</label>
                      <input 
                        type="email" 
                        required={buatAkunOtomatis}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-400 outline-none text-sm"
                        placeholder="pengajar@mutabaah.com"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Password</label>
                      <input 
                        type="password" 
                        required={buatAkunOtomatis}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-400 outline-none text-sm"
                        placeholder="Minimal 6 karakter"
                        minLength={6}
                      />
                    </div>
                  </div>
                )}
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
