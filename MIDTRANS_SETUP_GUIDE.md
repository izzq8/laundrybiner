# Setup Midtrans Payment Gateway untuk LaundryBiner

## 🚀 Langkah-langkah Setup Midtrans

### 1. Daftar Akun Midtrans

1. **Buka website Midtrans**
   - Pergi ke [https://midtrans.com](https://midtrans.com)
   - Klik "Daftar" atau "Sign Up"

2. **Lengkapi data bisnis**
   - Nama bisnis: LaundryBiner
   - Kategori: Service/Laundry
   - Website: domain website Anda
   - Nomor telepon dan email

3. **Verifikasi akun**
   - Cek email untuk verifikasi
   - Upload dokumen yang diperlukan (KTP, NPWP, dll)

### 2. Dapatkan API Keys

1. **Login ke Midtrans Dashboard**
   - Pergi ke [https://dashboard.midtrans.com](https://dashboard.midtrans.com)

2. **Pilih Environment**
   - **Sandbox** (untuk testing): Gratis, menggunakan data dummy
   - **Production** (untuk live): Setelah akun diverifikasi

3. **Copy API Keys**
   - Pergi ke Settings → Access Keys
   - Copy **Server Key**

### 3. Setup Environment Variables

Tambahkan ke file `.env.local` di project Anda:

\`\`\`env
# Midtrans Configuration
MIDTRANS_SERVER_KEY=your-server-key-here
MIDTRANS_IS_PRODUCTION=false
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
\`\`\`

**Contoh untuk Sandbox:**
\`\`\`env
MIDTRANS_SERVER_KEY=SB-Mid-server-xxxxxxxxxxxxxxxx
MIDTRANS_IS_PRODUCTION=false
NEXT_PUBLIC_BASE_URL=https://v0.dev
\`\`\`

**Note:** Client Key tidak diperlukan untuk implementasi server-side ini karena kita menggunakan server-to-server API calls. Client Key hanya diperlukan jika menggunakan Midtrans Snap.js untuk frontend integration.

### 4. Konfigurasi Webhook (Opsional tapi Direkomendasikan)

1. **Di Midtrans Dashboard**
   - Pergi ke Settings → Configuration
   - Set **Payment Notification URL**: `https://yourdomain.com/api/payment/webhook`
   - Set **Finish Redirect URL**: `https://yourdomain.com/payment/finish`
   - Set **Unfinish Redirect URL**: `https://yourdomain.com/payment/unfinish`
   - Set **Error Redirect URL**: `https://yourdomain.com/payment/error`

### 5. Testing di Sandbox

Midtrans menyediakan test cards untuk sandbox:

**Credit Card Testing:**
- Card Number: `4811 1111 1111 1114`
- CVV: `123`
- Exp Month: `01`
- Exp Year: `2025`

**Bank Transfer Testing:**
- Pilih bank mana saja
- Sistem akan otomatis approve dalam beberapa detik

**E-Wallet Testing:**
- GoPay: Akan muncul QR code dummy
- ShopeePay: Redirect ke halaman simulasi

### 6. Go Live (Production)

1. **Lengkapi verifikasi bisnis**
   - Upload dokumen lengkap
   - Tunggu approval dari Midtrans (1-3 hari kerja)

2. **Update environment variables**
   \`\`\`env
   MIDTRANS_IS_PRODUCTION=true
   \`\`\`

3. **Ganti API keys ke production keys**

## 💳 Metode Pembayaran yang Tersedia

### Credit Card
- Visa, Mastercard, JCB
- 3D Secure authentication
- Installment (cicilan) tersedia

### Bank Transfer
- Virtual Account: BCA, Mandiri, BNI, BRI, Permata
- Transfer manual dengan kode unik

### E-Wallet
- GoPay
- ShopeePay  
- QRIS (semua e-wallet)

### Convenience Store
- Indomaret
- Alfamart

## 🔧 Troubleshooting

### Error: "Merchant not found"
- Periksa Server Key sudah benar
- Pastikan environment (sandbox/production) sesuai

### Error: "Invalid signature"
- Periksa webhook signature verification
- Pastikan Server Key benar

### Payment tidak redirect
- Periksa Finish Redirect URL di dashboard
- Pastikan URL accessible dari internet

### Webhook tidak diterima
- Pastikan webhook URL accessible (https)
- Cek firewall atau security settings
- Test webhook dengan tools seperti ngrok untuk development

## 📊 Monitoring & Analytics

1. **Dashboard Midtrans**
   - Monitor transaksi real-time
   - Download laporan
   - Lihat analytics pembayaran

2. **Integration dengan Database**
   - Simpan transaction_id dari Midtrans
   - Update status order berdasarkan webhook
   - Buat laporan keuangan

## 💰 Biaya Transaksi

### Sandbox
- **Gratis** untuk testing

### Production
- **Credit Card**: 2.9% + Rp 2.000
- **Bank Transfer**: Rp 4.000 - Rp 5.500
- **E-Wallet**: 0.7% - 2%
- **QRIS**: 0.7%

*Biaya dapat berubah, cek website Midtrans untuk info terbaru*

## 🔐 Security Best Practices

1. **Jangan expose Server Key** di frontend
2. **Selalu verify webhook signature**
3. **Gunakan HTTPS** untuk semua endpoint
4. **Validate amount** di server sebelum create payment
5. **Log semua transaksi** untuk audit

## 📞 Support

- **Documentation**: [https://docs.midtrans.com](https://docs.midtrans.com)
- **Support Email**: support@midtrans.com
- **Telegram**: @midtranssupport
- **Phone**: +62 21 2212 5430

Setelah setup selesai, test payment gateway dengan:
1. Buat order baru
2. Pilih metode pembayaran online
3. Lakukan pembayaran dengan test data
4. Verifikasi status pembayaran berubah

Good luck! 🚀
