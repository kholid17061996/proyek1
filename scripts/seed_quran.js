const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');
const XLSX = require('xlsx');

// Load env variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedQuran() {
  try {
    console.log("Membaca file Excel...");
    const filePath = path.resolve(__dirname, '../Pembagian_JUZ_AlQuran.xlsx');
    const wb = XLSX.readFile(filePath);
    const sheetName = wb.SheetNames[0];
    const rawData = XLSX.utils.sheet_to_json(wb.Sheets[sheetName]);

    console.log(`Ditemukan ${rawData.length} baris data. Memproses...`);

    const payload = rawData.map(row => {
      // Split '1-7' into [1, 7]. Handle cases where there might not be a dash just in case
      let ayatMulai = 1;
      let ayatSelesai = 1;
      if (typeof row.Ayat === 'string' && row.Ayat.includes('-')) {
        const parts = row.Ayat.split('-');
        ayatMulai = parseInt(parts[0], 10);
        ayatSelesai = parseInt(parts[1], 10);
      } else if (typeof row.Ayat === 'number') {
        ayatMulai = row.Ayat;
        ayatSelesai = row.Ayat;
      }

      return {
        juz: parseInt(row.Juz, 10),
        surah: row.Surah,
        ayat_mulai: ayatMulai,
        ayat_selesai: ayatSelesai
      };
    });

    console.log("Menghapus data master_quran lama (jika ada)...");
    await supabase.from('master_quran').delete().neq('id', 0); // Hapus semua

    console.log("Mengunggah data ke Supabase...");
    
    // Batch insert 50 at a time to be safe
    const batchSize = 50;
    for (let i = 0; i < payload.length; i += batchSize) {
      const batch = payload.slice(i, i + batchSize);
      const { error } = await supabase.from('master_quran').insert(batch);
      if (error) {
        throw new Error(`Gagal upload batch ${i}: ` + error.message);
      }
    }

    console.log("✅ BERHASIL! 135 baris data Al-Quran telah di-seed ke database.");
  } catch (err) {
    console.error("❌ ERROR: ", err.message);
  }
}

seedQuran();
