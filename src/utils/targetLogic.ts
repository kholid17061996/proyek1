export function getFilteredTargets<T extends { no: number; targetKelas: number }>(
  allData: T[],
  santriKelas: number,
  tahun_ajaran: string,
  semester: number,
  isToleransiKls9Active: boolean
): T[] {
  return allData.filter(item => {
    // KONDISI KHUSUS TAHUN AJARAN 2026/2027
    if (tahun_ajaran === '2026/2027') {
      
      // Kelas 7: Normal ritme
      if (santriKelas === 7) {
        if (semester === 1) return item.targetKelas === 7 && item.no >= 1 && item.no <= 5;
        if (semester === 2) return item.targetKelas === 7 && item.no >= 6 && item.no <= 10;
      }
      
      // Kelas 8: Kejar target kelas 7 + kelas 8
      if (santriKelas === 8) {
        // Semester 1: 5 target kls 7 awal + 2 target kls 8 awal (total 7 target)
        if (semester === 1) {
          return (item.targetKelas === 7 && item.no >= 1 && item.no <= 5) || 
                 (item.targetKelas === 8 && item.no >= 11 && item.no <= 12);
        }
        // Semester 2: sisa target (5 dari kls 7 + 3 dari kls 8 = total 8 target)
        if (semester === 2) {
          return (item.targetKelas === 7 && item.no >= 6 && item.no <= 10) || 
                 (item.targetKelas === 8 && item.no >= 13 && item.no <= 15);
        }
      }
      
      // Kelas 9: Borong semua (7, 8, dan 9) di semester 1
      if (santriKelas === 9) {
        if (semester === 1) {
          return item.targetKelas <= 9; // Ambil semua
        }
        if (semester === 2) {
          // Jika admin mengaktifkan toleransi, semester 1 tetap dimunculkan di semester 2
          if (isToleransiKls9Active) {
            return item.targetKelas <= 9;
          }
          // Jika tidak ada toleransi, tidak ada target baru di sem 2 untuk kelas 9
          return false;
        }
      }
    } 
    
    // KONDISI NORMAL (Selain Tahun Ajaran 2026/2027)
    else {
      if (santriKelas === 7) {
        if (semester === 1) return item.targetKelas === 7 && item.no >= 1 && item.no <= 5;
        if (semester === 2) return item.targetKelas === 7 && item.no >= 6 && item.no <= 10;
      }
      if (santriKelas === 8) {
        if (semester === 1) return item.targetKelas === 8 && item.no >= 11 && item.no <= 13; // 3 target
        if (semester === 2) return item.targetKelas === 8 && item.no >= 14 && item.no <= 15; // 2 target
      }
      if (santriKelas === 9) {
        if (semester === 1) return item.targetKelas === 9 && item.no >= 16 && item.no <= 21; // Borong semua
        if (semester === 2) {
          if (isToleransiKls9Active) {
            return item.targetKelas === 9 && item.no >= 16 && item.no <= 21;
          }
          return false;
        }
      }
    }

    return false;
  });
}
