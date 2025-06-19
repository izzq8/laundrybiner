# Solusi Masalah Webhook Payment di Localhost

## Masalah yang Terjadi

Ketika menggunakan Midtrans Sandbox di localhost, webhook tidak dapat berjalan dengan normal karena:

1. **Midtrans tidak dapat mengakses localhost** - Webhook memerlukan URL yang dapat diakses dari internet
2. **Mismatch Order ID** - Order ID yang dikirim Midtrans mungkin berbeda dengan yang tersimpan di database
3. **Development Environment** - Di localhost, webhook Midtrans tidak dapat mengirim notifikasi secara otomatis

## Solusi yang Disediakan

### 1. Manual Payment Status Update (Recommended untuk Development)

Kami telah menambahkan sistem untuk memperbarui status payment secara manual:

#### A. Melalui Order Detail Page
1. Buka halaman order: `http://localhost:3000/orders/{ORDER_ID}`
2. Setelah melakukan pembayaran di Midtrans, klik tombol **"Perbarui Status Pembayaran"**
3. Sistem akan mengecek status payment dari Midtrans API dan memperbarui database

#### B. Melalui Tool Khusus
1. Buka: `http://localhost:3000/payment-status-update`
2. Masukkan Order ID (UUID format)
3. Klik "Update Status Pembayaran"

### 2. Webhook Handler yang Diperbaiki

Webhook handler sudah diperbaiki untuk menangani berbagai skenario order ID:
- Direct match dengan `midtrans_order_id`
- Fallback dengan pattern matching
- Time-based matching untuk order terbaru

## Cara Testing

### 1. Flow Normal (dengan Manual Update)

```bash
# 1. Buat order baru
# 2. Klik "Bayar Sekarang" -> akan redirect ke Midtrans
# 3. Lakukan pembayaran (gunakan QRIS simulator)
# 4. Setelah payment success, kembali ke order detail
# 5. Klik "Perbarui Status Pembayaran"
# 6. Status akan berubah menjadi "paid" dan order status menjadi "confirmed"
```

### 2. Manual Testing dengan Order ID

```bash
# Order ID dari SQL: 63fca420-dc4a-44bf-a1e9-ab931945a0b8
# 1. Buka: http://localhost:3000/payment-status-update
# 2. Masukkan: 63fca420-dc4a-44bf-a1e9-ab931945a0b8
# 3. Klik "Update Status Pembayaran"
```

## API Endpoints yang Ditambahkan

### POST `/api/payment/manual-status-update`
```json
{
  "orderId": "63fca420-dc4a-44bf-a1e9-ab931945a0b8"
}
```

Response:
```json
{
  "success": true,
  "message": "Payment status updated successfully",
  "order": { /* updated order data */ },
  "midtrans_status": { /* midtrans response */ }
}
```

## Untuk Production

Di production, webhook akan bekerja normal karena:
1. Domain dapat diakses dari internet
2. Webhook URL akan dikonfigurasi di Midtrans Dashboard
3. Tidak perlu manual update

### Setup Production Webhook:
1. Login ke Midtrans Dashboard
2. Settings → Configuration
3. Set **Payment Notification URL**: `https://yourdomain.com/api/payment/webhook`

## Troubleshooting

### Error: "Order not found"
- Pastikan Order ID benar (UUID format)
- Cek di database apakah order ada

### Error: "Cannot find Midtrans transaction"
- Order mungkin belum pernah melakukan payment
- Atau order_id pattern tidak sesuai

### Payment status tidak berubah
1. Cek log console untuk error details
2. Pastikan Midtrans sandbox credentials benar
3. Coba manual update melalui tool

## Log Monitoring

Untuk debug, cek console log:
```javascript
// Di browser console
// Atau di terminal server log
```

## File yang Dimodifikasi

1. `/app/api/payment/webhook/route.ts` - Webhook handler yang diperbaiki
2. `/app/api/payment/manual-status-update/route.ts` - Manual update endpoint
3. `/app/orders/[orderId]/page.tsx` - Tambah tombol refresh status
4. `/app/payment-status-update/page.tsx` - Tool untuk manual update

## Testing Data

Order ID dari SQL attachment: `63fca420-dc4a-44bf-a1e9-ab931945a0b8`
- Order Number: `LDY-20250619-0001`
- Total Amount: `Rp 18,000`
- Status: `pending`
- Payment Status: `pending`

Setelah payment success dan manual update:
- Status: `confirmed`
- Payment Status: `paid`
