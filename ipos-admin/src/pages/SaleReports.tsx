import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Download,
  Search,
  Filter,
  X,
  CreditCard,
  User,
  Coins,
  ChevronLeft,
  ChevronRight,
  ChevronFirst,
  ChevronLast,
  ChevronDown,
  Store,
  Package,
  FileText
} from 'lucide-react';
import { api } from '../services/api';

const SaleReports = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD in local time
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [selectedMethods, setSelectedMethods] = useState<string[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedCurrencies, setSelectedCurrencies] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [shops, setShops] = useState<any[]>([]);
  const [selectedShopId, setSelectedShopId] = useState(() => localStorage.getItem('selectedShopId') || '');
  const [showRemit, setShowRemit] = useState(false);
  const [cashierPage, setCashierPage] = useState(1);
  const [cashierPerPage, setCashierPerPage] = useState(10);

  const userJson = localStorage.getItem('user');
  const currentUser = userJson ? JSON.parse(userJson) : null;
  const isSystemAdmin = currentUser && !currentUser.shop_id && !currentUser.owner_id;
  const isOwner = currentUser?.role === 'admin' && !currentUser?.owner_id;

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    loadShops();
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [selectedShopId]);

  const loadShops = async () => {
    try {
      const data = await api.getShops(isSystemAdmin ? undefined : (currentUser?.owner_id || currentUser?.id));
      setShops(data);
    } catch (error) {
      console.error('Failed to load shops:', error);
    }
  };

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const effectiveShopId = (isSystemAdmin || isOwner) ? selectedShopId : (selectedShopId || currentUser?.shop_id);

      const [ordersData, usersData] = await Promise.all([
        api.getOrders(effectiveShopId || undefined),
        api.getUsers(effectiveShopId || undefined, isSystemAdmin ? undefined : (currentUser?.owner_id || currentUser?.id))
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
  const getLocalDateString = (dateInput: string) => {
    if (!dateInput) return '';
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return dateInput.split(/[T ]/)[0] || '';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

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
    const orderDateStr = getLocalDateString(o.date || o.createdAt);
    const matchesDate = (!startDate || orderDateStr >= startDate) && (!endDate || orderDateStr <= endDate);

    const matchesSearch = o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sellerName.includes(searchTerm.toLowerCase());
    const matchesUser = selectedUsers.length === 0 || selectedUsers.some(u => u.trim().toLowerCase() === sellerName);
    const matchesMethod = selectedMethods.length === 0 || selectedMethods.includes(o.paymentMethod);
    const matchesCurrency = selectedCurrencies.length === 0 || selectedCurrencies.includes((o.currency || 'LAK').toUpperCase());

    return matchesSearch && matchesDate && matchesUser && matchesMethod && matchesCurrency;
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
  const allCurrencies = Array.from(new Set(orders.map(o => (o.currency || 'LAK').toUpperCase()))).filter(Boolean);
  
  const currentShopId = (isSystemAdmin || isOwner) ? selectedShopId : (selectedShopId || currentUser?.shop_id);

  // ใช้ user จาก API state ที่มี role = 'staff' และอยู่ shop เดียวกัน
  const staffUsers = users
    .filter(u => u.role === 'staff' && u.name && (!currentShopId || u.shop_id === currentShopId))
    .map(u => u.name.trim());
  const allUsers = Array.from(new Set(staffUsers)).sort() as string[];

  // Cashier Summary: filter completed orders based on ALL active filters
  const summaryOrders = filteredOrders.filter(o => o.status === 'Completed');

  const dateSummary: Record<string, { dateKey: string; cashierName: string; cashLAK: number; cashTHB: number; cashUSD: number; bankLAK: number; bankTHB: number; bankUSD: number; totalLAK: number; totalTHB: number; totalUSD: number; txCount: number }> = {};
  
  // Pre-fill to ensure all target cashiers show up even with 0 sales for active dates
  const targetCashiers = selectedUsers.length > 0 ? selectedUsers : allUsers;
  const uniqueDates = Array.from(new Set(summaryOrders.map(o => getLocalDateString(o.date || o.createdAt) || 'Unknown')));
  
  uniqueDates.forEach(dateStr => {
    targetCashiers.forEach(cashier => {
      const groupKey = `${dateStr}|${cashier}`;
      dateSummary[groupKey] = { dateKey: dateStr, cashierName: cashier, cashLAK: 0, cashTHB: 0, cashUSD: 0, bankLAK: 0, bankTHB: 0, bankUSD: 0, totalLAK: 0, totalTHB: 0, totalUSD: 0, txCount: 0 };
    });
  });

  summaryOrders.forEach(o => {
    const rawName = (o.user_name || getSellerInfo(o.remark).userName || 'Unknown').trim();
    // ถ้า rawName ตรงกับ cashier ที่เลือก (case-insensitive) ให้ใช้ชื่อที่ตรงกันเพื่อไม่ให้เกิด Row ซ้ำ
    const matchedCashier = targetCashiers.find(c => c.toLowerCase() === rawName.toLowerCase()) || rawName;
    const dateStr = getLocalDateString(o.date || o.createdAt) || 'Unknown';
    const groupKey = `${dateStr}|${matchedCashier}`;

    if (!dateSummary[groupKey]) {
      dateSummary[groupKey] = { dateKey: dateStr, cashierName: matchedCashier, cashLAK: 0, cashTHB: 0, cashUSD: 0, bankLAK: 0, bankTHB: 0, bankUSD: 0, totalLAK: 0, totalTHB: 0, totalUSD: 0, txCount: 0 };
    }
    const amount = Number(o.total) || 0;
    const method = (o.paymentMethod || '').toLowerCase();
    const currency = (o.currency || 'LAK').toUpperCase();
    const isCash = method === 'cash';
    const isBank = method === 'bank';
    
    if (currency === 'LAK') {
      dateSummary[groupKey].totalLAK += amount;
      if (isCash) dateSummary[groupKey].cashLAK += amount;
      else if (isBank) dateSummary[groupKey].bankLAK += amount;
    } else if (currency === 'THB') {
      dateSummary[groupKey].totalTHB += amount;
      if (isCash) dateSummary[groupKey].cashTHB += amount;
      else if (isBank) dateSummary[groupKey].bankTHB += amount;
    } else if (currency === 'USD') {
      dateSummary[groupKey].totalUSD += amount;
      if (isCash) dateSummary[groupKey].cashUSD += amount;
      else if (isBank) dateSummary[groupKey].bankUSD += amount;
    }
    
    dateSummary[groupKey].txCount += 1;
  });
  
  const reportRows = Object.values(dateSummary).sort((a, b) => {
    const dateCmp = b.dateKey.localeCompare(a.dateKey);
    return dateCmp !== 0 ? dateCmp : a.cashierName.localeCompare(b.cashierName);
  });


  // Report table pagination
  const totalReportPages = Math.ceil(reportRows.length / cashierPerPage);
  const pagedRows = reportRows.slice((cashierPage - 1) * cashierPerPage, cashierPage * cashierPerPage);

  const showCash = selectedMethods.length === 0 || selectedMethods.includes('cash');
  const showBank = selectedMethods.length === 0 || selectedMethods.includes('bank');
  const showLAK = selectedCurrencies.length === 0 || selectedCurrencies.includes('LAK');
  const showTHB = selectedCurrencies.length === 0 || selectedCurrencies.includes('THB');
  const showUSD = selectedCurrencies.length === 0 || selectedCurrencies.includes('USD');
  const colSpanCount = 1 + (showCash ? 1 : 0) + (showBank ? 1 : 0) + 2;

  return (
    <div className="animate-slide-up">
      {/* 🚀 Header Actions matching Stock style */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-main)' }}>Transaction Reports</h1>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          {/* Date Range */}
          <div style={{
            display: 'flex', alignItems: 'center', background: '#fff',
            borderRadius: '16px', border: '1px solid var(--border-strong)',
            padding: '0 16px', height: '50px', gap: '12px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-sidebar)', letterSpacing: '0.05em' }}>FROM</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }}
                style={{ background: 'transparent', border: 'none', fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)', outline: 'none', width: '120px' }}
              />
            </div>
            <div style={{ width: '1px', height: '20px', background: 'var(--border-strong)' }}></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-sidebar)', letterSpacing: '0.05em' }}>UNTIL</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }}
                style={{ background: 'transparent', border: 'none', fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)', outline: 'none', width: '120px' }}
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

          <button
            onClick={() => setShowRemit(true)}
            className="btn-primary"
            style={{ 
              display: 'flex', alignItems: 'center', gap: '8px', height: '50px', 
              whiteSpace: 'nowrap', background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)'
            }}
          >
            <FileText size={18} />
            <span>Remittance Slip</span>
          </button>

          <button
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '50px', whiteSpace: 'nowrap' }}
            onClick={() => window.print()}
          >
            <Download size={18} />
            <span>Generate Ledger</span>
          </button>
        </div>
      </div>

      <div className="table-container" style={{ border: 'none', boxShadow: 'var(--shadow-premium)', display: 'flex', flexDirection: 'column', background: 'transparent' }}>

        {/* ⚛️ Filter Strip */}
        <div style={{
          padding: '14px 20px',
          background: '#fff',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {/* Shop Selector for System Admin & Owners */}
            {(isSystemAdmin || (currentUser?.role === 'admin')) && (
              <div style={{ position: 'relative', flex: '1 1 200px' }}>
                <Package size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)', opacity: 0.8 }} />
                <select
                  value={selectedShopId}
                  onChange={(e) => {
                    setSelectedShopId(e.target.value);
                    localStorage.setItem('selectedShopId', e.target.value);
                    setCurrentPage(1);
                  }}
                  className="input-premium"
                  style={{ 
                    height: '50px', borderRadius: '16px', padding: '0 40px 0 44px', width: '100%', 
                    fontWeight: 900, fontSize: '0.95rem', color: 'var(--primary)', 
                    border: '1px solid var(--border-strong)', background: '#fff', 
                    appearance: 'none', cursor: 'pointer', outline: 'none',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <option value="">All Branches</option>
                  {shops.map(shop => (
                    <option key={shop.id} value={shop.id}>{shop.name}</option>
                  ))}
                </select>
                <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                  <ChevronDown size={18} color="var(--primary)" style={{ opacity: 0.6 }} />
                </div>
              </div>
            )}

            {/* Account / Payment Method Dropdown */}
            <div style={{ position: 'relative', flex: '1 1 200px' }}>
              <CreditCard size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-sidebar)' }} />
              <select
                className="input-premium"
                style={{ height: '50px', borderRadius: '16px', padding: '0 40px 0 44px', width: '100%', fontWeight: 700, appearance: 'none', cursor: 'pointer' }}
                onChange={(e) => {
                  if (e.target.value && !selectedMethods.includes(e.target.value)) setSelectedMethods([...selectedMethods, e.target.value]);
                }}
                value=""
              >
                <option value="">Filter by Account</option>
                {allMethods.map(m => <option key={m} value={m}>{m.toUpperCase()}</option>)}
              </select>
              <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                <ChevronDown size={18} color="var(--text-sidebar)" />
              </div>
            </div>

            {/* User Multi-select */}
            <div style={{ position: 'relative', flex: '1 1 200px' }}>
              <User size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-sidebar)' }} />
              <select
                className="input-premium"
                style={{ height: '50px', borderRadius: '16px', padding: '0 40px 0 44px', width: '100%', fontWeight: 700, appearance: 'none', cursor: 'pointer' }}
                onChange={(e) => {
                  if (e.target.value && !selectedUsers.includes(e.target.value)) setSelectedUsers([...selectedUsers, e.target.value]);
                }}
                value=""
              >
                <option value="">Filter by User</option>
                {allUsers.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
              <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                <ChevronDown size={18} color="var(--text-sidebar)" />
              </div>
            </div>

            {/* Currency Dropdown */}
            <div style={{ position: 'relative', flex: '1 1 200px' }}>
              <Coins size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-sidebar)' }} />
              <select
                className="input-premium"
                style={{ height: '50px', borderRadius: '16px', padding: '0 40px 0 44px', width: '100%', fontWeight: 700, appearance: 'none', cursor: 'pointer' }}
                onChange={(e) => {
                  if (e.target.value && !selectedCurrencies.includes(e.target.value)) setSelectedCurrencies([...selectedCurrencies, e.target.value]);
                }}
                value=""
              >
                <option value="">Filter by Currency</option>
                {allCurrencies.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                <ChevronDown size={18} color="var(--text-sidebar)" />
              </div>
            </div>

          </div>

          {/* Active Filter Chips */}
          {(selectedUsers.length > 0 || selectedMethods.length > 0 || selectedCurrencies.length > 0) && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '16px' }}>
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
            {selectedCurrencies.map(c => (
              <span key={c} style={{ padding: '6px 14px', borderRadius: '12px', background: 'rgba(234, 179, 8, 0.1)', color: '#ca8a04', fontWeight: 800, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid rgba(234, 179, 8, 0.2)' }}>
                {c} <X size={14} style={{ cursor: 'pointer' }} onClick={() => setSelectedCurrencies(prev => prev.filter(x => x !== c))} />
              </span>
            ))}
            </div>
          )}
        </div>
        <div style={{ 
          background: '#fff', 
          borderRadius: '20px', 
          boxShadow: 'var(--shadow-premium)', 
          overflow: 'hidden',
          border: '1px solid var(--border)'
        }}>
          {/* 💳 Cashier Summary Table */}
          <table style={{ width: '100%', height: 'fit-content', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', height: '55px' }}>
                  <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '0.72rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>DATE & CASHIER</th>
                  {showCash && <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '0.72rem', fontWeight: 900, color: '#065f46', textTransform: 'uppercase', letterSpacing: '0.06em' }}>🟢 CASH</th>}
                  {showBank && <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '0.72rem', fontWeight: 900, color: '#1e40af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>🔵 BANK</th>}
                  <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '0.72rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>ITEM</th>
                  <th style={{ padding: '12px 24px', textAlign: 'right', fontSize: '0.72rem', fontWeight: 900, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>TOTAL</th>
                </tr>
              </thead>
              <tbody>
                {reportRows.length === 0 && (
                  <tr>
                    <td colSpan={colSpanCount} style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 600 }}>
                      No data found for the selected filters.
                    </td>
                  </tr>
                )}
                {pagedRows.map((s, idx) => {
                  const showDate = idx === 0 || pagedRows[idx - 1].dateKey !== s.dateKey;
                  return (
                  <tr key={`${s.dateKey}-${s.cashierName}`} style={{ borderTop: '1px solid var(--border)', background: idx % 2 === 0 ? '#fff' : '#fcfdfe' }}>
                    <td style={{ padding: '14px 24px', verticalAlign: 'top' }}>
                      <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '0.9rem', opacity: showDate ? 1 : 0 }}>{s.dateKey}</div>
                      <div style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <User size={12} /> {s.cashierName}
                      </div>
                    </td>
                    {showCash && (
                      <td style={{ padding: '14px 16px', textAlign: 'right', verticalAlign: 'top' }}>
                        {showLAK && <div style={{ fontWeight: 900, color: '#10b981', fontSize: '0.95rem' }}>{formatCurrency(s.cashLAK, 'LAK')}</div>}
                        {showTHB && <div style={{ fontWeight: 700, color: '#eab308', fontSize: '0.78rem', marginTop: '2px' }}>{s.cashTHB > 0 ? formatCurrency(s.cashTHB, 'THB') : '0'} ฿</div>}
                        {showUSD && <div style={{ fontWeight: 700, color: '#ec4899', fontSize: '0.78rem', marginTop: '2px' }}>{s.cashUSD > 0 ? formatCurrency(s.cashUSD, 'USD') : '0'} $</div>}
                      </td>
                    )}
                    {showBank && (
                      <td style={{ padding: '14px 16px', textAlign: 'right', verticalAlign: 'top' }}>
                        {showLAK && <div style={{ fontWeight: 900, color: '#3b82f6', fontSize: '0.95rem' }}>{formatCurrency(s.bankLAK, 'LAK')}</div>}
                        {showTHB && <div style={{ fontWeight: 700, color: '#eab308', fontSize: '0.78rem', marginTop: '2px' }}>{s.bankTHB > 0 ? formatCurrency(s.bankTHB, 'THB') : '0'} ฿</div>}
                        {showUSD && <div style={{ fontWeight: 700, color: '#ec4899', fontSize: '0.78rem', marginTop: '2px' }}>{s.bankUSD > 0 ? formatCurrency(s.bankUSD, 'USD') : '0'} $</div>}
                      </td>
                    )}
                    <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.85rem', verticalAlign: 'top' }}>{s.txCount}</td>
                    <td style={{ padding: '14px 24px', textAlign: 'right', verticalAlign: 'top' }}>
                      {showLAK && <div style={{ fontWeight: 900, color: 'var(--primary)', fontSize: '1rem' }}>{formatCurrency(s.totalLAK, 'LAK')}</div>}
                      {showTHB && <div style={{ fontWeight: 700, color: '#eab308', fontSize: '0.78rem', marginTop: '2px' }}>{s.totalTHB > 0 ? formatCurrency(s.totalTHB, 'THB') : '0'} ฿</div>}
                      {showUSD && <div style={{ fontWeight: 700, color: '#ec4899', fontSize: '0.78rem', marginTop: '2px' }}>{s.totalUSD > 0 ? formatCurrency(s.totalUSD, 'USD') : '0'} $</div>}
                    </td>
                  </tr>
                )})}
                {/* Grand Total Footer Row */}
                {reportRows.length > 0 && (
                  <tr style={{ borderTop: '2px solid var(--border)', background: '#f8fafc' }}>
                    <td style={{ padding: '12px 24px', fontWeight: 900, color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'right', verticalAlign: 'top' }}>GRAND TOTAL</td>
                    {showCash && (
                      <td style={{ padding: '12px 16px', textAlign: 'right', verticalAlign: 'top' }}>
                        {showLAK && <div style={{ fontWeight: 900, color: '#10b981', fontSize: '0.95rem' }}>{formatCurrency(reportRows.reduce((sum, s) => sum + s.cashLAK, 0), 'LAK')}</div>}
                        {showTHB && <div style={{ fontWeight: 800, color: '#eab308', fontSize: '0.78rem', marginTop: '2px' }}>{formatCurrency(reportRows.reduce((sum, s) => sum + s.cashTHB, 0), 'THB')} ฿</div>}
                        {showUSD && <div style={{ fontWeight: 800, color: '#ec4899', fontSize: '0.78rem', marginTop: '2px' }}>{formatCurrency(reportRows.reduce((sum, s) => sum + s.cashUSD, 0), 'USD')} $</div>}
                      </td>
                    )}
                    {showBank && (
                      <td style={{ padding: '12px 16px', textAlign: 'right', verticalAlign: 'top' }}>
                        {showLAK && <div style={{ fontWeight: 900, color: '#3b82f6', fontSize: '0.95rem' }}>{formatCurrency(reportRows.reduce((sum, s) => sum + s.bankLAK, 0), 'LAK')}</div>}
                        {showTHB && <div style={{ fontWeight: 800, color: '#eab308', fontSize: '0.78rem', marginTop: '2px' }}>{formatCurrency(reportRows.reduce((sum, s) => sum + s.bankTHB, 0), 'THB')} ฿</div>}
                        {showUSD && <div style={{ fontWeight: 800, color: '#ec4899', fontSize: '0.78rem', marginTop: '2px' }}>{formatCurrency(reportRows.reduce((sum, s) => sum + s.bankUSD, 0), 'USD')} $</div>}
                      </td>
                    )}
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 900, color: 'var(--text-muted)', fontSize: '0.9rem', verticalAlign: 'top' }}>{reportRows.reduce((sum, s) => sum + s.txCount, 0)}</td>
                    <td style={{ padding: '12px 24px', textAlign: 'right', verticalAlign: 'top' }}>
                      {showLAK && <div style={{ fontWeight: 900, color: 'var(--primary)', fontSize: '1.05rem' }}>{formatCurrency(reportRows.reduce((sum, s) => sum + s.totalLAK, 0), 'LAK')}</div>}
                      {showTHB && <div style={{ fontWeight: 800, color: '#eab308', fontSize: '0.78rem', marginTop: '2px' }}>{formatCurrency(reportRows.reduce((sum, s) => sum + s.totalTHB, 0), 'THB')} ฿</div>}
                      {showUSD && <div style={{ fontWeight: 800, color: '#ec4899', fontSize: '0.78rem', marginTop: '2px' }}>{formatCurrency(reportRows.reduce((sum, s) => sum + s.totalUSD, 0), 'USD')} $</div>}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Report Table Pagination */}
            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 24px', borderTop: '1px solid var(--border)', background: '#fff' }}>
              {/* Left: Showing + Limit */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                  Showing <strong style={{ color: 'var(--text-main)' }}>{Math.min((cashierPage - 1) * cashierPerPage + 1, reportRows.length)}</strong> to <strong style={{ color: 'var(--text-main)' }}>{Math.min(cashierPage * cashierPerPage, reportRows.length)}</strong> of <strong style={{ color: 'var(--text-main)' }}>{reportRows.length}</strong> items
                </span>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 700 }}>LIMIT:</span>
                <select
                  value={cashierPerPage}
                  onChange={(e) => { setCashierPerPage(Number(e.target.value)); setCashierPage(1); }}
                  style={{ height: '32px', padding: '0 28px 0 10px', borderRadius: '10px', border: '1.5px solid var(--border-strong)', background: '#fff', fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary)', appearance: 'none', cursor: 'pointer', outline: 'none' }}
                >
                  {[5, 10, 20, 50].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              {/* Right: Page Buttons */}
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <button className="pagination-btn" onClick={() => setCashierPage(1)} disabled={cashierPage === 1}><ChevronFirst size={15} /></button>
                <button className="pagination-btn" onClick={() => setCashierPage(p => Math.max(1, p - 1))} disabled={cashierPage === 1}><ChevronLeft size={15} /></button>
                {Array.from({ length: totalReportPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalReportPages || Math.abs(p - cashierPage) <= 1)
                  .reduce((acc: (number | string)[], p, i, arr) => {
                    if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push('...');
                    acc.push(p); return acc;
                  }, [])
                  .map((p, i) => p === '...' ? (
                    <span key={`e${i}`} style={{ padding: '0 4px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>…</span>
                  ) : (
                    <button key={p} className="pagination-btn" onClick={() => setCashierPage(p as number)}
                      style={{ background: cashierPage === p ? 'var(--primary)' : '#fff', color: cashierPage === p ? '#fff' : 'var(--text-main)', borderColor: cashierPage === p ? 'var(--primary)' : undefined, fontWeight: cashierPage === p ? 900 : 600 }}>
                      {p}
                    </button>
                  ))}
                <button className="pagination-btn" onClick={() => setCashierPage(p => Math.min(totalReportPages, p + 1))} disabled={cashierPage === totalReportPages}><ChevronRight size={15} /></button>
                <button className="pagination-btn" onClick={() => setCashierPage(totalReportPages)} disabled={cashierPage === totalReportPages}><ChevronLast size={15} /></button>
              </div>
            </div>
        </div>
      </div>

      {/* Remit Modal */}
      {showRemit && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
          <div style={{ background: '#fff', borderRadius: '20px', width: '600px', maxWidth: '95vw', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.3)', position: 'relative' }}>
            {/* Modal Header */}
            <div style={{ padding: '24px 28px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontWeight: 900, fontSize: '1.3rem', color: '#1e293b', margin: 0 }}>Remittance Slip</h2>
                <p style={{ color: '#64748b', fontSize: '0.82rem', margin: '4px 0 0' }}>
                  {shops.find(s => s.id === selectedShopId)?.name || 'All Branches'} &nbsp;·&nbsp;
                  {startDate || 'All time'} {endDate ? `→ ${endDate}` : ''}
                </p>
              </div>
              <button onClick={() => setShowRemit(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '10px', width: 36, height: 36, cursor: 'pointer', fontSize: '1.1rem', color: '#64748b' }}>✕</button>
            </div>

            {/* Remit Table */}
            <div style={{ padding: '20px 28px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 900, color: '#475569', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date & Cashier</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 900, color: '#065f46', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cash</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 900, color: '#1e40af', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Bank</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 900, color: '#0f766e', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Items</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 900, color: '#7c3aed', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                   {reportRows.map((s, idx) => {
                    const showDate = idx === 0 || reportRows[idx - 1].dateKey !== s.dateKey;
                    return (
                    <tr key={`${s.dateKey}-${s.cashierName}`} style={{ borderTop: '1px solid #e2e8f0', background: idx % 2 === 0 ? '#fff' : '#f8fafc' }}>
                      <td style={{ padding: '10px 12px', verticalAlign: 'top' }}>
                        <div style={{ fontWeight: 700, color: '#1e293b', opacity: showDate ? 1 : 0 }}>{s.dateKey}</div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}><User size={10} /> {s.cashierName}</div>
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', verticalAlign: 'top' }}>
                        {showLAK && <div style={{ fontWeight: 800, color: '#10b981' }}>{formatCurrency(s.cashLAK, 'LAK')}</div>}
                        {showTHB && (s.cashTHB > 0 || selectedCurrencies.includes('THB')) && <div style={{ fontSize: '0.75rem', color: '#eab308' }}>{formatCurrency(s.cashTHB, 'THB')} ฿</div>}
                        {showUSD && (s.cashUSD > 0 || selectedCurrencies.includes('USD')) && <div style={{ fontSize: '0.75rem', color: '#ec4899' }}>{formatCurrency(s.cashUSD, 'USD')} $</div>}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', verticalAlign: 'top' }}>
                        {showLAK && <div style={{ fontWeight: 800, color: '#3b82f6' }}>{formatCurrency(s.bankLAK, 'LAK')}</div>}
                        {showTHB && (s.bankTHB > 0 || selectedCurrencies.includes('THB')) && <div style={{ fontSize: '0.75rem', color: '#eab308' }}>{formatCurrency(s.bankTHB, 'THB')} ฿</div>}
                        {showUSD && (s.bankUSD > 0 || selectedCurrencies.includes('USD')) && <div style={{ fontSize: '0.75rem', color: '#ec4899' }}>{formatCurrency(s.bankUSD, 'USD')} $</div>}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#64748b' }}>{s.txCount}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', verticalAlign: 'top' }}>
                        {showLAK && <div style={{ fontWeight: 900, color: '#7c3aed' }}>{formatCurrency(s.totalLAK, 'LAK')}</div>}
                        {showTHB && (s.totalTHB > 0 || selectedCurrencies.includes('THB')) && <div style={{ fontSize: '0.75rem', color: '#eab308' }}>{formatCurrency(s.totalTHB, 'THB')} ฿</div>}
                        {showUSD && (s.totalUSD > 0 || selectedCurrencies.includes('USD')) && <div style={{ fontSize: '0.75rem', color: '#ec4899' }}>{formatCurrency(s.totalUSD, 'USD')} $</div>}
                      </td>
                    </tr>
                  )})}
                  {/* Grand Total */}
                  <tr style={{ borderTop: '2px solid #1e293b', background: '#f1f5f9' }}>
                    <td style={{ padding: '12px', fontWeight: 900, color: '#1e293b', fontSize: '0.8rem' }}>GRAND TOTAL</td>
                    <td style={{ padding: '12px', textAlign: 'right', verticalAlign: 'top' }}>
                      {showLAK && <div style={{ fontWeight: 800, color: '#10b981' }}>{formatCurrency(reportRows.reduce((sum, s) => sum + s.cashLAK, 0), 'LAK')}</div>}
                      {showTHB && <div style={{ fontSize: '0.75rem', color: '#eab308' }}>{formatCurrency(reportRows.reduce((sum, s) => sum + s.cashTHB, 0), 'THB')} ฿</div>}
                      {showUSD && <div style={{ fontSize: '0.75rem', color: '#ec4899' }}>{formatCurrency(reportRows.reduce((sum, s) => sum + s.cashUSD, 0), 'USD')} $</div>}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right', verticalAlign: 'top' }}>
                      {showLAK && <div style={{ fontWeight: 800, color: '#3b82f6' }}>{formatCurrency(reportRows.reduce((sum, s) => sum + s.bankLAK, 0), 'LAK')}</div>}
                      {showTHB && <div style={{ fontSize: '0.75rem', color: '#eab308' }}>{formatCurrency(reportRows.reduce((sum, s) => sum + s.bankTHB, 0), 'THB')} ฿</div>}
                      {showUSD && <div style={{ fontSize: '0.75rem', color: '#ec4899' }}>{formatCurrency(reportRows.reduce((sum, s) => sum + s.bankUSD, 0), 'USD')} $</div>}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right', fontWeight: 900, color: '#1e293b' }}>{reportRows.reduce((sum, s) => sum + s.txCount, 0)}</td>
                    <td style={{ padding: '12px', textAlign: 'right', verticalAlign: 'top' }}>
                      {showLAK && <div style={{ fontWeight: 900, color: '#7c3aed' }}>{formatCurrency(reportRows.reduce((sum, s) => sum + s.totalLAK, 0), 'LAK')}</div>}
                      {showTHB && <div style={{ fontSize: '0.75rem', color: '#eab308' }}>{formatCurrency(reportRows.reduce((sum, s) => sum + s.totalTHB, 0), 'THB')} ฿</div>}
                      {showUSD && <div style={{ fontSize: '0.75rem', color: '#ec4899' }}>{formatCurrency(reportRows.reduce((sum, s) => sum + s.totalUSD, 0), 'USD')} $</div>}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Footer */}
              <div style={{ marginTop: '20px', padding: '16px', background: '#f8fafc', borderRadius: '12px', fontSize: '0.78rem', color: '#64748b' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Generated: {new Date().toLocaleString()}</span>
                  <span>Prepared by: {currentUser?.name || currentUser?.username || '-'}</span>
                </div>
                <div style={{ marginTop: '20px', display: 'flex', gap: '40px', justifyContent: 'space-around', paddingTop: '12px', borderTop: '1px dashed #cbd5e1' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ height: '40px', borderBottom: '1px solid #94a3b8', width: '140px', marginBottom: '6px' }}></div>
                    <div style={{ fontWeight: 700 }}>Cashier Signature</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ height: '40px', borderBottom: '1px solid #94a3b8', width: '140px', marginBottom: '6px' }}></div>
                    <div style={{ fontWeight: 700 }}>Manager Signature</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ padding: '16px 28px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowRemit(false)} style={{ padding: '10px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontWeight: 700, color: '#64748b' }}>Close</button>
              <button onClick={() => window.print()} style={{ padding: '10px 20px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', color: '#fff', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Download size={16} /> Print Remit
              </button>
            </div>
          </div>
        </div>
      )}

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

