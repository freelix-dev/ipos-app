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
    // ใช้ user_name จาก API โดยตรง ถ้าไม่มีค่อย fallback ไปที่ remark
    const sellerName = (o.user_name || seller.userName || '').trim().toLowerCase();
    const orderDate = new Date(o.date).setHours(0, 0, 0, 0);
    const start = startDate ? new Date(startDate).setHours(0, 0, 0, 0) : null;
    const end = endDate ? new Date(endDate).setHours(23, 59, 59, 999) : null;

    const matchesSearch = o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sellerName.includes(searchTerm.toLowerCase());
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
    return new Date(by, bm - 1, bd).getTime() - new Date(ay, am - 1, ad).getTime();
  });

  const allMethods = Array.from(new Set(orders.map(o => o.paymentMethod))).filter(Boolean);
  // ใช้ user_name จาก order โดยตรง (ข้อมูลจาก API) แทนการ parse จาก remark
  const orderUserNames = Array.from(new Set(
    orders.map(o => o.user_name || getSellerInfo(o.remark).userName)
  )).filter(n => n && n !== 'System' && n !== 'Unknown Seller' && n !== 'Legacy Label');
  const allUsers = orderUserNames.sort() as string[];

  // Cashier Summary: group completed orders by cashier + payment method
  // Respects date + user filter but NOT method filter (to always show both cash & bank totals)
  const summaryOrders = processedOrders.filter(o => {
    const sellerName = (o.user_name || getSellerInfo(o.remark).userName || '').trim().toLowerCase();
    const orderDate = new Date(o.date).setHours(0, 0, 0, 0);
    const start = startDate ? new Date(startDate).setHours(0, 0, 0, 0) : null;
    const end = endDate ? new Date(endDate).setHours(23, 59, 59, 999) : null;
    const matchesDate = (!start || orderDate >= start) && (!end || orderDate <= end);
    const matchesUser = selectedUsers.length === 0 || selectedUsers.some(u => u.trim().toLowerCase() === sellerName);
    return matchesDate && matchesUser && o.status === 'Completed';
  });

  const cashierSummary: Record<string, { date: string; cashierName: string; cashLAK: number; bankLAK: number; totalLAK: number; totalTHB: number; totalUSD: number; txCount: number }> = {};
  summaryOrders.forEach(o => {
    const d = new Date(o.date).toLocaleDateString('en-GB'); // DD/MM/YYYY
    const name = (o.user_name || getSellerInfo(o.remark).userName || 'Unknown').trim();
    const key = `${d}_${name}`;

    if (!cashierSummary[key]) {
      cashierSummary[key] = { date: d, cashierName: name, cashLAK: 0, bankLAK: 0, totalLAK: 0, totalTHB: 0, totalUSD: 0, txCount: 0 };
    }
    const amount = Number(o.total) || 0;
    const method = (o.paymentMethod || '').toLowerCase();
    const currency = (o.currency || 'LAK').toUpperCase();
    
    if (currency === 'LAK') {
      cashierSummary[key].totalLAK += amount;
      if (method === 'cash') cashierSummary[key].cashLAK += amount;
      else if (method === 'bank') cashierSummary[key].bankLAK += amount;
    } else if (currency === 'THB') {
      cashierSummary[key].totalTHB += amount;
    } else if (currency === 'USD') {
      cashierSummary[key].totalUSD += amount;
    }
    
    cashierSummary[key].txCount += 1;
  });
  
  const cashierRows = Object.values(cashierSummary).sort((a, b) => {
    const [ad, am, ay] = a.date.split('/').map(Number);
    const [bd, bm, by] = b.date.split('/').map(Number);
    const timeA = new Date(ay, am - 1, ad).getTime();
    const timeB = new Date(by, bm - 1, bd).getTime();
    if (timeA !== timeB) return timeB - timeA;
    return b.totalLAK - a.totalLAK;
  });

  const groupedByDateSummary: Record<string, typeof cashierRows> = {};
  cashierRows.forEach(r => {
    if (!groupedByDateSummary[r.date]) groupedByDateSummary[r.date] = [];
    groupedByDateSummary[r.date].push(r);
  });
  
  const sortedDates = Object.keys(groupedByDateSummary).sort((a, b) => {
    const [ad, am, ay] = a.split('/').map(Number);
    const [bd, bm, by] = b.split('/').map(Number);
    return new Date(by, bm - 1, bd).getTime() - new Date(ay, am - 1, ad).getTime();
  });

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

        {/* ⚛️ Filter Strip */}
        <div style={{
          padding: '24px 32px',
          background: '#fff',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
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

            {/* User Multi-select */}
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

            {/* Date Range */}
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

        {/* 💳 Cashier Summary Table */}
        {cashierRows.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '0.72rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>CASHIER</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '0.72rem', fontWeight: 900, color: '#065f46', textTransform: 'uppercase', letterSpacing: '0.06em' }}>🟢 CASH (LAK)</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '0.72rem', fontWeight: 900, color: '#1e40af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>🔵 BANK (LAK)</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '0.72rem', fontWeight: 900, color: '#eab308', textTransform: 'uppercase', letterSpacing: '0.06em' }}>🟡 THB</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '0.72rem', fontWeight: 900, color: '#ec4899', textTransform: 'uppercase', letterSpacing: '0.06em' }}>🔴 USD</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '0.72rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>ITEM</th>
                <th style={{ padding: '12px 24px', textAlign: 'right', fontSize: '0.72rem', fontWeight: 900, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>TOTAL (LAK)</th>
              </tr>
            </thead>
            <tbody>
              {sortedDates.map((date) => {
                const dayRows = groupedByDateSummary[date];
                return (
                  <React.Fragment key={date}>
                    {/* Date Header Row */}
                    <tr style={{ background: '#e2e8f0' }}>
                      <td colSpan={7} style={{ padding: '10px 24px', fontWeight: 900, color: '#334155', fontSize: '0.85rem' }}>
                        📅 {date}
                      </td>
                    </tr>
                    {/* Cashier Rows for this date */}
                    {dayRows.map((s) => (
                      <tr key={`${s.date}_${s.cashierName}`} style={{ borderTop: '1px solid var(--border)', background: '#fff' }}>
                        <td style={{ padding: '14px 24px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.85rem', flexShrink: 0 }}>
                              {s.cashierName.charAt(0).toUpperCase()}
                            </div>
                            <span style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '0.9rem' }}>{s.cashierName}</span>
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 900, color: '#10b981', fontSize: '0.95rem' }}>{formatCurrency(s.cashLAK, 'LAK')}</td>
                        <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 900, color: '#3b82f6', fontSize: '0.95rem' }}>{formatCurrency(s.bankLAK, 'LAK')}</td>
                        <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 900, color: '#eab308', fontSize: '0.95rem' }}>{s.totalTHB > 0 ? formatCurrency(s.totalTHB, 'THB') : '-'}</td>
                        <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 900, color: '#ec4899', fontSize: '0.95rem' }}>{s.totalUSD > 0 ? formatCurrency(s.totalUSD, 'USD') : '-'}</td>
                        <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.85rem' }}>{s.txCount}</td>
                        <td style={{ padding: '14px 24px', textAlign: 'right', fontWeight: 900, color: 'var(--primary)', fontSize: '1rem' }}>{formatCurrency(s.totalLAK, 'LAK')}</td>
                      </tr>
                    ))}
                    {/* Subtotal Row for this date */}
                    <tr style={{ borderTop: '1px solid var(--border)', background: '#f8fafc' }}>
                      <td style={{ padding: '12px 24px', fontWeight: 900, color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'right' }}>TOTAL {date}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 900, color: '#10b981', fontSize: '0.95rem' }}>{formatCurrency(dayRows.reduce((sum, s) => sum + s.cashLAK, 0), 'LAK')}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 900, color: '#3b82f6', fontSize: '0.95rem' }}>{formatCurrency(dayRows.reduce((sum, s) => sum + s.bankLAK, 0), 'LAK')}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 900, color: '#eab308', fontSize: '0.95rem' }}>{formatCurrency(dayRows.reduce((sum, s) => sum + s.totalTHB, 0), 'THB')}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 900, color: '#ec4899', fontSize: '0.95rem' }}>{formatCurrency(dayRows.reduce((sum, s) => sum + s.totalUSD, 0), 'USD')}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 900, color: 'var(--text-muted)', fontSize: '0.85rem' }}>{dayRows.reduce((sum, s) => sum + s.txCount, 0)}</td>
                      <td style={{ padding: '12px 24px', textAlign: 'right', fontWeight: 900, color: 'var(--primary)', fontSize: '1.05rem' }}>{formatCurrency(dayRows.reduce((sum, s) => sum + s.totalLAK, 0), 'LAK')}</td>
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: '80px', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 600 }}>
            No data found for the selected filters.
          </div>
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
