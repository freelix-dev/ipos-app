import React, { useState, useRef, useEffect } from 'react';
import { Package, Upload, ChevronLeft, Save, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api';

const UpdateProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    unit: 'Pack',
    description: '',
    imagePath: ''
  });

  useEffect(() => {
    if (id) {
      loadProduct();
    }
  }, [id]);

  const loadProduct = async () => {
    try {
      setFetching(true);
      const product = await api.getProductById(id!);
      setFormData({
        name: product.name,
        price: product.price.toString(),
        stock: product.stock.toString(),
        unit: product.unit,
        description: product.description || '',
        imagePath: product.imagePath
      });
      setPreviewUrl(`http://127.0.0.1:3000/${product.imagePath}`);
    } catch (error) {
      console.error('Failed to load product:', error);
      alert('Product not found');
      navigate('/products');
    } finally {
      setFetching(false);
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
      
      // 1. Upload new image if selected
      if (selectedFile) {
        const uploadRes = await api.uploadImage(selectedFile);
        finalImagePath = uploadRes.imagePath;
      }

      // 2. Update product
      await api.updateProduct(id!, {
        name: formData.name,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        unit: formData.unit,
        imagePath: finalImagePath
      });
      
      alert('Product updated successfully!');
      navigate('/products');
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div style={{ padding: '32px', textAlign: 'center' }}>Loading product details...</div>;

  return (
    <form className="animate-fade" onSubmit={handleSubmit}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <button 
          type="button"
          onClick={() => navigate('/products')}
          style={{ 
            padding: '8px', borderRadius: '50%', border: '1px solid var(--border)', 
            background: '#fff', cursor: 'pointer', display: 'flex' 
          }}
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 style={{ fontSize: '1.75rem' }}>Update Product</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Modify product details and stock</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="data-table-container" style={{ padding: '24px' }}>
            <h3 style={{ marginBottom: '20px', fontSize: '1.1rem' }}>General Information</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 600 }}>Product Name</label>
                <input 
                  type="text" 
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 600 }}>Description</label>
                <textarea 
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={6}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none', resize: 'vertical' }}
                ></textarea>
              </div>
            </div>
          </div>

          <div className="data-table-container" style={{ padding: '24px' }}>
            <h3 style={{ marginBottom: '20px', fontSize: '1.1rem' }}>Pricing & Stocks</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 600 }}>Base Price (₭)</label>
                <input 
                  type="number" 
                  name="price"
                  required
                  value={formData.price}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 600 }}>Stock Quantity</label>
                <input 
                  type="number" 
                  name="stock"
                  required
                  value={formData.stock}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none' }}
                />
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="data-table-container" style={{ padding: '24px' }}>
            <h3 style={{ marginBottom: '20px', fontSize: '1.1rem' }}>Product Media</h3>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" style={{ display: 'none' }} />
            
            {previewUrl ? (
              <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                <img src={previewUrl} alt="Preview" style={{ width: '100%', height: '200px', objectFit: 'cover' }} onError={(e: any) => { e.target.src = 'http://127.0.0.1:3000/assets/images/default.png'; }} />
                <button 
                  type="button"
                  onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}
                  style={{ position: 'absolute', top: '8px', right: '8px', padding: '4px', borderRadius: '50%', background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', cursor: 'pointer' }}
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div 
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: '2px dashed var(--border)', borderRadius: '12px', padding: '40px 20px', textAlign: 'center', backgroundColor: 'var(--bg-main)', cursor: 'pointer'
                }}
              >
                <Upload size={24} color="var(--primary)" style={{ margin: '0 auto 12px' }} />
                <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>Click to upload new image</p>
              </div>
            )}
          </div>

          <div className="data-table-container" style={{ padding: '24px' }}>
            <h3 style={{ marginBottom: '20px', fontSize: '1.1rem' }}>Organization</h3>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 600 }}>Unit</label>
              <select name="unit" value={formData.unit} onChange={handleChange} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: '#fff' }}>
                <option value="Pack">Pack</option>
                <option value="Bottle">Bottle</option>
                <option value="Unit">Unit</option>
                <option value="แທັດ">แທັດ</option>
                <option value="ถง">ถง</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: 'auto' }}>
            <button type="button" onClick={() => navigate('/products')} style={{ flex: 1, padding: '14px', borderRadius: '12px', border: '1px solid var(--border)', background: '#fff', fontWeight: 600, cursor: 'pointer' }}>Discard</button>
            <button type="submit" disabled={loading} style={{ flex: 1, padding: '14px', borderRadius: '12px', border: 'none', background: 'var(--primary)', color: '#fff', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Save size={18} />
              {loading ? 'Updating...' : 'Update Product'}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default UpdateProduct;
