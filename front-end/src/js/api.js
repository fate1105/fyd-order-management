// api.js - API service for FYD Admin

const API_BASE = 'http://localhost:8080/api';

// Helper function for API calls
async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const token = sessionStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return await response.json();
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
};

// ============ PRODUCTS ============
export const productAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchAPI(`/products${query ? `?${query}` : ''}`);
  },
  
  getById: (id) => fetchAPI(`/products/${id}`),
  
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
};

// ============ INVENTORY ============
export const inventoryAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchAPI(`/inventory${query ? `?${query}` : ''}`);
  },
  
  getLowStock: (threshold = 6) => fetchAPI(`/inventory/low-stock?threshold=${threshold}`),
  
  getOutOfStock: () => fetchAPI('/inventory/out-of-stock'),
  
  updateVariantStock: (variantId, quantity) =>
    fetchAPI(`/inventory/variant/${variantId}?quantity=${quantity}`, {
      method: 'PATCH',
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
};
