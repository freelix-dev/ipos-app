import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  Package, 
  ArrowUpRight, 
  ArrowDownRight,
  Plus,
  Shield,
  Database,
  Calendar,
  CreditCard,
  Target,
  AlertTriangle,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { api, IMAGE_BASE_URL } from '../services/api';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>({
    salesOverTime: [],
    paymentDistribution: [],
    summary: [], // Changed to array for multi-currency support
    topProducts: []
  });
  const [expenses, setExpenses] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);
  const [rates, setRates] = useState<any>({ thb: 750, usd: 25000 }); // Default fallback
  const [loading, setLoading] = useState(true);
  const [shops, setShops] = useState<any[]>([]);
  const [selectedShopId, setSelectedShopId] = useState(() => localStorage.getItem('selectedShopId') || '');
  const [activeCurrency, setActiveCurrency] = useState('LAK');

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
      const effectiveShopId = selectedShopId || undefined;
      const [visualStats, orders, lowStock, expenseData, rateData] = await Promise.all([
        api.getDashboardStats(effectiveShopId),
        api.getOrders(effectiveShopId),
        api.getLowStock(effectiveShopId),
        effectiveShopId ? api.getExpenses(effectiveShopId) : api.getExpenses(''), // Fetch all if no shop
        api.getExchangeRates(effectiveShopId)
      ]);

      setStats(visualStats);
      setRecentOrders(orders.slice(0, 6));
      setLowStockProducts(lowStock.slice(0, 5));
      setExpenses(expenseData);
      if (rateData) setRates(rateData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
  
  // Convert all revenues to LAK for a unified Net Profit estimate
  const totalRevenueInLAK = Array.isArray(stats.summary) ? stats.summary.reduce((sum: number, s: any) => {
    const amount = Number(s.totalRevenue) || 0;
    if (s.currency === 'THB') return sum + (amount * (rates.thb || 1));
    if (s.currency === 'USD') return sum + (amount * (rates.usd || 1));
    return sum + amount;
  }, 0) : 0;

  const netProfit = totalRevenueInLAK - totalExpense;

  const formatCurrency = (amount: number, currency: string = 'LAK') => {
    const symbol = currency === 'THB' ? '฿' : (currency === 'USD' ? '$' : '');
    const formatted = new Intl.NumberFormat('lo-LA', { style: 'decimal', minimumFractionDigits: 0 }).format(amount || 0);
    const suffix = currency === 'LAK' || !currency ? ' ₭' : '';
    return `${symbol}${formatted}${suffix}`;
  };

  const StatCard = ({ title, values, icon, color, label }: any) => (
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
      </div>
      <div style={{ marginTop: '24px' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{title}</p>
        <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {Array.isArray(values) ? values.map((v: any, i: number) => (
            <h3 key={i} style={{ fontSize: v.isMain ? '1.75rem' : '1.1rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              {v.amount}
            </h3>
          )) : (
            <h3 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>{values}</h3>
          )}
        </div>
        {label && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px', fontWeight: 700 }}>{label}</p>}
      </div>
    </div>
  );

  return (
    <div className="animate-slide-up">
      {lowStockProducts.length > 0 && (
        <div style={{ 
          background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '24px', 
          padding: '24px 32px', marginBottom: '40px', display: 'flex', 
          justifyContent: 'space-between', alignItems: 'center',
          boxShadow: '0 10px 15px -3px rgba(239, 68, 68, 0.1)'
        }}>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <div style={{ background: '#ef4444', color: '#fff', padding: '12px', borderRadius: '14px' }}>
              <AlertTriangle size={24} />
            </div>
            <div>
              <h4 style={{ fontWeight: 900, color: '#991b1b', fontSize: '1.1rem' }}>ແຈ້ງເຕືອນສະຕັອກ: {lowStockProducts.length} ລາຍການຕ່ຳ</h4>
              <p style={{ color: '#b91c1c', fontSize: '0.9rem', fontWeight: 600 }}>ກວດພົບລະດັບສະຕັອກທີ່ວິກິດໃນ {selectedShopId ? 'ສາຂານີ້' : 'ຫຼາຍສາຂາ'}.</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {lowStockProducts.slice(0, 3).map((p, i) => (
              <div key={i} style={{ background: '#fff', padding: '8px 16px', borderRadius: '12px', border: '1px solid #fee2e2', fontSize: '0.8rem', fontWeight: 800, color: '#991b1b' }}>
                {p.name}: <span style={{ color: '#ef4444' }}>ຍັງເຫຼືອ {p.stock}</span>
              </div>
            ))}
            <button 
              onClick={() => window.location.href='/stock'}
              style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              ເຕີມສະຕັອກດຽວນີ້ <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      <div style={{ marginBottom: '48px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 900, letterSpacing: '-0.04em', color: 'var(--text-main)', marginBottom: '8px' }}>ພາບລວມບໍລິຫານ</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 500 }}>ການວິເຄາະຂັ້ນສູງ ແລະ ການສະແດງຜົນປະສິດທິພາບ</p>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          {(isSystemAdmin || (currentUser?.role === 'admin')) && (
            <select 
              value={selectedShopId}
              onChange={(e) => {
                setSelectedShopId(e.target.value);
                localStorage.setItem('selectedShopId', e.target.value);
              }}
              className="input-premium"
              style={{ width: '220px', fontWeight: 800, color: 'var(--primary)' }}
            >
              <option value="">{isSystemAdmin ? 'ທຸກສາຂາ' : 'ຮ້ານປະຈຸບັນ'}</option>
              {shops.map(shop => <option key={shop.id} value={shop.id}>{shop.name}</option>)}
            </select>
          )}
          <div style={{ background: '#fff', padding: '12px 24px', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-strong)', display: 'flex', alignItems: 'center', gap: '12px', height: '50px' }}>
            <div className="pulse-dot"></div>
            <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-main)' }}>ຂໍ້ມູນສົດ</span>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard 
          title="ລາຍຮັບມື້ນີ້" 
          values={(stats.summary || []).map((s: any) => ({ 
            amount: formatCurrency(s.todayRevenue, s.currency), 
            isMain: s.currency === 'LAK' 
          }))} 
          icon={<TrendingUp size={24} />} 
          color="#10b981" 
          label="ການຊຳລະເງິນແບບສົດໆ"
        />
        <StatCard 
          title="ອໍເດີມື້ນີ້" 
          values={(stats.summary || []).reduce((sum: number, s: any) => sum + s.todayOrders, 0)} 
          icon={<ShoppingBag size={24} />} 
          color="#3b82f6" 
          label="ທຸລະກຳທີ່ສຳເລັດ"
        />
        <StatCard 
          title="ບໍລິມາດລວມ" 
          values={(stats.summary || []).map((s: any) => ({ 
            amount: formatCurrency(s.totalRevenue, s.currency), 
            isMain: s.currency === 'LAK' 
          }))} 
          icon={<Package size={24} />} 
          color="#3b82f6" 
          label="ມູນຄ່າສິນຄ້າລວມ"
        />
        <StatCard 
          title="ຄ່າໃຊ້ຈ່າຍທັງໝົດ" 
          values={formatCurrency(totalExpense)} 
          icon={<CreditCard size={24} />} 
          color="#ef4444" 
          label="ຄ່າໃຊ້ຈ່າຍໃນການດຳເນີນງານ"
        />
        <StatCard 
          title="ກຳໄລສຸດທິ (ປະມານ LAK)" 
          values={formatCurrency(netProfit)} 
          icon={<Target size={24} />} 
          color={netProfit >= 0 ? "#10b981" : "#ef4444"}
          label="ລາຍໄດ້ສຸດທິທີ່ປັບປຸງແລ້ວ"
        />
      </div>

      {/* Main Revenue Chart */}
      <div className="card-premium" style={{ background: '#fff', borderRadius: '32px', padding: '40px', marginTop: '40px', boxShadow: 'var(--shadow-premium)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 900 }}>ຄວາມໄວຂອງລາຍຮັບ ({activeCurrency})</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>ແນວໂນ້ມກະແສເງິນສົດສຳລັບ {activeCurrency} ໃນ 30 ວັນຜ່ານມາ</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            {['LAK', 'THB', 'USD'].map(curr => (
              <button 
                key={curr}
                onClick={() => setActiveCurrency(curr)}
                style={{ 
                  padding: '8px 16px', borderRadius: '12px', fontWeight: 800, fontSize: '0.85rem',
                  border: '1px solid var(--border)', cursor: 'pointer',
                  background: activeCurrency === curr ? 'var(--primary)' : '#fff',
                  color: activeCurrency === curr ? '#fff' : 'var(--text-muted)',
                  transition: 'all 0.3s ease'
                }}
              >
                {curr}
              </button>
            ))}
          </div>
        </div>
        
        <div style={{ width: '100%', height: '350px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.salesOverTime?.filter((d: any) => d.currency === activeCurrency)}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }}
                tickFormatter={(val: string) => new Date(val).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }}
                tickFormatter={(val: number) => (val / 1000) + 'k'}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontWeight: 800 }}
                formatter={(val: any) => [formatCurrency(Number(val) || 0), 'Revenue']}
              />
              <Area type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={4} fillOpacity={1} fill="url(#colorRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px', marginTop: '40px' }}>
        {/* Category Distribution */}
        <div className="card-premium" style={{ background: '#fff', borderRadius: '32px', padding: '40px', boxShadow: 'var(--shadow-premium)' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Database size={20} color="var(--primary)" />
            ສະຕັອກຕາມໝວດໝູ່
          </h3>
          <div style={{ width: '100%', height: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.categoryDistribution}
                  cx="50%" cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="name"
                >
                  {stats.categoryDistribution?.map((_: any, index: number) => (
                    <Cell key={`cell-cat-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Supplier Distribution */}
        <div className="card-premium" style={{ background: '#fff', borderRadius: '32px', padding: '40px', boxShadow: 'var(--shadow-premium)' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Shield size={20} color="var(--primary)" />
            ການແຈກຢາຍຜູ້ສະໜອງ
          </h3>
          <div style={{ width: '100%', height: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.supplierDistribution}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 700 }}
                />
                <YAxis hide />
                <Tooltip cursor={{fill: '#f8fafc'}} />
                <Bar dataKey="count" fill="#10b981" radius={[8, 8, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px', marginTop: '40px' }}>
        {/* Settlement Mix */}
        <div className="card-premium" style={{ background: '#fff', borderRadius: '32px', padding: '40px', boxShadow: 'var(--shadow-premium)' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <CreditCard size={20} color="var(--primary)" />
            ຮູບແບບການຊຳລະເງິນ
          </h3>
          <div style={{ width: '100%', height: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.paymentDistribution}
                  cx="50%" cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  nameKey="paymentMethod"
                >
                  {stats.paymentDistribution?.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products */}
        <div className="card-premium" style={{ background: '#fff', borderRadius: '32px', padding: '40px', boxShadow: 'var(--shadow-premium)' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Package size={20} color="var(--primary)" />
            ສິນຄ້າທີ່ຂາຍດີທີ່ສຸດ
          </h3>
          <div style={{ width: '100%', height: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.topProducts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  width={120}
                  tick={{ fontSize: 11, fontWeight: 800, fill: '#334155' }}
                />
                <Tooltip cursor={{fill: '#f8fafc'}} />
                <Bar dataKey="quantity" fill="var(--primary)" radius={[0, 8, 8, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="table-container" style={{ marginTop: '40px', border: 'none', boxShadow: 'var(--shadow-premium)' }}>
        <div style={{ padding: '28px 32px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff' }}>
          <div>
            <h3 style={{ fontWeight: 900, fontSize: '1.3rem', letterSpacing: '-0.02em' }}>ຕິດຕາມທຸລະກຳສົດ</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '4px' }}>ຂໍ້ມູນສົດຈາກເຄື່ອງຂາຍທີ່ເຊື່ອມຕໍ່</p>
          </div>
        </div>
        <table style={{ border: 'none' }}>
          <thead>
            <tr>
              <th style={{ paddingLeft: '32px' }}>ລະຫັດຕິດຕາມ</th>
              <th>ເວລາທີ່ດຳເນີນການ</th>
              <th>ມູນຄ່າ</th>
              <th style={{ textAlign: 'right', paddingRight: '32px' }}>ສະຖານະການດຳເນີນງານ</th>
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
                    {order.status === 'Completed' ? 'ສຳເລັດ' : 
                    order.status === 'Pending' ? 'ຍັງຄ້າງ' : 'ຍົກເລີກ'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '40px' }}>
        {/* Low Stock Alert */}
        <div className="card-premium" style={{ background: '#fff', borderRadius: '32px', padding: '40px', boxShadow: 'var(--shadow-premium)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '12px' }}>
              <AlertCircle size={20} color="#ef4444" />
              ແຈ້ງເຕືອນຄວາມໄວສະຕັອກ
            </h3>
            <span style={{ background: '#fee2e2', color: '#ef4444', padding: '6px 12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800 }}>ການເຕີມສິນຄ້າທີ່ວິກິດ</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {lowStockProducts.slice(0, 8).map((product: any) => (
              <div key={product.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: '#f8fafc', borderRadius: '16px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                   <div style={{ width: '40px', height: '40px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Package size={20} color="#ef4444" />
                  </div>
                  <div>
                    <p style={{ fontWeight: 800, fontSize: '0.95rem' }}>{product.name}</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>ສະຕັອກ: {product.stock} {product.unit}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <style>{`
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
      `}</style>
    </div>
  );
};

export default Dashboard;
