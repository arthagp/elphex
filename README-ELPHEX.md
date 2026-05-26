# ELPHEX - Elephant Brain OS
Elephant Brain OS (ELPHEX) adalah platform produktivitas gamified modern yang dirancang untuk membantu mengelola tugas pribadi maupun organisasi secara efektif, lengkap dengan hewan peliharaan virtual (Elph Pet) yang berinteraksi berdasarkan produktivitas Anda.

Dokumentasi ini menjelaskan arsitektur autentikasi, batasan plan langganan (Free vs Pro), integrasi kalender, asisten AI, dan rekomendasi pengembangan lebih lanjut.

---

## 🛠️ Arsitektur & Teknologi Utama
1. **Frontend / Routing**: Next.js 15 (App Router) dengan TypeScript.
2. **State Management**: Zustand store (`src/store/elphexStore.ts`) untuk mengelola status global secara instan di sisi klien.
3. **Database**: Prisma ORM dengan PostgreSQL/SQLite untuk manajemen persistensi data relasional.
4. **Middleware**: Next.js Middleware (`src/middleware.ts`) untuk proteksi rute halaman yang membutuhkan otorisasi (`/`, `/tasks`, `/focus`, dll.) dan mengarahkan pengguna yang belum masuk ke `/login`.
5. **Autentikasi**: Otorisasi aman berbasis sesi HTTP-Only cookie `elphex-session` yang menyimpan `userId`.

---

## 🔐 Sistem Autentikasi & Rute API
Autentikasi menggunakan verifikasi OTP berbasis WhatsApp (saat ini disimulasikan secara premium di sisi UI dengan simulasi chat interaktif).

### Endpoints Autentikasi (`/api/auth/`)
* **`POST /api/auth/signup`**: Mendaftar akun baru dengan mengirim data nama, email, nomor WhatsApp, dan kata sandi. Menghasilkan kode OTP acak 6 digit dan menyimpannya di DB.
* **`POST /api/auth/verify-otp`**: Memvalidasi kode OTP yang dimasukkan. Jika sukses, menginisialisasi workspace personal default, data status streak, dan pet Elphy default, lalu mengatur cookie sesi.
* **`POST /api/auth/signin`**: Masuk menggunakan email dan kata sandi, lalu mengatur cookie sesi `elphex-session`.
* **`POST /api/auth/signout`**: Menghapus cookie sesi `elphex-session` untuk keluar.
* **`GET /api/auth/me`**: Mendapatkan data profil pengguna aktif saat ini.
* **`GET /api/auth/dev-otp`**: Helper khusus mode pengembangan untuk membaca OTP terakhir pengguna secara cepat dari UI verifikasi.
* **`POST /api/auth/upgrade`**: Simulasi pembayaran untuk meningkatkan plan pengguna dari `FREE` menjadi `PRO`.

---

## 💎 Batasan Plan Langganan (Free vs Pro)

| Fitur | 🆓 Plan FREE | 💎 Plan PRO |
| :--- | :--- | :--- |
| **Ruang Kerja (Workspace)** | Hanya Personal Workspace (Lokal). | Dapat membuat & bergabung ke Organisasi/Tim (Maks. 12 Anggota). |
| **Elephant Brain AI** | 🔒 Terkunci (Dilengkapi Banner Upgrade). | ✅ Terbuka (Pecah Subtugas, Estimasi Jam, Rekomendasi Prioritas). |
| **Integrasi Kalender** | 🔒 Terkunci (Hanya untuk Tugas Tim). | ✅ Terbuka (Google Calendar & Looyal Calendar pada Tugas Tim). |
| **Herd Mode Sprints** | 🔒 Terkunci (Hanya untuk Tugas Tim). | ✅ Terbuka (Mengelola Sprint/Tugas Tim secara kolaboratif). |

---

## 📅 Simulasi Integrasi Kalender & AI
* **Asisten AI**: Menggunakan API endpoint `/api/ai` untuk memecah tugas menjadi sub-tugas, mengestimasi jam kerja secara cerdas, dan menganalisis tingkat prioritas.
* **Kalender**: Menyediakan pilihan sinkronisasi tugas ke **Google Calendar** atau **Looyal Calendar** pada detail panel drawer jika tugas tersebut berada di dalam ruang kerja Organisasi. Perubahan kalender ini akan disinkronisasikan ke properti `calendarType` di database.

---

## 🚀 Rekomendasi Pengembangan Masa Depan (Production Ready)

1. **Integrasi WhatsApp Gateway Riil**:
   Menggantikan simulasi OTP chat dengan WhatsApp API Gateway nyata seperti:
   * **Fonnte** atau **Wootz**
   * **WABlas** / **Baileys (Open-source WA Library)**
   Di sisi `/api/auth/signup`, kirim request POST ke API gateway tersebut untuk mengirimkan pesan OTP nyata ke nomor WhatsApp pendaftar.

2. **Integrasi Kalender Riil**:
   * **Google Calendar API**: Implementasikan OAuth 2.0 flow untuk meminta otorisasi akun Google milik pengguna, simpan token akses/refresh di database, dan buat event di Google Calendar saat tugas dibuat atau diubah di ELPHEX.
   * **Looyal Calendar**: Integrasikan dengan endpoint Webhook eksternal milik Looyal untuk mengirim payload tugas.

3. **Integrasi Payment Gateway Nyata**:
   Hubungkan mock checkout `/payment` dengan payment gateway nyata seperti **Midtrans** atau **Xendit**:
   * Buat transaksi melalui API Midtrans/Xendit untuk menghasilkan token Snap/URL redirect.
   * Daftarkan webhook handler di `/api/payment/webhook` untuk mendengarkan status pembayaran dari server gateway, lalu ubah plan user menjadi `PRO` setelah status pembayaran dikonfirmasi lunas (`settlement`).
