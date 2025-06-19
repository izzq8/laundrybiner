/**
 * Format currency consistently between server and client
 * to avoid hydration mismatches
 */
export const formatCurrency = (amount: number): string => {
  // Use consistent Indonesian locale formatting
  // This ensures same output on both server and client
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format currency with Rp prefix
 */
export const formatRupiah = (amount: number): string => {
  return `Rp ${formatCurrency(amount)}`
}

/**
 * Safe number formatting that works consistently
 * Alternative approach using manual formatting
 */
export const formatNumber = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

/**
 * Format Rupiah with manual formatting (fallback)
 */
export const formatRupiahSafe = (amount: number): string => {
  return `Rp ${formatNumber(amount)}`
}
