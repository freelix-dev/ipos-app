import React, { useState, useEffect } from 'react';
import { 
  History, 
  Search, 
  Calendar, 
  User, 
  Store, 
  Activity, 
  Filter,
  ArrowRight,
  Clock,
  Shield
} from 'lucide-react';
import { api } from '../services/api';

const AuditLogs = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [shops, setShops] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    shopId: '',
    userId: '',
    action: '',
    startDate: '',
    endDate: ''
  });

  const userJson = localStorage.getItem('user');
  const currentUser = userJson ? JSON.parse(userJson) : null;
  const isSystemAdmin = currentUser && !currentUser.shop_id;

  useEffect(() => {
    loadShops();
    fetchLogs();
  }, []);

  const loadShops = async () => {
    try {
      const data = await api.getShops();
      setShops(data);
    } catch (error) {
      console.error('Failed to load shops:', error);
    }
  };

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await api.getAuditLogs(filters);
      setLogs(data);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const getActionColor = (action: string) => {
    const act = action.toLowerCase();
    if (act.includes('delete')) return '#ef4444';
    if (act.includes('create') || act.includes('add')) return '#10b981';
    if (act.includes('update') || act.includes('edit')) return '#3b82f6';
    if (act.includes('login')) return '#8b5cf6';
    return 'var(--text-muted)';
  };

  return (
    <div className="animate-slide-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '48px' }}>
        <div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: '8px', color: 'var(--text-main)' }}>Audit Trail</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 500 }}>System activity monitoring and security forensics</p>
        </div>
        <button onClick={fetchLogs} className="btn-primary" style={{ background: '#fff', color: 'var(--primary)', border: '1px solid var(--primary)' }}>
          Refresh Log Trace
        </button>
      </div>

      <div className="card-premium" style={{ background: '#fff', borderRadius: '32px', padding: '32px', marginBottom: '32px', boxShadow: 'var(--shadow-premium)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 900, marginBottom: '8px', opacity: 0.6 }}>TARGET SHOP</label>
            <select value={filters.shopId} onChange={e => handleFilterChange('shopId', e.target.value)} className="input-premium">
              <option value="">All Branches</option>
              {shops.map(shop => <option key={shop.id} value={shop.id}>{shop.name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 900, marginBottom: '8px', opacity: 0.6 }}>ACTION TYPE</label>
            <input type="text" placeholder="e.g. Delete, Login..." value={filters.action} onChange={e => handleFilterChange('action', e.target.value)} className="input-premium" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 900, marginBottom: '8px', opacity: 0.6 }}>START DATE</label>
            <input type="date" value={filters.startDate} onChange={e => handleFilterChange('startDate', e.target.value)} className="input-premium" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 900, marginBottom: '8px', opacity: 0.6 }}>END DATE</label>
            <input type="date" value={filters.endDate} onChange={e => handleFilterChange('endDate', e.target.value)} className="input-premium" />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button onClick={fetchLogs} className="btn-primary" style={{ width: '100%', height: '54px' }}>Apply Filter</button>
          </div>
        </div>
      </div>

      <div className="timeline-container">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px' }}><div className="spinner" style={{ margin: '0 auto' }}></div></div>
        ) : logs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '100px', background: '#fff', borderRadius: '32px' }}>
             <Activity size={48} opacity={0.2} style={{ marginBottom: '16px' }} />
             <p style={{ fontWeight: 800, color: 'var(--text-muted)' }}>No activity logs found for current criteria.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {logs.map((log) => (
              <div key={log.id} className="log-item" style={{ 
                background: '#fff', padding: '24px 32px', borderRadius: '24px', 
                border: '1px solid var(--border)', display: 'flex', alignItems: 'center', 
                gap: '24px', transition: 'var(--transition)',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <div style={{ 
                  width: '56px', height: '56px', borderRadius: '18px', 
                  background: `${getActionColor(log.action)}15`, 
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: getActionColor(log.action),
                  flexShrink: 0
                }}>
                  {log.action.toLowerCase().includes('login') ? <Shield size={24} /> : <History size={24} />}
                </div>
                
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 900, fontSize: '1.1rem', color: 'var(--text-main)' }}>{log.action}</span>
                    <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--border-strong)' }}></div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)' }}>{log.target_type || 'SYSTEM'}</span>
                  </div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                    <span style={{ fontWeight: 800, color: 'var(--text-main)' }}>{log.user_name || 'System Auto'}</span> 
                    {log.shop_name && <span style={{ marginLeft: '8px' }}>at <span style={{ fontWeight: 800 }}>{log.shop_name}</span></span>}
                  </p>
                  {log.details && (
                    <div style={{ marginTop: '12px', padding: '12px 16px', background: '#f8fafc', borderRadius: '12px', fontSize: '0.85rem', color: 'var(--text-muted)', border: '1px dashed var(--border-strong)' }}>
                      {log.details}
                    </div>
                  )}
                </div>

                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)', fontWeight: 800, justifyContent: 'flex-end' }}>
                    <Calendar size={14} opacity={0.5} />
                    <span>{new Date(log.created_at).toLocaleDateString()}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontWeight: 600, justifyContent: 'flex-end', marginTop: '4px' }}>
                    <Clock size={14} opacity={0.5} />
                    <span>{new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .log-item:hover { transform: translateX(8px); border-color: var(--primary); box-shadow: 0 10px 30px -10px rgba(0,0,0,0.1); }
        .spinner { width: 44px; height: 44px; border: 4px solid #f1f5f9; border-top: 4px solid var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default AuditLogs;
