import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Save, 
  RefreshCw, 
  Database, 
  Globe, 
  ShieldCheck, 
  Store,
  Layout,
  Smartphone,
  HardDrive
} from 'lucide-react';
import { api } from '../services/api';

const SystemSettings = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await api.getSystemSettings();
      setSettings(data);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.updateSystemSettings(settings);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const sections = [
    {
      title: 'ເອກະລັກ ແລະ ແບຣນ',
      icon: <Layout size={20} />,
      items: [
        { key: 'app_name', label: 'ຊື່ແອັບພລິເຄຊັນ', type: 'text', description: 'ຊື່ທີ່ຈະສະແດງໃນທຸກລະບົບ' },
        { key: 'business_tagline', label: 'ຄຳຂວັນທຸລະກິດ', type: 'text', description: 'ຄຳອະທິບາຍຫຍໍ້ສຳລັບສ່ວນຫົວ' }
      ]
    },
    {
      title: 'ພາລາມິເຕີທາງການເງິນ',
      icon: <Globe size={20} />,
      items: [
        { key: 'currency_primary', label: 'ສະກຸນເງິນຫຼັກ', type: 'text', description: 'ສະກຸນເງິນພື້ນຖານສຳລັບການບັນຊີ (ຕົວຢ່າງ: LAK)' },
        { key: 'tax_rate', label: 'ອັດຕາພາສີເລີ່ມຕົ້ນ (%)', type: 'number', description: 'ເປີເຊັນອາກອນ/VAT ມາດຕະຖານ' }
      ]
    },
    {
      title: 'ຕັກກະການດຳເນີນງານ',
      icon: <Smartphone size={20} />,
      items: [
        { key: 'allow_negative_stock', label: 'ອະນຸຍາດໃຫ້ສະຕັອກຕິດລົບ', type: 'select', options: ['true', 'false'], description: 'ອະນຸຍາດໃຫ້ຂາຍໄດ້ເຖິງວ່າສະຕັອກຈະເປັນສູນ' },
        { key: 'session_timeout', label: 'ເວລາໝົດອາຍຸເຊດຊັນ (ນາທີ)', type: 'number', description: 'ກຳນົດເວລາທີ່ບໍ່ມີການເຄື່ອນໄຫວກ່ອນອອກຈາກລະບົບອັດຕະໂນມັດ' }
      ]
    }
  ];

  return (
    <div className="animate-slide-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '48px' }}>
        <div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: '8px', color: 'var(--text-main)' }}>ຕັ້ງຄ່າລະບົບລວມ</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 500 }}>ການກຳນົດຄ່າທົ່ວລະບົບ ແລະ ຕົວປ່ຽນສະພາບແວດລ້ອມຕ່າງໆ</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {saving ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} />}
          <span>{saving ? 'ກຳລັງຊິງຂໍ້ມູນ...' : 'ບັນທຶກການປ່ຽນແປງ'}</span>
        </button>
      </div>

      {success && (
        <div style={{ marginBottom: '32px', padding: '20px', background: '#dcfce7', borderLeft: '4px solid #10b981', borderRadius: '12px', color: '#15803d', fontWeight: 800 }}>
          ອັບເດດພາລາມິເຕີລະບົບສຳເລັດແລ້ວ!
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '100px' }}><div className="spinner" style={{ margin: '0 auto' }}></div></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px' }}>
          {sections.map((section, idx) => (
            <div key={idx} className="card-premium" style={{ background: '#fff', borderRadius: '32px', padding: '40px', boxShadow: 'var(--shadow-premium)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                <div style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '12px', borderRadius: '14px' }}>
                  {section.icon}
                </div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--text-main)' }}>{section.title}</h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                {section.items.map((item) => (
                  <div key={item.key}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>{item.label}</label>
                    </div>
                    
                    {item.type === 'select' ? (
                      <select 
                        value={settings[item.key] || ''} 
                        onChange={e => handleChange(item.key, e.target.value)}
                        className="input-premium"
                        style={{ fontWeight: 800, color: 'var(--primary)' }}
                      >
                        {item.options?.map(opt => <option key={opt} value={opt}>{opt.toUpperCase()}</option>)}
                      </select>
                    ) : (
                      <input 
                        type={item.type} 
                        value={settings[item.key] || ''} 
                        onChange={e => handleChange(item.key, e.target.value)}
                        className="input-premium"
                        style={{ fontWeight: 800 }}
                      />
                    )}
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px', fontWeight: 500 }}>{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Technical Info Card */}
          <div className="card-premium" style={{ gridColumn: '1 / -1', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderRadius: '32px', padding: '40px', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
              <div style={{ background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '24px' }}>
                <HardDrive size={32} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 900 }}>ສະຖານະໂຄງສ້າງພື້ນຖານ</h3>
                <p style={{ opacity: 0.6, fontWeight: 500 }}>System core version 2.4.0-stable | Database: MySQL 8.0</p>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(16, 185, 129, 0.2)', padding: '8px 16px', borderRadius: '12px', color: '#10b981', fontWeight: 800, fontSize: '0.85rem' }}>
                  <ShieldCheck size={16} />
                  <span>ທຸກລະບົບເຮັດວຽກປົກກະຕິ</span>
               </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .spinner { width: 44px; height: 44px; border: 4px solid #f1f5f9; border-top: 4px solid var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .input-premium:focus { border-color: var(--primary); box-shadow: 0 0 0 4px var(--primary-light); }
      `}</style>
    </div>
  );
};

export default SystemSettings;
