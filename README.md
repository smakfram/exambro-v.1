# 📱 Secure ExamBrowser Android APK & Kiosk Engine

Aplikasi Secure Exam Browser berbasis **Flutter (Android/iOS)** dan **Web Simulator** untuk mengunci perangkat siswa selama pelaksanaan ujian sekolah (Google Form, Moodle LMS, Candy CBT, LAN Server).

---

## 🚀 Cara Menjalankan & Build APK Otomatis di GitHub

Repositori ini sudah dilengkapi dengan **GitHub Actions Automated Pipeline** (`.github/workflows/build-apk.yml`).

### Langkah 1: Push Repositori ke Akun GitHub Anda
Jika belum menghubungkan ke GitHub, jalankan perintah berikut di terminal:
```bash
git init
git add .
git commit -m "feat: setup secure exambrowser flutter engine and github actions apk builder"
git branch -M main
git remote add origin https://github.com/[USERNAME-ANDA]/[NAMA-REPO].git
git push -u origin main
```

### Langkah 2: Build APK Langsung dari Browser GitHub
1. Buka repositori GitHub Anda di browser: `https://github.com/[USERNAME]/[REPO]`
2. Klik tab **Actions** di bagian atas.
3. Pilih workflow **Build & Release ExamBrowser APK** pada daftar sebelah kiri.
4. Klik tombol **Run workflow** ➔ Klik tombol hijau **Run workflow**.
5. Tunggu sekitar 2-3 menit hingga proses compile selesai (bercentang hijau).

### Langkah 3: Download & Bagikan Link APK ke Siswa
- **Direct Download Artifact**: Buka run yang baru saja selesai, scroll ke bawah pada bagian **Artifacts**, dan unduh `Secure-ExamBrowser-Android-APK`.
- **Public Online Release**: Buka halaman **Releases** di repositori GitHub Anda.
- **Link Download Langsung untuk Siswa**:
  ```text
  https://github.com/[USERNAME]/[REPO]/releases/latest/download/app-release.apk
  ```

---

## 🔒 Fitur Keamanan Android yang Diterapkan
1. **Android LockTask (Kiosk Mode)**: Mengunci navigasi Home, Recent Apps, dan Notifikasi.
2. **FLAG_SECURE**: Mencegah screenshot, screen recording, dan screen mirroring.
3. **Pembersihan Clipboard Berkala**: Menghapus teks yang disalin setiap 2 detik.
4. **Domain Whitelist Enforcement**: Memblokir siswa mengakses situs selain Google Form / CBT resmi.
5. **3-Strike Violation System**: Menghitung pelanggaran otomatis jika siswa berpindah aplikasi atau membagi layar (*split screen*).
6. **PIN Pengawas Tersembunyi**: Kunci keluar hanya dapat dibuka oleh proktor/pengawas ruang.
