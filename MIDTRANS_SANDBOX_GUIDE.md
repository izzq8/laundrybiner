# Panduan Penggunaan Midtrans Sandbox

## 🧪 Mode Sandbox

Mode sandbox Midtrans memungkinkan Anda untuk menguji integrasi pembayaran tanpa menggunakan uang sungguhan. Semua transaksi yang dilakukan dalam mode sandbox adalah simulasi.

## 🔑 Kredensial Test

### Kartu Kredit
- **Nomor Kartu**: 4811 1111 1111 1114
- **CVV**: 123
- **Tanggal Kadaluarsa**: 01/25
- **OTP/3DS**: 112233

### Virtual Account
- Pilih bank apa saja
- Sistem akan otomatis menyelesaikan pembayaran dalam beberapa detik

### E-Wallet
- **GoPay**: Akan menampilkan QR code dummy
- **ShopeePay**: Akan redirect ke halaman simulasi
- **QRIS**: Akan menampilkan QR code dummy

## 🚀 Cara Menggunakan

1. **Pilih Metode Pembayaran**
   - Pilih salah satu metode pembayaran yang tersedia

2. **Untuk Kartu Kredit**
   - Masukkan nomor kartu test: 4811 1111 1111 1114
   - CVV: 123
   - Exp: 01/25
   - Pada halaman 3DS, masukkan OTP: 112233

3. **Untuk Virtual Account**
   - Catat nomor virtual account yang diberikan
   - Dalam mode sandbox, pembayaran akan otomatis diselesaikan

4. **Untuk E-Wallet**
   - Scan QR code dummy atau klik tombol "Bayar"
   - Sistem akan otomatis menyelesaikan pembayaran

## 🔄 Status Transaksi

Dalam mode sandbox, status transaksi akan berubah secara otomatis:

- **Kartu Kredit**: Langsung berubah menjadi "settlement" setelah OTP dimasukkan
- **Virtual Account**: Berubah menjadi "settlement" setelah beberapa detik
- **E-Wallet**: Berubah menjadi "settlement" setelah QR code di-scan

## ⚠️ Penting Diketahui

1. **Tidak Ada Uang Sungguhan**: Semua transaksi dalam mode sandbox adalah simulasi
2. **Data Test**: Gunakan hanya data test yang disediakan
3. **Notifikasi**: Webhook notifikasi tetap akan dikirim seperti di production
4. **Dashboard**: Transaksi akan muncul di dashboard Midtrans sandbox

## 🔍 Troubleshooting

### Kartu Kredit Ditolak
- Pastikan menggunakan nomor kartu test yang benar
- Pastikan CVV dan tanggal kadaluarsa sesuai

### Virtual Account Tidak Berfungsi
- Pastikan Anda menggunakan endpoint sandbox
- Cek log untuk melihat response dari Midtrans

### Status Tidak Berubah
- Dalam beberapa kasus, perlu waktu beberapa detik untuk update status
- Refresh halaman atau cek kembali setelah beberapa saat

## 📊 Testing Webhook

Untuk testing webhook di environment lokal:
1. Gunakan tools seperti ngrok untuk membuat tunnel ke localhost
2. Set webhook URL di dashboard Midtrans sandbox ke URL ngrok Anda
3. Lakukan transaksi test untuk memicu webhook

## 🔄 Beralih ke Production

Setelah testing selesai dan ingin beralih ke production:
1. Ubah `MIDTRANS_IS_PRODUCTION=true` di environment variables
2. Gunakan Server Key dan Client Key production
3. Pastikan semua endpoint menggunakan URL production Midtrans

## 📞 Bantuan

Jika mengalami masalah dengan sandbox Midtrans:
- Dokumentasi: [https://docs.midtrans.com](https://docs.midtrans.com)
- Support: support@midtrans.com
