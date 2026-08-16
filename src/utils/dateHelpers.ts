export function getCurrentAcademicPeriod() {
  const now = new Date();
  const month = now.getMonth(); // 0-11
  const year = now.getFullYear();

  let semester = 1;
  let tahun_ajaran = '';

  // Bulan Juli (6) sampai Desember (11) adalah Semester 1 (Ganjil)
  if (month >= 6) {
    semester = 1;
    tahun_ajaran = `${year}/${year + 1}`;
  } 
  // Bulan Januari (0) sampai Juni (5) adalah Semester 2 (Genap)
  else {
    semester = 2;
    tahun_ajaran = `${year - 1}/${year}`;
  }

  return { semester, tahun_ajaran };
}
