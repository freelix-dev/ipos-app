import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Download, 
  Search, 
  Filter, 
  X,
  CreditCard,
  User,
  ChevronLeft,
  ChevronRight,
  ChevronFirst,
  ChevronLast
} from 'lucide-react';
import { api } from '../services/api';

const SaleReports = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedMethods, setSelectedMethods] = useState<string[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [ordersData, usersData] = await Promise.all([
        api.getOrders(),
        api.getUsers()
      ]);
      setOrders(ordersData);
      setUsers(usersData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSellerInfo = (remark: string) => {
    if (!remark) return { userName: 'System' };
    try {
      const metadata = JSON.parse(remark);
      return {
        userName: metadata.userName || 'Unknown Seller',
        userId: metadata.userId || ''
      };
    } catch (e) {
      return { userName: 'Legacy Label', text: remark };
    }
  };

  const formatCurrency = (amount: number, currency: string = 'LAK') => {
    const symbol = currency === 'THB' ? '฿' : (currency === 'USD' ? '$' : '');
    const formatted = new Intl.NumberFormat('lo-LA', { style: 'decimal', minimumFractionDigits: 0 }).format(amount);
    const suffix = currency === 'LAK' || !currency ? ' ₭' : '';
    return `${symbol}${formatted}${suffix}`;
  };

  // Logic Processing
  const sortedOrders = [...orders].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  let runningBalance = 0;
  const processedOrders = sortedOrders.map(o => {
    const isCompleted = o.status === 'Completed';
    const amountIn = isCompleted ? (Number(o.total) || 0) : 0;
    const amountOut = o.status === 'Cancelled' ? (Number(o.total) || 0) : 0;
    const prevBalance = runningBalance;
    runningBalance = runningBalance + amountIn - amountOut;
    return { ...o, amountIn, amountOut, prevBalance, currentBalance: runningBalance };
  });

  const filteredOrders = processedOrders.filter(o => {
    const seller = getSellerInfo(o.remark);
    const sellerName = seller.userName.trim().toLowerCase();
    const orderDate = new Date(o.date).setHours(0, 0, 0, 0);
    const start = startDate ? new Date(startDate).setHours(0, 0, 0, 0) : null;
    const end = endDate ? new Date(endDate).setHours(23, 59, 59, 999) : null;
    
    const matchesSearch = o.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          seller.userName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = (!start || orderDate >= start) && (!end || orderDate <= end);
    const matchesUser = selectedUsers.length === 0 || selectedUsers.some(u => u.trim().toLowerCase() === sellerName);
    const matchesMethod = selectedMethods.length === 0 || selectedMethods.includes(o.paymentMethod);
    
    return matchesSearch && matchesDate && matchesUser && matchesMethod;
  }).reverse();

  // Pagination Logic
  const totalItems = filteredOrders.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);

  const groupedByDate: Record<string, any[]> = {};
  currentOrders.forEach(o => {
    const d = new Date(o.date).toLocaleDateString('en-GB');
    if (!groupedByDate[d]) groupedByDate[d] = [];
    groupedByDate[d].push(o);
  });

  const dateGroups = Object.keys(groupedByDate).sort((a, b) => {
    const [ad, am, ay] = a.split('/').map(Number);
    const [bd, bm, by] = b.split('/').map(Number);
    return new Date(by, bm-1, bd).getTime() - new Date(ay, am-1, ad).getTime();
  });

  const allMethods = Array.from(new Set(orders.map(o => o.paymentMethod))).filter(Boolean);
  const staffNames = users.filter(u => u.role === 'staff').map(u => u.name);
  const orderUserNames = Array.from(new Set(orders.map(o => getSellerInfo(o.remark).userName))).filter(Boolean);
  const allUsers = Array.from(new Set([...staffNames, ...orderUserNames])).sort();

  return (
    <div className="animate-slide-up">
      {/* 🚀 Header Actions matching Stock style */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-main)' }}>Transaction Reports</h1>
        <button 
           className="btn-primary" 
           style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
           onClick={() => window.print()}
        >
          <Download size={18} />
          <span>Generate Ledger</span>
        </button>
      </div>

      <div className="table-container" style={{ border: 'none', boxShadow: 'var(--shadow-premium)', display: 'flex', flexDirection: 'column', background: 'transparent' }}>
        
        {/* ⚛️ Quantum Filter Strip (Matching StockReports exact UX) */}
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
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-sidebar)', opacity: 0.6 }} />
              <input 
                type="text" 
                placeholder="Search transaction ID or seller..." 
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                style={{ 
                  width: '100%', height: '50px', padding: '0 16px 0 48px', 
                  borderRadius: '16px', border: '1px solid var(--border-strong)', 
                  background: '#f8fafc', fontSize: '0.9rem', fontWeight: 600,
                  transition: 'var(--transition)', outline: 'none'
                }}
              />
            </div>

            {/* Account / Payment Method Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ position: 'relative' }}>
                   <CreditCard size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-sidebar)' }} />
                   <select 
                      className="input-premium" 
                      style={{ height: '50px', borderRadius: '16px', paddingLeft: '44px', width: '200px', fontWeight: 700 }}
                      onChange={(e) => {
                         if (e.target.value && !selectedMethods.includes(e.target.value)) setSelectedMethods([...selectedMethods, e.target.value]);
                      }}
                      value=""
                   >
                      <option value="">Filter by Account</option>
                      {allMethods.map(m => <option key={m} value={m}>{m.toUpperCase()}</option>)}
                   </select>
                </div>
            </div>

            {/* User Multi-select (Injected into the Quantum Strip) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ position: 'relative' }}>
                   <User size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-sidebar)' }} />
                   <select 
                      className="input-premium" 
                      style={{ height: '50px', borderRadius: '16px', paddingLeft: '44px', width: '200px', fontWeight: 700 }}
                      onChange={(e) => {
                         if (e.target.value && !selectedUsers.includes(e.target.value)) setSelectedUsers([...selectedUsers, e.target.value]);
                      }}
                      value=""
                   >
                      <option value="">Filter by User</option>
                      {allUsers.map(u => <option key={u} value={u}>{u}</option>)}
                   </select>
                </div>
            </div>

            {/* Date Range Module (Identical to Stock) */}
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
                  onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }}
                  style={{ background: 'transparent', border: 'none', fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)', outline: 'none', width: '130px' }}
                />
              </div>
              <div style={{ width: '1px', height: '20px', background: 'var(--border-strong)' }}></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-sidebar)', letterSpacing: '0.05em' }}>UNTIL</span>
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }}
                  style={{ background: 'transparent', border: 'none', fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)', outline: 'none', width: '130px' }}
                />
              </div>
            </div>
          </div>

          {/* Active Filter Chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
             {selectedUsers.map(u => (
               <span key={u} style={{ padding: '6px 14px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--primary)', fontWeight: 800, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid var(--primary-glow)' }}>
                 {u} <X size={14} style={{ cursor: 'pointer' }} onClick={() => setSelectedUsers(prev => prev.filter(x => x !== u))} />
               </span>
             ))}
             {selectedMethods.map(m => (
               <span key={m} style={{ padding: '6px 14px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', fontWeight: 800, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                 {m} <X size={14} style={{ cursor: 'pointer' }} onClick={() => setSelectedMethods(prev => prev.filter(x => x !== m))} />
               </span>
             ))}
          </div>
        </div>

        {/* 📔 Data Ledger Table */}
        {loading ? (
          <div style={{ padding: '100px', textAlign: 'center' }}>
            <div className="spinner" style={{ margin: '0 auto 24px' }}></div>
            <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Syncing ledger data...</p>
          </div>
        ) : (
          <>
            <table style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
              <thead>
                <tr>
                  <th style={{ paddingLeft: '32px' }}>NO.</th>
                  <th>IDENTIFIER</th>
                  <th>STAFF / ACCOUNT</th>
                  <th style={{ textAlign: 'right' }}>PREV. BAL</th>
                  <th style={{ textAlign: 'right' }}>INFLOW</th>
                  <th style={{ textAlign: 'right', paddingRight: '32px' }}>BALANCE</th>
                </tr>
              </thead>
              <tbody>
                {dateGroups.map(date => (
                  <React.Fragment key={date}>
                    <tr>
                      <td colSpan={6} style={{ background: '#f8fafc', padding: '10px 32px', fontSize: '0.7rem', fontWeight: 900, color: '#94a3b8', borderBottom: '1px solid #f1f5f9' }}>
                         📅 {date}
                      </td>
                    </tr>
                    {groupedByDate[date].map((o, idx) => (
                      <tr key={o.id} className="ledger-row" style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ paddingLeft: '32px', color: '#94a3b8', fontSize: '0.8rem' }}>{idx + 1}</td>
                        <td style={{ fontWeight: 800, color: 'var(--primary)' }}>#{o.id.substring(0, 8)}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                             <div style={{ width: 28, height: 28, background: '#e2e8f0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 900 }}>{getSellerInfo(o.remark).userName.charAt(0)}</div>
                             <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 800 }}>{getSellerInfo(o.remark).userName}</p>
                                <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>•</span>
                                <p style={{ fontWeight: 700, fontSize: '0.8rem', color: '#64748b' }}>({o.currency?.toUpperCase() || 'LAK'})</p>
                             </div>
                          </div>
                        </td>
                        <td style={{ textAlign: 'right', color: '#64748b', fontWeight: 600 }}>{formatCurrency(o.prevBalance, o.currency)}</td>
                        <td style={{ textAlign: 'right', color: '#10b981', fontWeight: 900 }}>{o.amountIn > 0 ? `+${formatCurrency(o.amountIn, o.currency)}` : ''}</td>
                        <td style={{ textAlign: 'right', paddingRight: '32px', fontWeight: 900, fontSize: '1rem' }}>{formatCurrency(o.currentBalance, o.currency)}</td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>

            {/* Pagination (Direct Stock UI match) */}
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
                  Showing <span style={{ color: 'var(--text-main)' }}>{indexOfFirstItem + 1}</span> to <span style={{ color: 'var(--text-main)' }}>{Math.min(indexOfLastItem, totalItems)}</span> of <span style={{ color: 'var(--text-main)' }}>{totalItems}</span> entries
                </p>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(1)} className="pagination-btn"><ChevronFirst size={18} /></button>
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} className="pagination-btn"><ChevronLeft size={18} /></button>
                <div style={{ display: 'flex', gap: '4px', margin: '0 8px' }}>
                  {[...Array(totalPages)].map((_, i) => (
                    <button 
                      key={i} 
                      onClick={() => setCurrentPage(i + 1)}
                      style={{
                        minWidth: '36px', height: '36px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                        background: currentPage === i + 1 ? 'var(--primary)' : 'transparent',
                        color: currentPage === i + 1 ? '#fff' : 'var(--text-muted)',
                        fontWeight: 800
                      }}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} className="pagination-btn"><ChevronRight size={18} /></button>
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(totalPages)} className="pagination-btn"><ChevronLast size={18} /></button>
              </div>
            </div>
          </>
        )}
      </div>

      <style>{`
        .ledger-row:hover { background: #fcfdfe; }
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
        @media print {
          .no-print { display: none !important; }
          .table-container { border: 1.5px solid #000 !important; box-shadow: none !important; }
          table { width: 100% !important; border-collapse: collapse !important; }
          th, td { border: 1px solid #000 !important; padding: 6px !important; }
          .animate-slide-up { padding: 0 !important; }
        }
      `}</style>
    </div>
  );
};

export default SaleReports;
