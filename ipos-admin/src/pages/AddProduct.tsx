import React, { useState, useRef } from 'react';
import { Package, Upload, ChevronLeft, Save, X, Store, DollarSign, Box, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const AddProduct = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [shops, setShops] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    unit: '',
    shop_id: '',
    category_id: '',
    supplier_id: '',
    min_stock_level: '5'
  });

  const userJson = localStorage.getItem('user');
  const currentUser = userJson ? JSON.parse(userJson) : null;
  const isSystemAdmin = currentUser && !currentUser.shop_id && !currentUser.owner_id;

  React.useEffect(() => {
    const loadInitialData = async () => {
      try {
        const shopsData = await api.getShops(isSystemAdmin ? undefined : (currentUser?.owner_id || currentUser?.id));
        setShops(shopsData);
        
        if (shopsData.length > 0) {
          const firstShopId = shopsData[0].id;
          setFormData(prev => ({ ...prev, shop_id: firstShopId }));
          
          // Load categories and suppliers for the first shop
          const [cats, sups] = await Promise.all([
            api.getCategories(firstShopId),
            api.getSuppliers(firstShopId)
          ]);
          setCategories(cats);
          setSuppliers(sups);
        }
      } catch (error) {
        console.error('Failed to load initial data:', error);
      }
    };
    loadInitialData();
  }, []);

  // Re-load categories and suppliers when shop changes
  const handleShopChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newShopId = e.target.value;
    setFormData(prev => ({ ...prev, shop_id: newShopId }));
    try {
      const [cats, sups] = await Promise.all([
        api.getCategories(newShopId),
        api.getSuppliers(newShopId)
      ]);
      setCategories(cats);
      setSuppliers(sups);
    } catch (error) {
      console.error('Failed to update categories/suppliers:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic Validation
    if (!formData.shop_id) {
      alert('Please select a branch first');
      return;
    }

    const priceNum = parseFloat(formData.price);
    const stockNum = parseInt(formData.stock);

    if (isNaN(priceNum) || isNaN(stockNum)) {
      alert('Please enter valid numeric values for price and stock');
      return;
    }

    try {
      setLoading(true);
      let imagePath = 'assets/images/default.png';
      
      if (selectedFile) {
        const uploadRes = await api.uploadImage(selectedFile);
        imagePath = uploadRes.imagePath;
      }

      const response = await api.addProduct({
        name: formData.name,
        price: priceNum,
        stock: stockNum,
        unit: formData.unit,
        imagePath: imagePath,
        shop_id: formData.shop_id,
        category_id: formData.category_id || null,
        supplier_id: formData.supplier_id || null,
        min_stock_level: parseInt(formData.min_stock_level)
      });
      
      console.log('Product added successfully:', response);
      navigate('/products');
    } catch (error: any) {
      console.error('Error adding product:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
      alert(`Failed to add product: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-slide-up" style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '100px' }}>
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button 
            onClick={() => navigate('/products')}
            style={{ 
              width: '48px', height: '48px', borderRadius: '14px', border: '1px solid var(--border)', 
              background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: 'var(--shadow-sm)', transition: 'all 0.2s'
            }}
          >
            <ChevronLeft size={24} color="var(--text-main)" />
          </button>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>New Product</h1>
            <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Deploy a new item to your active inventory</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            type="button"
            onClick={() => navigate('/products')}
            style={{ 
              padding: '12px 24px', borderRadius: '12px', border: '1px solid var(--border)', 
              background: '#fff', color: 'var(--text-main)', fontWeight: 700, cursor: 'pointer' 
            }}
          >
            Cancel
          </button>
          <button 
            form="add-product-form"
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ 
              padding: '12px 32px', borderRadius: '12px', border: 'none', 
              display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 700
            }}
          >
            {loading ? <div className="spinner" style={{ width: '18px', height: '18px' }}></div> : <><Save size={18} /> Publish Item</>}
          </button>
        </div>
      </div>

      <form id="add-product-form" onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        
        {/* Left Side: General Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div className="card-premium" style={{ padding: '32px', height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                <Package size={22} />
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Product Details</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-muted)' }}>PRODUCT NAME</label>
                <input 
                  type="text" 
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Premium Lao Coffee"
                  className="input-premium"
                  style={{ fontSize: '1.1rem', padding: '16px 20px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-muted)' }}>UNIT OF MEASURE</label>
                <input 
                  type="text" 
                  name="unit"
                  required
                  value={formData.unit}
                  onChange={handleChange}
                  placeholder="e.g. Bottle, Pack, Box"
                  className="input-premium"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-muted)' }}>TARGET BRANCH</label>
                <div style={{ position: 'relative' }}>
                  <select 
                    name="shop_id"
                    required
                    value={formData.shop_id}
                    onChange={handleShopChange}
                    className="input-premium"
                    style={{ appearance: 'none', background: '#fff', paddingRight: '40px' }}
                  >
                    {shops.map(shop => (
                      <option key={shop.id} value={shop.id}>{shop.name}</option>
                    ))}
                  </select>
                  <Store size={18} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-muted)' }}>CATEGORY</label>
                  <select 
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleChange}
                    className="input-premium"
                  >
                    <option value="">Uncategorized</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-muted)' }}>SUPPLIER</label>
                  <select 
                    name="supplier_id"
                    value={formData.supplier_id}
                    onChange={handleChange}
                    className="input-premium"
                  >
                    <option value="">None</option>
                    {suppliers.map(sup => (
                      <option key={sup.id} value={sup.id}>{sup.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Media & Pricing */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Media Card */}
          <div className="card-premium" style={{ padding: '32px', textAlign: 'center' }}>
             <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '24px', textAlign: 'left' }}>Product Media</h2>
             <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" style={{ display: 'none' }} />
             {previewUrl ? (
               <div style={{ position: 'relative', borderRadius: '24px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                 <img src={previewUrl} alt="Preview" style={{ width: '100%', height: '240px', objectFit: 'cover' }} />
                 <button 
                  type="button"
                  onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}
                  style={{ position: 'absolute', top: '12px', right: '12px', width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}
                 >
                   <X size={20} />
                 </button>
               </div>
             ) : (
               <div 
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                style={{
                  height: '240px', border: '2px dashed var(--border-strong)', borderRadius: '24px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  background: dragActive ? 'var(--primary-light)' : '#f8fafc',
                  cursor: 'pointer', transition: 'all 0.3s'
                }}
               >
                 <Upload size={32} color="var(--primary)" style={{ marginBottom: '16px' }} />
                 <p style={{ fontWeight: 800, color: 'var(--text-main)' }}>Drop image here</p>
               </div>
             )}
          </div>

          {/* Pricing & Inventory Card */}
          <div className="card-premium" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
                <DollarSign size={22} />
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Pricing & Inventory</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-muted)' }}>UNIT PRICE (₭)</label>
                <input 
                  type="number" 
                  name="price"
                  required
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0"
                  className="input-premium"
                  style={{ fontWeight: 900, color: 'var(--primary)', fontSize: '1.2rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-muted)' }}>STOCK</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="number" 
                    name="stock"
                    required
                    value={formData.stock}
                    onChange={handleChange}
                    placeholder="0"
                    className="input-premium"
                    style={{ fontWeight: 700 }}
                  />
                  <Box size={18} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
                </div>
              </div>
            </div>

            <div style={{ marginTop: '24px' }}>
              <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.9rem', fontWeight: 800, color: '#ef4444' }}>ALERT THRESHOLD (LOW STOCK)</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="number" 
                  name="min_stock_level" 
                  required 
                  value={formData.min_stock_level} 
                  onChange={handleChange} 
                  className="input-premium" 
                  style={{ fontWeight: 700, border: '1px solid #fee2e2' }} 
                />
                <AlertTriangle size={18} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: '#ef4444' }} />
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>Notify me on dashboard when stock drops below this value.</p>
            </div>
          </div>
        </div>
      </form>

      <style>{`
        .card-premium {
          background: #fff;
          border-radius: 24px;
          border: 1px solid var(--border);
          box-shadow: 0 4px 20px rgba(0,0,0,0.02);
          transition: all 0.3s ease;
        }
        .spinner {
          border: 2px solid rgba(255,255,255,0.3);
          border-top: 2px solid #fff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default AddProduct;
