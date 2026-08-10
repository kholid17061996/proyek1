-- Enable RLS untuk semua tabel
ALTER TABLE kelas ENABLE ROW LEVEL SECURITY;
ALTER TABLE pengajar ENABLE ROW LEVEL SECURITY;
ALTER TABLE santri ENABLE ROW LEVEL SECURITY;
ALTER TABLE ortu ENABLE ROW LEVEL SECURITY;
ALTER TABLE ortu_santri ENABLE ROW LEVEL SECURITY;
ALTER TABLE periode ENABLE ROW LEVEL SECURITY;
ALTER TABLE target_hafalan ENABLE ROW LEVEL SECURITY;
ALTER TABLE setoran_hafalan ENABLE ROW LEVEL SECURITY;
ALTER TABLE mutabaah_harian ENABLE ROW LEVEL SECURITY;
ALTER TABLE pengaturan ENABLE ROW LEVEL SECURITY;

-- Buat policy yang mengizinkan semua operasi (CRUD) untuk pengguna yang sudah login (authenticated)
-- Kebijakan ini diterapkan ke semua tabel master data

CREATE POLICY "Allow authenticated users full access on kelas" ON kelas FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated users full access on pengajar" ON pengajar FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated users full access on santri" ON santri FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated users full access on ortu" ON ortu FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated users full access on ortu_santri" ON ortu_santri FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated users full access on periode" ON periode FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated users full access on target_hafalan" ON target_hafalan FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated users full access on setoran_hafalan" ON setoran_hafalan FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated users full access on mutabaah_harian" ON mutabaah_harian FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated users full access on pengaturan" ON pengaturan FOR ALL TO authenticated USING (true) WITH CHECK (true);
