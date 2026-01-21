// api.js - API service for FYD Admin

import { getSession } from './authSession';

const API_BASE = 'http://localhost:8080/api';

// Helper function for API calls
async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const token = getSession();

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  // Nếu body là FormData, browser sẽ tự động set Content-Type là multipart/form-data với boundary
  // Chúng ta cần xóa header Content-Type mặc định (application/json)
  if (options.body instanceof FormData) {
    if (headers['Content-Type'] === 'application/json') {
      delete headers['Content-Type'];
    }
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    // Handle empty responses (204 No Content or empty body)
    const text = await response.text();
    if (!text) {
      return {};
    }
    return JSON.parse(text);
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

// ============ AUTH ============
export const authAPI = {
  login: (username, password) =>
    fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  getMe: () => fetchAPI('/auth/me'),

  updateProfile: (data) =>
    fetchAPI('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

// ============ DASHBOARD ============
export const dashboardAPI = {
  get: () => fetchAPI('/dashboard'),
  getRevenue: (days = 7) => fetchAPI(`/dashboard/revenue?days=${days}`),
  getAiSuggestions: () => fetchAPI('/dashboard/ai-suggestions'),
  applyAiAction: (insightId, category, data) =>
    fetchAPI('/dashboard/ai-action/apply', {
      method: 'POST',
      body: JSON.stringify({ insightId, category, data }),
    }),
};

// ============ PRODUCTS ============
export const productAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchAPI(`/products${query ? `?${query}` : ''}`);
  },

  getById: (id) => fetchAPI(`/products/${id}`),

  getBrands: () => fetchAPI('/products/brands'),

  getBySku: (sku) => fetchAPI(`/products/sku/${sku}`),

  create: (data) =>
    fetchAPI('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id, data) =>
    fetchAPI(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id) =>
    fetchAPI(`/products/${id}`, { method: 'DELETE' }),

  updateStock: (id, variantId, quantity) =>
    fetchAPI(`/products/${id}/stock?variantId=${variantId}&quantity=${quantity}`, {
      method: 'PATCH',
    }),

  setPrimaryImage: (productId, imageId) =>
    fetchAPI(`/products/${productId}/primary-image?imageId=${imageId}`, {
      method: 'PATCH',
    }),

  uploadImage: async (productId, file) => {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('fyd_token');
    const response = await fetch(`${API_BASE}/products/${productId}/images`, {
      method: 'POST',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }
    return response.json();
  },

  deleteImage: (productId, imageId) =>
    fetchAPI(`/products/${productId}/images/${imageId}`, {
      method: 'DELETE',
    }),

  getFeatured: () => fetchAPI('/products/featured'),
  getNew: () => fetchAPI('/products/new'),
  getTopSelling: (limit = 10) => fetchAPI(`/products/top-selling?limit=${limit}`),
};

// ============ ORDERS ============
export const orderAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchAPI(`/orders${query ? `?${query}` : ''}`);
  },

  getById: (id) => fetchAPI(`/orders/${id}`),

  getByNumber: (orderNumber) => fetchAPI(`/orders/number/${orderNumber}`),

  create: (data) =>
    fetchAPI('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateStatus: (id, status) =>
    fetchAPI(`/orders/${id}/status?status=${status}`, {
      method: 'PATCH',
    }),

  delete: (id) =>
    fetchAPI(`/orders/${id}`, { method: 'DELETE' }),

  requestCancel: (id, reason) =>
    fetchAPI(`/orders/${id}/cancel-request?reason=${encodeURIComponent(reason)}`, {
      method: 'PATCH',
    }),

  getByCustomer: (customerId, params = {}) => {
    const query = new URLSearchParams({ ...params, customerId }).toString();
    return fetchAPI(`/orders?${query}`);
  },
};

// ============ CUSTOMERS ============
export const customerAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchAPI(`/customers${query ? `?${query}` : ''}`);
  },

  getById: (id) => fetchAPI(`/customers/${id}`),

  getByPhone: (phone) => fetchAPI(`/customers/phone/${phone}`),

  getByEmail: (email) => fetchAPI(`/customers/email/${email}`),

  update: (id, data) =>
    fetchAPI(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  uploadAvatar: (id, file) => {
    const formData = new FormData();
    formData.append("file", file);

    // For FormData, we must not set 'Content-Type': 'application/json'.
    // The browser will automatically set the correct 'Content-Type' header
    // including the boundary for multipart/form-data.
    // We pass an empty headers object to fetchAPI to prevent it from adding 'Content-Type: application/json'.
    return fetchAPI(`/customers/${id}/avatar`, {
      method: "POST",
      body: formData,
      headers: {}, // Override default 'Content-Type: application/json'
    });
  }
};

// ============ INVENTORY ============
export const inventoryAPI = {
  getAll: (params = {}) => {
    // Filter out undefined, null, and empty string values
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== '')
    );
    const query = new URLSearchParams(cleanParams).toString();
    return fetchAPI(`/inventory${query ? `?${query}` : ''}`);
  },

  getLowStock: (threshold = 6) => fetchAPI(`/inventory/low-stock?threshold=${threshold}`),

  getOutOfStock: () => fetchAPI('/inventory/out-of-stock'),

  updateVariantStock: (variantId, quantity) =>
    fetchAPI(`/inventory/variant/${variantId}?quantity=${quantity}`, {
      method: 'PATCH',
    }),

  setVariantStock: (variantId, stock) =>
    fetchAPI(`/inventory/variant/${variantId}/stock?stock=${stock}`, {
      method: 'PUT',
    }),
};

// ============ CATEGORIES ============
export const categoryAPI = {
  getAll: () => fetchAPI('/categories'),
  getFlat: () => fetchAPI('/categories/flat'),
  getById: (id) => fetchAPI(`/categories/${id}`),
};

// ============ COLORS, SIZES, BRANDS ============
export const colorAPI = {
  getAll: () => fetchAPI('/colors'),
};

export const sizeAPI = {
  getAll: () => fetchAPI('/sizes'),
};

export const brandAPI = {
  getAll: () => fetchAPI('/brands'),
};

// ============ SHOP API HELPERS ============
export async function fetchProducts() {
  try {
    const response = await productAPI.getAll({ size: 100 }); // Get more products for shop
    // Backend returns { products: [...], currentPage, totalItems, totalPages }
    return response.products || [];
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return [];
  }
}

export async function fetchCategories() {
  try {
    const categories = await categoryAPI.getAll();
    // Transform to include children structure
    return categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      image: cat.image,
      parentId: cat.parentId,
      sortOrder: cat.sortOrder,
      children: cat.children || []
    }));
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return [];
  }
}

export async function fetchColors() {
  try {
    const colors = await colorAPI.getAll();
    return colors || [];
  } catch (error) {
    console.error('Failed to fetch colors:', error);
    return [];
  }
}

export async function fetchSizes() {
  try {
    const sizes = await sizeAPI.getAll();
    return sizes || [];
  } catch (error) {
    console.error('Failed to fetch sizes:', error);
    return [];
  }
}

// ============ HELPERS ============
export function formatVND(n) {
  try {
    return new Intl.NumberFormat('vi-VN').format(n) + '₫';
  } catch {
    return `${n}₫`;
  }
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatTime(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Status mapping
export const ORDER_STATUS = {
  PENDING: 'Chờ xử lý',
  PENDING_CANCEL: 'Chờ duyệt hủy',
  CONFIRMED: 'Đã xác nhận',
  PROCESSING: 'Đang xử lý',
  SHIPPING: 'Đang giao',
  DELIVERED: 'Hoàn tất',
  CANCELLED: 'Đã hủy',
  RETURNED: 'Hoàn trả',
};

export const PAYMENT_METHOD = {
  COD: 'COD',
  BANK_TRANSFER: 'Chuyển khoản',
  MOMO: 'Momo',
  VNPAY: 'VNPay',
  ZALOPAY: 'ZaloPay',
};

// ============ AI API ============
export const aiAPI = {
  chat: (message, context = 'shop') =>
    fetchAPI('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, context }),
    }),

  shopChat: (message) =>
    fetchAPI('/ai/shop-chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),

  adminChat: (message) =>
    fetchAPI('/ai/admin-chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),

  getAdminSummary: () => fetchAPI('/ai/admin-summary'),

  // AI Product Management
  generateDescription: (productName, category) =>
    fetchAPI('/ai/generate-description', {
      method: 'POST',
      body: JSON.stringify({ productName, category }),
    }),

  suggestCategory: (productName, description) =>
    fetchAPI('/ai/suggest-category', {
      method: 'POST',
      body: JSON.stringify({ productName, description }),
    }),

  // AI Anomaly Detection
  getAnomalies: () => fetchAPI('/ai/anomalies'),
};

// ============ NOTIFICATION API ============
export const notificationAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchAPI(`/notifications${query ? `?${query}` : ''}`);
  },

  markRead: (id) =>
    fetchAPI(`/notifications/${id}/read`, { method: 'PATCH' }),

  markAllRead: () =>
    fetchAPI('/notifications/read-all', { method: 'PATCH' }),

  delete: (id) =>
    fetchAPI(`/notifications/${id}`, { method: 'DELETE' }),

  create: (data) =>
    fetchAPI('/notifications', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// ============ FEATURED ZONES API ============
export const featuredAPI = {
  getZones: () => fetchAPI('/featured-zones'),

  getZone: (id) => fetchAPI(`/featured-zones/${id}`),

  getZoneBySlug: (slug) => fetchAPI(`/featured-zones/slug/${slug}`),

  getActiveZones: () => fetchAPI('/featured-zones/active'),

  createZone: (data) =>
    fetchAPI('/featured-zones', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateZone: (id, data) =>
    fetchAPI(`/featured-zones/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteZone: (id) =>
    fetchAPI(`/featured-zones/${id}`, { method: 'DELETE' }),
};

// ============ PROMOTION API ============
export const promotionAPI = {
  getAll: () => fetchAPI('/promotions'),
  getActive: () => fetchAPI('/promotions/active'),
  getById: (id) => fetchAPI(`/promotions/${id}`),
  create: (data) =>
    fetchAPI('/promotions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id, data) =>
    fetchAPI(`/promotions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id) =>
    fetchAPI(`/promotions/${id}`, {
      method: 'DELETE',
    }),
  validate: (code, subtotal) =>
    fetchAPI('/promotions/validate', {
      method: 'POST',
      body: JSON.stringify({ code, subtotal }),
    }),
  apply: (code) =>
    fetchAPI('/promotions/apply', {
      method: 'POST',
      body: JSON.stringify({ code }),
    }),
};

// ============ POINTS API ============
export const pointsAPI = {
  getBalance: (customerId) => fetchAPI(`/points/balance/${customerId}`),
  calculate: (customerId, orderAmount, pointsToUse = 0) =>
    fetchAPI('/points/calculate', {
      method: 'POST',
      body: JSON.stringify({ customerId, orderAmount, pointsToUse }),
    }),
  getTiers: () => fetchAPI('/points/tiers'),
  getTierStats: () => fetchAPI('/points/tiers/stats'),
  updateTier: (id, data) =>
    fetchAPI(`/points/tiers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

export default {
  auth: authAPI,
  dashboard: dashboardAPI,
  product: productAPI,
  order: orderAPI,
  customer: customerAPI,
  inventory: inventoryAPI,
  category: categoryAPI,
  color: colorAPI,
  size: sizeAPI,
  brand: brandAPI,
  ai: aiAPI,
  notification: notificationAPI,
  promotion: promotionAPI,
  points: pointsAPI,
};

