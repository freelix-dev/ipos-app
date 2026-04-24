import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  Package, 
  ArrowUpRight, 
  ArrowDownRight,
  Plus,
  Shield,
  Database
} from 'lucide-react';
import { api, IMAGE_BASE_URL } from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalSales: 0,
    ordersCount: 0,
    productsCount: 0,
    pendingOrders: 0
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [shops, setShops] = useState<any[]>([]);
  const [selectedShopId, setSelectedShopId] = useState('');

  const userJson = localStorage.getItem('user');
  const currentUser = userJson ? JSON.parse(userJson) : null;
  const isSystemAdmin = currentUser && !currentUser.shop_id && !currentUser.owner_id;

  useEffect(() => {
    loadShops();
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [selectedShopId]);

  const loadShops = async () => {
    try {
      const data = await api.getShops(isSystemAdmin ? undefined : (currentUser?.owner_id || currentUser?.id));
      setShops(data);
    } catch (error) {
      console.error('Failed to load shops:', error);
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [orders, products] = await Promise.all([
        api.getOrders(isSystemAdmin ? selectedShopId : (selectedShopId || currentUser?.shop_id)),
        api.getProducts(isSystemAdmin ? selectedShopId : (selectedShopId || currentUser?.shop_id))
      ]);

      const totalSales = orders.reduce((sum: number, order: any) => 
        order.status === 'Completed' ? sum + parseFloat(order.total) : sum, 0
      );
      
      const pending = orders.filter((o: any) => o.status === 'Pending').length;

      setStats({
        totalSales,
        ordersCount: orders.length,
        productsCount: products.length,
        pendingOrders: pending
      });

      setRecentOrders(orders.slice(0, 6));
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('lo-LA', { style: 'currency', currency: 'LAK', maximumFractionDigits: 0 }).format(amount);
  };

  const StatCard = ({ title, value, icon, trend, color, label }: any) => (
    <div className="stat-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ 
          background: `${color}15`, 
          padding: '14px', 
          borderRadius: '16px', 
          color: color,
          boxShadow: `0 8px 16px ${color}10`
        }}>
          {icon}
        </div>
        {trend && (
          <div style={{ 
            display: 'flex', alignItems: 'center', gap: '4px', 
            color: trend > 0 ? '#10b981' : '#ef4444', 
            fontSize: '0.8rem', fontWeight: 800,
            background: trend > 0 ? '#10b98110' : '#ef444410',
            padding: '6px 10px', borderRadius: '12px'
          }}>
            {trend > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div style={{ marginTop: '24px' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{title}</p>
        <h3 style={{ fontSize: '1.75rem', marginTop: '6px', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>{value}</h3>
        {label && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>{label}</p>}
      </div>
    </div>
  );

  return (
    <div className="animate-slide-up">
      <div style={{ marginBottom: '48px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 900, letterSpacing: '-0.04em', color: 'var(--text-main)', marginBottom: '8px' }}>Store Intelligence</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 500 }}>Real-time performance metrics and operational tracing</p>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          {/* Current Shop Logo Display */}
          {selectedShopId && shops.find(s => s.id === selectedShopId)?.logoPath && (
            <img 
              src={`${IMAGE_BASE_URL}${shops.find(s => s.id === selectedShopId)?.logoPath}`} 
              alt="Shop Logo" 
              style={{ width: '50px', height: '50px', borderRadius: '14px', objectFit: 'cover', border: '1px solid var(--border-strong)' }} 
            />
          )}

          {/* Shop Selector for System Admin & Owners */}
          {(isSystemAdmin || (currentUser?.role === 'admin')) && (
            <div style={{ position: 'relative', width: '220px' }}>
              <select 
                value={selectedShopId}
                onChange={(e) => setSelectedShopId(e.target.value)}
                style={{ 
                  width: '100%', height: '50px', padding: '0 40px 0 16px', 
                  borderRadius: '16px', border: '1px solid var(--border-strong)', 
                  background: '#fff', fontSize: '0.9rem', fontWeight: 800,
                  appearance: 'none', cursor: 'pointer', outline: 'none',
                  color: 'var(--primary)', boxShadow: 'var(--shadow-sm)'
                }}
              >
                <option value="">{isSystemAdmin ? 'All Branches' : 'Current Store'}</option>
                {shops.map(shop => (
                  <option key={shop.id} value={shop.id}>{shop.name}</option>
                ))}
              </select>
            </div>
          )}
          
          <div style={{ background: '#fff', padding: '12px 24px', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-strong)', display: 'flex', alignItems: 'center', gap: '12px', height: '50px' }}>
            <div className="pulse-dot"></div>
            <span style={{ fontWeight: 800, fontSize: '0.95rem', letterSpacing: '0.02em', color: 'var(--text-main)' }}>SYSTEM ONLINE</span>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard 
          title="Total Revenue" 
          value={formatCurrency(stats.totalSales)} 
          icon={<TrendingUp size={24} />} 
          trend={12.5} 
          color="#10b981" 
          label="GROSS SETTLEMENT (30D)"
        />
        <StatCard 
          title="Orders Trace" 
          value={stats.ordersCount} 
          icon={<ShoppingBag size={24} />} 
          trend={8.2} 
          color="#3b82f6" 
          label="LIFETIME TRANSACTIONS"
        />
        <StatCard 
          title="Active Inventory" 
          value={stats.productsCount} 
          icon={<Package size={24} />} 
          color="#f59e0b" 
          label="SKUs IN CORE CATALOG"
        />
        <StatCard 
          title="Sync Latency" 
          value={stats.pendingOrders} 
          icon={<Users size={24} />} 
          color="#ef4444" 
          label="PENDING CLOUD BACKUP"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '32px', marginTop: '40px' }}>
        <div className="table-container" style={{ border: 'none', boxShadow: 'var(--shadow-premium)' }}>
          <div style={{ padding: '28px 32px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff' }}>
            <div>
              <h3 style={{ fontWeight: 900, fontSize: '1.3rem', letterSpacing: '-0.02em' }}>Audit Trail</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '4px' }}>LATEST OPERATIONAL LOGS</p>
            </div>
            <button className="btn-primary" style={{ padding: '10px 20px', fontSize: '0.85rem', background: '#fff', color: 'var(--text-main)', border: '1px solid var(--border-strong)', boxShadow: 'var(--shadow-sm)' }}>
              VIEW ALL LOGS
            </button>
          </div>
          {loading ? (
            <div style={{ padding: '80px', textAlign: 'center' }}>
              <div className="spinner" style={{ margin: '0 auto' }}></div>
            </div>
          ) : (
            <table style={{ border: 'none' }}>
              <thead>
                <tr>
                  <th style={{ paddingLeft: '32px' }}>Tracing ID</th>
                  <th>Execution Delay</th>
                  <th>Valuation</th>
                  <th style={{ textAlign: 'right', paddingRight: '32px' }}>Process State</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="directory-row">
                    <td style={{ paddingLeft: '32px' }}>
                      <div style={{ background: 'var(--bg-main)', padding: '6px 12px', borderRadius: '8px', display: 'inline-block', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '0.05em', border: '1px solid var(--border-strong)', fontSize: '0.85rem' }}>
                        #{order.order_no || order.id.substring(0, 8).toUpperCase()}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.9rem' }}>{new Date(order.date).toLocaleDateString('en-GB')}</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800 }}>{new Date(order.date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </td>
                    <td style={{ fontWeight: 900, color: 'var(--primary)', fontSize: '1.05rem' }}>{formatCurrency(order.total)}</td>
                    <td style={{ textAlign: 'right', paddingRight: '32px' }}>
                      <span className={`badge ${
                        order.status === 'Completed' ? 'badge-success' : 
                        order.status === 'Pending' ? 'badge-warning' : 'badge-danger'
                      }`}>
                        {order.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div className="card-premium" style={{ padding: '32px' }}>
            <h3 style={{ marginBottom: '24px', fontWeight: 900, fontSize: '1.2rem', letterSpacing: '-0.02em' }}>Quick Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button className="btn-action" onClick={() => window.location.href='/products/add'}>
                <Plus size={18} />
                <span>Publish New Product</span>
              </button>
              <button className="btn-action" onClick={() => window.location.href='/stock'}>
                <Package size={18} />
                <span>Audit Inventory</span>
              </button>
              <button className="btn-action">
                <TrendingUp size={18} />
                <span>Download Report</span>
              </button>
            </div>
          </div>
          
          <div style={{ 
            padding: '36px', borderRadius: '32px', 
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', 
            color: '#fff', position: 'relative', overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.5)',
            border: '1px solid rgba(255,255,255,0.05)'
          }}>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ background: 'rgba(255,255,255,0.1)', padding: '14px', borderRadius: '18px', display: 'inline-flex', marginBottom: '24px', backdropFilter: 'blur(10px)' }}>
                <Shield size={26} color="#10b981" />
              </div>
              <h4 style={{ fontSize: '1.4rem', fontWeight: 900, letterSpacing: '-0.01em' }}>Security Vault</h4>
              <p style={{ fontSize: '0.95rem', opacity: 0.6, marginTop: '12px', lineHeight: 1.7, fontWeight: 500 }}>
                High-level synchronization enabled. {stats.pendingOrders} local operations are awaiting cloud validation.
              </p>
              <button className="btn-primary" style={{ 
                marginTop: '32px', width: '100%', padding: '18px', borderRadius: '18px', 
                border: 'none', background: 'var(--primary)', color: '#fff', fontWeight: 900,
                cursor: 'pointer', transition: 'var(--transition)', letterSpacing: '0.02em',
                boxShadow: '0 10px 20px rgba(16, 185, 129, 0.3)'
              }}>
                TRIGGER CLOUD SYNC
              </button>
            </div>
            <div style={{ position: 'absolute', bottom: '-40px', right: '-40px', opacity: 0.03 }}>
              <Database size={240} />
            </div>
          </div>
        </div>
      </div>
      
      <style>{`
        .btn-action {
          display: flex;
          align-items: center;
          gap: 14px;
          width: 100%;
          padding: 18px 24px;
          border-radius: 18px;
          border: 1px solid var(--border);
          background: #f8fafc;
          color: var(--text-main);
          font-weight: 800;
          cursor: pointer;
          transition: var(--transition);
          text-align: left;
          font-size: 0.95rem;
        }
        .btn-action:hover {
          background: #fff;
          border-color: var(--primary);
          color: var(--primary);
          transform: translateX(6px);
          box-shadow: var(--shadow-md);
        }
        .pulse-dot {
          width: 12px; height: 12px; border-radius: 50%; background: #10b981;
          box-shadow: 0 0 0 rgba(16, 185, 129, 0.4);
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
          100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
        .directory-row td { transition: var(--transition); }
        .directory-row:hover td { background: #fcfdfe; }
        .spinner { width: 44px; height: 44px; border: 4px solid #f1f5f9; border-top: 4px solid var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};


export default Dashboard;
