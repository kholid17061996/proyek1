-- 1. Tabel Profiles (Relasi dengan auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'pengajar')),
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for profiles (optional but good practice for Supabase)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id);

-- 2. Tabel Kelas
CREATE TABLE kelas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama TEXT NOT NULL,
  keterangan TEXT,
  status TEXT DEFAULT 'aktif' CHECK (status IN ('aktif', 'nonaktif')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabel Pengajar
CREATE TABLE pengajar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  nama TEXT NOT NULL,
  kode_pengajar TEXT UNIQUE NOT NULL,
  kelas TEXT,
  no_hp TEXT,
  status TEXT DEFAULT 'aktif' CHECK (status IN ('aktif', 'nonaktif')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabel Santri
CREATE TABLE santri (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kode_santri TEXT UNIQUE NOT NULL,
  nis TEXT UNIQUE,
  nama TEXT NOT NULL,
  kelas_id UUID REFERENCES kelas(id) ON DELETE SET NULL,
  pengajar_id UUID REFERENCES pengajar(id) ON DELETE SET NULL,
  tanggal_masuk DATE,
  status TEXT DEFAULT 'aktif' CHECK (status IN ('aktif', 'nonaktif')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabel Ortu
CREATE TABLE ortu (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama TEXT NOT NULL,
  kode_akses TEXT UNIQUE NOT NULL,
  no_hp TEXT,
  status TEXT DEFAULT 'aktif' CHECK (status IN ('aktif', 'nonaktif')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tabel Ortu_Santri (Relasi Many-to-Many)
CREATE TABLE ortu_santri (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ortu_id UUID REFERENCES ortu(id) ON DELETE CASCADE,
  santri_id UUID REFERENCES santri(id) ON DELETE CASCADE,
  hubungan TEXT NOT NULL, -- (contoh: 'Ayah', 'Ibu', 'Wali')
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(ortu_id, santri_id)
);

-- 7. Tabel Periode
CREATE TABLE periode (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama TEXT NOT NULL,
  tanggal_mulai DATE NOT NULL,
  tanggal_selesai DATE NOT NULL,
  status TEXT DEFAULT 'aktif' CHECK (status IN ('aktif', 'selesai')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Tabel Target Hafalan
CREATE TABLE target_hafalan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  santri_id UUID REFERENCES santri(id) ON DELETE CASCADE,
  periode_id UUID REFERENCES periode(id) ON DELETE CASCADE,
  juz INTEGER NOT NULL,
  surat TEXT NOT NULL,
  ayat_mulai INTEGER NOT NULL,
  ayat_selesai INTEGER NOT NULL,
  halaman_mulai INTEGER,
  halaman_selesai INTEGER,
  tanggal_mulai DATE,
  tanggal_selesai DATE,
  status TEXT DEFAULT 'belum_mulai' CHECK (status IN ('belum_mulai', 'berjalan', 'tercapai', 'tidak_tercapai')),
  catatan TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Tabel Setoran Hafalan
CREATE TABLE setoran_hafalan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  santri_id UUID REFERENCES santri(id) ON DELETE CASCADE,
  pengajar_id UUID REFERENCES pengajar(id) ON DELETE SET NULL,
  target_id UUID REFERENCES target_hafalan(id) ON DELETE SET NULL,
  tanggal_setoran DATE NOT NULL,
  juz INTEGER NOT NULL,
  surat TEXT NOT NULL,
  ayat_mulai INTEGER NOT NULL,
  ayat_selesai INTEGER NOT NULL,
  jenis_setoran TEXT NOT NULL CHECK (jenis_setoran IN ('hafalan_baru', 'murojaah')),
  kelancaran NUMERIC NOT NULL,
  tajwid NUMERIC NOT NULL,
  makhraj NUMERIC NOT NULL,
  nilai_akhir NUMERIC NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('lulus', 'perlu_perbaikan')),
  catatan TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Tabel Mutabaah Harian
CREATE TABLE mutabaah_harian (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  santri_id UUID REFERENCES santri(id) ON DELETE CASCADE,
  pengajar_id UUID REFERENCES pengajar(id) ON DELETE SET NULL,
  tanggal DATE NOT NULL,
  kehadiran TEXT NOT NULL CHECK (kehadiran IN ('hadir', 'izin', 'sakit', 'alpa')),
  setoran BOOLEAN DEFAULT false,
  murojaah BOOLEAN DEFAULT false,
  catatan TEXT,
  status TEXT DEFAULT 'baik' CHECK (status IN ('baik', 'perlu_perhatian')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(santri_id, tanggal) -- Mencegah duplikasi absensi harian
);

-- 11. Tabel Pengaturan
CREATE TABLE pengaturan (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- INSERT Default Pengaturan (contoh)
INSERT INTO pengaturan (key, value, description) VALUES
('bobot_kelancaran', '40', 'Persentase bobot nilai kelancaran (%)'),
('bobot_tajwid', '30', 'Persentase bobot nilai tajwid (%)'),
('bobot_makhraj', '30', 'Persentase bobot nilai makhraj (%)'),
('nilai_minimum_lulus', '75', 'Nilai akhir minimum untuk dinyatakan lulus pada setoran');

-- Triggers untuk updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_modtime BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_pengajar_modtime BEFORE UPDATE ON pengajar FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_santri_modtime BEFORE UPDATE ON santri FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_ortu_modtime BEFORE UPDATE ON ortu FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_target_hafalan_modtime BEFORE UPDATE ON target_hafalan FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_setoran_hafalan_modtime BEFORE UPDATE ON setoran_hafalan FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_mutabaah_harian_modtime BEFORE UPDATE ON mutabaah_harian FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_pengaturan_modtime BEFORE UPDATE ON pengaturan FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
