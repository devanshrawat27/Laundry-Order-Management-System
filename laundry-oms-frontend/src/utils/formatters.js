/**
 * Format currency in INR
 */
export const formatCurrency = (amount) => {
  return `₹${Number(amount).toLocaleString('en-IN')}`;
};

/**
 * Format a date string to readable format
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Format a date with time
 */
export const formatDateTime = (dateStr) => {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Garment type display names
 */
export const garmentLabels = {
  SHIRT: 'Shirt',
  PANTS: 'Pants',
  SAREE: 'Saree',
  SUIT: 'Business Suit',
  JACKET: 'Jacket',
  KURTA: 'Kurta',
  DRESS: 'Dress',
  BED_SHEET: 'Bed Sheet',
};

/**
 * Get friendly garment label
 */
export const getGarmentLabel = (type) => garmentLabels[type] || type;
