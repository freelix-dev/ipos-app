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
import { api, IMAGE_BASE_URL } from '../services/api';

const API_BASE = IMAGE_BASE_URL;

const Shops = () => {
  const [shops, setShops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShop, setEditingShop] = useState<any>(null);
  const [formData, setFormData] = useState({ 
    name: '', address: '', phone: '', logoPath: '',
    status: 'Active', license_expiry: '', plan_type: 'Premium'
  });
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
        if (isSystemAdmin) {
          await api.updateShopLicense({ 
            shop_id: editingShop.id, 
            status: formData.status, 
            license_expiry: formData.license_expiry, 
            plan_type: formData.plan_type 
          });
        }
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
      setFormData({ name: '', address: '', phone: '', logoPath: '', status: 'Active', license_expiry: '', plan_type: 'Premium' });
      setLogoFile(null);
      setLogoPreview('');
      loadShops();
    } catch (error) {
      alert('ບໍ່ສາມາດບັນທຶກຂໍ້ມູນຮ້ານຄ້າໄດ້');
    }
  };

  const handleEdit = (shop: any) => {
    setEditingShop(shop);
    setFormData({ 
      name: shop.name, 
      address: shop.address || '', 
      phone: shop.phone || '', 
      logoPath: shop.logoPath || '',
      status: shop.status || 'Active',
      license_expiry: shop.license_expiry ? new Date(shop.license_expiry).toISOString().split('T')[0] : '',
      plan_type: shop.plan_type || 'Premium'
    });
    setLogoFile(null);
    setLogoPreview(shop.logoPath ? `${API_BASE}${shop.logoPath}` : '');
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('ເຈົ້າແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບຮ້ານຄ້ານີ້? ຂໍ້ມູນທັງໝົດທີ່ກ່ຽວຂ້ອງອາດຈະຖືກກະທົບ.')) return;
    try {
      await api.deleteShop(id);
      loadShops();
    } catch (error) {
      alert('ບໍ່ສາມາດລຶບຮ້ານຄ້າໄດ້');
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
            <h1 style={{ fontSize: '2.4rem', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: '8px', color: 'var(--text-main)' }}>ຈັດການຮ້ານຄ້າ</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 500 }}>ສ້າງ ແລະ ຈັດການຫຼາຍສາຂາ ແລະ ສະຖານທີ່</p>
          </div>
          {currentUser?.role === 'admin' && (
            <button 
              onClick={() => { setEditingShop(null); setFormData({ name: '', address: '', phone: '', logoPath: '', status: 'Active', license_expiry: '', plan_type: 'Premium' }); setLogoFile(null); setLogoPreview(''); setIsModalOpen(true); }}
              className="btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
            >
              <Plus size={20} />
              <span>ເພີ່ມຮ້ານຄ້າໃໝ່</span>
            </button>
          )}
        </div>

        <div className="table-container" style={{ border: 'none', boxShadow: 'var(--shadow-premium)', background: '#fff', borderRadius: '24px', overflow: 'hidden' }}>
          <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border)' }}>
             <div style={{ position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  placeholder="ຄົ້ນຫາຮ້ານຕາມຊື່ ຫຼື ສະຖານທີ່..." 
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
                  <th style={{ textAlign: 'left', padding: '20px 32px', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', fontWeight: 800 }}>ຂໍ້ມູນຮ້ານຄ້າ</th>
                  <th style={{ textAlign: 'left', padding: '20px', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', fontWeight: 800 }}>ສະຖານທີ່</th>
                  <th style={{ textAlign: 'left', padding: '20px', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', fontWeight: 800 }}>ຕິດຕໍ່</th>
                  <th style={{ textAlign: 'right', padding: '20px 32px', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', fontWeight: 800 }}>ການຈັດການ</th>
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
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                             <span style={{ 
                               fontSize: '0.65rem', fontWeight: 900, padding: '2px 8px', borderRadius: '6px',
                               background: shop.status === 'Active' ? '#dcfce7' : shop.status === 'Expired' ? '#fee2e2' : '#f1f5f9',
                               color: shop.status === 'Active' ? '#166534' : shop.status === 'Expired' ? '#991b1b' : '#475569'
                             }}>
                               {shop.status === 'Active' ? 'ເປີດໃຊ້ງານ' : shop.status === 'Expired' ? 'ໝົດອາຍຸ' : 'ລະງັບ'}
                             </span>
                             <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)' }}>{shop.plan_type}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '24px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
                        <MapPin size={16} opacity={0.5} />
                        <span>{shop.address || 'ບໍ່ໄດ້ລະບຸ'}</span>
                      </div>
                    </td>
                    <td style={{ padding: '24px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
                        <Phone size={16} opacity={0.5} />
                        <span>{shop.phone || 'ບໍ່ມີເບີໂທ'}</span>
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
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>ເບິ່ງຢ່າງດຽວ</span>
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
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(8px)' }}>
            <div style={{ background: '#fff', width: '100%', maxWidth: '500px', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', position: 'relative' }}>
              <div style={{ padding: '32px', background: 'var(--bg-sidebar)', color: '#fff', display: 'flex', justifyContent: 'space-between' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 900 }}>{editingShop ? 'ແກ້ໄຂຮ້ານຄ້າ' : 'ເພີ່ມຮ້ານຄ້າໃໝ່'}</h2>
                <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={24} /></button>
              </div>
              <form onSubmit={handleSubmit} style={{ padding: '32px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 800, marginBottom: '8px', fontSize: '0.85rem' }}>ຊື່ຮ້ານຄ້າ</label>
                    <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="input-premium" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 800, marginBottom: '8px', fontSize: '0.85rem' }}>ທີ່ຢູ່ / ສະຖານທີ່</label>
                    <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="input-premium" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 800, marginBottom: '8px', fontSize: '0.85rem' }}>ເບີໂທລະສັບຕິດຕໍ່</label>
                    <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="input-premium" />
                  </div>
                  
                  {isSystemAdmin && editingShop && (
                    <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '20px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <p style={{ fontWeight: 900, fontSize: '0.85rem', color: 'var(--primary)', letterSpacing: '0.05em' }}>ໃບອະນຸຍາດ ແລະ ແພັກເກັດ</p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, marginBottom: '6px' }}>ສະຖານະ</label>
                          <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="input-premium" style={{ height: '44px', fontSize: '0.85rem' }}>
                            <option value="Active">ເປີດໃຊ້ງານ</option>
                            <option value="Suspended">ລະງັບການໃຊ້ງານ</option>
                            <option value="Expired">ໝົດອາຍຸ</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, marginBottom: '6px' }}>ແພັກເກັດ</label>
                          <select value={formData.plan_type} onChange={e => setFormData({...formData, plan_type: e.target.value})} className="input-premium" style={{ height: '44px', fontSize: '0.85rem' }}>
                            <option value="Basic">Basic</option>
                            <option value="Premium">Premium</option>
                            <option value="Enterprise">Enterprise</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, marginBottom: '6px' }}>ວັນໝົດອາຍຸ</label>
                        <input type="date" value={formData.license_expiry} onChange={e => setFormData({...formData, license_expiry: e.target.value})} className="input-premium" style={{ height: '44px', fontSize: '0.85rem' }} />
                      </div>
                    </div>
                  )}

                  {/* Shop Logo Upload */}
                  <div>
                    <label style={{ display: 'block', fontWeight: 800, marginBottom: '10px', fontSize: '0.85rem' }}>ໂລໂກ້ຮ້ານຄ້າ</label>
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
                          {logoPreview ? (logoFile ? logoFile.name : 'ໂລໂກ້ປະຈຸບັນ') : 'ຄລິກ ຫຼື ລາກຮູບມາທີ່ນີ້'}
                        </p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>PNG, JPG, WEBP ສູງສຸດ 5MB</p>
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
                        ✕ ລຶບໄຟລ໌ທີ່ເລືອກ
                      </button>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                    <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '14px', borderRadius: '12px', border: '1px solid var(--border)', fontWeight: 800, cursor: 'pointer' }}>ຍົກເລີກ</button>
                    <button type="submit" className="btn-primary" style={{ flex: 2 }}>{editingShop ? 'ບັນທຶກການປ່ຽນແປງ' : 'ສ້າງຮ້ານຄ້າ'}</button>
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
