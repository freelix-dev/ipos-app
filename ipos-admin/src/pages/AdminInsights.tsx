import React, { useState, useEffect } from 'react';
import { 
  Users, 
  TrendingUp, 
  ShoppingBag, 
  Target,
  BarChart2,
  PieChart as PieIcon,
  RefreshCw,
  Crown
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
import { api } from '../services/api';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const AdminInsights = () => {
  const [stats, setStats] = useState<any>({
    totalShops: 0,
    globalVolume: [],
    topShops: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGlobalStats();
  }, []);

  const fetchGlobalStats = async () => {
    try {
      setLoading(true);
      const data = await api.getGlobalStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch global stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'LAK') => {
    const symbol = currency === 'THB' ? '฿' : (currency === 'USD' ? '$' : '');
    const formatted = new Intl.NumberFormat('lo-LA', { style: 'decimal', minimumFractionDigits: 0 }).format(amount || 0);
    const suffix = currency === 'LAK' || !currency ? ' ₭' : '';
    return `${symbol}${formatted}${suffix}`;
  };

  const StatCard = ({ title, value, icon, color, label }: any) => (
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
        <h3 style={{ fontSize: '1.75rem', marginTop: '6px', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>{value}</h3>
        {label && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px', fontWeight: 700 }}>{label}</p>}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <RefreshCw className="animate-spin" size={48} color="var(--primary)" />
      </div>
    );
  }

  return (
    <div className="animate-slide-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '48px' }}>
        <div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 900, letterSpacing: '-0.04em', color: 'var(--text-main)', marginBottom: '8px' }}>ຂໍ້ມູນເຄືອຂ່າຍອັດສະລິຍະ</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 500 }}>ການວິເຄາະລະບົບນິເວດທີ່ຄົບຖ້ວນ ແລະ ຕົວຊີ້ວັດປະສິດທິພາບ</p>
        </div>
        <button onClick={fetchGlobalStats} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <RefreshCw size={20} />
          <span>ໂຫຼດຂໍ້ມູນໃໝ່</span>
        </button>
      </div>

      <div className="stats-grid">
        <StatCard 
          title="ຄູ່ຮ່ວມງານທີ່ເຄື່ອນໄຫວ" 
          value={stats.totalShops} 
          icon={<Users size={24} />} 
          color="#10b981" 
          label="ຫົວໜ່ວຍທຸລະກິດທີ່ລົງທະບຽນ"
        />
        {stats.globalVolume.map((v: any, i: number) => (
          <StatCard 
            key={i}
            title={`ບໍລິມາດ 30 ວັນ (${v.currency})`} 
            value={formatCurrency(v.revenue, v.currency)} 
            icon={<TrendingUp size={24} />} 
            color="#3b82f6" 
            label={`${v.count} ທຸລະກຳທີ່ດຳເນີນການແລ້ວ`}
          />
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginTop: '40px' }}>
        {/* Top Performing Shops */}
        <div className="card-premium" style={{ background: '#fff', borderRadius: '32px', padding: '40px', boxShadow: 'var(--shadow-premium)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 900 }}>ຄູ່ຮ່ວມງານທີ່ເຕີບໂຕສູງສຸດ</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>ຈັດອັນດັບຕາມບໍລິມາດທຸລະກຳ</p>
            </div>
            <Crown size={24} color="#f59e0b" />
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {stats.topShops.map((shop: any, i: number) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', background: '#f8fafc', borderRadius: '20px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div style={{ width: '40px', height: '40px', background: 'var(--primary)', color: '#fff', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 900 }}>
                    {i + 1}
                  </div>
                  <div>
                    <p style={{ fontWeight: 800, fontSize: '1.05rem' }}>{shop.name}</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{shop.orderCount} ອໍເດີທີ່ດຳເນີນການແລ້ວ</p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontWeight: 900, color: 'var(--primary)' }}>{formatCurrency(shop.totalRevenue, shop.currency)}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>ບໍລິມາດລວມ</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Global Volume Chart */}
        <div className="card-premium" style={{ background: '#fff', borderRadius: '32px', padding: '40px', boxShadow: 'var(--shadow-premium)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 900 }}>ບໍລິມາດເຄືອຂ່າຍ (LAK)</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>ແນວໂນ້ມປະສິດທິພາບໂດຍລວມ</p>
            </div>
            <BarChart2 size={24} color="var(--primary)" />
          </div>
          
          <div style={{ width: '100%', height: '350px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.globalVolume.filter((v: any) => v.currency === 'LAK')}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="currency" hide />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                  formatter={(value: any) => formatCurrency(value)}
                />
                <Bar dataKey="revenue" fill="var(--primary)" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminInsights;
