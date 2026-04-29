import React, { useState, useEffect } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  ArrowUpRight, 
  ArrowDownLeft, 
  RefreshCw, 
  XCircle,
  Package,
  Calendar,
  User,
  Info
} from 'lucide-react';
import { api } from '../services/api';

const StockHistory = () => {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [shops, setShops] = useState<any[]>([]);
  const [selectedShopId, setSelectedShopId] = useState(() => localStorage.getItem('selectedShopId') || '');

  const userJson = localStorage.getItem('user');
  const currentUser = userJson ? JSON.parse(userJson) : null;
  const isSystemAdmin = currentUser && !currentUser.shop_id;

  useEffect(() => {
    loadShops();
    loadHistory();
  }, [selectedShopId]);

  const loadShops = async () => {
    try {
      const data = await api.getShops(isSystemAdmin ? undefined : (currentUser?.owner_id || currentUser?.id));
      setShops(data);
    } catch (error) {
      console.error('Failed to load shops:', error);
    }
  };

  const loadHistory = async () => {
    try {
      setLoading(true);
      const isOwner = currentUser?.role === 'admin' && !currentUser?.owner_id;
      const effectiveShopId = (isSystemAdmin || isOwner) ? selectedShopId : (selectedShopId || currentUser?.shop_id);
      if (effectiveShopId) {
        const data = await api.getStockHistory(effectiveShopId);
        setHistory(data);
      }
    } catch (error) {
      console.error('Failed to load stock history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'Sale': return <ArrowDownLeft size={16} color="#ef4444" />;
      case 'Restock': return <ArrowUpRight size={16} color="#10b981" />;
      case 'Adjustment': return <RefreshCw size={16} color="#3b82f6" />;
      case 'Void': return <XCircle size={16} color="#10b981" />;
      default: return <Info size={16} />;
    }
  };

  const getMovementColor = (type: string, amount: number) => {
    if (type === 'Sale') return '#ef4444';
    if (amount > 0) return '#10b981';
    if (amount < 0) return '#ef4444';
    return 'var(--text-main)';
  };

  const filteredHistory = history.filter(item => {
    const matchesType = typeFilter === 'All' || item.type === typeFilter;
    const matchesSearch = item.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.reason?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="animate-slide-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '48px' }}>
        <div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: '8px' }}>Inventory Ledger</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 500 }}>Comprehensive audit trail of global stock movements</p>
        </div>
      </div>

      <div className="table-container" style={{ border: 'none', boxShadow: 'var(--shadow-premium)' }}>
        <div style={{ padding: '24px 32px', background: '#fff', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px' }}>
          <div style={{ display: 'flex', gap: '16px', flex: 1 }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
              <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-sidebar)', opacity: 0.6 }} />
              <input 
                type="text" 
                placeholder="Filter by product, order ID, or reason..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', height: '48px', padding: '0 16px 0 48px', borderRadius: '14px', border: '1px solid var(--border-strong)', background: '#f8fafc', fontWeight: 600 }}
              />
            </div>
            
            <select 
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              style={{ padding: '0 16px', height: '48px', borderRadius: '14px', border: '1px solid var(--border-strong)', background: '#fff', fontWeight: 700, color: 'var(--primary)', outline: 'none' }}
            >
              <option value="All">All Movements</option>
              <option value="Sale">Sales Only</option>
              <option value="Restock">Restocks Only</option>
              <option value="Adjustment">Adjustments</option>
              <option value="Void">Voids / Returns</option>
            </select>
          </div>

          {(isSystemAdmin || currentUser?.role === 'admin') && (
            <select 
              value={selectedShopId}
              onChange={(e) => {
                setSelectedShopId(e.target.value);
                localStorage.setItem('selectedShopId', e.target.value);
              }}
              style={{ height: '48px', padding: '0 20px', borderRadius: '14px', border: '1px solid var(--border-strong)', fontWeight: 800, color: 'var(--primary)' }}
            >
              <option value="">Global Network View</option>
              {shops.map(shop => <option key={shop.id} value={shop.id}>{shop.name}</option>)}
            </select>
          )}
        </div>

        {loading ? (
          <div style={{ padding: '100px', textAlign: 'center' }}>
            <div className="spinner" style={{ margin: '0 auto 24px' }}></div>
            <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Retrieving chronological stock logs...</p>
          </div>
        ) : (
          <table style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr>
                <th style={{ paddingLeft: '32px' }}>Execution Date</th>
                <th>Product Information</th>
                <th>Movement Vector</th>
                <th>Quantity Shift</th>
                <th>Justification / Context</th>
                <th style={{ textAlign: 'right', paddingRight: '32px' }}>Operator</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map((item) => (
                <tr key={item.id} className="directory-row">
                  <td style={{ paddingLeft: '32px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{new Date(item.created_at).toLocaleDateString()}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{new Date(item.created_at).toLocaleTimeString()}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Package size={20} color="var(--primary)" />
                      </div>
                      <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>{item.product_name}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ padding: '6px', borderRadius: '8px', background: '#f8fafc', border: '1px solid var(--border-strong)' }}>
                        {getMovementIcon(item.type)}
                      </div>
                      <span style={{ fontWeight: 800, fontSize: '0.8rem', letterSpacing: '0.04em' }}>{item.type.toUpperCase()}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ 
                      fontSize: '1.1rem', fontWeight: 900, 
                      color: getMovementColor(item.type, item.change_amount)
                    }}>
                      {item.change_amount > 0 ? '+' : ''}{item.change_amount}
                    </div>
                  </td>
                  <td style={{ maxWidth: '300px' }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>{item.reason || 'No context provided'}</p>
                  </td>
                  <td style={{ textAlign: 'right', paddingRight: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                      <User size={14} color="var(--text-sidebar)" />
                      <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{item.created_by || 'Auto-System'}</span>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredHistory.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '100px', color: 'var(--text-muted)' }}>
                    <History size={48} style={{ opacity: 0.1, margin: '0 auto 20px' }} />
                    <p style={{ fontWeight: 600 }}>No stock movement protocols detected.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default StockHistory;
