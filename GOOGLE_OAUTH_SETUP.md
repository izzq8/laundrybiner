# Setup Google OAuth untuk LaundryBiner

## Mengapa Google Sign In Tidak Berfungsi di Preview?

Google OAuth memerlukan domain yang terdaftar dan konfigurasi yang tepat. Di environment preview/development, fitur ini tidak akan berfungsi karena:

1. Domain preview tidak dapat didaftarkan di Google Cloud Console
2. Supabase OAuth memerlukan konfigurasi khusus
3. Redirect URLs harus sesuai dengan yang terdaftar

## Langkah-langkah Setup untuk Production:

### 1. Google Cloud Console Setup

1. **Buka Google Cloud Console**
   - Pergi ke [Google Cloud Console](https://console.cloud.google.com/)
   - Buat project baru atau pilih project yang ada

2. **Enable Google+ API**
   - Pergi ke "APIs & Services" > "Library"
   - Cari "Google+ API" dan enable

3. **Buat OAuth 2.0 Credentials**
   - Pergi ke "APIs & Services" > "Credentials"
   - Klik "Create Credentials" > "OAuth 2.0 Client IDs"
   - Pilih "Web application"
   - Tambahkan Authorized redirect URIs:
     \`\`\`
     https://your-project-ref.supabase.co/auth/v1/callback
     https://yourdomain.com/auth/callback
     \`\`\`

4. **Dapatkan Client ID dan Client Secret**
   - Copy Client ID dan Client Secret yang dihasilkan

### 2. Supabase Dashboard Setup

1. **Buka Supabase Dashboard**
   - Pergi ke project Supabase Anda
   - Pilih "Authentication" > "Providers"

2. **Enable Google Provider**
   - Toggle "Google" provider
   - Masukkan Client ID dan Client Secret dari Google Cloud Console
   - Set Redirect URL: `https://yourdomain.com/auth/callback`

3. **Update Site URL**
   - Di "Authentication" > "Settings"
   - Set Site URL ke domain production Anda

### 3. Environment Variables

Pastikan environment variables berikut sudah diset:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
\`\`\`

### 4. Deploy ke Production

1. **Deploy ke Vercel/Netlify**
   - Deploy aplikasi ke platform hosting
   - Pastikan domain sudah terdaftar

2. **Update Google Cloud Console**
   - Tambahkan domain production ke Authorized domains
   - Update redirect URIs dengan domain yang benar

3. **Test Google OAuth**
   - Coba Google Sign In di production
   - Periksa console untuk error jika ada

## Troubleshooting

### Error: "This content is blocked"
- Pastikan domain terdaftar di Google Cloud Console
- Periksa Authorized redirect URIs
- Pastikan Google+ API sudah enabled

### Error: "redirect_uri_mismatch"
- Periksa redirect URI di Google Cloud Console
- Pastikan sesuai dengan yang diset di Supabase

### Error: "invalid_client"
- Periksa Client ID dan Client Secret
- Pastikan credentials benar di Supabase Dashboard

## Untuk Development

Sementara untuk development/preview, gunakan:
- Email/Password authentication
- Mock Google Sign In (seperti yang sudah diimplementasi)
- Test dengan akun dummy

## Production Checklist

- [ ] Google Cloud Console project dibuat
- [ ] OAuth 2.0 credentials dikonfigurasi
- [ ] Authorized domains dan redirect URIs diset
- [ ] Supabase Google provider enabled
- [ ] Client ID dan Secret dimasukkan ke Supabase
- [ ] Environment variables diset
- [ ] Aplikasi di-deploy ke production
- [ ] Google Sign In ditest di production
