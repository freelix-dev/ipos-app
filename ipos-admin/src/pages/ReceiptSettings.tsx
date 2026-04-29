import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Save, 
  RefreshCw, 
  Image as ImageIcon, 
  Type, 
  Phone, 
  MapPin, 
  User, 
  Hash,
  Store,
  Eye,
  CheckCircle2
} from 'lucide-react';
import { api, IMAGE_BASE_URL } from '../services/api';

const ReceiptSettings = () => {
  const [shops, setShops] = useState<any[]>([]);
  const [selectedShopId, setSelectedShopId] = useState('');
  const [settings, setSettings] = useState<any>({
    logo_enabled: true,
    logo_path: '',
    header_text: '',
    footer_text: '',
    show_phone: true,
    show_address: true,
    show_order_id: true,
    show_staff_name: true,
    show_qr: false,
    qr_image_url: '',
    font_size: 10
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [qrUploading, setQrUploading] = useState(false);

  const userJson = localStorage.getItem('user');
  const currentUser = userJson ? JSON.parse(userJson) : null;
  const isSystemAdmin = currentUser && !currentUser.shop_id;

  useEffect(() => {
    loadShops();
  }, []);

  useEffect(() => {
    if (selectedShopId) {
      fetchSettings();
    }
  }, [selectedShopId]);

  const loadShops = async () => {
    try {
      const data = await api.getShops(isSystemAdmin ? undefined : (currentUser?.owner_id || currentUser?.id));
      setShops(data);
      if (data.length > 0) {
        setSelectedShopId(data[0].id);
      }
    } catch (error) {
      console.error('Failed to load shops:', error);
    }
  };

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await api.getReceiptSettings(selectedShopId);
      if (data) {
        setSettings({
          ...data,
          logo_enabled: !!data.logo_enabled,
          show_phone: !!data.show_phone,
          show_address: !!data.show_address,
          show_order_id: !!data.show_order_id,
          show_staff_name: !!data.show_staff_name,
          show_qr: !!data.show_qr,
          qr_image_url: data.qr_image_url || '',
          font_size: data.font_size || 10
        });
      } else {
        // Reset to defaults if no settings found
        setSettings({
          logo_enabled: true,
          logo_path: '',
          header_text: `ຍິນດີຕ້ອນຮັບສູ່ ${shops.find(s => s.id === selectedShopId)?.name || 'ຮ້ານຂອງພວກເຮົາ'}`,
          footer_text: 'ຂອບໃຈທີ່ໃຊ້ບໍລິການ!',
          show_phone: true,
          show_address: true,
          show_order_id: true,
          show_staff_name: true,
          show_qr: false,
          qr_image_url: '',
          font_size: 10
        });
      }
    } catch (error) {
      console.error('Failed to fetch receipt settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        setSaving(true);
        const res = await api.uploadImage(e.target.files[0]);
        handleChange('logo_path', res.imagePath);
      } catch (error) {
        alert('Logo upload failed');
      } finally {
        setSaving(false);
      }
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.updateReceiptSettings({ ...settings, shop_id: selectedShopId });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key: string, value: any) => {
    setSettings((prev: any) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="animate-slide-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '48px' }}>
        <div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: '8px', color: 'var(--text-main)' }}>Receipt Designer</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 500 }}>Customize the physical touchpoint of your customer experience</p>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <select 
            value={selectedShopId} 
            onChange={(e) => setSelectedShopId(e.target.value)}
            className="input-premium"
            style={{ width: '220px', fontWeight: 800, color: 'var(--primary)' }}
          >
            {shops.map(shop => <option key={shop.id} value={shop.id}>{shop.name}</option>)}
          </select>
          <button onClick={handleSave} disabled={saving || !selectedShopId} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {saving ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} />}
            <span>Commit Design</span>
          </button>
        </div>
      </div>

      {success && (
        <div style={{ marginBottom: '32px', padding: '20px', background: '#dcfce7', borderLeft: '4px solid #10b981', borderRadius: '12px', color: '#15803d', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '12px' }}>
          <CheckCircle2 size={20} />
          Receipt configuration synchronized for selected branch!
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '40px', alignItems: 'start' }}>
        {/* Editor Side */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div className="card-premium" style={{ background: '#fff', padding: '40px', borderRadius: '32px', boxShadow: 'var(--shadow-premium)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Type size={20} color="var(--primary)" />
              Typography & Content
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 900, marginBottom: '8px', opacity: 0.6 }}>HEADER TEXT</label>
                <textarea 
                  value={settings.header_text} 
                  onChange={(e) => handleChange('header_text', e.target.value)}
                  className="input-premium" 
                  style={{ height: '80px', resize: 'none', paddingTop: '12px' }}
                  placeholder="ເຊັ່ນ: ຍິນດີຕ້ອນຮັບ..."
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 900, marginBottom: '8px', opacity: 0.6 }}>FOOTER TEXT</label>
                <textarea 
                  value={settings.footer_text} 
                  onChange={(e) => handleChange('footer_text', e.target.value)}
                  className="input-premium" 
                  style={{ height: '80px', resize: 'none', paddingTop: '12px' }}
                  placeholder="ເຊັ່ນ: ຂອບໃຈທີ່ໃຊ້ບໍລິການ!"
                />
              </div>
            </div>
          </div>

          <div className="card-premium" style={{ background: '#fff', padding: '40px', borderRadius: '32px', boxShadow: 'var(--shadow-premium)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <ImageIcon size={20} color="var(--primary)" />
              Brand Assets & Typography
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                <div style={{ 
                  width: '100px', height: '100px', borderRadius: '24px', 
                  border: '2px dashed var(--border-strong)', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: '#f8fafc', overflow: 'hidden'
                }}>
                  {settings.logo_path ? (
                    <img src={settings.logo_path.startsWith('http') ? settings.logo_path : `${IMAGE_BASE_URL}/${settings.logo_path}`} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  ) : (
                    <ImageIcon size={32} color="#cbd5e1" />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 900, marginBottom: '12px', opacity: 0.6 }}>STORE LOGO (BLACK & WHITE RECOMMENDED)</label>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <input type="file" id="logo-upload" hidden onChange={handleLogoUpload} accept="image/*" />
                    <button onClick={() => document.getElementById('logo-upload')?.click()} className="btn-secondary" style={{ padding: '10px 20px', borderRadius: '12px' }}>Upload Image</button>
                    {settings.logo_path && (
                      <button onClick={() => handleChange('logo_path', '')} style={{ color: '#ef4444', fontWeight: 800, fontSize: '0.8rem', background: 'none', border: 'none', cursor: 'pointer' }}>Remove</button>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '24px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '12px' }}>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700 }}>BASE FONT SIZE</h4>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', opacity: 0.6 }}>Adjust the overall text size on the printed bill.</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={() => handleChange('font_size', 20)}
                        style={{ padding: '10px 14px', borderRadius: '12px', border: settings.font_size === 20 ? '2px solid var(--primary)' : '1px solid var(--border)', background: settings.font_size === 20 ? 'var(--primary-light)' : 'white', cursor: 'pointer', fontWeight: 800, fontSize: '0.85rem', transition: 'all 0.2s' }}
                      >
                        Small (20)
                      </button>
                      <button 
                        onClick={() => handleChange('font_size', 22)}
                        style={{ padding: '10px 14px', borderRadius: '12px', border: settings.font_size === 22 ? '2px solid var(--primary)' : '1px solid var(--border)', background: settings.font_size === 22 ? 'var(--primary-light)' : 'white', cursor: 'pointer', fontWeight: 800, fontSize: '0.85rem', transition: 'all 0.2s' }}
                      >
                        Medium (22)
                      </button>
                      <button 
                        onClick={() => handleChange('font_size', 24)}
                        style={{ padding: '10px 14px', borderRadius: '12px', border: settings.font_size === 24 ? '2px solid var(--primary)' : '1px solid var(--border)', background: settings.font_size === 24 ? 'var(--primary-light)' : 'white', cursor: 'pointer', fontWeight: 800, fontSize: '0.85rem', transition: 'all 0.2s' }}
                      >
                        Large (24)
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ padding: '24px', background: '#f8fafc', borderRadius: '24px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Hash size={18} color="var(--primary)" />
                    <span style={{ fontWeight: 900, fontSize: '0.9rem' }}>QR Code Attachment</span>
                  </div>
                  <label className="switch">
                    <input type="checkbox" checked={settings.show_qr} onChange={(e) => handleChange('show_qr', e.target.checked)} />
                    <span className="slider round"></span>
                  </label>
                </div>

                {settings.show_qr && (
                  <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                    <div style={{ 
                      width: '100px', height: '100px', borderRadius: '24px', 
                      border: '2px dashed var(--border-strong)', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: '#fff', overflow: 'hidden'
                    }}>
                      {settings.qr_image_url ? (
                        <img src={settings.qr_image_url} alt="QR Code" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      ) : (
                        <ImageIcon size={32} color="#cbd5e1" />
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 900, marginBottom: '12px', opacity: 0.6 }}>QR IMAGE (PROMPTPAY, ETC.)</label>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <input 
                          type="file" 
                          id="qr-upload" 
                          hidden 
                          accept="image/*"
                          disabled={qrUploading}
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file || !selectedShopId) return;
                            setQrUploading(true);
                            try {
                              const res = await api.uploadShopQr(selectedShopId, file);
                              handleChange('qr_image_url', res.qrImageUrl);
                            } catch (err) {
                              alert('Failed to upload QR image');
                            } finally {
                              setQrUploading(false);
                            }
                          }}
                        />
                        <button 
                          onClick={() => document.getElementById('qr-upload')?.click()} 
                          className="btn-secondary" 
                          style={{ padding: '10px 20px', borderRadius: '12px' }}
                          disabled={qrUploading}
                        >
                          {qrUploading ? 'Uploading...' : 'Upload QR Image'}
                        </button>
                        {settings.qr_image_url && (
                          <button 
                            onClick={() => handleChange('qr_image_url', '')} 
                            style={{ color: '#ef4444', fontWeight: 800, fontSize: '0.8rem', background: 'none', border: 'none', cursor: 'pointer' }}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="card-premium" style={{ background: '#fff', padding: '40px', borderRadius: '32px', boxShadow: 'var(--shadow-premium)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Eye size={20} color="var(--primary)" />
              Visibility Controls
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              {[
                { key: 'logo_enabled', label: 'Store Logo', icon: <ImageIcon size={18} /> },
                { key: 'show_phone', label: 'Phone Number', icon: <Phone size={18} /> },
                { key: 'show_address', label: 'Store Address', icon: <MapPin size={18} /> },
                { key: 'show_order_id', label: 'Order Reference', icon: <Hash size={18} /> },
                { key: 'show_staff_name', label: 'Staff Identity', icon: <User size={18} /> }
              ].map((item) => (
                <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: '#f8fafc', borderRadius: '16px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ color: settings[item.key] ? 'var(--primary)' : 'var(--text-muted)' }}>{item.icon}</div>
                    <span style={{ fontWeight: 800, fontSize: '0.85rem' }}>{item.label}</span>
                  </div>
                  <label className="switch">
                    <input type="checkbox" checked={settings[item.key]} onChange={(e) => handleChange(item.key, e.target.checked)} />
                    <span className="slider round"></span>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Preview Side */}
        <div style={{ position: 'sticky', top: '120px' }}>
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
             <span style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--text-muted)', letterSpacing: '0.1em' }}>LIVE PREVIEW</span>
          </div>
          <div style={{ 
            background: '#fff', 
            width: '100%', 
            minHeight: '500px', 
            padding: '40px 32px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)',
            borderRadius: '4px',
            fontFamily: "'Courier New', Courier, monospace",
            color: '#333',
            border: '1px solid #ddd',
            fontSize: settings.font_size === 'small' ? '0.7rem' : settings.font_size === 'large' ? '1rem' : '0.85rem'
          }}>
            {settings.logo_enabled && (
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                {settings.logo_path ? (
                  <img src={settings.logo_path.startsWith('http') ? settings.logo_path : `${IMAGE_BASE_URL}/${settings.logo_path}`} alt="Receipt Logo" style={{ width: '80px', height: '80px', objectFit: 'contain', filter: 'grayscale(100%) contrast(150%)' }} />
                ) : (
                  <div style={{ width: '60px', height: '60px', margin: '0 auto', background: '#eee', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Store size={30} opacity={0.3} />
                  </div>
                )}
              </div>
            )}
            
            <div style={{ padding: '24px', textAlign: 'center' }}>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '1.2rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{shops.find(s => s.id === selectedShopId)?.name || 'YOUR STORE'}</h3>
              {settings.show_address && <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.6 }}>123 Merchant Way, City Center</p>}
              {settings.show_phone && <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.6 }}>TEL: +856 20 12345678</p>}
              
              <div style={{ margin: '16px 0', borderTop: '1px dashed #ddd' }} />
              
              {settings.header_text && (
                <>
                  <p style={{ margin: '8px 0', fontSize: '0.9rem', fontStyle: 'italic' }}>{settings.header_text}</p>
                  <div style={{ margin: '16px 0', borderTop: '1px dashed #ddd' }} />
                </>
              )}
              
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '8px' }}>
                <span>Item Name x2</span>
                <span>50,000</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '8px' }}>
                <span>Another Product</span>
                <span>25,000</span>
              </div>
              
              <div style={{ margin: '16px 0', borderTop: '1px dashed #ddd' }} />
              
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1rem' }}>
                <span>ລວມທັງໝົດ (LAK)</span>
                <span>75,000</span>
              </div>
              
              <div style={{ margin: '16px 0', textAlign: 'left', fontSize: '0.75rem', opacity: 0.6, lineHeight: 1.6 }}>
                {settings.show_order_id && <div>ເລກທີບິນ: #INV-2024-001</div>}
                {settings.show_staff_name && <div>ພະນັກງານ: Admin User</div>}
                <div>ວັນທີ: {new Date().toLocaleString()}</div>
              </div>
              
              <div style={{ margin: '16px 0', borderTop: '1px dashed #ddd' }} />
              
              <p style={{ margin: '8px 0', fontSize: '0.9rem' }}>{settings.footer_text || 'ຂອບໃຈที่ໃຊ້ບໍລິການ'}</p>
            </div>
            
            {settings.show_qr && (
              <div style={{ textAlign: 'center', marginTop: '24px', padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #eee' }}>
                {settings.qr_image_url ? (
                  <img
                    src={settings.qr_image_url}
                    alt="QR Code"
                    style={{ width: '100px', height: '100px', objectFit: 'contain', margin: '0 auto', display: 'block' }}
                  />
                ) : (
                  <>
                    <div style={{ width: '80px', height: '80px', margin: '0 auto', border: '4px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: '60px', height: '60px', border: '2px solid #333' }}></div>
                    </div>
                    <p style={{ fontSize: '0.6rem', marginTop: '8px', fontWeight: 'bold', opacity: 0.5 }}>Upload QR image to preview</p>
                  </>
                )}
              </div>
            )}

            <div style={{ textAlign: 'center', marginTop: '32px' }}>
              <p style={{ fontSize: '0.7em', opacity: 0.4 }}>Powered by iPOS PRO</p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .switch { position: relative; display: inline-block; width: 44px; height: 24px; }
        .switch input { opacity: 0; width: 0; height: 0; }
        .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #cbd5e1; transition: .4s; }
        .slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: white; transition: .4s; }
        input:checked + .slider { background-color: var(--primary); }
        input:checked + .slider:before { transform: translateX(20px); }
        .slider.round { border-radius: 24px; }
        .slider.round:before { border-radius: 50%; }
        .spinner { width: 44px; height: 44px; border: 4px solid #f1f5f9; border-top: 4px solid var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default ReceiptSettings;
