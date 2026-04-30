import React, { useState, useRef, useEffect } from 'react';
import { Package, Upload, ChevronLeft, Save, X, Store, DollarSign, Box, Trash2, AlertTriangle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, IMAGE_BASE_URL } from '../services/api';

const UpdateProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
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
    imagePath: '',
    shop_id: '',
    category_id: '',
    supplier_id: '',
    min_stock_level: '5'
  });

  const userJson = localStorage.getItem('user');
  const currentUser = userJson ? JSON.parse(userJson) : null;
  const isSystemAdmin = currentUser && !currentUser.shop_id && !currentUser.owner_id;

  useEffect(() => {
    const initPage = async () => {
      try {
        setFetching(true);
        const [product, shopData] = await Promise.all([
          api.getProductById(id!),
          api.getShops(isSystemAdmin ? undefined : (currentUser?.owner_id || currentUser?.id))
        ]);
        
        setShops(shopData);
        
        // Load categories and suppliers for this shop
        const [cats, sups] = await Promise.all([
          api.getCategories(product.shop_id || undefined),
          api.getSuppliers(product.shop_id || undefined)
        ]);
        setCategories(cats);
        setSuppliers(sups);

        setFormData({
          name: product.name,
          price: product.price.toString(),
          stock: product.stock.toString(),
          unit: product.unit,
          imagePath: product.imagePath,
          shop_id: product.shop_id || '',
          category_id: product.category_id || '',
          supplier_id: product.supplier_id || '',
          min_stock_level: product.min_stock_level ? product.min_stock_level.toString() : '5'
        });
        setPreviewUrl(`${IMAGE_BASE_URL}/${product.imagePath}`);
      } catch (error) {
        console.error('Failed to load data:', error);
        alert('Product not found');
        navigate('/products');
      } finally {
        setFetching(false);
      }
    };
    initPage();
  }, [id]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      let finalImagePath = formData.imagePath;
      
      if (selectedFile) {
        const uploadRes = await api.uploadImage(selectedFile);
        finalImagePath = uploadRes.imagePath;
      }

      await api.updateProduct(id!, {
        name: formData.name,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        unit: formData.unit,
        imagePath: finalImagePath,
        shop_id: formData.shop_id,
        category_id: formData.category_id || null,
        supplier_id: formData.supplier_id || null,
        min_stock_level: parseInt(formData.min_stock_level)
      });
      
      navigate('/products');
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <div style={{ padding: '100px', textAlign: 'center' }}>
      <div className="spinner" style={{ margin: '0 auto 24px', width: '50px', height: '50px' }}></div>
      <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>ກຳລັງຊິງຂໍ້ມູນ...</p>
    </div>
  );

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
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <ChevronLeft size={24} color="var(--text-main)" />
          </button>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>ແກ້ໄຂສິນຄ້າ</h1>
            <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>ລະຫັດ: {id?.slice(-8).toUpperCase()}</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            type="button"
            onClick={() => navigate('/products')}
            style={{ padding: '12px 24px', borderRadius: '12px', border: '1px solid var(--border)', background: '#fff', color: 'var(--text-main)', fontWeight: 700, cursor: 'pointer' }}
          >
            ຍົກເລີກ
          </button>
          <button form="update-product-form" type="submit" disabled={loading} className="btn-primary" style={{ padding: '12px 32px', borderRadius: '12px', border: 'none', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 700 }}>
            {loading ? <div className="spinner" style={{ width: '18px', height: '18px' }}></div> : <><Save size={18} /> ອັບເດດສິນຄ້າ</>}
          </button>
        </div>
      </div>

      <form id="update-product-form" onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        
        {/* Left Side */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div className="card-premium" style={{ padding: '32px', height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                <Package size={22} />
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>ລາຍລະອຽດຫຼັກ</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-muted)' }}>ຊື່ສິນຄ້າ</label>
                <input type="text" name="name" required value={formData.name} onChange={handleChange} className="input-premium" style={{ fontSize: '1.1rem', padding: '16px 20px' }} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-muted)' }}>ຫົວໜ່ວຍ</label>
                <input type="text" name="unit" required value={formData.unit} onChange={handleChange} className="input-premium" />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-muted)' }}>ສາຂາທີ່ຮັບຜິດຊອບ</label>
                <div style={{ position: 'relative' }}>
                  <select name="shop_id" required value={formData.shop_id} onChange={handleShopChange} className="input-premium" style={{ appearance: 'none', background: '#fff', paddingRight: '40px' }}>
                    {shops.map(shop => <option key={shop.id} value={shop.id}>{shop.name}</option>)}
                  </select>
                  <Store size={18} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-muted)' }}>ໝວດໝູ່</label>
                  <select 
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleChange}
                    className="input-premium"
                  >
                    <option value="">ບໍ່ມີໝວດໝູ່</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-muted)' }}>ຜູ້ສະໜອງ (Supplier)</label>
                  <select 
                    name="supplier_id"
                    value={formData.supplier_id}
                    onChange={handleChange}
                    className="input-premium"
                  >
                    <option value="">ບໍ່ມີ</option>
                    {suppliers.map(sup => (
                      <option key={sup.id} value={sup.id}>{sup.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div className="card-premium" style={{ padding: '32px', textAlign: 'center' }}>
             <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '24px', textAlign: 'left' }}>ຮູບພາບສິນຄ້າ</h2>
             <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" style={{ display: 'none' }} />
             {previewUrl ? (
               <div style={{ position: 'relative', borderRadius: '24px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                 <img src={previewUrl} alt="Preview" style={{ width: '100%', height: '240px', objectFit: 'cover' }} onError={(e: any) => { e.target.src = `${IMAGE_BASE_URL}/assets/images/default.png`; }} />
                 <button type="button" onClick={() => { setSelectedFile(null); setPreviewUrl(null); }} style={{ position: 'absolute', top: '12px', right: '12px', width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
                   <Trash2 size={18} />
                 </button>
               </div>
             ) : (
               <div onClick={() => fileInputRef.current?.click()} style={{ height: '240px', border: '2px dashed var(--border-strong)', borderRadius: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', cursor: 'pointer' }}>
                 <Upload size={32} color="var(--primary)" style={{ marginBottom: '16px' }} />
                 <p style={{ fontWeight: 800, color: 'var(--text-main)' }}>ປ່ຽນຮູບພາບໃໝ່</p>
               </div>
             )}
          </div>

          <div className="card-premium" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
                <DollarSign size={22} />
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>ລາຄາ ແລະ ສະຕັອກ</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-muted)' }}>ລາຄາ (₭)</label>
                <input type="number" name="price" required value={formData.price} onChange={handleChange} className="input-premium" style={{ fontWeight: 900, color: 'var(--primary)', fontSize: '1.2rem' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-muted)' }}>ຈຳນວນສະຕັອກ</label>
                <div style={{ position: 'relative' }}>
                  <input type="number" name="stock" required value={formData.stock} onChange={handleChange} className="input-premium" style={{ fontWeight: 700 }} />
                  <Box size={18} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
                </div>
              </div>
            </div>

            <div style={{ marginTop: '24px' }}>
              <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.9rem', fontWeight: 800, color: '#ef4444' }}>ຈຸດເຕືອນສະຕັອກ (ໃກ້ໝົດ)</label>
              <div style={{ position: 'relative' }}>
                <input type="number" name="min_stock_level" required value={formData.min_stock_level} onChange={handleChange} className="input-premium" style={{ fontWeight: 700, border: '1px solid #fee2e2' }} />
                <AlertTriangle size={18} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: '#ef4444' }} />
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>ແຈ້ງເຕືອນໃນໜ້າ Dashboard ເມື່ອສະຕັອກຫຼຸດລົງຮອດຈຳນວນນີ້.</p>
            </div>
          </div>
        </div>
      </form>

      <style>{`
        .card-premium { background: #fff; border-radius: 24px; border: 1px solid var(--border); box-shadow: 0 4px 20px rgba(0,0,0,0.02); transition: all 0.3s ease; }
        .spinner { border: 2px solid rgba(255,255,255,0.3); border-top: 2px solid #fff; border-radius: 50%; animation: spin 1s linear infinite; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default UpdateProduct;
