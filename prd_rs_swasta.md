# Product Requirements Document (PRD): Dashboard Rumah Sakit (RS) Swasta

## 1. Pendahuluan
**Tujuan:**
Membuat sebuah dashboard khusus bagi mitra Rumah Sakit (RS) Swasta di dalam ekosistem sistem PMI Pringsewu. Dashboard ini memungkinkan pihak rumah sakit untuk mengelola, melacak, dan memantau permintaan darah secara langsung ke Unit Donor Darah (UDD) atau Distribution Center (DC).

**Latar Belakang:**
Saat ini kita telah memiliki 2 jenis dashboard (Admin UDD dan DC). Sistem aplikasi mobile juga sudah menyediakan fitur pendaftaran/registrasi mitra RS Swasta. Oleh karena itu, diperlukan sebuah antarmuka web khusus (Dashboard) agar RS Swasta yang akunnya **sudah divalidasi dan diterima oleh Admin** dapat masuk (login) dan mulai bertransaksi (meminta darah) secara digital dan terpadu.

---

## 2. Alur Pengguna (User Flow)
1. **Pendaftaran (Aplikasi Mobile / Web):** Perwakilan RS Swasta mendaftarkan akun.
2. **Validasi (Admin Dashboard):** Admin PMI Pringsewu memverifikasi dokumen dan menyetujui akun tersebut sebagai mitra RS Swasta.
3. **Login (Dashboard RS Swasta):** Pengguna RS masuk menggunakan kredensial. Sistem akan mengecek *Role* dan *Status Approval*. Jika berstatus *Approved*, pengguna diarahkan ke Dashboard RS Swasta.
4. **Operasional:** RS membuat pesanan/permintaan darah, memantau ketersediaan stok di PMI (UDD/DC), dan melacak status pengiriman darah.

---

## 3. Fitur Utama (Core Features)

### 3.1. Autentikasi & Otorisasi
- **Login Role-Based:** Sistem login yang memeriksa peran (`role: HOSPITAL` atau sejenisnya) dan status validasi akun (`status: APPROVED`).
- **Penolakan Akses:** Jika akun masih berstatus `PENDING` atau `REJECTED`, berikan pesan peringatan "Akun Anda sedang dalam tahap verifikasi oleh Admin PMI" atau "Akun ditolak".

### 3.2. Halaman Beranda (Overview/Dashboard)
- **Ringkasan Data (Statistik):**
  - Total permintaan darah bulan ini.
  - Jumlah permintaan darah yang sedang **Menunggu**, **Diproses**, dan **Selesai**.
- **Aktivitas Terkini:** Tabel atau *timeline* singkat mengenai status update terbaru dari permintaan darah terakhir.

### 3.3. Manajemen Permintaan Darah (Blood Requests)
- **Kategori Permintaan Darah:**
  Terdapat 3 kategori utama saat pihak RS Swasta ingin mengajukan permintaan darah ke PMI:
  
  **A. Permintaan Pasien (Cito / Reguler)**
  - Form pengisian detail pasien (Nama Pasien, No. Rekam Medis, Nama Dokter Penanggung Jawab).
  - Form kebutuhan darah (Golongan Darah, Produk Darah seperti WB/PRC/TC, Jumlah Kantong).
  - Tingkat urgensi (Reguler, CITO/Darurat).
  - Alasan medis / Diagnosa (wajib diisi).
  
  **B. Permintaan Stok Minimum (ICU / IGD / OK)**
  - **Tujuan:** Pemenuhan stok kesiapsiagaan (Buffer Stock).
  - **Identitas Layanan:** Menyebutkan unit layanan secara spesifik (ICU / IGD / Ruang Operasi).
  - **Detail Kebutuhan:** Jumlah darah per golongan & jenis komponen.
  - **Data Histori (Syarat Mutlak):** 
    - Pemakaian bulanan sebelumnya.
    - Jumlah kasus operasi / kasus emergency rata-rata.
  - **Data Fasilitas:** Bukti/konfirmasi ketersediaan kulkas darah (Blood Bank Refrigerator) yang dilengkapi dengan sistem monitoring suhu.
  - **Komitmen RS:** Bersedia menerapkan sistem FIFO (First In First Out), sanggup melakukan retur jika mendekati expired, dan memberikan pelaporan penggunaan berkala.
  - *Catatan Kritis:* Pengajuan tanpa data histori penggunaan dan bukti fasilitas memadai akan otomatis / berisiko besar ditolak oleh PMI.

  **C. Prediksi Kebutuhan (Operasi Terjadwal / Pasien Rutin)**
  - **Tujuan:** Pemesanan darah untuk jadwal operasi terencana atau transfusi pasien rutin (misal penderita Thalassemia).
  - **Jika untuk Operasi:**
    - Jadwal pelaksanaan operasi.
    - Jenis tindakan operasi.
    - Estimasi kebutuhan darah.
  - **Jika untuk Pasien Rutin:**
    - Data pasien & jadwal rutin transfusi.
    - Kebutuhan jumlah kantong per pasien.
    - Total seluruh kebutuhan darah kumulatif (golongan & komponen).
    - Status *crossmatch* (Opsional).
  - *Catatan Kritis:* Permintaan ini harus didasarkan pada data pasien aktual dan jadwal yang rasional/nyata.
- **Daftar Permintaan Darah (Request List):**
  - Tabel berisi riwayat seluruh permintaan darah yang diajukan oleh RS tersebut.
  - Filter dan pencarian (berdasarkan status, tanggal, atau nama pasien).
  - Status pesanan: *Menunggu Konfirmasi*, *Diproses DC*, *Dalam Pengiriman*, *Selesai*, *Ditolak*.
- **Detail Permintaan:**
  - Melihat rincian permintaan, alasan penolakan (jika ditolak), atau melihat informasi kurir/petugas (jika sedang dikirim).

### 3.4. Pemantauan Stok Darah (Blood Stock Monitor) - *Read Only*
- Menampilkan matriks stok darah (Golongan Darah x Jenis Produk Darah) yang ada di UDD/DC secara *real-time*.
- Fitur ini krusial agar pihak RS dapat mengecek ketersediaan terlebih dahulu sebelum mengirim permintaan, atau mempersiapkan alternatif (misal: donor pengganti) jika stok di PMI kosong.

### 3.5. Manajemen Profil & Pengaturan (Profile & Settings)
- **Profil RS:** Menampilkan detail data rumah sakit (Nama RS, Alamat Lengkap, Nomor Telepon/Kontak Darurat, Nama PIC).
- **Pengaturan Akun:** Ganti *password* atau perbarui email kontak PIC.

---

## 4. Persyaratan Teknis (Technical Requirements)

### 4.1. Akses Endpoint (Backend)
Sistem backend perlu menyediakan endpoint khusus dengan proteksi role `HOSPITAL`, di antaranya:
- `GET /api/hospital/dashboard-stats` (Statistik beranda)
- `POST /api/hospital/requests` (Membuat permintaan darah)
- `GET /api/hospital/requests` (Mendapatkan riwayat permintaan RS tersebut)
- `GET /api/blood-stocks/public` (Membaca matriks stok darah)

### 4.2. UI/UX & Desain
- Menggunakan *library/framework* yang selaras dengan dashboard Admin dan DC yang sudah ada (misal: Next.js + TailwindCSS).
- Nuansa warna dapat dibuat sedikit berbeda (misal dominan warna biru medis/putih) untuk membedakan konteks penggunaannya dibandingkan Admin PMI (Merah).

---

## 5. Rencana Fase Rilis (Milestones)
- **Fase 1 (MVP):** 
  - Login khusus RS Swasta yang di-approve.
  - Fitur membuat permintaan darah & melihat statusnya.
  - Halaman ketersediaan stok darah PMI.
- **Fase 2 (Peningkatan):** 
  - Fitur cetak surat jalan / invoice otomatis secara digital.
  - Notifikasi *real-time* (WebSocket/Push Notification) saat status darah diubah oleh DC.
