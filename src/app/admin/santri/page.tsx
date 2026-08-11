'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/utils/supabase/client'
import { Plus, Edit2, Trash2, Search, Loader2, Users, FileUp, Download, ArrowUpDown } from 'lucide-react'
import * as XLSX from 'xlsx'

// Types based on schema
type Santri = {
  id: string
  kode_santri: string
  nis: string
  nama: string
  kelas_id: string
  pengajar_id: string
  tanggal_masuk: string
  created_at?: string
  status: string
  kelas: { nama: string }
  pengajar: { nama: string }
}

type Kelas = { id: string, nama: string }
type Pengajar = { id: string, nama: string }
type Ortu = { id: string, nama: string, kode_akses: string }

export default function DataSantriPage() {
  const [santriList, setSantriList] = useState<Santri[]>([])
  const [kelasList, setKelasList] = useState<Kelas[]>([])
  const [pengajarList, setPengajarList] = useState<Pengajar[]>([])
  const [ortuList, setOrtuList] = useState<Ortu[]>([])
  
  const [loading, setLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('urut')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  
  // Form states
  const [kodeSantri, setKodeSantri] = useState('')
  const [nis, setNis] = useState('')
  const [nama, setNama] = useState('')
  const [kelasId, setKelasId] = useState('')
  const [pengajarId, setPengajarId] = useState('')
  const [tanggalMasuk, setTanggalMasuk] = useState('')
  const [status, setStatus] = useState('aktif')
  
  // Hubungan Ortu state (hanya untuk create perdana)
  const [ortuId, setOrtuId] = useState('')
  const [hubunganOrtu, setHubunganOrtu] = useState('Ayah')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    
    const { data: santriData } = await supabase
      .from('santri')
      .select(`
        *,
        kelas ( nama ),
        pengajar ( nama )
      `)
      .order('nama', { ascending: true })
    
    if (santriData) setSantriList(santriData as any)

    const [resKelas, resPengajar, resOrtu] = await Promise.all([
      supabase.from('kelas').select('id, nama').eq('status', 'aktif'),
      supabase.from('pengajar').select('id, nama').eq('status', 'aktif'),
      supabase.from('ortu').select('id, nama, kode_akses').eq('status', 'aktif')
    ])

    if (resKelas.data) setKelasList(resKelas.data)
    if (resPengajar.data) setPengajarList(resPengajar.data)
    if (resOrtu.data) setOrtuList(resOrtu.data)

    setLoading(false)
  }

  const handleOpenModal = (santri?: Santri) => {
    if (santri) {
      setEditId(santri.id)
      setKodeSantri(santri.kode_santri)
      setNis(santri.nis || '')
      setNama(santri.nama)
      setKelasId(santri.kelas_id || '')
      setPengajarId(santri.pengajar_id || '')
      setTanggalMasuk(santri.tanggal_masuk || '')
      setStatus(santri.status)
      setOrtuId('')
    } else {
      setEditId(null)
      setKodeSantri(`ST-${Math.floor(10000 + Math.random() * 90000)}`)
      setNis('')
      setNama('')
      setKelasId('')
      setPengajarId('')
      setTanggalMasuk(new Date().toISOString().split('T')[0])
      setStatus('aktif')
      setOrtuId('')
      setHubunganOrtu('Ayah')
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
      kode_santri: kodeSantri,
      nis: nis || null,
      nama,
      kelas_id: kelasId || null,
      pengajar_id: pengajarId || null,
      tanggal_masuk: tanggalMasuk || null,
      status
    }

    if (editId) {
      const { error } = await supabase.from('santri').update(payload).eq('id', editId)
      if (!error) {
        fetchData()
        handleCloseModal()
      } else {
        alert('Gagal mengupdate siswa: ' + error.message)
      }
    } else {
      const { data: newSantri, error } = await supabase.from('santri').insert([payload]).select().single()
      
      if (!error && newSantri) {
        if (ortuId) {
          await supabase.from('ortu_santri').insert([{
            ortu_id: ortuId,
            santri_id: newSantri.id,
            hubungan: hubunganOrtu,
            is_primary: true
          }])
        }
        fetchData()
        handleCloseModal()
      } else {
        alert('Gagal menambah siswa: ' + error?.message)
      }
    }
    
    setIsSubmitting(false)
  }

  const handleDelete = async (id: string, namaSantri: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus data Siswa ${namaSantri}?`)) {
      const { error } = await supabase.from('santri').delete().eq('id', id)
      if (!error) {
        fetchData()
      } else {
        alert('Gagal menghapus data: ' + error.message)
      }
    }
  }

  const handleDownloadTemplate = async () => {
    try {
      const ExcelJS = (await import('exceljs')).default
      const { saveAs } = (await import('file-saver')).default || await import('file-saver')

      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Template Siswa')

      // Define columns
      worksheet.columns = [
        { header: 'NIS / Kode', key: 'nis', width: 15 },
        { header: 'Nama Siswa', key: 'nama', width: 25 },
        { header: 'Kelas', key: 'kelas', width: 20 },
        { header: 'Pengajar / Musyrif', key: 'pengajar', width: 25 },
        { header: 'Status', key: 'status', width: 15 }
      ]

      // Header styling
      worksheet.getRow(1).font = { bold: true }

      // Add a sample row
      worksheet.addRow({
        nis: '12345678',
        nama: 'Ahmad Abdullah',
        kelas: kelasList[0]?.nama || 'Kelas Abu Bakar',
        pengajar: pengajarList[0]?.nama || 'Ustaz Fulan',
        status: 'aktif'
      })

      // Prepare dropdown lists
      // ExcelJS formulae for list data validation require comma-separated strings inside quotes: '"item1,item2"'
      const kelasFormula = `"${kelasList.map(k => k.nama).join(',')}"`
      const pengajarFormula = `"${pengajarList.map(p => p.nama).join(',')}"`
      const statusFormula = '"aktif,nonaktif"'

      // Apply data validation to rows 2 to 1000
      for (let i = 2; i <= 1000; i++) {
        // Dropdown for Kelas (Column C)
        if (kelasList.length > 0) {
          worksheet.getCell(`C${i}`).dataValidation = {
            type: 'list',
            allowBlank: true,
            formulae: [kelasFormula]
          }
        }
        
        // Dropdown for Pengajar (Column D)
        if (pengajarList.length > 0) {
          worksheet.getCell(`D${i}`).dataValidation = {
            type: 'list',
            allowBlank: true,
            formulae: [pengajarFormula]
          }
        }

        // Dropdown for Status (Column E)
        worksheet.getCell(`E${i}`).dataValidation = {
          type: 'list',
          allowBlank: true,
          formulae: [statusFormula]
        }
      }

      // Generate file and trigger download
      const buffer = await workbook.xlsx.writeBuffer()
      saveAs(new Blob([buffer]), 'template_data_siswa.xlsx')

    } catch (error) {
      console.error('Error generating template:', error)
      alert('Gagal membuat template Excel.')
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const reader = new FileReader()
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result
        const wb = XLSX.read(bstr, { type: 'binary' })
        const wsname = wb.SheetNames[0]
        const ws = wb.Sheets[wsname]
        const data = XLSX.utils.sheet_to_json(ws) as any[]

        if (data.length === 0) {
          alert('File Excel kosong atau format tidak sesuai.')
          setIsUploading(false)
          return
        }

        let successCount = 0
        let errorCount = 0

        // Process each row
        for (const row of data) {
          const nama = row['Nama Siswa'] || row.nama_siswa || row.nama
          if (!nama) continue

          const nis = row['NIS / Kode'] || row.nis_kode || row.nis
          const kelas = row['Kelas'] || row.kelas || row.nama_kelas
          const pengajar = row['Pengajar / Musyrif'] || row.pengajar
          const status = row['Status'] || row.status || 'aktif'

          // Find class ID if provided
          let assignedKelasId = null
          if (kelas) {
            const foundKelas = kelasList.find(k => k.nama.toLowerCase() === kelas.toString().toLowerCase())
            if (foundKelas) assignedKelasId = foundKelas.id
          }

          // Find pengajar ID if provided
          let assignedPengajarId = null
          if (pengajar) {
            const foundPengajar = pengajarList.find(p => p.nama.toLowerCase() === pengajar.toString().toLowerCase())
            if (foundPengajar) assignedPengajarId = foundPengajar.id
          }

          const payload = {
            kode_santri: `ST-${Math.floor(10000 + Math.random() * 90000)}`,
            nis: nis ? nis.toString() : null,
            nama: nama,
            kelas_id: assignedKelasId,
            pengajar_id: assignedPengajarId,
            tanggal_masuk: new Date().toISOString().split('T')[0],
            status: status.toString().toLowerCase()
          }

          const { error } = await supabase.from('santri').insert([payload])
          if (error) errorCount++
          else successCount++
        }

        alert(`Import selesai! Berhasil: ${successCount}, Gagal: ${errorCount}`)
        fetchData()

      } catch (err) {
        console.error(err)
        alert('Terjadi kesalahan saat membaca file Excel.')
      } finally {
        setIsUploading(false)
        if (fileInputRef.current) fileInputRef.current.value = ''
      }
    }
    reader.readAsBinaryString(file)
  }

  const filteredSantri = [...santriList]
    .filter(s => 
      s.nama.toLowerCase().includes(search.toLowerCase()) ||
      s.nis?.toLowerCase().includes(search.toLowerCase()) ||
      s.kode_santri.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      let comparison = 0
      if (sortBy === 'nis') {
        comparison = (a.nis || '').localeCompare(b.nis || '')
      } else if (sortBy === 'nama') {
        comparison = a.nama.localeCompare(b.nama)
      } else if (sortBy === 'kelas') {
        comparison = (a.kelas?.nama || '').localeCompare(b.kelas?.nama || '')
      } else if (sortBy === 'pengajar') {
        comparison = (a.pengajar?.nama || '').localeCompare(b.pengajar?.nama || '')
      } else if (sortBy === 'urut') {
        comparison = (a.created_at || '').localeCompare(b.created_at || '')
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Siswa</h1>
          <p className="text-gray-500 mt-1">Kelola data siswa, penempatan kelas, dan pengajarnya.</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full lg:w-auto">
          <button 
            onClick={handleDownloadTemplate}
            className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            <Download size={18} className="text-gray-500" />
            <span className="hidden sm:inline">Unduh Template</span>
          </button>
          
          <input 
            type="file" 
            accept=".xlsx, .xls" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleFileUpload}
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            {isUploading ? <Loader2 size={18} className="animate-spin" /> : <FileUp size={18} />}
            <span className="hidden sm:inline">Import Excel</span>
          </button>
          
          <button 
            onClick={() => handleOpenModal()}
            className="bg-slate hover:bg-slateHover text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Tambah Siswa</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari nama, NIS, atau kode siswa..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emas focus:border-emas"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 font-medium">Urut Berdasarkan:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emas focus:border-emas bg-white cursor-pointer"
            >
              <option value="urut">Nomer Urut</option>
              <option value="nis">NIS / Kode</option>
              <option value="nama">Nama Siswa</option>
              <option value="kelas">Kelas</option>
              <option value="pengajar">Pengajar / Musyrif</option>
            </select>
            <button
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
              title={sortOrder === 'asc' ? 'Urutkan Menurun' : 'Urutkan Menaik'}
            >
              <ArrowUpDown size={18} />
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-100">
                <th className="p-4 font-semibold w-16">No.</th>
                <th className="p-4 font-semibold">NIS / Kode</th>
                <th className="p-4 font-semibold">Nama Siswa</th>
                <th className="p-4 font-semibold">Kelas</th>
                <th className="p-4 font-semibold">Pengajar / Musyrif</th>
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
              ) : filteredSantri.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    Belum ada data siswa yang ditemukan.
                  </td>
                </tr>
              ) : (
                filteredSantri.map((santri, index) => (
                  <tr key={santri.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 text-gray-500">{index + 1}</td>
                    <td className="p-4">
                      <div className="font-medium text-gray-900">{santri.nis || '-'}</div>
                      <div className="text-xs text-gray-500 font-mono">{santri.kode_santri}</div>
                    </td>
                    <td className="p-4 font-bold text-slate">{santri.nama}</td>
                    <td className="p-4">
                      {santri.kelas ? (
                        <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md text-sm border border-blue-100">
                          {santri.kelas.nama}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic text-sm">Belum ditentukan</span>
                      )}
                    </td>
                    <td className="p-4">
                      {santri.pengajar ? (
                        <span className="text-gray-700 text-sm flex items-center gap-1.5">
                          <Users size={14} className="text-gray-400" />
                          {santri.pengajar.nama}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic text-sm">-</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                        santri.status === 'aktif' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {santri.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button 
                        onClick={() => handleOpenModal(santri)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors inline-flex"
                        title="Edit"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(santri.id, santri.nama)}
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
          <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm overflow-y-auto pt-20 pb-10" onClick={handleCloseModal}></div>
          <div className="bg-white rounded-2xl w-full max-w-2xl relative z-10 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 sticky top-0 z-20">
              <h2 className="text-xl font-bold text-gray-900">
                {editId ? 'Edit Data Siswa' : 'Pendaftaran Siswa Baru'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              
              {/* Seksi Identitas */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate uppercase tracking-wider border-b pb-2">Identitas Siswa</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kode Siswa (Sistem)</label>
                    <input 
                      type="text" 
                      required
                      value={kodeSantri}
                      onChange={(e) => setKodeSantri(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-100 outline-none font-mono text-sm"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Induk Siswa (NIS)</label>
                    <input 
                      type="text" 
                      value={nis}
                      onChange={(e) => setNis(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emas focus:border-emas outline-none"
                      placeholder="Masukkan NIS..."
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap Siswa</label>
                  <input 
                    type="text" 
                    required
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emas focus:border-emas outline-none"
                    placeholder="Nama Lengkap..."
                  />
                </div>
              </div>

              {/* Seksi Akademik */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate uppercase tracking-wider border-b pb-2">Penempatan Akademik</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Kelas</label>
                    <select 
                      required
                      value={kelasId}
                      onChange={(e) => setKelasId(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-blue-200 bg-white focus:ring-2 focus:ring-blue-400 outline-none text-sm"
                    >
                      <option value="">-- Pilih Data Kelas --</option>
                      {kelasList.map(k => (
                        <option key={k.id} value={k.id}>{k.nama}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="bg-purple-50/50 p-3 rounded-xl border border-purple-100">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Pengajar</label>
                    <select 
                      required
                      value={pengajarId}
                      onChange={(e) => setPengajarId(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-purple-200 bg-white focus:ring-2 focus:ring-purple-400 outline-none text-sm"
                    >
                      <option value="">-- Pilih Data Pengajar --</option>
                      {pengajarList.map(p => (
                        <option key={p.id} value={p.id}>{p.nama}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Seksi Wali */}
              {!editId && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate uppercase tracking-wider border-b pb-2">Hubungkan Orang Tua / Wali</h3>
                  <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100">
                    <p className="text-xs text-amber-700 mb-3">
                      Hubungkan siswa ini dengan orang tua yang sudah terdaftar di menu Data Orang Tua.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Orang Tua</label>
                        <select 
                          value={ortuId}
                          onChange={(e) => setOrtuId(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-emas outline-none text-sm"
                        >
                          <option value="">-- Lewati / Jangan Hubungkan --</option>
                          {ortuList.map(o => (
                            <option key={o.id} value={o.id}>{o.nama} (Akses: {o.kode_akses})</option>
                          ))}
                        </select>
                      </div>
                      
                      {ortuId && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Hubungan</label>
                          <select 
                            value={hubunganOrtu}
                            onChange={(e) => setHubunganOrtu(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-emas outline-none text-sm"
                          >
                            <option value="Ayah">Ayah</option>
                            <option value="Ibu">Ibu</option>
                            <option value="Wali">Wali Lainnya</option>
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Seksi Lainnya */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Masuk</label>
                  <input 
                    type="date" 
                    value={tanggalMasuk}
                    onChange={(e) => setTanggalMasuk(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emas focus:border-emas outline-none"
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
              </div>

              <div className="pt-6 flex gap-3 border-t">
                <button 
                  type="button" 
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 bg-emas hover:bg-emasHover text-slate font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : 'Simpan Data Siswa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
