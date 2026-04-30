import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  RefreshCw, 
  ShieldAlert, 
  Save, 
  AlertCircle, 
  Info,
  ChevronRight,
  Monitor,
  Activity,
  Server
} from 'lucide-react';
import { api } from '../services/api';

const AppManagement = () => {
  const [config, setConfig] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(false);
      // We can use getSystemSettings which we already have
      const data = await api.getSystemSettings();
      setConfig(data);
    } catch (error) {
      console.error('Failed to fetch app config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.updateAppConfig(config);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      alert('ບໍ່ສາມາດອັບເດດການຕັ້ງຄ່າໄດ້');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setConfig((prev: any) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="animate-slide-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '48px' }}>
        <div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 900, letterSpacing: '-0.04em', color: 'var(--text-main)', marginBottom: '8px' }}>ຈັດການແອັບພລິເຄຊັນ</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 500 }}>ຄວບຄຸມ ແລະ ບຳລຸງຮັກສາແອັບໃຊ້ງານໃນໂທລະສັບ</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {saving ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} />}
          <span>{saving ? 'ກຳລັງອັບເດດ...' : 'ສົ່ງການອັບເດດ'}</span>
        </button>
      </div>

      {success && (
        <div style={{ marginBottom: '32px', padding: '20px', background: '#dcfce7', borderLeft: '4px solid #10b981', borderRadius: '12px', color: '#15803d', fontWeight: 800 }}>
          ຊິງຂໍ້ມູນການຕັ້ງຄ່າໄປຫາທຸກໂທລະສັບສຳເລັດແລ້ວ!
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '40px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Version Control */}
          <div className="card-premium" style={{ background: '#fff', padding: '40px', borderRadius: '32px', boxShadow: 'var(--shadow-premium)' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 900, marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '16px' }}>
               <div style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '12px', borderRadius: '14px' }}><Smartphone size={20} /></div>
               ຈັດການເວີຊັນ
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 900, marginBottom: '8px', opacity: 0.6 }}>ເວີຊັນປະຈຸບັນ</label>
                <input type="text" value={config.app_current_version || ''} onChange={e => handleChange('app_current_version', e.target.value)} className="input-premium" placeholder="e.g. 1.2.0" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 900, marginBottom: '8px', opacity: 0.6 }}>ເວີຊັນຕ່ຳສຸດ</label>
                <input type="text" value={config.app_min_version || ''} onChange={e => handleChange('app_min_version', e.target.value)} className="input-premium" placeholder="e.g. 1.0.0" />
              </div>
            </div>

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', background: '#f8fafc', borderRadius: '20px', border: '1px solid var(--border)' }}>
              <div>
                <p style={{ fontWeight: 800, fontSize: '0.95rem' }}>ບັງຄັບອັບເດດ</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ກຳນົດໃຫ້ຜູ້ໃຊ້ທຸກຄົນຕ້ອງອັບເດດເປັນເວີຊັນລ່າສຸດ</p>
              </div>
              <label className="switch">
                <input type="checkbox" checked={config.force_update === 'true'} onChange={e => handleChange('force_update', e.target.checked ? 'true' : 'false')} />
                <span className="slider round"></span>
              </label>
            </div>
          </div>

          {/* Maintenance Mode */}
          <div className="card-premium" style={{ background: '#fff', padding: '40px', borderRadius: '32px', boxShadow: 'var(--shadow-premium)', border: config.maintenance_mode === 'true' ? '2px solid #ef4444' : '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 900, marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '16px' }}>
               <div style={{ background: config.maintenance_mode === 'true' ? '#fee2e2' : 'var(--primary-light)', color: config.maintenance_mode === 'true' ? '#ef4444' : 'var(--primary)', padding: '12px', borderRadius: '14px' }}><Server size={20} /></div>
               ສະຖານະລະບົບ
            </h3>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px', background: config.maintenance_mode === 'true' ? '#fef2f2' : '#f8fafc', borderRadius: '20px', border: '1px solid var(--border)', marginBottom: '24px' }}>
               <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <ShieldAlert size={24} color={config.maintenance_mode === 'true' ? '#ef4444' : '#64748b'} />
                  <div>
                    <p style={{ fontWeight: 800, fontSize: '1rem' }}>ໂໝດດູແລລະບົບ</p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>ປິດການໃຊ້ງານທຸກການດຳເນີນງານໃນໂທລະສັບ</p>
                  </div>
               </div>
               <label className="switch">
                 <input type="checkbox" checked={config.maintenance_mode === 'true'} onChange={e => handleChange('maintenance_mode', e.target.checked ? 'true' : 'false')} />
                 <span className="slider round"></span>
               </label>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 900, marginBottom: '8px', opacity: 0.6 }}>ຂໍ້ຄວາມໃນໂໝດດູແລ</label>
              <textarea 
                value={config.maintenance_message || ''} 
                onChange={e => handleChange('maintenance_message', e.target.value)}
                className="input-premium" 
                style={{ height: '100px', resize: 'none' }}
              />
            </div>
          </div>
        </div>

        {/* Device Status Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div className="card-premium" style={{ background: 'var(--bg-sidebar)', color: '#fff', borderRadius: '32px', padding: '32px' }}>
             <h4 style={{ fontSize: '1.1rem', fontWeight: 900, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Monitor size={20} />
                ສະຖິຕິໂທລະສັບ
             </h4>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ opacity: 0.6 }}>ຈຳນວນການຕິດຕັ້ງ</span>
                  <span style={{ fontWeight: 800 }}>1,248</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ opacity: 0.6 }}>ໂທລະສັບ iOS</span>
                  <span style={{ fontWeight: 800 }}>482</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ opacity: 0.6 }}>ໂທລະສັບ Android</span>
                  <span style={{ fontWeight: 800 }}>766</span>
                </div>
                <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981' }}>
                  <span style={{ fontWeight: 800 }}>ສຸຂະພາບການຊິງ</span>
                  <span style={{ fontWeight: 900 }}>99.8%</span>
                </div>
             </div>
          </div>

          <div style={{ padding: '32px', borderRadius: '32px', border: '2px dashed var(--border)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
             <div style={{ display: 'flex', gap: '12px' }}>
                <Info size={20} color="var(--primary)" />
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  ການປ່ຽນ <strong>ເວີຊັນຕ່ຳສຸດ</strong> ຈະເຮັດໃຫ້ຜູ້ໃຊ້ທີ່ໃຊ້ເວີຊັນເກົ່າຕ້ອງອັບເດດທັນທີ່ເມື່ອເປີດແອັບ.
                </p>
             </div>
             <div style={{ display: 'flex', gap: '12px' }}>
                <AlertCircle size={20} color="#f59e0b" />
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  <strong>ໂໝດດູແລລະບົບ</strong> ຈະປ້ອງກັນການຊິງຂໍ້ມູນ ແລະ ການສັ່ງຊື້ຈາກໂທລະສັບທັງໝົດ.
                </p>
             </div>
          </div>
        </div>
      </div>

      <style>{`
        .switch { position: relative; display: inline-block; width: 50px; height: 28px; }
        .switch input { opacity: 0; width: 0; height: 0; }
        .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #cbd5e1; transition: .4s; }
        .slider:before { position: absolute; content: ""; height: 20px; width: 20px; left: 4px; bottom: 4px; background-color: white; transition: .4s; }
        input:checked + .slider { background-color: var(--primary); }
        input:checked + .slider:before { transform: translateX(22px); }
        .slider.round { border-radius: 34px; }
        .slider.round:before { border-radius: 50%; }
      `}</style>
    </div>
  );
};

export default AppManagement;
