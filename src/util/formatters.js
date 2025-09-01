// src/utils/formatters.js

/**
 * Formats a date string into a readable local format.
 * e.g., "2 September 2025, 02.00"
 */
export function formatDate(dateString) {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Formats a number into an Indonesian Rupiah currency string.
 * e.g., 15000 -> "15.000"
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('id-ID').format(amount || 0);
}

/**
 * Returns a string describing the stock status.
 */
export function getStockStatus(current, min) {
    if (current === 0) return 'Habis';
    if (current <= (min || 5)) return 'Rendah';
    return 'Normal';
}

/**
 * Returns a Tailwind CSS class string for a given pengajuan status.
 */
export function getStatusClass(status) {
  const classMap = {
    'Menunggu Persetujuan': 'bg-yellow-100 text-yellow-800',
    'Disetujui': 'bg-green-100 text-green-800',
    'Ditolak': 'bg-red-100 text-red-800',
    'Selesai': 'bg-blue-100 text-blue-800',
  };
  return classMap[status] || 'bg-gray-100 text-gray-800';
}