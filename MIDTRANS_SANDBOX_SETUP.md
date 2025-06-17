# Midtrans Sandbox Setup Guide

## Kredensial Sandbox Anda

- **Merchant ID**: G656403153
- **Client Key**: SB-Mid-client-mNdxM5MY-ItvKEFT
- **Server Key**: SB-Mid-server-bS9phW7kMqLO0jGb3Q9n7INz

## Environment Variables

Pastikan environment variables berikut sudah diset:

\`\`\`env
MIDTRANS_SERVER_KEY=SB-Mid-server-bS9phW7kMqLO0jGb3Q9n7INz
MIDTRANS_IS_PRODUCTION=false
NEXT_PUBLIC_BASE_URL=http://localhost:3000
\`\`\`

## Testing Payment Methods

### 1. Credit Card Testing
- **Nomor Kartu**: 4811 1111 1111 1114
- **CVV**: 123
- **Expiry**: 01/25
- **OTP/3DS**: 112233

### 2. Virtual Account Testing
- **BCA VA**: Akan generate nomor VA otomatis
- **BNI VA**: Akan generate nomor VA otomatis
- **BRI VA**: Akan generate nomor VA otomatis

### 3. E-Wallet Testing
- **GoPay**: Akan redirect ke halaman simulasi GoPay
- **ShopeePay**: Akan redirect ke halaman simulasi ShopeePay
- **QRIS**: Akan generate QR code untuk testing

### 4. Convenience Store
- **Alfamart**: Akan generate kode pembayaran
- **Indomaret**: Akan generate kode pembayaran

## Webhook Testing

Webhook URL untuk development:
\`\`\`
http://localhost:3000/api/payment/webhook
\`\`\`

Untuk production nanti, ganti dengan domain Anda:
\`\`\`
https://yourdomain.com/api/payment/webhook
\`\`\`

## Status Transaksi

- **pending**: Menunggu pembayaran
- **settlement**: Pembayaran berhasil (untuk bank transfer)
- **capture**: Pembayaran berhasil (untuk credit card)
- **deny**: Pembayaran ditolak
- **cancel**: Pembayaran dibatalkan
- **expire**: Pembayaran kadaluarsa

## Cara Testing

1. Buat order melalui aplikasi
2. Pilih metode pembayaran
3. Gunakan data testing di atas
4. Cek status pembayaran di dashboard Midtrans
5. Verifikasi webhook diterima di aplikasi

## Dashboard Midtrans Sandbox

Akses dashboard di: https://dashboard.sandbox.midtrans.com/
Login dengan akun Midtrans Anda untuk melihat transaksi testing.
