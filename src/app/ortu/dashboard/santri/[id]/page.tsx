'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabase/client'
import { getSantriDashboardData } from '@/app/actions/santri'
import { 
  BookOpen, RefreshCw, Mic, Star, Book, HandHeart, 
  Calendar, User, Printer, Share2, CheckCircle2, 
  ThumbsUp, Sparkles, MessageCircle, Info, Clock 
} from 'lucide-react'
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip 
} from 'recharts'
import Image from 'next/image'

const CircularProgress = ({ value, label, color, statusText, statusColor }: { value: number, label: string, color: string, statusText: string, statusColor: string }) => {
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;
  
  return (
    <div className="flex flex-col items-center">
      <div className="relative inline-flex items-center justify-center mb-2">
        <svg className="transform -rotate-90 w-16 h-16">
          <circle cx="32" cy="32" r={radius} stroke="#f1f5f9" strokeWidth="4" fill="transparent" />
          <circle cx="32" cy="32" r={radius} stroke={color} strokeWidth="4" fill="transparent" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
        </svg>
        <div className="absolute flex flex-col items-center justify-center text-xs font-bold text-slate-800">
          <span>{value}%</span>
        </div>
      </div>
      <div className={`flex items-center gap-1 text-[10px] font-bold ${statusColor}`}>
        <div className={`w-2 h-2 rounded-full`} style={{ backgroundColor: color }}></div>
        {statusText}
      </div>
    </div>
  )
}

const ProgressBar = ({ value, color }: { value: number, color: string }) => {
  return (
    <div className="w-full bg-slate-100 rounded-full h-2">
      <div className="h-2 rounded-full transition-all duration-1000" style={{ width: `\${value}%`, backgroundColor: color }}></div>
    </div>
  )
}

export default function OrtuSantriDetailPage() {
  const params = useParams()
  const router = useRouter()
  const santriId = params.id as string

  const [loading, setLoading] = useState(true)
  const [santri, setSantri] = useState<any>(null)
  const [riwayatCapaian, setRiwayatCapaian] = useState<any[]>([])
  const [targetSantri, setTargetSantri] = useState<any>(null)
  const [laporanTerakhir, setLaporanTerakhir] = useState<any>(null)
  const [masterQuran, setMasterQuran] = useState<any[]>([])

  useEffect(() => {
    const sessionStr = localStorage.getItem('ortu_session_santri')
    if (!sessionStr) {
      router.push('/ortu')
      return
    }
    const session = JSON.parse(sessionStr)
    if (session.id !== santriId) {
      alert("Akses ditolak.")
      router.push('/ortu')
      return
    }
    fetchData(santriId)
  }, [santriId, router])

  const fetchData = async (sId: string) => {
    try {
      const result = await getSantriDashboardData(sId)
      if (result.error) {
        console.error(result.error)
      } else if (result.data) {
        setSantri(result.data.santri)
        setRiwayatCapaian(result.data.riwayatCapaian)
        setTargetSantri(result.data.targetSantri)
        setLaporanTerakhir(result.data.laporanTerakhir)
        setMasterQuran(result.data.masterQuran || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // --- Calculations ---
  const ziyadahCount = riwayatCapaian.filter(c => c.jenis_setoran === 'hafalan_baru').length
  const murojaahCount = riwayatCapaian.filter(c => c.jenis_setoran === 'murojaah').length
  const tasmiCount = riwayatCapaian.filter(c => c.jenis_setoran === 'tasmi').length
  const pilihanCount = riwayatCapaian.filter(c => c.jenis_setoran === 'ayat_pilihan').length
  const haditsCount = riwayatCapaian.filter(c => c.jenis_setoran === 'hadits').length
  const doaCount = riwayatCapaian.filter(c => c.jenis_setoran === 'doa_harian').length
  const tahsinCount = riwayatCapaian.filter(c => c.jenis_setoran === 'tahsin').length
  const tilawahCount = riwayatCapaian.filter(c => c.jenis_setoran === 'tilawah').length

  const stats = useMemo(() => {
    const tZiyadah = targetSantri?.target_ziyadah || 5;
    const tMurojaah = targetSantri?.target_murojaah || 5;
    const tTasmi = targetSantri?.target_tasmi || 5;
    const tPilihan = targetSantri?.target_pilihan || 20;
    const tHadits = targetSantri?.target_hadits || 15;
    const tDoa = targetSantri?.target_doa || 20;

    // Helper to calculate Juz fraction based on verses
    const getJuzFraction = (setoranList: any[]) => {
      let totalJuz = 0;
      for (const s of setoranList) {
        if (!s.juz || !masterQuran.length) {
          totalJuz += 0.05; // Fallback 1 halaman
          continue;
        }
        
        // Find all surahs in this juz
        const juzSurahs = masterQuran.filter(q => q.juz === s.juz);
        if (juzSurahs.length === 0) {
          totalJuz += 0.05;
          continue;
        }
        
        // Total verses in this juz
        const totalAyatJuz = juzSurahs.reduce((acc, curr) => acc + (curr.ayat_selesai - curr.ayat_mulai + 1), 0);
        
        // Calculate verses done in this setoran
        let ayatDone = 0;
        if (s.surat_mulai === s.surat_selesai) {
          ayatDone = (s.ayat_selesai - s.ayat_mulai) + 1;
        } else {
          // Cross-surah logic
          let started = false;
          for (const q of juzSurahs) {
            if (q.surah === s.surat_mulai) {
              started = true;
              ayatDone += (q.ayat_selesai - s.ayat_mulai) + 1;
            } else if (q.surah === s.surat_selesai) {
              ayatDone += (s.ayat_selesai - q.ayat_mulai) + 1;
              started = false;
              break;
            } else if (started) {
              ayatDone += (q.ayat_selesai - q.ayat_mulai) + 1;
            }
          }
        }
        
        if (ayatDone > 0 && totalAyatJuz > 0) {
          totalJuz += (ayatDone / totalAyatJuz);
        } else {
          totalJuz += 0.05; // Fallback
        }
      }
      return parseFloat(totalJuz.toFixed(2));
    };

    const cZiyadah = getJuzFraction(riwayatCapaian.filter(c => c.jenis_setoran === 'hafalan_baru'));
    const cMurojaah = getJuzFraction(riwayatCapaian.filter(c => c.jenis_setoran === 'murojaah'));
    const cTasmi = tasmiCount;
    const cPilihan = pilihanCount;
    const cHadits = haditsCount;
    const cDoa = doaCount;

    const pZiyadah = Math.min(100, Math.round((cZiyadah / tZiyadah) * 100)) || 0;
    const pMurojaah = Math.min(100, Math.round((cMurojaah / tMurojaah) * 100)) || 0;
    const pTasmi = Math.min(100, Math.round((cTasmi / tTasmi) * 100)) || 0;
    const pPilihan = Math.min(100, Math.round((cPilihan / tPilihan) * 100)) || 0;
    const pHadits = Math.min(100, Math.round((cHadits / tHadits) * 100)) || 0;
    const pDoa = Math.min(100, Math.round((cDoa / tDoa) * 100)) || 0;

    return {
      ziyadah: { target: tZiyadah, tercapai: cZiyadah, satuan: 'Juz', pct: pZiyadah, color: '#10b981' },
      murojaah: { target: tMurojaah, tercapai: cMurojaah, satuan: 'Juz', pct: pMurojaah, color: '#3b82f6' },
      tasmi: { target: tTasmi, tercapai: cTasmi, satuan: 'Kali', pct: pTasmi, color: '#8b5cf6' },
      pilihan: { target: tPilihan, tercapai: cPilihan, satuan: 'Ayat', pct: pPilihan, color: '#ec4899' },
      hadits: { target: tHadits, tercapai: cHadits, satuan: 'Hadits', pct: pHadits, color: '#f59e0b' },
      doa: { target: tDoa, tercapai: cDoa, satuan: "Do'a", pct: pDoa, color: '#14b8a6' },
    }
  }, [ziyadahCount, murojaahCount, tasmiCount, pilihanCount, haditsCount, doaCount, targetSantri, masterQuran, riwayatCapaian])


  const overallAvg = useMemo(() => {
    return Math.round((stats.ziyadah.pct + stats.murojaah.pct + stats.tasmi.pct + stats.pilihan.pct + stats.hadits.pct + stats.doa.pct) / 6);
  }, [stats])

  const getPredicate = (avg: number) => {
    if (avg >= 90) return 'Mumtaz';
    if (avg >= 80) return 'Jayyid Jiddan';
    if (avg >= 70) return 'Jayyid';
    if (avg >= 60) return 'Maqbul';
    return 'Perlu Pembinaan';
  }

  const radarData = [
    { subject: 'Ziyadah', A: stats.ziyadah.pct },
    { subject: 'Muroja\'ah', A: stats.murojaah.pct },
    { subject: 'Tasmi\'', A: stats.tasmi.pct },
    { subject: 'Ayat Pilihan', A: stats.pilihan.pct },
    { subject: 'Hadits', A: stats.hadits.pct },
    { subject: 'Do\'a Harian', A: stats.doa.pct },
  ]


  const areaData = useMemo(() => {
    const months = ['Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const buckets = [0, 0, 0, 0, 0, 0];
    
    riwayatCapaian.forEach((item) => {
      if (item.tanggal_setoran) {
        const date = new Date(item.tanggal_setoran);
        let m = date.getMonth(); 
        if (m >= 6 && m <= 11) {
          buckets[m - 6] += 1;
        }
      }
    });

    let cumulative = 0;
    return months.map((month, idx) => {
      cumulative += buckets[idx];
      return { name: month, val: cumulative };
    });
  }, [riwayatCapaian])

  const recentMaterials = useMemo(() => {
    const latest: any = {
      Ziyadah: null, Murojaah: null, Tasmi: null, Pilihan: null, Hadits: null, Doa: null, Tahsin: null, Tilawah: null
    };
    
    for (const item of riwayatCapaian) {
      if (!latest.Ziyadah && item.jenis_setoran === 'Ziyadah') latest.Ziyadah = `QS. ${item.surat_mulai || ''} ${item.ayat_mulai || ''}`;
      if (!latest.Murojaah && item.jenis_setoran === 'Murojaah') latest.Murojaah = `Juz ${item.juz || ''}`;
      if (!latest.Tasmi && item.jenis_setoran === 'Tasmi') latest.Tasmi = `Juz ${item.juz || ''}`;
      if (!latest.Pilihan && (item.jenis_setoran === 'Pilihan' || item.jenis_setoran === 'ayat_pilihan')) latest.Pilihan = `Ayat Pilihan (Surat ${item.surat_mulai || ''})`;
      if (!latest.Hadits && (item.jenis_setoran === 'Hadits' || item.jenis_setoran === 'hadits')) latest.Hadits = `Hadits ke-${item.surat_mulai || ''}`;
      if (!latest.Doa && (item.jenis_setoran === 'Doa' || item.jenis_setoran === 'doa_harian')) latest.Doa = `Do'a ke-${item.surat_mulai || ''}`;
      if (!latest.Tahsin && (item.jenis_setoran === 'Tahsin' || item.jenis_setoran === 'tahsin')) latest.Tahsin = `${item.surat_mulai || ''} Hal ${item.ayat_mulai || ''}`;
      if (!latest.Tilawah && (item.jenis_setoran === 'Tilawah' || item.jenis_setoran === 'tilawah')) latest.Tilawah = `QS. ${item.surat_mulai || ''} ${item.ayat_mulai || ''}-${item.ayat_selesai || ''}`;
    }
    return latest;
  }, [riwayatCapaian]);

  if (loading || !santri) return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  )

  const printDocument = () => window.print()

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 font-sans pb-10">
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body { background: white !important; }
          .no-print { display: none !important; }
          .print-shadow-none { box-shadow: none !important; border: 1px solid #e2e8f0 !important; }
        }
      `}} />
      
      {/* Header Info Banner */}
      <div className="bg-white px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-10 print-shadow-none">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">Laporan Perkembangan</h1>
          <p className="text-sm text-slate-500">Mutaba'ah Tahfidz Siswa</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 md:gap-6">
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 hidden md:flex">
            <div className="bg-purple-100 p-1.5 rounded-lg text-purple-600"><Calendar size={16} /></div>
            <div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase">Semester</p>
              <p className="text-xs font-bold text-slate-700">Ganjil (Semester 1)</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 hidden md:flex">
            <div className="bg-blue-100 p-1.5 rounded-lg text-blue-600"><BookOpen size={16} /></div>
            <div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase">Tahun Ajaran</p>
              <p className="text-xs font-bold text-slate-700">2026 / 2027</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 hidden sm:flex">
            <div className="bg-orange-100 p-1.5 rounded-lg text-orange-600"><User size={16} /></div>
            <div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase">Wali Siswa</p>
              <p className="text-xs font-bold text-slate-700">Bapak/Ibu Wali</p>
            </div>
          </div>
          <div className="flex gap-2 no-print">
            <button onClick={printDocument} className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-xl text-xs font-bold transition-colors">
              <Printer size={14} /> Cetak
            </button>
            <button className="flex items-center gap-2 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 px-3 py-2 rounded-xl text-xs font-bold transition-colors">
              <Share2 size={14} /> Bagikan
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ROW 1: Left Profile + Radar, Right 6 Cards */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm print-shadow-none flex flex-col">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-tr from-blue-400 to-emerald-400 rounded-full border-4 border-white shadow-md flex items-center justify-center overflow-hidden">
               <User size={32} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{santri.nama}</h2>
              <p className="text-sm text-slate-500">Kelas {santri.kelas?.nama} • Santri Tahfidz Mutqin</p>
            </div>
          </div>

          <div className="flex-1 min-h-[220px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Capaian" dataKey="A" stroke="#10b981" strokeWidth={2} fill="#10b981" fillOpacity={0.2} />
              </RadarChart>
            </ResponsiveContainer>
            
            <div className="absolute top-0 left-0">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Capaian Keseluruhan</p>
              <p className="text-5xl font-black text-emerald-500 my-1">{overallAvg}%</p>
              <div className="inline-flex items-center gap-1 bg-yellow-50 border border-yellow-200 text-yellow-700 px-2 py-1 rounded-lg text-xs font-bold shadow-sm">
                <Star size={12} className="fill-yellow-500" /> {getPredicate(overallAvg)}
              </div>
            </div>
          </div>
          
          <p className="text-xs text-slate-400 mt-4 text-center">Sangat baik! Terus pertahankan dan tingkatkan.</p>
        </div>

        <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm print-shadow-none">
          <h3 className="text-sm font-bold text-slate-800 mb-6 uppercase tracking-wider">Capaian Per Target Tahfidz</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            
            {/* Card 1: Ziyadah */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col">
              <div className="flex items-center gap-2 text-emerald-600 font-bold mb-4">
                <BookOpen size={18} /> Ziyadah
              </div>
              <div className="flex justify-between items-end mb-4">
                <div>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">Target</p>
                  <p className="text-sm font-bold text-slate-700">{stats.ziyadah.target} {stats.ziyadah.satuan}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">Tercapai</p>
                  <p className="text-sm font-bold text-slate-700">{stats.ziyadah.tercapai} {stats.ziyadah.satuan}</p>
                </div>
              </div>
              <CircularProgress value={stats.ziyadah.pct} label="Ziyadah" color={stats.ziyadah.color} statusText="Baik" statusColor="text-emerald-600" />
            </div>

            {/* Card 2: Murojaah */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col">
              <div className="flex items-center gap-2 text-blue-600 font-bold mb-4">
                <RefreshCw size={18} /> Muroja'ah
              </div>
              <div className="flex justify-between items-end mb-4">
                <div>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">Target</p>
                  <p className="text-sm font-bold text-slate-700">{stats.murojaah.target} {stats.murojaah.satuan}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">Tercapai</p>
                  <p className="text-sm font-bold text-slate-700">{stats.murojaah.tercapai} {stats.murojaah.satuan}</p>
                </div>
              </div>
              <CircularProgress value={stats.murojaah.pct} label="Muroja'ah" color={stats.murojaah.color} statusText="Dalam Proses" statusColor="text-orange-500" />
            </div>

            {/* Card 3: Tasmi */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col">
              <div className="flex items-center gap-2 text-purple-600 font-bold mb-4">
                <Mic size={18} /> Tasmi'
              </div>
              <div className="flex justify-between items-end mb-4">
                <div>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">Target</p>
                  <p className="text-sm font-bold text-slate-700">{stats.tasmi.target} {stats.tasmi.satuan}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">Tercapai</p>
                  <p className="text-sm font-bold text-slate-700">{stats.tasmi.tercapai} {stats.tasmi.satuan}</p>
                </div>
              </div>
              <CircularProgress value={stats.tasmi.pct} label="Tasmi'" color={stats.tasmi.color} statusText="Sangat Baik" statusColor="text-emerald-600" />
            </div>

            {/* Card 4: Ayat Pilihan */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col">
              <div className="flex items-center gap-2 text-pink-600 font-bold mb-4">
                <Star size={18} className="fill-pink-600" /> Ayat Pilihan
              </div>
              <div className="flex justify-between items-end mb-4">
                <div>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">Target</p>
                  <p className="text-sm font-bold text-slate-700">{stats.pilihan.target} {stats.pilihan.satuan}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">Tercapai</p>
                  <p className="text-sm font-bold text-slate-700">{stats.pilihan.tercapai} {stats.pilihan.satuan}</p>
                </div>
              </div>
              <CircularProgress value={stats.pilihan.pct} label="Pilihan" color={stats.pilihan.color} statusText="Sangat Baik" statusColor="text-emerald-600" />
            </div>

            {/* Card 5: Hadits */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col">
              <div className="flex items-center gap-2 text-orange-500 font-bold mb-4">
                <Book size={18} /> Hadits
              </div>
              <div className="flex justify-between items-end mb-4">
                <div>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">Target</p>
                  <p className="text-sm font-bold text-slate-700">{stats.hadits.target} {stats.hadits.satuan}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">Tercapai</p>
                  <p className="text-sm font-bold text-slate-700">{stats.hadits.tercapai} {stats.hadits.satuan}</p>
                </div>
              </div>
              <CircularProgress value={stats.hadits.pct} label="Hadits" color={stats.hadits.color} statusText="Baik" statusColor="text-emerald-600" />
            </div>

            {/* Card 6: Doa Harian */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col">
              <div className="flex items-center gap-2 text-teal-600 font-bold mb-4">
                <HandHeart size={18} /> Do'a Harian
              </div>
              <div className="flex justify-between items-end mb-4">
                <div>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">Target</p>
                  <p className="text-sm font-bold text-slate-700">{stats.doa.target} {stats.doa.satuan}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">Tercapai</p>
                  <p className="text-sm font-bold text-slate-700">{stats.doa.tercapai} {stats.doa.satuan}</p>
                </div>
              </div>
              <CircularProgress value={stats.doa.pct} label="Do'a" color={stats.doa.color} statusText="Sangat Baik" statusColor="text-emerald-600" />
            </div>

          </div>
        </div>

        {/* ROW 2: Linear Rincian (4), Chart (5), Ringkasan (3) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm print-shadow-none">
          <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
            <span>Target</span>
            <span className="w-16">Tercapai</span>
            <span className="w-12 text-right">Progress</span>
          </div>
          
          <div className="space-y-4 mt-4">
            {[
              { label: 'Ziyadah', desc: 'Menambah hafalan baru', val: stats.ziyadah, icon: <BookOpen size={16} className="text-emerald-600" /> },
              { label: 'Muroja\'ah', desc: 'Mengulang hafalan', val: stats.murojaah, icon: <RefreshCw size={16} className="text-blue-600" /> },
              { label: 'Tasmi\'', desc: 'Setoran hafalan kepada guru', val: stats.tasmi, icon: <Mic size={16} className="text-purple-600" /> },
              { label: 'Ayat Pilihan', desc: 'Menghafal ayat-ayat pilihan', val: stats.pilihan, icon: <Star size={16} className="fill-pink-600 text-pink-600" /> },
              { label: 'Hadits', desc: 'Menghafal hadits pilihan', val: stats.hadits, icon: <Book size={16} className="text-orange-500" /> },
              { label: 'Do\'a Harian', desc: 'Menghafal do\'a harian', val: stats.doa, icon: <HandHeart size={16} className="text-teal-600" /> },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <div className="flex items-start gap-2 w-1/3">
                  <div className="mt-0.5">{item.icon}</div>
                  <div>
                    <p className="font-bold text-slate-800 leading-tight">{item.label}</p>
                    <p className="text-[9px] text-slate-400 truncate w-24 hidden xl:block">{item.desc}</p>
                  </div>
                </div>
                <div className="w-1/4 text-center text-slate-600 font-medium text-xs">
                  {item.val.tercapai} / {item.val.target}
                </div>
                <div className="w-1/3 flex items-center gap-2">
                  <ProgressBar value={item.val.pct} color={item.val.color} />
                  <span className="text-[10px] font-bold text-slate-500 w-6 text-right">{item.val.pct}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm print-shadow-none flex flex-col">
          <h3 className="text-sm font-bold text-slate-800 mb-6 uppercase tracking-wider">Grafik Perkembangan Semester</h3>
          <div className="flex-1 w-full min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={areaData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#64748b', fontWeight: 500}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#64748b', fontWeight: 500}} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} 
                  cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Area type="monotone" dataKey="val" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" 
                  activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 bg-emerald-50 text-emerald-700 text-center p-3 rounded-xl text-xs font-bold border border-emerald-100">
            Alhamdulillah, perkembangan ananda sangat baik dan konsisten.
          </div>
        </div>

        <div className="lg:col-span-3 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm print-shadow-none flex flex-col justify-between gap-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Ringkasan</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="bg-blue-100 p-2.5 rounded-xl text-blue-600"><Clock size={20} /></div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Setoran</p>
                <p className="text-lg font-black text-slate-800">{riwayatCapaian.length} <span className="text-xs font-normal text-slate-500">Kali</span></p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="bg-orange-100 p-2.5 rounded-xl text-orange-600"><Star size={20} className="fill-orange-500" /></div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Rata-rata Nilai</p>
                <p className="text-lg font-black text-slate-800">{overallAvg} <span className="text-xs font-normal text-slate-500">/100</span></p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="bg-emerald-100 p-2.5 rounded-xl text-emerald-600"><Calendar size={20} /></div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Kehadiran Tahfidz</p>
                <p className="text-lg font-black text-slate-800">{laporanTerakhir?.kehadiran_persen ?? '-'}% <span className="text-xs font-normal text-slate-500">Hadir</span></p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="bg-pink-100 p-2.5 rounded-xl text-pink-600"><HandHeart size={20} className="fill-pink-500" /></div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Sikap & Adab</p>
                <p className="text-sm font-black text-slate-800">{laporanTerakhir?.predikat_adab ?? '-'}</p>
              </div>
            </div>
          </div>

          <div className="mt-2">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Predikat Capaian</h4>
            <div className="flex flex-wrap gap-1">
              <span className="text-[9px] font-bold px-2 py-1 rounded bg-teal-50 text-teal-700">Mumtaz</span>
              <span className="text-[9px] font-bold px-2 py-1 rounded bg-emerald-50 text-emerald-700">Jayyid Jiddan</span>
              <span className="text-[9px] font-bold px-2 py-1 rounded bg-yellow-50 text-yellow-700">Jayyid</span>
              <span className="text-[9px] font-bold px-2 py-1 rounded bg-orange-50 text-orange-700">Maqbul</span>
              <span className="text-[9px] font-bold px-2 py-1 rounded bg-red-50 text-red-700">Perlu Pembinaan</span>
            </div>
          </div>
        </div>

        {/* ROW 3: Materi, Komentar, Saran */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm print-shadow-none">
          <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">Materi Pekan Terakhir</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-2 text-xs text-slate-600">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-1"></div> 
              <span className="font-bold w-20">Ziyadah :</span> {recentMaterials.Ziyadah || 'Belum ada materi'}
            </li>
            <li className="flex items-start gap-2 text-xs text-slate-600">
              <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1"></div> 
              <span className="font-bold w-20">Muroja'ah :</span> {recentMaterials.Murojaah || 'Belum ada materi'}
            </li>
            <li className="flex items-start gap-2 text-xs text-slate-600">
              <div className="w-2 h-2 rounded-full bg-purple-500 shrink-0 mt-1"></div> 
              <span className="font-bold w-20">Tasmi' :</span> {recentMaterials.Tasmi || 'Belum ada materi'}
            </li>
            <li className="flex items-start gap-2 text-xs text-slate-600">
              <div className="w-2 h-2 rounded-full bg-pink-500 shrink-0 mt-1"></div> 
              <span className="font-bold w-20">Ayat Pilihan :</span> {recentMaterials.Pilihan || 'Belum ada materi'}
            </li>
            <li className="flex items-start gap-2 text-xs text-slate-600">
              <div className="w-2 h-2 rounded-full bg-orange-500 shrink-0 mt-1"></div> 
              <span className="font-bold w-20">Hadits :</span> {recentMaterials.Hadits || 'Belum ada materi'}
            </li>
            <li className="flex items-start gap-2 text-xs text-slate-600">
              <div className="w-2 h-2 rounded-full bg-teal-500 shrink-0 mt-1"></div> 
              <span className="font-bold w-20">Do'a :</span> {recentMaterials.Doa || 'Belum ada materi'}
            </li>
          </ul>
        </div>

        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm print-shadow-none flex flex-col">
          <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">Komentar Pengajar</h3>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center overflow-hidden">
              <User size={20} className="text-slate-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">{santri.pengajar?.nama || 'Ust. Kholid Amrullah'}</p>
              <p className="text-[10px] text-slate-500">Pengajar Tahfidz</p>
            </div>
          </div>
          <div className="flex-1 bg-slate-50 rounded-2xl p-4 text-xs text-slate-600 italic border border-slate-100 relative">
            <span className="text-3xl text-slate-300 font-serif absolute top-2 left-2">"</span>
            <p className="relative z-10 pl-4 mt-2 leading-relaxed">
              {laporanTerakhir?.komentar_guru || "Belum ada komentar pekan ini."}
            </p>
          </div>
        </div>

        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm print-shadow-none">
          <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">Saran untuk Wali Siswa</h3>
          <ul className="space-y-4 mt-2">
            {laporanTerakhir?.saran_ortu ? (
              <li className="flex items-start gap-3 text-xs text-slate-600">
                <div className="bg-blue-50 text-blue-500 p-1 rounded-full mt-0.5"><MessageCircle size={12} /></div> 
                <span>{laporanTerakhir.saran_ortu}</span>
              </li>
            ) : (
              <li className="flex items-start gap-3 text-xs text-slate-600 italic">
                Belum ada saran pekan ini.
              </li>
            )}
          </ul>
        </div>
        
      </div>
      
      <div className="max-w-[1400px] mx-auto px-4 mt-8 text-center text-[10px] md:text-xs text-slate-400 no-print flex items-center justify-center gap-2">
        <div className="h-px bg-slate-200 flex-1"></div>
        <div className="bg-slate-100 px-4 py-2 rounded-full text-slate-500 flex items-center gap-1">
          Terima kasih atas dukungan Bapak/Ibu. Semoga Allah selalu memberkahi ananda dalam perjalanan menghafal Al-Qur'an. <span className="text-emerald-500">♥</span>
        </div>
        <div className="h-px bg-slate-200 flex-1"></div>
      </div>

    </div>
  )
}
