import React, { useState, useEffect, useRef } from 'react';
import { 
  Layers, 
  Plus, 
  MapPin, 
  Phone, 
  Trash2, 
  X, 
  Store,
  Search,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronLast,
  ChevronFirst,
  Upload,
  Image
} from 'lucide-react';
import { api } from '../services/api';

const API_BASE = 'http://127.0.0.1:3000';

const Shops = () => {
  const [shops, setShops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShop, setEditingShop] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', address: '', phone: '', logoPath: '' });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const userJson = localStorage.getItem('user');
  const currentUser = userJson ? JSON.parse(userJson) : null;
  const isSystemAdmin = currentUser && !currentUser.shop_id;

  useEffect(() => {
    loadShops();
  }, []);

  const loadShops = async () => {
    try {
      setLoading(true);
      const data = await api.getShops(isSystemAdmin ? undefined : (currentUser?.owner_id || currentUser?.id));
      setShops(data);
    } catch (error) {
      console.error('Failed to load shops:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (file: File | null) => {
    if (!file) return;
    setLogoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setLogoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let savedShopId = editingShop?.id;
      if (editingShop) {
        await api.updateShop(editingShop.id, { name: formData.name, address: formData.address, phone: formData.phone });
      } else {
        const result = await api.addShop({ 
          name: formData.name, 
          address: formData.address, 
          phone: formData.phone, 
          ownerId: currentUser?.owner_id || currentUser?.id 
        });
        savedShopId = result.id;
      }
      // Upload logo if a new file was selected
      if (logoFile && savedShopId) {
        await api.uploadShopLogo(savedShopId, logoFile);
      }
      setIsModalOpen(false);
      setEditingShop(null);
      setFormData({ name: '', address: '', phone: '', logoPath: '' });
      setLogoFile(null);
      setLogoPreview('');
      loadShops();
    } catch (error) {
      alert('Failed to save shop');
    }
  };

  const handleEdit = (shop: any) => {
    setEditingShop(shop);
    setFormData({ name: shop.name, address: shop.address || '', phone: shop.phone || '', logoPath: shop.logoPath || '' });
    setLogoFile(null);
    setLogoPreview(shop.logoPath ? `${API_BASE}${shop.logoPath}` : '');
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this shop? All linked data may be affected.')) return;
    try {
      await api.deleteShop(id);
      loadShops();
    } catch (error) {
      alert('Failed to delete shop');
    }
  };

  const filteredShops = shops.filter(shop => 
    shop.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (shop.address && shop.address.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalItems = filteredShops.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const currentShops = filteredShops.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <>
      <div className="animate-slide-up">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '48px' }}>
          <div>
            <h1 style={{ fontSize: '2.4rem', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: '8px', color: 'var(--text-main)' }}>Shop Management</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 500 }}>Create and manage multiple branches and locations</p>
          </div>
          {currentUser?.role === 'admin' && (
            <button 
              onClick={() => { setEditingShop(null); setFormData({ name: '', address: '', phone: '', logoPath: '' }); setLogoFile(null); setLogoPreview(''); setIsModalOpen(true); }}
              className="btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
            >
              <Plus size={20} />
              <span>Add New Shop</span>
            </button>
          )}
        </div>

        <div className="table-container" style={{ border: 'none', boxShadow: 'var(--shadow-premium)', background: '#fff', borderRadius: '24px', overflow: 'hidden' }}>
          <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border)' }}>
             <div style={{ position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  placeholder="Search shops by name or location..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ 
                    width: '100%', height: '50px', padding: '0 16px 0 48px', 
                    borderRadius: '16px', border: '1px solid var(--border-strong)', 
                    background: '#f8fafc', fontSize: '0.9rem', outline: 'none'
                  }}
                />
              </div>
          </div>

          {loading ? (
            <div style={{ padding: '100px', textAlign: 'center' }}>
              <div className="spinner" style={{ margin: '0 auto' }}></div>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '20px 32px', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', fontWeight: 800 }}>Shop Identity</th>
                  <th style={{ textAlign: 'left', padding: '20px', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', fontWeight: 800 }}>Location</th>
                  <th style={{ textAlign: 'left', padding: '20px', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', fontWeight: 800 }}>Contact</th>
                  <th style={{ textAlign: 'right', padding: '20px 32px', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', fontWeight: 800 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentShops.map((shop) => (
                  <tr key={shop.id} style={{ borderBottom: '1px solid var(--border)' }} className="directory-row">
                    <td style={{ padding: '24px 32px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        {shop.logoPath ? (
                          <img src={`${API_BASE}${shop.logoPath}`} alt={shop.name} style={{ width: '44px', height: '44px', borderRadius: '12px', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '12px', borderRadius: '14px' }}>
                            <Store size={20} />
                          </div>
                        )}
                        <div>
                          <p style={{ fontWeight: 800, color: 'var(--text-main)' }}>{shop.name}</p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {shop.id.slice(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '24px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
                        <MapPin size={16} opacity={0.5} />
                        <span>{shop.address || 'Not specified'}</span>
                      </div>
                    </td>
                    <td style={{ padding: '24px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
                        <Phone size={16} opacity={0.5} />
                        <span>{shop.phone || 'No phone'}</span>
                      </div>
                    </td>
                    <td style={{ padding: '24px 32px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                        {currentUser?.role === 'admin' ? (
                          <>
                            <button onClick={() => handleEdit(shop)} className="row-action-btn" style={{ padding: '8px', borderRadius: '10px', border: '1px solid var(--border)', background: '#fff', cursor: 'pointer' }}>
                              <Settings size={16} />
                            </button>
                            <button onClick={() => handleDelete(shop.id)} className="row-delete-btn" style={{ padding: '8px', borderRadius: '10px', border: '1px solid #fee2e2', background: '#fff', color: '#dc2626', cursor: 'pointer' }}>
                              <Trash2 size={16} />
                            </button>
                          </>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>View only</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {isModalOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ background: '#fff', width: '100%', maxWidth: '500px', borderRadius: '24px', overflow: 'hidden' }}>
              <div style={{ padding: '32px', background: 'var(--bg-sidebar)', color: '#fff', display: 'flex', justifyContent: 'space-between' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 900 }}>{editingShop ? 'Edit Shop' : 'Onboard New Shop'}</h2>
                <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={24} /></button>
              </div>
              <form onSubmit={handleSubmit} style={{ padding: '32px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 800, marginBottom: '8px', fontSize: '0.85rem' }}>SHOP NAME</label>
                    <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="input-premium" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 800, marginBottom: '8px', fontSize: '0.85rem' }}>ADDRESS / LOCATION</label>
                    <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="input-premium" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 800, marginBottom: '8px', fontSize: '0.85rem' }}>CONTACT PHONE</label>
                    <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="input-premium" />
                  </div>
                  {/* Shop Logo Upload */}
                  <div>
                    <label style={{ display: 'block', fontWeight: 800, marginBottom: '10px', fontSize: '0.85rem' }}>SHOP LOGO</label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                    />
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => { e.preventDefault(); handleFileChange(e.dataTransfer.files?.[0] || null); }}
                      style={{
                        border: `2px dashed ${logoPreview ? 'var(--primary)' : 'var(--border-strong)'}`,
                        borderRadius: '16px',
                        padding: '20px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        background: logoPreview ? 'var(--primary-light)' : '#f8fafc',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {logoPreview ? (
                        <img src={logoPreview} alt="Preview" style={{ width: '56px', height: '56px', borderRadius: '12px', objectFit: 'cover', flexShrink: 0 }} />
                      ) : (
                        <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Image size={24} color="var(--text-muted)" />
                        </div>
                      )}
                      <div>
                        <p style={{ fontWeight: 800, fontSize: '0.9rem', color: logoPreview ? 'var(--primary)' : 'var(--text-main)' }}>
                          {logoPreview ? (logoFile ? logoFile.name : 'Current logo') : 'Click or drag image here'}
                        </p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>PNG, JPG, WEBP up to 5MB</p>
                      </div>
                      <div style={{ marginLeft: 'auto', flexShrink: 0 }}>
                        <Upload size={18} color="var(--text-muted)" />
                      </div>
                    </div>
                    {logoPreview && logoFile && (
                      <button
                        type="button"
                        onClick={() => { setLogoFile(null); setLogoPreview(''); }}
                        style={{ marginTop: '8px', fontSize: '0.75rem', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}
                      >
                        ✕ Remove selected file
                      </button>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                    <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '14px', borderRadius: '12px', border: '1px solid var(--border)', fontWeight: 800, cursor: 'pointer' }}>Cancel</button>
                    <button type="submit" className="btn-primary" style={{ flex: 2 }}>{editingShop ? 'Save Changes' : 'Create Shop'}</button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Shops;
