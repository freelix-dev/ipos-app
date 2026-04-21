import React, { useState, useRef } from 'react';
import { Package, Upload, ChevronLeft, Save, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const AddProduct = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    unit: 'Pack',
    description: ''
  });

  const categories = ['Electronics', 'Food & Drinks', 'Clothing', 'Accessories', 'Furniture'];

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
    try {
      setLoading(true);
      
      let imagePath = 'assets/images/default.png';
      
      // 1. Upload image if selected
      if (selectedFile) {
        const uploadRes = await api.uploadImage(selectedFile);
        imagePath = uploadRes.imagePath;
      }

      // 2. Save product
      await api.addProduct({
        name: formData.name,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        unit: formData.unit,
        imagePath: imagePath
      });
      
      alert('Product added successfully!');
      navigate('/products');
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="animate-fade" onSubmit={handleSubmit}>
      {/* Header */}
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
          <h1 style={{ fontSize: '1.75rem' }}>Add New Product</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Create a new item for your inventory</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
        {/* Left Column - General Info */}
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
                  placeholder="e.g. Wireless Headphones"
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 600 }}>Description</label>
                <textarea 
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your product..."
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
                  placeholder="0.00"
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
                  placeholder="0"
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Media & Category */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="data-table-container" style={{ padding: '24px' }}>
            <h3 style={{ marginBottom: '20px', fontSize: '1.1rem' }}>Product Media</h3>
            
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              style={{ display: 'none' }}
            />

            {previewUrl ? (
              <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                <img src={previewUrl} alt="Preview" style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
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
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                style={{
                  border: `2px dashed ${dragActive ? 'var(--primary)' : 'var(--border)'}`,
                  borderRadius: '12px',
                  padding: '40px 20px',
                  textAlign: 'center',
                  backgroundColor: dragActive ? 'var(--primary-light)' : 'var(--bg-main)',
                  transition: 'var(--transition)',
                  cursor: 'pointer'
                }}
              >
                <div style={{ background: '#fff', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                  <Upload size={24} color="var(--primary)" />
                </div>
                <p style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '4px' }}>Click to upload or drag and drop</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PNG, JPG or WebP (max. 2MB)</p>
              </div>
            )}
          </div>

          <div className="data-table-container" style={{ padding: '24px' }}>
            <h3 style={{ marginBottom: '20px', fontSize: '1.1rem' }}>Organization</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 600 }}>Unit</label>
                <select 
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none', background: '#fff' }}
                >
                  <option value="Pack">Pack</option>
                  <option value="Bottle">Bottle</option>
                  <option value="Unit">Unit</option>
                  <option value="แທັດ">แທັດ</option>
                  <option value="ถง">ถง</option>
                </select>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', marginTop: 'auto' }}>
            <button 
              type="button"
              onClick={() => navigate('/products')}
              style={{ flex: 1, padding: '14px', borderRadius: '12px', border: '1px solid var(--border)', background: '#fff', fontWeight: 600, cursor: 'pointer' }}
            >
              Discard
            </button>
            <button 
              type="submit"
              disabled={loading}
              style={{ 
                flex: 1, padding: '14px', borderRadius: '12px', border: 'none', 
                background: 'var(--primary)', color: '#fff', fontWeight: 600, 
                cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' 
              }}
            >
              <Save size={18} />
              {loading ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default AddProduct;
