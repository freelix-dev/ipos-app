import React, { useState, useEffect } from 'react';
import { 
  BarChart2, 
  Download, 
  Search, 
  Filter, 
  AlertTriangle,
  PackageCheck,
  ChevronLeft,
  ChevronRight,
  ChevronFirst,
  ChevronLast,
  TrendingUp,
  Package
} from 'lucide-react';
import { api, IMAGE_BASE_URL } from '../services/api';

const StockReports = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsData, ordersData] = await Promise.all([
        api.getProducts(),
        api.getOrders()
      ]);
      setProducts(productsData);
      setOrders(ordersData);
    } catch (error) {
      console.error('Failed to load data for stock report:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSoldQuantity = (productId: string) => {
    let sold = 0;
    
    const start = startDate ? new Date(startDate).setHours(0, 0, 0, 0) : null;
    const end = endDate ? new Date(endDate).setHours(23, 59, 59, 999) : null;

    orders.forEach(order => {
      if (order.status === 'Completed') {
        const orderDate = new Date(order.date).getTime();
        
        // Date filtering
        if (start && orderDate < start) return;
        if (end && orderDate > end) return;

        try {
          const items = typeof order.itemsJson === 'string' ? JSON.parse(order.itemsJson) : (order.itemsJson || []);
          items.forEach((item: any) => {
            if (item.id === productId) {
              sold += Number(item.quantity) || 0;
            }
          });
        } catch (e) {
          console.error('Failed to parse itemsJson for order:', order.id);
        }
      }
    });
    return sold;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('lo-LA', { style: 'currency', currency: 'LAK' }).format(amount);
  };

  const getStatusColor = (stock: number) => {
    if (stock <= 0) return 'badge-danger';
    if (stock <= 10) return 'badge-warning';
    return 'badge-success';
  };

  const getStatusLabel = (stock: number) => {
    if (stock <= 0) return 'Out of Stock';
    if (stock <= 10) return 'Low Stock';
    return 'In Stock';
  };

  const filteredProducts = products.filter(p => {
    return p.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Calculate stats for products including sold quantity
  const productsWithStats = filteredProducts.map(p => {
    const sold = getSoldQuantity(p.id);
    const stockQuantity = Number(p.stock) || 0;
    return {
      ...p,
      sold,
      total: stockQuantity + sold,
      stock: stockQuantity
    };
  });

  // Analytics
  const totalSoldItems = productsWithStats.reduce((sum, p) => sum + p.sold, 0);
  const criticalItems = productsWithStats.filter(p => p.stock <= 10).length;
  const outOfStockItems = productsWithStats.filter(p => p.stock <= 0).length;
  
  // Pagination Logic
  const totalItems = productsWithStats.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = productsWithStats.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="animate-slide-up">
      <div className="table-container" style={{ border: 'none', boxShadow: 'var(--shadow-premium)', display: 'flex', flexDirection: 'column', background: 'transparent', marginTop: '20px' }}>
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
                placeholder="Search logistics items..." 
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
            }} className="btn-hover-premium" onClick={() => window.print()}>
              <Download size={18} />
              <span>Export PDF</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '100px', textAlign: 'center' }}>
            <div className="spinner" style={{ margin: '0 auto 24px' }}></div>
            <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Analyzing inventory depth...</p>
          </div>
        ) : (
          <>
            <table style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
              <thead>
                <tr>
                  <th style={{ paddingLeft: '32px' }}>Asset Identifier</th>
                  <th>Total</th>
                  <th>Stock Sale</th>
                  <th style={{ textAlign: 'right', paddingRight: '32px' }}>Stock</th>
                </tr>
              </thead>
              <tbody>
                {currentProducts.map((product) => {
                  return (
                    <tr key={product.id} className="directory-row">
                      <td style={{ paddingLeft: '32px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div style={{ 
                            width: '40px', height: '40px', borderRadius: '10px', 
                            background: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)', 
                            display: 'flex', alignItems: 'center', justifyContent: 'center', 
                            overflow: 'hidden', border: '1px solid #fff', boxShadow: 'var(--shadow-sm)'
                          }}>
                            <img 
                              src={`${IMAGE_BASE_URL}/${product.imagePath}`} 
                              alt="" 
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              onError={(e: any) => { e.target.src = `${IMAGE_BASE_URL}/assets/images/default.png`; }}
                            />
                          </div>
                          <div>
                            <p style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '0.95rem' }}>{product.name}</p>
                            <span className={`badge ${getStatusColor(product.stock)}`} style={{ fontSize: '0.65rem', marginTop: '4px', display: 'inline-block' }}>
                              {getStatusLabel(product.stock)}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontWeight: 600, color: 'var(--text-sidebar)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Package size={14} className="text-muted" />
                          <span>{product.total}</span>
                        </div>
                      </td>
                      <td style={{ fontWeight: 700, color: '#3b82f6' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <TrendingUp size={14} />
                          <span>{product.sold}</span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'right', paddingRight: '32px' }}>
                        <span style={{ fontWeight: 900, fontSize: '1.2rem', color: product.stock <= 10 ? '#dc2626' : 'var(--text-main)' }}>
                          {product.stock}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {/* Pagination Controls */}
            {totalItems > 0 && (
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
                    Showing <span style={{ color: 'var(--text-main)' }}>{indexOfFirstItem + 1}</span> to <span style={{ color: 'var(--text-main)' }}>{Math.min(indexOfLastItem, totalItems)}</span> of <span style={{ color: 'var(--text-main)' }}>{totalItems}</span> items
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
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
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
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    className="pagination-btn"
                  >
                    <ChevronRight size={18} />
                  </button>
                  <button 
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(totalPages)}
                    className="pagination-btn"
                  >
                    <ChevronLast size={18} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        .pagination-btn {
          width: 36px; height: 36px; border-radius: 10px; 
          border: 1px solid var(--border-strong); background: #fff; 
          color: var(--text-main); display: flex; align-items: center; 
          justify-content: center; cursor: pointer; transition: var(--transition);
        }
        .pagination-btn:hover:not(:disabled) { border-color: var(--primary); color: var(--primary); }
        .pagination-btn:disabled { opacity: 0.3; cursor: not-allowed; }
        .spinner { width: 44px; height: 44px; border: 4px solid #f1f5f9; border-top: 4px solid var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default StockReports;
