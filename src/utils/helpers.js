// Values below mirror what the backend accepts (models and validators).
export const CATEGORIES = ['electronics', 'clothing', 'food', 'books', 'other'];

export const ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
export const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded'];

export const PAYMENT_METHODS = [
  { value: 'mock_card', label: 'Demo card (mock payment, no real charge)' },
  { value: 'cash_on_delivery', label: 'Cash on delivery' },
];

// Which status an order may move to next (same rules as the backend)
export const ORDER_TRANSITIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
};

export const capitalize = (text) => (text ? text.charAt(0).toUpperCase() + text.slice(1).replace(/_/g, ' ') : '');

const priceFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
});

export const formatPrice = (amount) => priceFormatter.format(Number(amount) || 0);

export const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const shortId = (id) => (id ? String(id).slice(-8) : '');

// Used when a product has no image or the image URL fails to load
const placeholderSvg =
  '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">' +
  '<rect width="400" height="300" fill="#E4EBEE"/>' +
  '<text x="200" y="158" font-family="sans-serif" font-size="22" fill="#82939D" text-anchor="middle">No image</text>' +
  '</svg>';

export const PLACEHOLDER_IMAGE = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(placeholderSvg)}`;

export const getProductImage = (product, index = 0) =>
  (product && product.images && product.images[index]) || PLACEHOLDER_IMAGE;

export const handleImageError = (event) => {
  if (event.currentTarget.src !== PLACEHOLDER_IMAGE) {
    event.currentTarget.src = PLACEHOLDER_IMAGE;
  }
};

// Cloudinary can resize and compress images on the fly. This asks for a smaller copy
// (for example 600px wide) so cards and thumbnails load fast. Other URLs are left unchanged.
export const optimizeImage = (url, width = 800) => {
  const marker = '/image/upload/';
  if (typeof url !== 'string' || !url.includes('res.cloudinary.com') || !url.includes(marker)) {
    return url;
  }
  return url.replace(marker, `${marker}w_${width},c_limit,q_auto,f_auto/`);
};

// Same limits as the backend (it checks again, this only gives faster feedback)
export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Returns an error message, or '' when the file is fine
export const checkImageFile = (file, maxMb) => {
  if (!file) return 'Choose an image first.';
  if (!IMAGE_TYPES.includes(file.type)) return 'Only JPG, PNG or WebP images are allowed.';
  if (file.size > maxMb * 1024 * 1024) return `The image is too large. The maximum size is ${maxMb} MB.`;
  return '';
};
