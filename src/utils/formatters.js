/**
 * Formats a date string into a readable local format.
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
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('id-ID').format(amount || 0);
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

/**
 * Returns a string describing the stock status.
 */
export function getStockStatus(current, min) {
    if (current === 0) return 'Habis';
    if (current <= (min || 5)) return 'Rendah';
    return 'Normal';
}

/**
 * Returns a full Tailwind CSS class string for the stock status badge.
 * This is the single, standardized function to be used everywhere.
 */
export function getStockBadgeClass(current, min) {
    const baseClass = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
    const threshold = Number.isFinite(min) ? Number(min) : undefined;

    if (current === 0) return `${baseClass} bg-red-100 text-red-800`;

    // If a per-item minimum is provided, scale colors relative to that
    if (typeof threshold === 'number') {
      if (current <= threshold) return `${baseClass} bg-orange-100 text-orange-800`;
      // Warning band: up to ~4x the minimum (tweakable)
      const warnUpper = Math.max(threshold + 1, Math.ceil(threshold * 4));
      if (current <= warnUpper) return `${baseClass} bg-yellow-100 text-yellow-800`;
      return `${baseClass} bg-green-100 text-green-800`;
    }

    // Legacy behavior when no minimum is provided
    if (current <= 5) return `${baseClass} bg-orange-100 text-orange-800`;
    if (current <= 20) return `${baseClass} bg-yellow-100 text-yellow-800`;
    return `${baseClass} bg-green-100 text-green-800`;
}

/**
 * Format role name for display with emoji prefix.
 */
export function formatRoleName(role) {
  const roleMap = {
    'admin': '🔑 Administrator',
    'manager': '👔 Manager',
    'user': '👤 User'
  }
  return roleMap[role] || role
}

/**
 * Get role badge styling classes.
 */
export function getRoleBadgeClass(role) {
  const classMap = {
    'admin': 'bg-red-200 text-red-800 border border-red-300',
    'manager': 'bg-blue-200 text-blue-800 border border-blue-300',
    'user': 'bg-green-200 text-green-800 border border-green-300'
  }
  return classMap[role] || 'bg-gray-200 text-gray-800 border border-gray-300'
}

/**
 * Get role badge styling for simple tables/lists (without border).
 * Used in Users.vue, PenggunaanBarang.vue
 */
export function getRoleBadgeSimpleClass(roleName) {
  const roleClasses = {
    'admin': 'bg-red-100 text-red-800',
    'manager': 'bg-blue-100 text-blue-800',
    'user': 'bg-green-100 text-green-800',
  };
  return roleClasses[roleName] || 'bg-gray-100 text-gray-800';
}