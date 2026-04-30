import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  XCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ChevronFirst,
  ChevronLast,
  ShoppingCart,
  Clock,
  User,
  Hash,
  MoreHorizontal,
  TrendingUp
} from 'lucide-react';
import { api } from '../services/api';

const Orders = () => {
  const [filter, setFilter] = useState('All');
  const [orders, setOrders] = useState<any[]>([]);
  const [shops, setShops] = useState<any[]>([]);
  const [selectedShopId, setSelectedShopId] = useState(() => localStorage.getItem('selectedShopId') || '');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Void & View States
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showVoidModal, setShowVoidModal] = useState(false);
  const [voidReason, setVoidReason] = useState('');
  const [isVoiding, setIsVoiding] = useState(false);

  const userJson = localStorage.getItem('user');
  const currentUser = userJson ? JSON.parse(userJson) : null;
  const isSystemAdmin = currentUser && !currentUser.shop_id;

  useEffect(() => {
    loadShops();
    loadOrders();
  }, [selectedShopId]);

  const loadShops = async () => {
    try {
      const data = await api.getShops(isSystemAdmin ? undefined : (currentUser?.owner_id || currentUser?.id));
      setShops(data);
    } catch (error) {
      console.error('Failed to load shops:', error);
    }
  };

  const loadOrders = async () => {
    try {
      setLoading(true);
      const isOwner = currentUser?.role === 'admin' && !currentUser?.owner_id;
      const effectiveShopId = (isSystemAdmin || isOwner) ? selectedShopId : (selectedShopId || currentUser?.shop_id);
      const data = await api.getOrders(effectiveShopId || undefined);
      setOrders(data);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVoid = async () => {
    if (!selectedOrder || !voidReason.trim()) return;
    try {
      setIsVoiding(true);
      await api.voidOrder(selectedOrder.id, voidReason);
      setShowVoidModal(false);
      setVoidReason('');
      setSelectedOrder(null);
      loadOrders();
      alert('ຍົກເລີກການສັ່ງຊື້ ແລະ ຄືນສະຕັອກສິນຄ້າສຳເລັດແລ້ວ.');
    } catch (error: any) {
      alert(error.message || 'ບໍ່ສາມາດຍົກເລີກການສັ່ງຊື້ໄດ້');
    } finally {
      setIsVoiding(false);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'LAK') => {
    return new Intl.NumberFormat('lo-LA', { style: 'currency', currency }).format(amount);
  };

  const safeParseItems = (itemsJson: any) => {
    if (!itemsJson) return [];
    if (typeof itemsJson !== 'string') return itemsJson; // Already an object/array
    try {
      return JSON.parse(itemsJson);
    } catch (e) {
      console.error('Failed to parse itemsJson:', e);
      return [];
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesFilter = filter === 'All' || o.status === filter;
    const matchesSearch = o.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (o.remark && o.remark.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Date Filtering
    const orderDate = new Date(o.date).setHours(0, 0, 0, 0);
    const start = startDate ? new Date(startDate).setHours(0, 0, 0, 0) : null;
    const end = endDate ? new Date(endDate).setHours(0, 0, 0, 0) : null;
    
    const matchesDate = (!start || orderDate >= start) && (!end || orderDate <= end);
    
    return matchesFilter && matchesSearch && matchesDate;
  });

  const totalItems = filteredOrders.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);

  // Quick Stats Calculations
  const completedOrders = filteredOrders.filter(o => o.status === 'Completed');
  const cancelledOrders = filteredOrders.filter(o => o.status === 'Cancelled');
  
  const totalRevenue = completedOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const avgOrderValue = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;
  const voidRate = filteredOrders.length > 0 ? (cancelledOrders.length / filteredOrders.length) * 100 : 0;
  
  const stats = [
    { label: 'ລາຍຮັບທັງໝົດ', value: formatCurrency(totalRevenue), icon: <TrendingUp size={24} />, color: '#10b981', bg: '#10b98115' },
    { label: 'ຈຳນວນລາຍການສັ່ງຊື້', value: filteredOrders.length.toString(), icon: <ShoppingCart size={24} />, color: '#3b82f6', bg: '#3b82f615' },
    { label: 'ຍອດຂາຍສະເລ່ຍຕໍ່ບິນ', value: formatCurrency(avgOrderValue), icon: <Hash size={24} />, color: '#6366f1', bg: '#6366f115' },
    { label: 'ອັດຕາການຍົກເລີກ', value: `${voidRate.toFixed(1)}%`, icon: <XCircle size={24} />, color: '#ef4444', bg: '#ef444415' },
  ];

  return (
    <div className="animate-slide-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '48px' }}>
        <div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: '8px', color: 'var(--text-main)' }}>ບັນທຶກທຸລະກຳ</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 500 }}>ຕິດຕາມ ແລະ ກວດສອບການຂາຍທັງໝົດ</p>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button className="btn-primary" style={{ background: '#fff', color: 'var(--text-main)', border: '1px solid var(--border-strong)', boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Download size={20} />
            <span>ສົ່ງອອກຂໍ້ມູນການວິເຄາະ</span>
          </button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        {stats.map((stat, i) => (
          <div key={i} style={{ 
            background: '#fff', padding: '24px', borderRadius: '24px', 
            boxShadow: 'var(--shadow-premium)', border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', gap: '20px',
            transition: 'transform 0.3s ease'
          }} className="stat-card-hover">
            <div style={{ 
              width: '56px', height: '56px', borderRadius: '18px', 
              background: stat.bg, color: stat.color, 
              display: 'flex', alignItems: 'center', justifyContent: 'center' 
            }}>
              {stat.icon}
            </div>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>{stat.label}</p>
              <p style={{ color: 'var(--text-main)', fontSize: '1.4rem', fontWeight: 900, letterSpacing: '-0.02em' }}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="table-container" style={{ border: 'none', boxShadow: 'var(--shadow-premium)', display: 'flex', flexDirection: 'column', background: 'transparent' }}>
        {/* Quantum Filter Strip */}
        <div style={{ 
          padding: '24px 32px', 
          background: '#fff', 
          borderBottom: '1px solid var(--border)', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '20px' 
        }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            {/* Search Zone */}
            <div style={{ position: 'relative', flex: 1.5 }}>
              <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-sidebar)', opacity: 0.6 }} />
              <input 
                type="text" 
                placeholder="ຄົ້ນຫາລະຫັດທຸລະກຳ, ໝາຍເຫດ ຫຼື ຂໍ້ມູນລູກຄ້າ..." 
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                style={{ 
                  width: '100%', height: '50px', padding: '0 16px 0 48px', 
                  borderRadius: '16px', border: '1px solid var(--border-strong)', 
                  background: '#f8fafc', fontSize: '0.9rem', fontWeight: 600,
                  transition: 'var(--transition)', outline: 'none'
                }}
                className="filter-input-focus"
              />
            </div>

            {/* Shop Selector for System Admin & Owners */}
            {(isSystemAdmin || (currentUser?.role === 'admin')) && (
              <div style={{ position: 'relative', width: '220px' }}>
                <select 
                  value={selectedShopId}
                  onChange={(e) => {
                    setSelectedShopId(e.target.value);
                    localStorage.setItem('selectedShopId', e.target.value);
                    setCurrentPage(1);
                  }}
                  style={{ 
                    width: '100%', height: '50px', padding: '0 40px 0 16px', 
                    borderRadius: '16px', border: '1px solid var(--border-strong)', 
                    background: '#fff', fontSize: '0.9rem', fontWeight: 800,
                    appearance: 'none', cursor: 'pointer', outline: 'none',
                    color: 'var(--primary)', boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <option value="">ທຸກສາຂາ</option>
                  {shops.map(shop => (
                    <option key={shop.id} value={shop.id}>{shop.name}</option>
                  ))}
                </select>
                <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', opacity: 0.5 }}>
                   <Filter size={16} />
                </div>
              </div>
            )}

            {/* Date Range Module */}
            <div style={{ 
              display: 'flex', alignItems: 'center', background: '#f8fafc', 
              borderRadius: '16px', border: '1px solid var(--border-strong)', 
              padding: '0 16px', height: '50px', gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-sidebar)', letterSpacing: '0.05em' }}>ຈາກ</span>
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  style={{ background: 'transparent', border: 'none', fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)', outline: 'none', width: '135px' }}
                />
              </div>
              <div style={{ width: '1px', height: '20px', background: 'var(--border-strong)' }}></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-sidebar)', letterSpacing: '0.05em' }}>ຮອດ</span>
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  style={{ background: 'transparent', border: 'none', fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)', outline: 'none', width: '135px' }}
                />
              </div>
              {(startDate || endDate) && (
                <button 
                  onClick={() => { setStartDate(''); setEndDate(''); setCurrentPage(1); }}
                  style={{ background: '#fee2e2', color: '#dc2626', border: 'none', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '10px', fontWeight: 900 }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Export Action */}
            <button style={{ 
              height: '50px', padding: '0 20px', borderRadius: '16px', 
              border: '1px solid var(--border-strong)', background: '#fff', 
              color: 'var(--text-main)', display: 'flex', alignItems: 'center', 
              gap: '10px', cursor: 'pointer', fontWeight: 800, fontSize: '0.9rem',
              transition: 'var(--transition)'
            }} className="btn-hover-premium">
              <Download size={18} />
              <span>ສົ່ງອອກ</span>
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '8px', background: '#f1f5f9', padding: '4px', borderRadius: '14px' }}>
              {['ທັງໝົດ', 'ສຳເລັດແລ້ວ', 'ກຳລັງລໍຖ້າ', 'ຍົກເລີກແລ້ວ'].map((t) => (
                <button 
                  key={t}
                  onClick={() => {
                    const mapFilter = (txt: string) => {
                      if (txt === 'ທັງໝົດ') return 'All';
                      if (txt === 'ສຳເລັດແລ້ວ') return 'Completed';
                      if (txt === 'ກຳລັງລໍຖ້າ') return 'Pending';
                      if (txt === 'ຍົກເລີກແລ້ວ') return 'Cancelled';
                      return txt;
                    };
                    setFilter(mapFilter(t));
                    setCurrentPage(1);
                  }}
                  style={{
                    padding: '8px 20px', borderRadius: '11px', border: 'none', cursor: 'pointer',
                    background: (t === 'ທັງໝົດ' && filter === 'All') || 
                               (t === 'ສຳເລັດແລ້ວ' && filter === 'Completed') || 
                               (t === 'ກຳລັງລໍຖ້າ' && filter === 'Pending') || 
                               (t === 'ຍົກເລີກແລ້ວ' && filter === 'Cancelled') ? '#fff' : 'transparent',
                    color: (t === 'ທັງໝົດ' && filter === 'All') || 
                               (t === 'ສຳເລັດແລ້ວ' && filter === 'Completed') || 
                               (t === 'ກຳລັງລໍຖ້າ' && filter === 'Pending') || 
                               (t === 'ຍົກເລີກແລ້ວ' && filter === 'Cancelled') ? 'var(--primary)' : 'var(--text-muted)',
                    fontWeight: 800, fontSize: '0.85rem',
                    boxShadow: (t === 'ທັງໝົດ' && filter === 'All') || 
                               (t === 'ສຳເລັດແລ້ວ' && filter === 'Completed') || 
                               (t === 'ກຳລັງລໍຖ້າ' && filter === 'Pending') || 
                               (t === 'ຍົກເລີກແລ້ວ' && filter === 'Cancelled') ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  {t}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.04em' }}>ຊິງຂໍ້ມູນອັດຕະໂນມັດ</span>
               </div>
               <div style={{ width: '1px', height: '16px', background: 'var(--border-strong)' }}></div>
               <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>{filteredOrders.length} ຜົນລາຍການ</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '100px', textAlign: 'center' }}>
            <div className="spinner" style={{ margin: '0 auto 24px' }}></div>
            <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>ກຳລັງຖອດລະຫັດບັນທຶກທຸລະກຳ...</p>
          </div>
        ) : (
          <>
            <table style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
              <thead>
                <tr>
                  <th style={{ paddingLeft: '32px', width: '220px' }}>ລະຫັດທຸລະກຳ</th>
                  <th>ເວລາທີ່ເຮັດທຸລະກຳ</th>
                  <th>ວິທີການຊຳລະ</th>
                  <th>ຍອດລວມ</th>
                  <th>ສະຖານະລະບົບ</th>
                  <th style={{ textAlign: 'right', paddingRight: '32px' }}>ເບິ່ງລາຍລະອຽດ</th>
                </tr>
              </thead>
              <tbody>
                {currentOrders.map((order) => (
                  <tr key={order.id} className="directory-row">
                    <td style={{ paddingLeft: '32px' }}>
                      <div style={{ 
                        background: 'var(--bg-main)', padding: '6px 12px', borderRadius: '8px', 
                        display: 'inline-block', fontWeight: 900, color: 'var(--text-main)', 
                        letterSpacing: '0.05em', border: '1px solid var(--border-strong)',
                        fontSize: '0.85rem'
                      }}>
                        #{order.id.toUpperCase().substring(0, 12)}
                      </div>
                      {(selectedShopId === '' || isSystemAdmin) && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 800, marginTop: '4px' }}>
                          {order.shop_name}
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.95rem' }}>{new Date(order.date).toLocaleDateString('en-GB')}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{new Date(order.date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: order.paymentMethod === 'cash' ? '#10b981' : '#3b82f6' }}></div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>{order.paymentMethod === 'cash' ? 'ຊຳລະດ້ວຍເງິນສົດ' : 'ໂອນຜ່ານທະນາຄານ'}</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800 }}>ຊ່ອງທາງ {order.currency.toUpperCase()}</span>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontWeight: 900, color: 'var(--primary)', fontSize: '1.1rem' }}>{formatCurrency(order.total, order.currency)}</td>
                    <td>
                      <span className={`badge ${order.status === 'Completed' ? 'badge-success' : order.status === 'Pending' ? 'badge-warning' : order.status === 'Voided' ? 'badge-danger' : 'badge-danger'}`} style={{
                        background: order.status === 'Voided' ? '#fee2e2' : undefined,
                        color: order.status === 'Voided' ? '#ef4444' : undefined,
                        border: order.status === 'Voided' ? '1px solid #fecaca' : undefined
                      }}>
                        {order.status === 'Completed' ? 'ສຳເລັດແລ້ວ' : order.status === 'Voided' ? 'ຍົກເລີກແລ້ວ' : order.status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', paddingRight: '32px' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                        <button 
                          onClick={() => { 
                            console.log('Viewing order:', order);
                            setSelectedOrder(order); 
                            setShowViewModal(true); 
                          }}
                          className="row-action-btn" 
                          style={{ padding: '10px', borderRadius: '12px', border: '1px solid var(--border-strong)', background: '#fff', color: 'var(--text-main)', cursor: 'pointer', transition: 'var(--transition)' }}
                        >
                          <Eye size={18} />
                        </button>
                        {order.status !== 'Voided' && order.status !== 'Cancelled' && (
                          <button 
                            onClick={() => { setSelectedOrder(order); setShowVoidModal(true); }}
                            className="row-action-btn" 
                            style={{ padding: '10px', borderRadius: '12px', border: '1px solid #fee2e2', background: '#fff', color: '#ef4444', cursor: 'pointer', transition: 'var(--transition)' }}
                            title="Void Order"
                          >
                            <XCircle size={18} />
                          </button>
                        )}
                        <button className="row-action-btn" style={{ padding: '10px', borderRadius: '12px', border: '1px solid var(--border-strong)', background: '#fff', color: 'var(--text-main)', cursor: 'pointer', transition: 'var(--transition)' }}>
                          <MoreHorizontal size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Controls */}
            <div style={{ 
              padding: '24px 32px', 
              borderTop: '1px solid var(--border)', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              background: '#fcfdfe'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>
                  ກຳລັງສະແດງ <span style={{ color: 'var(--text-main)' }}>{totalItems === 0 ? 0 : indexOfFirstItem + 1}</span> ຫາ <span style={{ color: 'var(--text-main)' }}>{Math.min(indexOfLastItem, totalItems)}</span> ຈາກ <span style={{ color: 'var(--text-main)' }}>{totalItems}</span> ທຸລະກຳ
                </p>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>ຈຳນວນ:</span>
                  <select 
                    value={itemsPerPage} 
                    onChange={(e) => {
                      setItemsPerPage(parseInt(e.target.value));
                      setCurrentPage(1);
                    }}
                    style={{ 
                      padding: '6px 12px', 
                      borderRadius: '10px', 
                      border: '1px solid var(--border-strong)', 
                      background: '#fff', 
                      fontSize: '0.85rem', 
                      fontWeight: 800,
                      cursor: 'pointer',
                      outline: 'none',
                      color: 'var(--primary)'
                    }}
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(1)}
                  className="pagination-btn"
                >
                  <ChevronFirst size={18} />
                </button>
                <button 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className="pagination-btn"
                >
                  <ChevronLeft size={18} />
                </button>
                
                <div style={{ display: 'flex', gap: '4px', margin: '0 8px' }}>
                  {[...Array(totalPages)].map((_, i) => {
                    const page = i + 1;
                    if (totalPages > 5 && Math.abs(page - currentPage) > 1 && page !== 1 && page !== totalPages) {
                      if (Math.abs(page - currentPage) === 2) return <span key={page} style={{ alignSelf: 'flex-end', padding: '0 4px', color: 'var(--text-sidebar)' }}>...</span>;
                      return null;
                    }
                    return (
                      <button 
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        style={{
                          minWidth: '36px', height: '36px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                          background: currentPage === page ? 'var(--primary)' : 'transparent',
                          color: currentPage === page ? '#fff' : 'var(--text-muted)',
                          fontWeight: 800, transition: 'var(--transition)', fontSize: '0.9rem'
                        }}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>

                <button 
                  disabled={currentPage === totalPages || totalPages === 0}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className="pagination-btn"
                >
                  <ChevronRight size={18} />
                </button>
                <button 
                  disabled={currentPage === totalPages || totalPages === 0}
                  onClick={() => setCurrentPage(totalPages)}
                  className="pagination-btn"
                >
                  <ChevronLast size={18} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <style>{`
        .directory-row td { transition: var(--transition); }
        .directory-row:hover td { background: #fcfdfe; }
        .stat-card-hover:hover { transform: translateY(-5px); }
        .row-action-btn:hover { border-color: var(--primary) !important; color: var(--primary) !important; transform: scale(1.1); }
        .spinner { width: 44px; height: 44px; border: 4px solid #f1f5f9; border-top: 4px solid var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .pagination-btn {
          width: 36px; height: 36px; border-radius: 10px; 
          border: 1px solid var(--border-strong); background: #fff; 
          color: var(--text-main); display: flex; align-items: center; 
          justify-content: center; cursor: pointer; transition: var(--transition);
        }
        .pagination-btn:hover:not(:disabled) { border-color: var(--primary); color: var(--primary); }
        .pagination-btn:disabled { opacity: 0.3; cursor: not-allowed; }
      `}</style>

      {/* View Order Modal */}
      {showViewModal && selectedOrder && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(8px)' }}>
          <div style={{ background: '#fff', width: '90%', maxWidth: '600px', borderRadius: '32px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', position: 'relative' }}>
            <div style={{ padding: '32px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-main)' }}>ລາຍລະອຽດການສັ່ງຊື້</h2>
                <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 800 }}>INV#{selectedOrder.id.substring(0, 12).toUpperCase()}</span>
              </div>
              <button onClick={() => setShowViewModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '24px', opacity: 0.5 }}>✕</button>
            </div>
            <div style={{ padding: '32px', maxHeight: '60vh', overflowY: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
                <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '20px' }}>
                  <p style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>ຜູ້ເຮັດລາຍການ</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <User size={14} color="var(--primary)" />
                    <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>{selectedOrder.user_name || 'ລະບົບອັດຕະໂນມັດ'}</span>
                  </div>
                </div>
                <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '20px' }}>
                  <p style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>ເວລາ</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={14} color="var(--primary)" />
                    <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>{new Date(selectedOrder.date).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 900, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <ShoppingCart size={18} color="var(--primary)" />
                  ລາຍການສິນຄ້າ
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {safeParseItems(selectedOrder.itemsJson).map((item: any, i: number) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', border: '1px solid var(--border)', borderRadius: '14px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>{item.name || 'Unknown Item'}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>{formatCurrency(item.price || 0, selectedOrder.currency)} × {item.quantity || 0}</span>
                      </div>
                      <span style={{ fontWeight: 900, color: 'var(--primary)' }}>{formatCurrency((item.price || 0) * (item.quantity || 0), selectedOrder.currency)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ padding: '24px', background: 'var(--bg-main)', borderRadius: '24px', border: '1px solid var(--border-strong)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>ລວມກ່ອນພາສີ</span>
                  <span style={{ fontWeight: 800 }}>{formatCurrency(selectedOrder.total, selectedOrder.currency)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px dashed var(--border-strong)' }}>
                  <span style={{ fontWeight: 900, color: 'var(--text-main)', fontSize: '1.1rem' }}>ຍອດລວມທັງໝົດ</span>
                  <span style={{ fontWeight: 900, color: 'var(--primary)', fontSize: '1.2rem' }}>{formatCurrency(selectedOrder.total, selectedOrder.currency)}</span>
                </div>
              </div>

              {selectedOrder.status === 'Voided' && (
                <div style={{ marginTop: '24px', padding: '16px', background: '#fff1f2', borderRadius: '16px', border: '1px solid #fecaca' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#be123c', marginBottom: '4px' }}>
                    <AlertTriangle size={16} />
                    <span style={{ fontWeight: 900, fontSize: '0.8rem' }}>ຂໍ້ມູນການຍົກເລີກ</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#991b1b', fontWeight: 600 }}>{selectedOrder.void_reason || 'ບໍ່ໄດ້ລະບຸເຫດຜົນ'}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Void Confirmation Modal */}
      {showVoidModal && selectedOrder && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(8px)' }}>
          <div style={{ background: '#fff', width: '90%', maxWidth: '450px', borderRadius: '32px', padding: '32px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', position: 'relative' }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: '#fee2e2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <XCircle size={32} />
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 900 }}>ຢືນຢັນການຍົກເລີກທຸລະກຳ</h2>
              <p style={{ color: 'var(--text-muted)', fontWeight: 600, marginTop: '8px' }}>ການດຳເນີນການນີ້ຈະຄືນສິນຄ້າເຂົ້າສະຕັອກ ແລະ ໝາຍວ່າບິນນີ້ບໍ່ຖືກຕ້ອງ. ບໍ່ສາມາດຍ້ອນກັບໄດ້.</p>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 900, color: 'var(--text-sidebar)', marginBottom: '8px', opacity: 0.6, letterSpacing: '0.05em' }}>ເຫດຜົນໃນການຍົກເລີກ (ຈຳເປັນ)</label>
              <textarea 
                value={voidReason}
                onChange={(e) => setVoidReason(e.target.value)}
                placeholder="ລະບຸເຫດຜົນໃນການຍົກເລີກ (ເຊັ່ນ: ເລືອກສິນຄ້າຜິດ, ຊຳລະເງິນບໍ່ສຳເລັດ, ລູກຄ້າຂົຍົກເລີກ)..."
                style={{ 
                  width: '100%', height: '100px', padding: '16px', borderRadius: '16px', 
                  border: '1px solid var(--border-strong)', background: '#f8fafc', 
                  fontSize: '0.9rem', fontWeight: 600, resize: 'none', outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => setShowVoidModal(false)}
                className="btn-secondary" 
                style={{ flex: 1, padding: '14px', borderRadius: '16px', fontWeight: 800 }}
              >
                ຍົກເລີກ
              </button>
              <button 
                onClick={handleVoid}
                disabled={isVoiding || !voidReason.trim()}
                className="btn-primary" 
                style={{ flex: 1, padding: '14px', borderRadius: '16px', fontWeight: 800, background: '#ef4444' }}
              >
                {isVoiding ? 'ກຳລັງຍົກເລີກ...' : 'ຢືນຢັນການຍົກເລີກ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


export default Orders;
