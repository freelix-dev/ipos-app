import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  ChevronFirst,
  ChevronLast
} from 'lucide-react';
import { api } from '../services/api';

const Orders = () => {
  const [filter, setFilter] = useState('All');
  const [orders, setOrders] = useState<any[]>([]);
  const [shops, setShops] = useState<any[]>([]);
  const [selectedShopId, setSelectedShopId] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const userJson = localStorage.getItem('user');
  const currentUser = userJson ? JSON.parse(userJson) : null;
  const isSystemAdmin = currentUser && !currentUser.shop_id;

  useEffect(() => {
    if (isSystemAdmin) {
      loadShops();
    }
    loadOrders();
  }, [selectedShopId]);

  const loadShops = async () => {
    try {
      const data = await api.getShops();
      setShops(data);
    } catch (error) {
      console.error('Failed to load shops:', error);
    }
  };

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await api.getOrders(isSystemAdmin ? selectedShopId : currentUser?.shop_id);
      setOrders(data);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'LAK') => {
    return new Intl.NumberFormat('lo-LA', { style: 'currency', currency }).format(amount);
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

  // Pagination Logic
  const totalItems = filteredOrders.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="animate-slide-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '48px' }}>
        <div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: '8px', color: 'var(--text-main)' }}>Transaction Ledger</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 500 }}>Monitor and audit global sales operations</p>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button className="btn-primary" style={{ background: '#fff', color: 'var(--text-main)', border: '1px solid var(--border-strong)', boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Download size={20} />
            <span>Generate CSV</span>
          </button>
        </div>
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
                placeholder="Search transaction ID, remark, or client info..." 
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

            {/* Shop Selector for System Admin */}
            {isSystemAdmin && (
              <div style={{ position: 'relative', width: '220px' }}>
                <select 
                  value={selectedShopId}
                  onChange={(e) => {
                    setSelectedShopId(e.target.value);
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
                  <option value="">All Branches</option>
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
                <span style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-sidebar)', letterSpacing: '0.05em' }}>FROM</span>
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
                <span style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-sidebar)', letterSpacing: '0.05em' }}>UNTIL</span>
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
              <span>Export</span>
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '8px', background: '#f1f5f9', padding: '4px', borderRadius: '14px' }}>
              {['All', 'Completed', 'Pending', 'Cancelled'].map((t) => (
                <button 
                  key={t}
                  onClick={() => {
                    setFilter(t);
                    setCurrentPage(1);
                  }}
                  style={{
                    padding: '8px 20px', borderRadius: '11px', border: 'none', cursor: 'pointer',
                    background: filter === t ? '#fff' : 'transparent',
                    color: filter === t ? 'var(--primary)' : 'var(--text-muted)',
                    fontWeight: 800, fontSize: '0.85rem',
                    boxShadow: filter === t ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
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
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.04em' }}>AUTO-SYNC ACTIVE</span>
               </div>
               <div style={{ width: '1px', height: '16px', background: 'var(--border-strong)' }}></div>
               <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>{filteredOrders.length} RESULTS</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '100px', textAlign: 'center' }}>
            <div className="spinner" style={{ margin: '0 auto 24px' }}></div>
            <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Deciphering transaction logs...</p>
          </div>
        ) : (
          <>
            <table style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
              <thead>
                <tr>
                  <th style={{ paddingLeft: '32px', width: '220px' }}>Tracing Protocol</th>
                  <th>Execution Delay</th>
                  <th>Payment Vector</th>
                  <th>Valuation</th>
                  <th>System State</th>
                  <th style={{ textAlign: 'right', paddingRight: '32px' }}>Insight</th>
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
                      {isSystemAdmin && (
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
                          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>{order.paymentMethod === 'cash' ? 'CASH SETTLEMENT' : 'BANK TRANSFER'}</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800 }}>{order.currency.toUpperCase()} GATEWAY</span>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontWeight: 900, color: 'var(--primary)', fontSize: '1.1rem' }}>{formatCurrency(order.total, order.currency)}</td>
                    <td>
                      <span className={`badge ${order.status === 'Completed' ? 'badge-success' : order.status === 'Pending' ? 'badge-warning' : 'badge-danger'}`}>
                        {order.status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', paddingRight: '32px' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                        <button className="row-action-btn" style={{ padding: '10px', borderRadius: '12px', border: '1px solid var(--border-strong)', background: '#fff', color: 'var(--text-main)', cursor: 'pointer', transition: 'var(--transition)' }}>
                          <Eye size={18} />
                        </button>
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
                  Showing <span style={{ color: 'var(--text-main)' }}>{totalItems === 0 ? 0 : indexOfFirstItem + 1}</span> to <span style={{ color: 'var(--text-main)' }}>{Math.min(indexOfLastItem, totalItems)}</span> of <span style={{ color: 'var(--text-main)' }}>{totalItems}</span> transactions
                </p>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>LIMIT:</span>
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
    </div>
  );
};


export default Orders;
