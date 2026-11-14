// Shell dosen (Phase A): role gate and placeholder until lecturer feeds land.
import type { Entry } from "./entry";

export const lecturerStrings = {
  "lecturer.role": { id: "Dosen", en: "Lecturer" },
  "lecturer.home.title": { id: "Siap sebagai dosen", en: "Signed in as a lecturer" },
  "lecturer.home.lead": {
    id: "Kelas, antrian tugas, dan ujianmu akan muncul di sini. Sementara ini, buka Edunex untuk mengajar.",
    en: "Your classes, task queue and exams will show up here. For now, open Edunex to teach.",
  },
  "lecturer.home.openEdunex": { id: "Buka Edunex", en: "Open Edunex" },
  "lecturer.home.settings": { id: "Pengaturan", en: "Settings" },
  "banner.lecturerSix": {
    id: "SIX di app ini masih untuk mahasiswa.",
    en: "SIX in this app is still for students.",
  },
  "status.lecturerSixHint": {
    id: "Keluar dari SIX di sini, atau lanjut dengan Edunex saja. Halaman dosen di SIX belum dibaca.",
    en: "Sign out of SIX here, or continue with Edunex only. Lecturer pages on SIX aren't read yet.",
  },
  "settings.account.lecturerSix": {
    id: "Akun dosen · SIX mahasiswa belum dibaca",
    en: "Lecturer account · student SIX isn't read",
  },
} as const satisfies Record<string, Entry>;
