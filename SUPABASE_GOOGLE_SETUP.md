# Langkah-langkah Lengkap Setup Google OAuth di Supabase

Karena Anda sudah menambahkan Google+ API dan URL website, sekarang perlu melakukan konfigurasi di Supabase Dashboard.

## Langkah Selanjutnya:

### 1. Dapatkan Client ID dan Client Secret dari Google Cloud Console

1. **Buka Google Cloud Console**
   - Pergi ke [Google Cloud Console](https://console.cloud.google.com/)
   - Pilih project yang sudah Anda buat

2. **Buat OAuth 2.0 Credentials**
   - Pergi ke "APIs & Services" > "Credentials"
   - Klik "Create Credentials" > "OAuth 2.0 Client IDs"
   - Pilih "Web application"
   - Beri nama (contoh: "LaundryBiner Web Client")

3. **Tambahkan Authorized JavaScript origins**
   \`\`\`
   https://your-project-ref.supabase.co
   https://v0.dev (jika menggunakan v0 preview)
   \`\`\`

4. **Tambahkan Authorized redirect URIs**
   \`\`\`
   https://your-project-ref.supabase.co/auth/v1/callback
   \`\`\`

5. **Copy Client ID dan Client Secret**
   - Setelah dibuat, copy kedua nilai ini

### 2. Konfigurasi di Supabase Dashboard

1. **Buka Supabase Dashboard**
   - Pergi ke project Supabase Anda
   - Pilih "Authentication" dari sidebar

2. **Enable Google Provider**
   - Klik tab "Providers"
   - Cari "Google" dan toggle untuk enable
   - Masukkan Client ID dan Client Secret dari langkah 1
   - Klik "Save"

3. **Set Site URL (Penting!)**
   - Masih di Authentication, klik tab "Settings"
   - Di bagian "Site URL", masukkan:
     \`\`\`
     https://v0.dev (untuk preview)
     atau
     https://yourdomain.com (untuk production)
     \`\`\`

### 3. Verifikasi Environment Variables

Pastikan di project Anda sudah ada:
\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
\`\`\`

### 4. Test Google OAuth

Setelah semua dikonfigurasi:
1. Refresh halaman website
2. Coba klik "Masuk dengan Google"
3. Popup Google OAuth seharusnya muncul
4. Setelah login, akan redirect ke /auth/callback kemudian ke /dashboard

## Troubleshooting

### Jika masih muncul "This content is blocked":

1. **Periksa Authorized domains di Google Cloud Console**
   - Pastikan domain v0.dev atau domain Anda sudah ditambahkan

2. **Periksa redirect URI**
   - Harus persis sama dengan yang di Supabase: 
   - `https://your-project-ref.supabase.co/auth/v1/callback`

3. **Periksa Site URL di Supabase**
   - Harus sesuai dengan domain yang digunakan

4. **Clear browser cache dan cookies**
   - Kadang cache lama bisa menyebabkan masalah

### Jika popup tidak muncul:
- Pastikan popup blocker tidak aktif
- Coba di browser lain atau incognito mode

### Jika error "redirect_uri_mismatch":
- Periksa kembali Authorized redirect URIs di Google Cloud Console
- Pastikan format URL benar dan tidak ada typo

## Catatan Penting:

- Google OAuth mungkin tidak berfungsi sempurna di environment preview seperti v0.dev
- Untuk production, deploy ke domain sendiri (Vercel, Netlify, dll)
- Pastikan semua URL konsisten antara Google Cloud Console dan Supabase

Setelah mengikuti langkah-langkah ini, Google Sign In seharusnya berfungsi dengan baik!
