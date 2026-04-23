const API_BASE_URL = 'http://127.0.0.1:3000/api';

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

  registerShop: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/shops/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to register shop');
    return response.json();
  },

  // Exchange Rates
  getExchangeRates: async () => {
    const response = await fetch(`${API_BASE_URL}/exchange-rates`);
    if (!response.ok) throw new Error('Failed to fetch rates');
    return response.json();
  }
};
