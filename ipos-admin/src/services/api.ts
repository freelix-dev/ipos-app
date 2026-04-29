const BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://127.0.0.1:3000';
const API_BASE_URL = `${BASE_URL}/api`;

export const IMAGE_BASE_URL = BASE_URL;


const getHeaders = (isMultipart = false) => {
  const token = localStorage.getItem('token');
  const headers: any = {};
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (response: Response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  return data;
};

export const api = {
  // Products
  getProducts: async (shopId?: string) => {
    const url = shopId ? `${API_BASE_URL}/products?shopId=${shopId}` : `${API_BASE_URL}/products`;
    const response = await fetch(url, { headers: getHeaders() });
    return handleResponse(response);
  },
  
  addProduct: async (product: any) => {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(product),
    });
    return handleResponse(response);
  },

  getProductById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, { headers: getHeaders() });
    return handleResponse(response);
  },

  updateProduct: async (id: string, product: any) => {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(product),
    });
    return handleResponse(response);
  },

  deleteProduct: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  updateStock: async (id: string, stock: number) => {
    const response = await fetch(`${API_BASE_URL}/products/${id}/stock`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ stock }),
    });
    return handleResponse(response);
  },

  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      headers: getHeaders(true),
      body: formData,
    });
    if (!response.ok) throw new Error('Failed to upload image');
    return response.json();
  },

  // Auth
  login: async (credentials: any) => {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    if (!response.ok) throw new Error('Invalid email or password');
    return response.json();
  },

  // Users
  getUsers: async (shopId?: string, ownerId?: string) => {
    let url = `${API_BASE_URL}/users`;
    const params = new URLSearchParams();
    if (shopId) params.append('shopId', shopId);
    if (ownerId) params.append('ownerId', ownerId);
    if (params.toString()) url += `?${params.toString()}`;
    
    const response = await fetch(url, { headers: getHeaders() });
    return handleResponse(response);
  },
  
  addUser: async (user: any) => {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(user),
    });
    return handleResponse(response);
  },

  updateUser: async (id: string, user: any) => {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(user),
    });
    return handleResponse(response);
  },

  deleteUser: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Orders
  getOrders: async (shopId?: string) => {
    const url = shopId ? `${API_BASE_URL}/orders?shopId=${shopId}` : `${API_BASE_URL}/orders`;
    const response = await fetch(url, { headers: getHeaders() });
    if (!response.ok) throw new Error('Failed to fetch orders');
    return response.json();
  },
  
  // Shops
  getShops: async (ownerId?: string) => {
    const url = ownerId ? `${API_BASE_URL}/shops?ownerId=${ownerId}` : `${API_BASE_URL}/shops`;
    const response = await fetch(url, { headers: getHeaders() });
    if (!response.ok) throw new Error('Failed to fetch shops');
    return response.json();
  },

  addShop: async (shop: any) => {
    const response = await fetch(`${API_BASE_URL}/shops`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(shop),
    });
    if (!response.ok) throw new Error('Failed to add shop');
    return response.json();
  },

  updateShop: async (id: string, shop: any) => {
    const response = await fetch(`${API_BASE_URL}/shops/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(shop),
    });
    if (!response.ok) throw new Error('Failed to update shop');
    return response.json();
  },

  deleteShop: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/shops/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete shop');
    return response.json();
  },

  uploadShopLogo: async (id: string, file: File) => {
    const formData = new FormData();
    formData.append('logo', file);
    const response = await fetch(`${API_BASE_URL}/shops/${id}/upload-logo`, {
      method: 'POST',
      headers: getHeaders(true),
      body: formData,
    });
    if (!response.ok) throw new Error('Failed to upload logo');
    return response.json();
  },

  uploadShopQr: async (id: string, file: File) => {
    const formData = new FormData();
    formData.append('qr_image', file);
    const response = await fetch(`${API_BASE_URL}/shops/${id}/upload-qr`, {
      method: 'POST',
      headers: getHeaders(true),
      body: formData,
    });
    if (!response.ok) throw new Error('Failed to upload QR image');
    return response.json();
  },

  registerShop: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/shops/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to register shop');
    return response.json();
  },

  updateExchangeRates: async (rates: any, shopId?: string) => {
    const response = await fetch(`${API_BASE_URL}/exchange-rates`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ rates, shopId }),
    });
    if (!response.ok) throw new Error('Failed to update rates');
    return response.json();
  },

  // Admin Features
  getSuppliers: async (shopId?: string) => {
    const url = shopId ? `${API_BASE_URL}/admin/suppliers?shopId=${shopId}` : `${API_BASE_URL}/admin/suppliers`;
    const response = await fetch(url, { headers: getHeaders() });
    return handleResponse(response);
  },

  addSupplier: async (supplier: any) => {
    const response = await fetch(`${API_BASE_URL}/admin/suppliers`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(supplier),
    });
    return handleResponse(response);
  },

  updateSupplier: async (id: string, supplier: any) => {
    const response = await fetch(`${API_BASE_URL}/admin/suppliers/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(supplier),
    });
    return handleResponse(response);
  },

  deleteSupplier: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/suppliers/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },
  
  // Categories
  getCategories: async (shopId?: string) => {
    const url = shopId ? `${API_BASE_URL}/admin/categories?shopId=${shopId}` : `${API_BASE_URL}/admin/categories`;
    const response = await fetch(url, { headers: getHeaders() });
    return handleResponse(response);
  },

  addCategory: async (category: any) => {
    const response = await fetch(`${API_BASE_URL}/admin/categories`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(category),
    });
    return handleResponse(response);
  },

  updateCategory: async (id: string, category: any) => {
    const response = await fetch(`${API_BASE_URL}/admin/categories/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(category),
    });
    return handleResponse(response);
  },

  deleteCategory: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/categories/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  getAuditLogs: async (filters: any) => {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${API_BASE_URL}/admin/audit-logs?${params.toString()}`, { headers: getHeaders() });
    return handleResponse(response);
  },

  getSystemSettings: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/settings`, { headers: getHeaders() });
    return handleResponse(response);
  },

  updateSystemSettings: async (settings: any) => {
    const response = await fetch(`${API_BASE_URL}/admin/settings`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(settings),
    });
    return handleResponse(response);
  },

  getDashboardStats: async (shopId?: string) => {
    const url = shopId ? `${API_BASE_URL}/admin/dashboard-stats?shopId=${shopId}` : `${API_BASE_URL}/admin/dashboard-stats`;
    const response = await fetch(url, { headers: getHeaders() });
    return handleResponse(response);
  },

  getGlobalStats: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/global-stats`, { headers: getHeaders() });
    return handleResponse(response);
  },

  getReceiptSettings: async (shopId?: string) => {
    const url = shopId ? `${API_BASE_URL}/admin/receipt-settings?shopId=${shopId}` : `${API_BASE_URL}/admin/receipt-settings`;
    const response = await fetch(url, { headers: getHeaders() });
    return handleResponse(response);
  },

  updateReceiptSettings: async (settings: any) => {
    const response = await fetch(`${API_BASE_URL}/admin/receipt-settings`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(settings),
    });
    return handleResponse(response);
  },

  getLowStock: async (shopId?: string) => {
    const url = shopId ? `${API_BASE_URL}/admin/low-stock?shopId=${shopId}` : `${API_BASE_URL}/admin/low-stock`;
    const response = await fetch(url, { headers: getHeaders() });
    return handleResponse(response);
  },

  updateShopLicense: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/admin/shop-license`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  updateAppConfig: async (config: any) => {
    const response = await fetch(`${API_BASE_URL}/admin/app-config`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(config),
    });
    return handleResponse(response);
  },

  voidOrder: async (orderId: string, reason: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/void-order`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ orderId, reason }),
    });
    return handleResponse(response);
  },

  getExpenses: async (shopId: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/expenses?shopId=${shopId}`, { headers: getHeaders() });
    return handleResponse(response);
  },

  createExpense: async (expense: any) => {
    const response = await fetch(`${API_BASE_URL}/admin/expenses`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(expense),
    });
    return handleResponse(response);
  },

  deleteExpense: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/expenses/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  getStockHistory: async (shopId: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/stock-history?shopId=${shopId}`, { headers: getHeaders() });
    return handleResponse(response);
  },

  adjustStock: async (productId: string, adjustment: number, type: string, reason: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/adjust-stock`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ productId, adjustment, type, reason }),
    });
    return handleResponse(response);
  },

  getExchangeRates: async (shopId?: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/exchange-rates?shopId=${shopId || ''}`, { headers: getHeaders() });
    return handleResponse(response);
  },

  // Marketing
  getPromotions: async (shopId: string) => {
    const response = await fetch(`${API_BASE_URL}/marketing/promotions?shopId=${shopId}`, { headers: getHeaders() });
    return handleResponse(response);
  },

  createPromotion: async (promotion: any) => {
    const response = await fetch(`${API_BASE_URL}/marketing/promotions`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(promotion),
    });
    return handleResponse(response);
  },

  deletePromotion: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/marketing/promotions/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  getCoupons: async (shopId: string) => {
    const response = await fetch(`${API_BASE_URL}/marketing/coupons?shopId=${shopId}`, { headers: getHeaders() });
    return handleResponse(response);
  },

  createCoupon: async (coupon: any) => {
    const response = await fetch(`${API_BASE_URL}/marketing/coupons`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(coupon),
    });
    return handleResponse(response);
  },

  deleteCoupon: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/marketing/coupons/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(response);
  }
};
