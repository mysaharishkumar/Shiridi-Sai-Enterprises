import {
  AuthResponse, Banner, Cart, Category, Order, 
  Product, SiteSettings, User, AuditLog, AdminKPIs, OrderStatus, PaymentStatus
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';

export function getCartSessionId(): string {
  let sessionId = localStorage.getItem('sse_cart_session_id');
  if (!sessionId) {
    sessionId = 'sess_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    localStorage.setItem('sse_cart_session_id', sessionId);
  }
  return sessionId;
}

export function getAuthToken(): string | null {
  try {
    localStorage.removeItem('sse_auth_token');
  } catch {}
  return sessionStorage.getItem('sse_auth_token');
}

export function setAuthToken(token: string | null): void {
  try {
    localStorage.removeItem('sse_auth_token');
  } catch {}
  if (token) {
    sessionStorage.setItem('sse_auth_token', token);
  } else {
    sessionStorage.removeItem('sse_auth_token');
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const token = getAuthToken();
  const sessionId = getCartSessionId();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Cart-Session-Id': sessionId,
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // If uploading FormData, delete Content-Type so browser sets correct boundary
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const response = await fetch(url, {
    ...options,
    headers
  });

  if (!response.ok) {
    let errorDetail = 'An unexpected error occurred';
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || errJson.message || errorDetail;
    } catch {
      errorDetail = response.statusText || errorDetail;
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

// Store & Public API
export const storeApi = {
  getSettings: () => request<SiteSettings>('/settings/public'),
  getCategories: () => request<Category[]>('/categories'),
  getCategory: (slug: string) => request<Category>(`/categories/${slug}`),
  getBanners: () => request<Banner[]>('/banners'),
  getProducts: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        query.append(k, String(v));
      }
    });
    const qs = query.toString();
    return request<{ items: Product[]; total: number; page: number; limit: number; total_pages: number }>(
      `/products${qs ? `?${qs}` : ''}`
    );
  },
  getProduct: (slug: string) => request<Product>(`/products/${slug}`),
  getRelatedProducts: (productId: string) => request<Product[]>(`/products/${productId}/related`),
  getSearchSuggestions: (q: string) => request<Array<{ id: string; name: string; slug: string; price: number; category: string; image?: string }>>(
    `/products/search/suggestions?q=${encodeURIComponent(q)}`
  ),
};

// Auth API
export const authApi = {
  register: (data: { name: string; email: string; password: string; phone?: string }) =>
    request<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data: { email: string; password: string }) =>
    request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => request<User>('/auth/me'),
  updateMe: (data: { name?: string; phone?: string; addresses?: any[] }) =>
    request<User>('/auth/me', { method: 'PATCH', body: JSON.stringify(data) }),
};

// Cart API
export const cartApi = {
  getCart: () => request<Cart>('/cart'),
  addItem: (data: { product_id: string; variant_id?: string; quantity: number; color?: string }) =>
    request<Cart>('/cart/items', { method: 'POST', body: JSON.stringify(data) }),
  updateItem: (itemId: string, quantity: number) =>
    request<Cart>(`/cart/items/${itemId}`, { method: 'PATCH', body: JSON.stringify({ quantity }) }),
  removeItem: (itemId: string) =>
    request<Cart>(`/cart/items/${itemId}`, { method: 'DELETE' }),
  clearCart: () =>
    request<Cart>('/cart', { method: 'DELETE' }),
};

// Orders API
export const orderApi = {
  createOrder: (data: {
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    shipping_address: any;
    delivery_instructions?: string;
    payment_method?: string;
  }) => request<Order>('/orders', { method: 'POST', body: JSON.stringify(data) }),
  getMyOrders: () => request<Order[]>('/orders/me'),
  getOrder: (idOrNumber: string, phone?: string) => {
    const qs = phone ? `?phone=${encodeURIComponent(phone)}` : '';
    return request<Order>(`/orders/${idOrNumber}${qs}`);
  },
  cancelOrder: (orderId: string, reason: string) =>
    request<Order>(`/orders/${orderId}/cancel`, { method: 'POST', body: JSON.stringify({ reason }) }),
};

// Admin API
export const adminApi = {
  getOverview: () => request<{
    kpis: AdminKPIs;
    recent_orders: any[];
    low_stock_alerts: any[];
    recent_activity: AuditLog[];
  }>('/admin/reports/overview'),
  
  // Products
  getProducts: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        query.append(k, String(v));
      }
    });
    const qs = query.toString();
    return request<{ items: Product[]; total: number; page: number; limit: number; total_pages: number }>(
      `/admin/products${qs ? `?${qs}` : ''}`
    );
  },
  getProduct: (id: string) => request<Product>(`/admin/products/${id}`),
  createProduct: (data: any) => request<Product>('/admin/products', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id: string, data: any) => request<Product>(`/admin/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  duplicateProduct: (id: string) => request<Product>(`/admin/products/${id}/duplicate`, { method: 'POST' }),
  deleteProduct: (id: string, hardDelete: boolean = false) =>
    request<{ success: boolean; message: string }>(`/admin/products/${id}?hard_delete=${hardDelete}`, { method: 'DELETE' }),

  // Categories
  getCategories: () => request<Category[]>('/admin/categories'),
  createCategory: (data: any) => request<Category>('/admin/categories', { method: 'POST', body: JSON.stringify(data) }),
  updateCategory: (id: string, data: any) => request<Category>(`/admin/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCategory: (id: string) => request<{ success: boolean; message: string }>(`/admin/categories/${id}`, { method: 'DELETE' }),

  // Banners
  getBanners: () => request<Banner[]>('/admin/banners'),
  createBanner: (data: any) => request<Banner>('/admin/banners', { method: 'POST', body: JSON.stringify(data) }),
  updateBanner: (id: string, data: any) => request<Banner>(`/admin/banners/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteBanner: (id: string) => request<{ success: boolean; message: string }>(`/admin/banners/${id}`, { method: 'DELETE' }),
  reorderBanners: (orderMap: Array<{ id: string; order: number }>) =>
    request<{ success: boolean; message: string }>('/admin/banners/reorder', { method: 'POST', body: JSON.stringify(orderMap) }),

  // Orders
  getOrders: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        query.append(k, String(v));
      }
    });
    const qs = query.toString();
    return request<{ items: Order[]; total: number; page: number; limit: number; total_pages: number }>(
      `/admin/orders${qs ? `?${qs}` : ''}`
    );
  },
  getOrder: (id: string) => request<Order>(`/admin/orders/${id}`),
  updateOrderStatus: (id: string, data: {
    order_status: OrderStatus;
    payment_status?: PaymentStatus;
    note?: string;
    tracking_number?: string;
    courier_partner?: string;
    estimated_delivery_date?: string;
  }) => request<Order>(`/admin/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify(data) }),

  // Users
  getUsers: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        query.append(k, String(v));
      }
    });
    const qs = query.toString();
    return request<{ items: User[]; total: number; page: number; limit: number; total_pages: number }>(
      `/admin/users${qs ? `?${qs}` : ''}`
    );
  },
  toggleUserStatus: (id: string, isActive: boolean) =>
    request<{ success: boolean; message: string }>(`/admin/users/${id}/status?is_active=${isActive}`, { method: 'PATCH' }),
  updateUserRole: (id: string, newRole: string) =>
    request<{ success: boolean; message: string }>(`/admin/users/${id}/role?new_role=${newRole}`, { method: 'PATCH' }),

  // Settings
  getSettings: () => request<SiteSettings>('/admin/settings'),
  updateSettings: (data: Partial<SiteSettings>) =>
    request<SiteSettings>('/admin/settings', { method: 'PUT', body: JSON.stringify(data) }),

  // Audit Logs
  getAuditLogs: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        query.append(k, String(v));
      }
    });
    const qs = query.toString();
    return request<{ items: AuditLog[]; total: number; page: number; limit: number; total_pages: number }>(
      `/admin/audit-logs${qs ? `?${qs}` : ''}`
    );
  },

  // Upload image
  uploadImage: async (file: File): Promise<{ url: string; public_id: string; filename: string; storage: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    return request<{ url: string; public_id: string; filename: string; storage: string }>('/uploads', {
      method: 'POST',
      body: formData
    });
  }
};
