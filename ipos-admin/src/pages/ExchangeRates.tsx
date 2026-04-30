import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Save, RefreshCw, AlertCircle, Info, Store } from 'lucide-react';

const ExchangeRates = () => {
  const [rates, setRates] = useState<Record<string, number>>({
    THB: 0,
    USD: 0,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [shops, setShops] = useState<any[]>([]);
  const [selectedShopId, setSelectedShopId] = useState('global');

  const userJson = localStorage.getItem('user');
  const currentUser = userJson ? JSON.parse(userJson) : null;
  const isSystemAdmin = currentUser && !currentUser.shop_id && !currentUser.owner_id;

  const loadShops = async () => {
    try {
      const data = await api.getShops(isSystemAdmin ? undefined : (currentUser?.owner_id || currentUser?.id));
      setShops(data);
    } catch (error) {
      console.error('Failed to load shops:', error);
    }
  };

  const fetchRates = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getExchangeRates(selectedShopId === 'global' ? undefined : selectedShopId);
      setRates({
        THB: data.THB || 0,
        USD: data.USD || 0,
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShops();
  }, []);

  useEffect(() => {
    fetchRates();
  }, [selectedShopId]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      await api.updateExchangeRates(rates, selectedShopId);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleRateChange = (currency: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setRates((prev) => ({
      ...prev,
      [currency]: numValue,
    }));
  };

  return (
    <div className="animate-slide-up" style={{ padding: '20px' }}>
      <div style={{ marginBottom: '48px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 900, letterSpacing: '-0.04em', color: 'var(--text-main)', marginBottom: '8px' }}>ຄວບຄຸມອັດຕາແລກປ່ຽນ</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 500 }}>ກຳນົດມູນຄ່າເງິນຕາຕ່າງປະເທດ ແລະ ພາລາມິເຕີການແປງສະກຸນເງິນລວມ</p>
        </div>

        {/* Shop Selector */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '250px' }}>
            <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)', zIndex: 1 }}>
              <Store size={18} />
            </div>
            <select 
              value={selectedShopId}
              onChange={(e) => setSelectedShopId(e.target.value)}
              style={{ 
                width: '100%', height: '50px', padding: '0 40px 0 48px', 
                borderRadius: '16px', border: '1px solid var(--border-strong)', 
                background: '#fff', fontSize: '0.9rem', fontWeight: 800,
                appearance: 'none', cursor: 'pointer', outline: 'none',
                color: 'var(--primary)', boxShadow: 'var(--shadow-sm)'
              }}
            >
              <option value="global">ຄ່າເລີ່ມຕົ້ນທັງໝົດ (GLOBAL)</option>
              {shops.map(shop => (
                <option key={shop.id} value={shop.id}>{shop.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div style={{ 
          marginBottom: '32px', padding: '20px', 
          background: '#fee2e2', borderLeft: '4px solid #ef4444', 
          borderRadius: '12px', color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '12px',
          fontWeight: 600
        }}>
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {success && (
        <div style={{ 
          marginBottom: '32px', padding: '20px', 
          background: '#dcfce7', borderLeft: '4px solid #10b981', 
          borderRadius: '12px', color: '#15803d', display: 'flex', alignItems: 'center', gap: '12px',
          fontWeight: 600
        }}>
          <Save size={20} />
          ອັບເດດຮູບແບບການຄິດໄລ່ມູນຄ່າສຳລັບ {selectedShopId === 'global' ? 'ຄ່າເລີ່ມຕົ້ນທັງໝົດ' : shops.find(s => s.id === selectedShopId)?.name} ສຳເລັດແລ້ວ!
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
          <div className="spinner"></div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px', maxWidth: '1200px' }}>
          {/* Info Card */}
          <div className="card-premium" style={{ gridColumn: '1 / -1', padding: '32px', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: '#fff', display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '16px', borderRadius: '20px', backdropFilter: 'blur(10px)' }}>
              <Info size={32} color="#3b82f6" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.02em' }}>
                {selectedShopId === 'global' ? 'ອັດຕາແລກປ່ຽນເລີ່ມຕົ້ນທັງໝົດ' : `ອັດຕາແລກປ່ຽນສຳລັບ ${shops.find(s => s.id === selectedShopId)?.name}`}
              </h2>
              <p style={{ opacity: 0.6, fontSize: '0.95rem', marginTop: '4px', fontWeight: 500 }}>
                {selectedShopId === 'global' 
                  ? 'ອັດຕາເຫຼົ່ານີ້ຈະຖືກນຳໃຊ້ກັບທຸກໆຮ້ານ ເວັ້ນເສຍແຕ່ວ່າຮ້ານນັ້ນຈະມີການກຳນົດອັດຕາສະເພາະ.' 
                  : 'ອັດຕາເຫຼົ່ານີ້ຈະຖືກນຳໃຊ້ແທນຄ່າເລີ່ມຕົ້ນສຳລັບສາຂານີ້ໂດຍສະເພາະ.'}
              </p>
            </div>
          </div>

          {/* THB Rate Card */}
          <div className="stat-card" style={{ padding: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
              <div style={{ background: '#f59e0b15', padding: '12px', borderRadius: '14px', color: '#f59e0b' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 900 }}>฿</span>
              </div>
               <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-main)' }}>ເງິນບາດ (THB)</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>ອັດຕາແລກປ່ຽນພາກພື້ນໄທ</p>
              </div>
            </div>
            
            <div style={{ position: 'relative' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 800, marginBottom: '12px', textTransform: 'uppercase' }}>1 THB = ? LAK</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <input
                  type="number"
                  value={rates.THB}
                  onChange={(e) => handleRateChange('THB', e.target.value)}
                  style={{ 
                    flex: 1, height: '70px', padding: '0 24px', 
                    borderRadius: '20px', border: '1px solid var(--border-strong)', 
                    background: '#f8fafc', fontSize: '2rem', fontWeight: 900,
                    color: 'var(--text-main)', outline: 'none', transition: 'var(--transition)',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                  }}
                />
                <span style={{ fontWeight: 900, color: 'var(--text-muted)', fontSize: '1.2rem' }}>KIP</span>
              </div>
            </div>
          </div>

          {/* USD Rate Card */}
          <div className="stat-card" style={{ padding: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
              <div style={{ background: '#10b98115', padding: '12px', borderRadius: '14px', color: '#10b981' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 900 }}>$</span>
              </div>
               <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-main)' }}>ເງິນໂດລາ (USD)</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>ອັດຕາແລກປ່ຽນສາກົນ</p>
              </div>
            </div>
            
            <div style={{ position: 'relative' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 800, marginBottom: '12px', textTransform: 'uppercase' }}>1 USD = ? LAK</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <input
                  type="number"
                  value={rates.USD}
                  onChange={(e) => handleRateChange('USD', e.target.value)}
                  style={{ 
                    flex: 1, height: '70px', padding: '0 24px', 
                    borderRadius: '20px', border: '1px solid var(--border-strong)', 
                    background: '#f8fafc', fontSize: '2rem', fontWeight: 900,
                    color: 'var(--text-main)', outline: 'none', transition: 'var(--transition)',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                  }}
                />
                <span style={{ fontWeight: 900, color: 'var(--text-muted)', fontSize: '1.2rem' }}>KIP</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {!loading && (
        <div style={{ marginTop: '48px', maxWidth: '1200px' }}>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary"
            style={{ 
              width: '100%', padding: '24px', borderRadius: '24px', 
              fontSize: '1.2rem', fontWeight: 900, letterSpacing: '0.02em',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px',
              boxShadow: '0 15px 30px rgba(16, 185, 129, 0.25)', border: 'none'
            }}
          >
             {saving ? (
              <>
                <RefreshCw className="animate-spin" size={24} />
                ກຳລັງຊິງຂໍ້ມູນອັດຕາແລກປ່ຽນ...
              </>
            ) : (
              <>
                <Save size={24} />
                ຢືນຢັນອັດຕາແລກປ່ຽນສຳລັບ {selectedShopId === 'global' ? 'ຄ່າເລີ່ມຕົ້ນທັງໝົດ' : shops.find(s => s.id === selectedShopId)?.name.toUpperCase()}
              </>
            )}
          </button>
        </div>
      )}

      <style>{`
        .stat-card {
          background: #fff;
          border-radius: 32px;
          border: 1px solid var(--border);
          box-shadow: var(--shadow-premium);
          transition: var(--transition);
        }
        .stat-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 30px 60px -12px rgba(15, 23, 42, 0.12);
        }
        .card-premium {
          border-radius: 32px;
          box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.4);
        }
        .spinner { width: 44px; height: 44px; border: 4px solid #f1f5f9; border-top: 4px solid var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .animate-slide-up {
          animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default ExchangeRates;
