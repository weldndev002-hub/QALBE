# Product Requirements Document (PRD)
## PWA Membership Management System
**Versi:** 1.1.0  
**Tanggal:** Juni 2026  
**Status:** Draft

---

## 1. Ringkasan Eksekutif

Platform berbasis **Progressive Web App (PWA)** dengan model Gojek-style:
- **Website** (`www.namaapp.com`) → marketing, registrasi, upgrade membership, pembayaran
- **Aplikasi PWA** (`app.namaapp.com`) → dashboard operasional member sehari-hari, bisa diinstall di Android

Fase 1 berfokus pada **Membership Management System** — Super Admin dapat membuat paket membership secara bebas, mengaktifkan/menonaktifkan fitur per paket via toggle, dan mengubah tier member secara manual. Payment gateway diintegrasi di fase 2.

---

## 2. Tujuan & Metrik

| Tujuan | Metrik Keberhasilan |
|---|---|
| Registrasi cepat | Waktu registrasi < 3 menit |
| Upgrade mudah | Super Admin bisa ganti tier member < 1 menit |
| Performa aplikasi | Lighthouse PWA score ≥ 90 |
| Ketersediaan | Uptime ≥ 99.9% |
| Skalabilitas | Mendukung 100.000+ pengguna tanpa refactor |

---

## 3. Peran Pengguna

Hanya ada **dua peran** dalam sistem:

| Peran | Deskripsi | Akses |
|---|---|---|
| **Member (User)** | Pengguna akhir yang menggunakan layanan | Website marketing + PWA app |
| **Super Admin** | Pemilik/pengelola platform | Seluruh sistem termasuk dashboard manajemen |

> Tidak ada role "Admin" biasa. Semua kendali manajemen ada di Super Admin.

---

## 4. Desain & UI System

### 4.1 Design Language

Berdasarkan referensi UI yang diberikan, sistem menggunakan desain dengan karakteristik:

**Color Palette:**
```
Primary Background  : #FFC5DF  (Pink lembut — digunakan di header, hero, card utama)
Primary Accent      : #F375AE  (Pink vivid — CTA button, highlight, active state)
Secondary Accent    : #D64945  (Merah — badge danger/warning)
Success             : #61AD67  (Hijau — badge aktif/success)
Warning             : #F5C750  (Kuning — badge pending/warning)
Orange              : #F78A31  (Orange — badge info/tier)
Soft Green          : #AAC168  (Hijau muda — badge tier/level)
Background          : #FFFFFF  (Putih — konten utama)
Text Primary        : #1A1A2E  (Hampir hitam — body text)
Text Secondary      : #6B6B8A  (Abu — subtitle/caption)
```

**Typography:**
```
Font Family   : Inter (body) + Poppins (heading)
Heading 1     : 28px / Bold / #1A1A2E
Heading 2     : 22px / SemiBold / #1A1A2E
Heading 3     : 18px / SemiBold / #1A1A2E
Body          : 14px / Regular / #1A1A2E
Caption       : 12px / Regular / #6B6B8A
Button        : 14px / SemiBold
```

**Border Radius:**
```
Card          : 16px
Button        : 12px
Input         : 10px
Badge/Chip    : 999px (pill)
```

**Spacing:**
```
Base unit     : 4px
Section gap   : 24px
Card padding  : 16px
Screen margin : 20px (mobile)
```

**Elevation / Shadow:**
```
Card default  : 0 4px 24px rgba(255, 117, 174, 0.12)
Card hover    : 0 8px 32px rgba(255, 117, 174, 0.20)
Modal         : 0 16px 48px rgba(0,0,0,0.16)
```

### 4.2 Komponen UI Utama

**Navigation:**
- Mobile bottom navigation bar (5 ikon)
- Web: sticky top navbar dengan background `#FFC5DF`

**Cards:**
- Background putih, radius 16px, shadow pink subtle
- Header card menggunakan gradient atau solid `#FFC5DF`

**Buttons:**
- Primary: `#F375AE` fill, teks putih, radius 12px
- Secondary: border `#F375AE`, teks `#F375AE`, background transparan
- Danger: `#D64945`

**Badges/Chips:**
- Pill shape (radius 999px)
- Warna sesuai status: merah (danger), hijau (success), kuning (warning), orange (info)

**Forms/Input:**
- Background `#FFF5F9` (pink sangat muda)
- Border `#FFB3D1` saat default, `#F375AE` saat focus
- Radius 10px

**Toggle Switch:**
- Off state: `#E0E0E0`
- On state: `#F375AE`
- Thumb: putih

### 4.3 Halaman yang Dibangun

**Website (`www.`):**
1. Landing Page / Marketing
2. Halaman Pricing / Paket
3. Register
4. Login
5. Forgot Password
6. Halaman Upgrade Membership (fase 2: payment)
7. Konfirmasi & Redirect ke App

**PWA App (`app.`):**
1. Splash Screen
2. Onboarding (pertama kali install)
3. Login / Register (redirect ke website)
4. Dashboard Member
5. Profil Pengguna
6. Detail Membership Saya
7. Notifikasi
8. Super Admin Dashboard
9. Manajemen Member
10. Konfigurasi Paket Membership

---

## 5. Fitur — Fase 1: Membership Management System

### 5.1 Autentikasi (Supabase Auth)

**F-AUTH-01: Registrasi Member**
- Form: Nama lengkap, email, password, konfirmasi password
- Verifikasi email otomatis via Supabase
- Setelah verifikasi → otomatis assign paket **Free** (default)
- Redirect ke `app.namaapp.com/welcome` setelah verifikasi

**F-AUTH-02: Login**
- Email + password
- Remember me session (30 hari)
- Reset password via email
- Proteksi brute force (lockout 5x salah)

**F-AUTH-03: Super Admin Login**
- Endpoint terpisah: `app.namaapp.com/superadmin/login`
- Email + password (akun Super Admin dibuat manual via Supabase)
- Tidak ada registrasi publik untuk Super Admin

### 5.2 Manajemen Paket Membership (Super Admin)

Ini adalah inti dari fase 1. Super Admin punya kendali penuh atas struktur paket.

**F-PKT-01: Buat Paket Baru**

Super Admin dapat membuat paket membership dengan konfigurasi bebas:

| Field | Tipe | Keterangan |
|---|---|---|
| Nama Paket | Text | Contoh: "Free", "Starter", "Pro", "VIP Gold" |
| Slug | Text (auto) | URL-friendly, unik: `free`, `starter`, `pro` |
| Deskripsi | Textarea | Deskripsi singkat paket |
| Level/Urutan | Number | 0 = terendah, angka lebih tinggi = tier lebih tinggi |
| Harga Bulanan | Number | 0 = gratis (untuk fase 2) |
| Harga Tahunan | Number | 0 = gratis (untuk fase 2) |
| Warna Tema | Color Picker | Warna badge paket di UI |
| Ikon/Emoji | Text | Ikon visual paket (misal: ⭐, 💎, 🚀) |
| Status Aktif | Toggle | Jika OFF → paket tidak bisa dipilih oleh member baru |

**F-PKT-02: Konfigurasi Fitur per Paket (Toggle System)**

Setiap paket memiliki daftar fitur yang bisa di-toggle ON/OFF oleh Super Admin secara individual. Contoh fitur:

```
[ ] Akses Dashboard Dasar
[ ] Akses Laporan Bulanan  
[ ] Akses Laporan Real-time
[ ] Download Laporan (PDF/Excel)
[ ] Akses API
[ ] Jumlah Proyek (input: unlimited / angka)
[ ] Jumlah Pengguna Sub-akun (input: angka)
[ ] Priority Support
[ ] Custom Branding
[ ] Akses Fitur Beta
[ ] Notifikasi WhatsApp
[ ] Notifikasi Email
[ ] (+ Tambah Fitur Custom oleh Super Admin)
```

Super Admin juga dapat **menambah fitur baru** yang langsung tersedia di semua paket (default OFF) untuk kemudian di-toggle per paket.

**F-PKT-03: Edit & Duplikasi Paket**
- Edit semua field paket kapan saja
- Duplikasi paket yang sudah ada (clone semua konfigurasi toggle)
- Urutan tampil dapat di-drag & drop

**F-PKT-04: Nonaktifkan / Arsipkan Paket**
- Toggle aktif/nonaktif paket
- Paket yang dinonaktifkan: tidak bisa dipilih member baru, member existing tetap pada paket tersebut
- Arsip paket: disembunyikan dari semua tampilan, member existing diturunkan ke Free

### 5.3 Manajemen Member (Super Admin)

**F-MEM-01: Daftar Member**
- Tabel dengan kolom: nama, email, paket aktif, tanggal bergabung, status, expired date
- Filter: paket, status, tanggal bergabung
- Search: nama / email / ID
- Export: CSV / Excel

**F-MEM-02: Detail Member**
- Profil lengkap
- Paket aktif sekarang + tanggal mulai + tanggal berakhir
- Riwayat perubahan paket (log lengkap)
- Riwayat pembayaran (fase 2)
- Tombol aksi cepat

**F-MEM-03: Ubah Paket Member (Toggle Manual)**

Super Admin dapat mengubah paket member dengan cara:

1. Buka detail member
2. Klik **"Ganti Paket"**
3. Muncul panel dengan toggle/pilihan semua paket aktif
4. Pilih paket baru
5. Isi: tanggal mulai, durasi (atau tanggal akhir), catatan internal
6. Konfirmasi → simpan + kirim notifikasi ke member

Aksi lain yang tersedia:
- **Extend** → perpanjang durasi paket yang sama
- **Suspend** → bekukan akses sementara (tetap tercatat paket aktif)
- **Aktifkan** → cabut suspend
- **Reset ke Free** → kembalikan ke paket dasar

**F-MEM-04: Tambah Member Manual**
- Super Admin bisa buat akun member secara manual (tanpa harus member registrasi sendiri)
- Pilih paket langsung saat pembuatan

### 5.4 Profil Member

**F-PROF-01: Data Profil**
- Foto profil (upload → Supabase Storage)
- Nama lengkap, email, nomor HP, kota
- Bio singkat (opsional)

**F-PROF-02: Pengaturan**
- Ubah password
- Preferensi notifikasi (email, push notification)
- Zona waktu, bahasa

**F-PROF-03: Info Membership Saya**
- Paket aktif + fitur yang tersedia (visual jelas — aktif vs nonaktif)
- Tanggal mulai & berakhir
- Progress bar sisa waktu
- Tombol "Upgrade Paket" (menuju website, fase 2)

### 5.5 Notifikasi

**F-NOTIF-01: Notifikasi Otomatis**

| Trigger | Channel | Waktu |
|---|---|---|
| Membership akan expired | Email + Push | H-7, H-3, H-1 |
| Membership expired | Email + Push | Hari H |
| Grace period habis (akses dicabut) | Email + Push | H+3 |
| Paket berhasil diubah (oleh Super Admin) | Email + Push | Realtime |
| Registrasi berhasil | Email | Realtime |

**F-NOTIF-02: Notif In-App**
- Bell icon di navbar dengan badge count
- List notifikasi dengan status baca/belum baca
- Tap notifikasi → navigasi ke halaman relevan

### 5.6 PWA (Progressive Web App)

**F-PWA-01: Manifest & Installability**
```json
{
  "name": "NamaApp",
  "short_name": "NamaApp",
  "display": "standalone",
  "background_color": "#FFC5DF",
  "theme_color": "#F375AE",
  "start_url": "/dashboard",
  "icons": [...]
}
```

**F-PWA-02: Install Prompt**
- Banner muncul setelah login pertama di mobile browser Android
- Desain mengikuti UI system (pink card, tombol `#F375AE`)
- Tidak muncul lagi jika sudah diinstall atau sudah di-dismiss 2x

**F-PWA-03: Service Worker & Offline**
- Cache aset statis (CSS, JS, ikon, font)
- Offline fallback page saat tidak ada koneksi
- Background sync untuk aksi yang gagal karena offline

**F-PWA-04: Deep Link dari Website ke App**
- Setelah registrasi/upgrade di website → redirect ke `app.namaapp.com?ref=...&status=success`
- App membaca param dan tampilkan konfirmasi/onboarding sesuai konteks

---

## 6. Database Schema (Supabase / PostgreSQL)

```sql
-- ═══════════════════════════════════════════
-- PROFILES (extend auth.users)
-- ═══════════════════════════════════════════
CREATE TABLE public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     TEXT,
  phone         TEXT,
  avatar_url    TEXT,
  bio           TEXT,
  city          TEXT,
  timezone      TEXT DEFAULT 'Asia/Jakarta',
  language      TEXT DEFAULT 'id',
  is_super_admin BOOLEAN DEFAULT false,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════
-- FITUR (master list fitur yang tersedia)
-- ═══════════════════════════════════════════
CREATE TABLE public.features (
  id            SERIAL PRIMARY KEY,
  key           TEXT UNIQUE NOT NULL,    -- 'access_reports', 'api_access', dll
  label         TEXT NOT NULL,           -- Label tampil di UI
  description   TEXT,
  category      TEXT,                    -- Grouping: 'access', 'limits', 'support'
  input_type    TEXT DEFAULT 'toggle',   -- 'toggle' | 'number' | 'text'
  sort_order    INT DEFAULT 0,
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════
-- PAKET MEMBERSHIP
-- ═══════════════════════════════════════════
CREATE TABLE public.membership_packages (
  id            SERIAL PRIMARY KEY,
  name          TEXT NOT NULL,
  slug          TEXT UNIQUE NOT NULL,
  description   TEXT,
  level         INT NOT NULL DEFAULT 0,      -- urutan tier: 0 = terendah
  color         TEXT DEFAULT '#FFC5DF',      -- warna badge
  icon          TEXT DEFAULT '⭐',
  price_monthly NUMERIC(12,2) DEFAULT 0,
  price_yearly  NUMERIC(12,2) DEFAULT 0,
  is_active     BOOLEAN DEFAULT true,
  is_default    BOOLEAN DEFAULT false,       -- true = paket untuk member baru (hanya 1)
  sort_order    INT DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════
-- KONFIGURASI FITUR PER PAKET (Toggle)
-- ═══════════════════════════════════════════
CREATE TABLE public.package_features (
  id              SERIAL PRIMARY KEY,
  package_id      INT NOT NULL REFERENCES public.membership_packages(id) ON DELETE CASCADE,
  feature_id      INT NOT NULL REFERENCES public.features(id) ON DELETE CASCADE,
  is_enabled      BOOLEAN DEFAULT false,     -- Toggle ON/OFF
  value           TEXT,                      -- Untuk input_type 'number'/'text' (misal: '50', 'unlimited')
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE (package_id, feature_id)
);

-- ═══════════════════════════════════════════
-- MEMBERSHIP AKTIF MEMBER
-- ═══════════════════════════════════════════
CREATE TABLE public.user_memberships (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  package_id      INT NOT NULL REFERENCES public.membership_packages(id),
  status          TEXT NOT NULL DEFAULT 'active',
                  -- active | expired | suspended | cancelled | pending
  started_at      TIMESTAMPTZ DEFAULT now(),
  expires_at      TIMESTAMPTZ,              -- NULL = tidak ada batas waktu (paket Free)
  grace_until     TIMESTAMPTZ,
  suspended_at    TIMESTAMPTZ,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id)
);

-- ═══════════════════════════════════════════
-- RIWAYAT PERUBAHAN PAKET
-- ═══════════════════════════════════════════
CREATE TABLE public.membership_history (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id),
  from_package_id INT REFERENCES public.membership_packages(id),
  to_package_id   INT NOT NULL REFERENCES public.membership_packages(id),
  changed_by      UUID REFERENCES public.profiles(id),  -- NULL = sistem
  change_type     TEXT NOT NULL,
                  -- manual_upgrade | manual_downgrade | renewal | suspension
                  -- unsuspend | expiry | reset_free | payment (fase 2)
  reason          TEXT,
  payment_ref     TEXT,                     -- fase 2
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════
-- NOTIFIKASI
-- ═══════════════════════════════════════════
CREATE TABLE public.notifications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id),
  type            TEXT NOT NULL,
                  -- expiry_reminder | tier_change | system | welcome
  title           TEXT NOT NULL,
  body            TEXT NOT NULL,
  is_read         BOOLEAN DEFAULT false,
  action_url      TEXT,
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT now()
);
```

### RLS Policy Summary

| Tabel | Member | Super Admin |
|---|---|---|
| `profiles` | Baca + edit diri sendiri | Baca semua + edit semua |
| `membership_packages` | Baca yang aktif saja | CRUD penuh |
| `features` | Baca yang aktif saja | CRUD penuh |
| `package_features` | Baca semua | CRUD penuh |
| `user_memberships` | Baca diri sendiri | Baca + edit semua |
| `membership_history` | Baca diri sendiri | Baca semua |
| `notifications` | Baca + update diri sendiri | Baca semua |

---

## 7. Arsitektur Sistem

### 7.1 Stack

```
Framework      : Next.js 14+ (App Router) + TypeScript
Styling        : Tailwind CSS + Shadcn/UI (dikustomisasi sesuai design system)
Database/Auth  : Supabase (PostgreSQL + Auth + Realtime + Storage + Edge Functions)
CDN/Edge       : Cloudflare Pages + Workers + WAF
Monorepo       : Turborepo
State          : Zustand (client) + TanStack Query (server state)
Push Notif     : Web Push API (service worker)
Icons          : Lucide React
```

### 7.2 Struktur Proyek

```
/
├── apps/
│   ├── web/                    # www.namaapp.com — marketing + transaksi
│   │   └── app/
│   │       ├── (marketing)/    # Landing, pricing, about
│   │       ├── (auth)/         # Register, login, reset password
│   │       └── upgrade/        # Halaman upgrade (fase 2)
│   └── pwa/                    # app.namaapp.com — PWA operasional
│       ├── app/
│       │   ├── (auth)/
│       │   ├── (member)/       # Dashboard, profil, membership saya
│       │   └── (superadmin)/   # Semua halaman manajemen Super Admin
│       └── public/
│           ├── manifest.json
│           ├── sw.js
│           └── icons/
└── packages/
    ├── ui/                     # Shared components (button, card, badge, toggle, dll)
    ├── design-tokens/          # Warna, font, spacing dari design system
    ├── supabase/               # Client + generated types
    └── config/                 # Shared eslint, tsconfig
```

### 7.3 Cloudflare Setup

```
DNS:
  www.namaapp.com  → Cloudflare Pages (web)
  app.namaapp.com  → Cloudflare Pages (pwa)

Workers:
  auth-middleware  → Validasi Supabase JWT di edge (halaman protected)
  redirect-worker  → Handle deep link web → pwa dengan query params

Security:
  WAF rules aktif
  Rate limit auth: 10 req/mnt per IP
  Bot Fight Mode: ON
  HTTPS enforced (Always Use HTTPS)
```

---

## 8. User Flow Detail

### 8.1 Flow Registrasi Member Baru
```
1. Kunjungi www.namaapp.com
2. Klik CTA "Daftar Sekarang"
3. Isi form (nama, email, password)
4. Supabase kirim email verifikasi
5. Klik link verifikasi di email
6. Sistem:
   - Buat record profiles
   - Assign paket default (is_default=true, biasanya Free)
   - Insert ke user_memberships & membership_history
7. Redirect → app.namaapp.com/welcome
8. Tampil prompt install PWA (Android)
9. Masuk dashboard member
```

### 8.2 Flow Super Admin Ganti Paket Member (Manual Toggle)
```
1. Super Admin login → app.namaapp.com/superadmin
2. Buka menu "Member"
3. Cari member (search/filter)
4. Klik nama member → halaman detail
5. Klik tombol "Ganti Paket"
6. Muncul modal:
   - Toggle/pilih paket baru
   - Input tanggal mulai
   - Input durasi / tanggal berakhir
   - Textarea catatan internal (opsional)
7. Klik "Simpan Perubahan"
8. Sistem:
   - Update user_memberships
   - Insert ke membership_history
   - Kirim notifikasi ke member (email + push)
9. Modal tutup, halaman detail terupdate
```

### 8.3 Flow Super Admin Konfigurasi Paket
```
1. Super Admin → menu "Paket Membership"
2. Lihat daftar paket (card view dengan drag & drop urutan)
3. Klik "Tambah Paket Baru" atau klik paket existing
4. Form paket:
   - Nama, deskripsi, level, harga, warna, ikon
   - Toggle "Aktif"
   - Toggle "Paket Default (untuk member baru)"
5. Tab "Konfigurasi Fitur":
   - List semua fitur yang ada
   - Toggle ON/OFF per fitur
   - Input value (untuk fitur bertipe number/text)
6. Simpan → real-time berlaku ke semua member paket ini
```

### 8.4 Flow Expiry Otomatis (Supabase Cron)
```
Cron: Setiap hari pukul 00:00 WIB

Tahap 1 — Reminder:
- Query members WHERE expires_at IN (now()+7d, now()+3d, now()+1d)
- Kirim notifikasi reminder

Tahap 2 — Expired:
- Query WHERE expires_at <= now() AND status = 'active'
- Set status = 'expired', grace_until = expires_at + 3 hari
- Kirim notifikasi "Membership Expired"

Tahap 3 — Grace Period Habis:
- Query WHERE grace_until <= now() AND status = 'expired'
- Downgrade ke paket default (Free)
- Insert membership_history (change_type: 'expiry')
- Kirim notifikasi "Akses premium dicabut"
```

---

## 9. Super Admin Dashboard — Halaman & Fitur

| Halaman | Konten |
|---|---|
| **Overview** | Total member per paket (realtime), grafik pertumbuhan, member akan expired (7 hari), aktivitas terbaru |
| **Member** | Tabel member + filter/search + aksi cepat |
| **Detail Member** | Profil, paket aktif, riwayat, tombol aksi |
| **Paket Membership** | Card semua paket, tambah/edit/duplikasi/arsip |
| **Detail Paket** | Konfigurasi paket + toggle fitur per paket |
| **Master Fitur** | Daftar semua fitur, tambah fitur baru, edit label |
| **Notifikasi** | Log semua notifikasi yang terkirim |
| **Pengaturan** | Data platform, konfigurasi umum, akun Super Admin |

---

## 10. Non-Functional Requirements

| Kategori | Requirement |
|---|---|
| **Performa** | FCP < 1.5 detik, TTI < 3 detik (mobile 4G) |
| **PWA** | Lighthouse PWA ≥ 90, installable di Android Chrome |
| **Responsif** | 360px – 1440px, mobile-first |
| **Aksesibilitas** | WCAG 2.1 Level AA |
| **Keamanan** | HTTPS enforced, RLS di semua tabel, input sanitization, rate limiting |
| **Offline** | Halaman utama tetap tampil meski offline (service worker cache) |
| **Realtime** | Perubahan paket oleh Super Admin langsung terasa di sisi member (Supabase Realtime) |

---

## 11. Roadmap

### ✅ Fase 1 — Membership Management (Sekarang)
- [ ] Setup Turborepo + Next.js TS (2 apps: web + pwa)
- [ ] Konfigurasi Supabase (schema, RLS, seed data)
- [ ] Konfigurasi Cloudflare (DNS, Pages, Workers)
- [ ] Autentikasi (register, login, email verify, reset password)
- [ ] Design system & shared UI components (sesuai referensi UI)
- [ ] CRUD Paket Membership + Master Fitur (Super Admin)
- [ ] Toggle fitur per paket
- [ ] Manajemen Member + ganti paket manual
- [ ] Profil Member + halaman "Membership Saya"
- [ ] PWA manifest + service worker + install prompt
- [ ] Notifikasi (in-app + email) + cron expiry
- [ ] Deep link web → app
- [ ] Super Admin dashboard dengan statistik

### 🔜 Fase 2 — Payment Gateway
- [ ] Integrasi Midtrans / Xendit
- [ ] Halaman checkout + konfirmasi
- [ ] Webhook auto-upgrade setelah bayar
- [ ] Invoice & riwayat transaksi member
- [ ] Laporan pendapatan Super Admin

### 🔜 Fase 3 — Google Play Store
- [ ] TWA (Trusted Web Activity) wrapping PWA
- [ ] Digital Asset Links verification
- [ ] Aset Play Store (ikon, screenshot, deskripsi)
- [ ] Sign in with Google

### 🔜 Fase 4 — Lanjutan
- [ ] Referral & affiliate program
- [ ] Multi-bahasa (i18n)
- [ ] Advanced analytics
- [ ] Sub-akun (tergantung fitur domain bisnis)

---

## 12. Risiko & Mitigasi

| Risiko | Level | Mitigasi |
|---|---|---|
| Data breach | Tinggi | RLS Supabase ketat, audit log, enkripsi sensitif |
| Super Admin akun dikompromikan | Tinggi | 2FA (fase 1), IP whitelist Cloudflare Workers |
| PWA tidak installable di Android lama | Sedang | Fallback ke mobile web, panduan screenshot |
| Supabase downtime | Tinggi | Monitor aktif, readonly fallback mode |
| Konfig fitur paket rusak saat edit | Sedang | Validasi di frontend + backend, staging env |
| Member tidak tahu paketnya berubah | Rendah | Notifikasi email + push wajib saat ada perubahan |

---

*Living document — diperbarui seiring perkembangan proyek.*
