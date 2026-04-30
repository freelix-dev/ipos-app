import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Save, 
  Package, 
  AlertCircle, 
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ChevronFirst,
  ChevronLast,
  Edit3,
  ArrowUpCircle,
  ArrowDownCircle,
  RefreshCw
} from 'lucide-react';
import { api, IMAGE_BASE_URL } from '../services/api';

const StockManagement = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [shops, setShops] = useState<any[]>([]);
  const [selectedShopId, setSelectedShopId] = useState(() => localStorage.getItem('selectedShopId') || '');
  const [activeTab, setActiveTab] = useState('Global Supply');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Adjustment States
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustType, setAdjustType] = useState<'Restock' | 'Adjustment'>('Restock');
  const [adjustReason, setAdjustReason] = useState('');
  const [isAdjusting, setIsAdjusting] = useState(false);

  const userJson = localStorage.getItem('user');
  const currentUser = userJson ? JSON.parse(userJson) : null;

  const isSystemAdmin = currentUser && !currentUser.shop_id && !currentUser.owner_id;

  useEffect(() => {
    loadShops();
    loadProducts();
  }, [selectedShopId]);

  const loadShops = async () => {
    try {
      const data = await api.getShops(isSystemAdmin ? undefined : (currentUser?.owner_id || currentUser?.id));
      setShops(data);
    } catch (error) {
      console.error('Failed to load shops:', error);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const isOwner = currentUser?.role === 'admin' && !currentUser?.owner_id;
      const effectiveShopId = (isSystemAdmin || isOwner) ? selectedShopId : (selectedShopId || currentUser?.shop_id);
      
      const data = await api.getProducts(effectiveShopId || undefined);
      setProducts(data);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStockChange = (id: string, newStock: string) => {
    setProducts(products.map(p => 
      p.id === id ? { ...p, stock: newStock === '' ? '' : parseInt(newStock) } : p
    ));
  };

  const handleAdjustStock = async () => {
    if (!selectedProduct || !adjustAmount || !adjustReason) return;
    try {
      setIsAdjusting(true);
      await api.adjustStock(
        selectedProduct.id, 
        parseInt(adjustAmount), 
        adjustType, 
        adjustReason
      );
      
      setShowAdjustModal(false);
      setAdjustAmount('');
      setAdjustReason('');
      setSelectedProduct(null);
      setMessage({ type: 'success', text: 'Stock adjusted successfully!' });
      setTimeout(() => setMessage(null), 3000);
      loadProducts();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to adjust stock' });
    } finally {
      setIsAdjusting(false);
    }
  };

  const getStockStatus = (stock: number) => {
    if (stock <= 0) return { color: '#ef4444', label: 'ວິກິດ: ໝົດແລ້ວ', badge: 'badge-danger' };
    if (stock < 10) return { color: '#f59e0b', label: 'ເຕືອນ: ໃກ້ໝົດ', badge: 'badge-warning' };
    return { color: '#10b981', label: 'ປົກກະຕິ', badge: 'badge-success' };
  };

  // Filtering Logic
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesTab = true;
    if (activeTab === 'High Availability') matchesTab = p.stock > 20;
    else if (activeTab === 'Critical Stock') matchesTab = p.stock > 0 && p.stock <= 10;
    else if (activeTab === 'Depleted') matchesTab = p.stock <= 0;
    
    return matchesSearch && matchesTab;
  });
  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="animate-slide-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '48px' }}>
        <div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: '8px', color: 'var(--text-main)' }}>ຄວບຄຸມສະຕັອກສິນຄ້າ</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 500 }}>ຈັດການລະດັບສິນຄ້າຄົງຄັງ ແລະ ກວດສອບຄວາມຖືກຕ້ອງຢ່າງລະອຽດ</p>
        </div>
        
        {message && (
          <div style={{ 
            display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 24px', borderRadius: '16px',
            background: message.type === 'success' ? '#10b98115' : '#ef444415',
            color: message.type === 'success' ? '#10b981' : '#ef4444',
            border: `1px solid ${message.type === 'success' ? '#10b98140' : '#ef444440'}`,
            fontSize: '0.95rem', fontWeight: 800, animation: 'fade-in 0.3s ease',
            boxShadow: 'var(--shadow-premium)'
          }}>
            {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            {message.text}
          </div>
        )}
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
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-sidebar)', opacity: 0.6 }} />
              <input 
                type="text" 
                placeholder="ຄົ້ນຫາລາຍການສິນຄ້າດ້ວຍ SKU, ຊື່ ຫຼື ຂໍ້ມູນອື່ນໆ..." 
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
                   <Package size={16} style={{ color: 'var(--primary)' }} />
                </div>
              </div>
            )}

            {/* Logistics Module removed as requested */}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '8px', background: '#f1f5f9', padding: '4px', borderRadius: '14px' }}>
              {['ສິນຄ້າທັງໝົດ', 'ສິນຄ້າມີພຽງພໍ', 'ສິນຄ້າໃກ້ໝົດ', 'ໝົດແລ້ວ'].map((t) => (
                <button 
                  key={t}
                  onClick={() => {
                    const mapTab = (txt: string) => {
                      if (txt === 'ສິນຄ້າທັງໝົດ') return 'Global Supply';
                      if (txt === 'ສິນຄ້າມີພຽງພໍ') return 'High Availability';
                      if (txt === 'ສິນຄ້າໃກ້ໝົດ') return 'Critical Stock';
                      if (txt === 'ໝົດແລ້ວ') return 'Depleted';
                      return txt;
                    };
                    setActiveTab(mapTab(t));
                    setCurrentPage(1);
                  }}
                  style={{
                    padding: '8px 20px', borderRadius: '11px', border: 'none', cursor: 'pointer',
                    background: (t === 'ສິນຄ້າທັງໝົດ' && activeTab === 'Global Supply') || 
                               (t === 'ສິນຄ້າມີພຽງພໍ' && activeTab === 'High Availability') || 
                               (t === 'ສິນຄ້າໃກ້ໝົດ' && activeTab === 'Critical Stock') || 
                               (t === 'ໝົດແລ້ວ' && activeTab === 'Depleted') ? '#fff' : 'transparent',
                    color: (t === 'ສິນຄ້າທັງໝົດ' && activeTab === 'Global Supply') || 
                               (t === 'ສິນຄ້າມີພຽງພໍ' && activeTab === 'High Availability') || 
                               (t === 'ສິນຄ້າໃກ້ໝົດ' && activeTab === 'Critical Stock') || 
                               (t === 'ໝົດແລ້ວ' && activeTab === 'Depleted') ? 'var(--primary)' : 'var(--text-muted)',
                    fontWeight: 800, fontSize: '0.85rem',
                    boxShadow: (t === 'ສິນຄ້າທັງໝົດ' && activeTab === 'Global Supply') || 
                               (t === 'ສິນຄ້າມີພຽງພໍ' && activeTab === 'High Availability') || 
                               (t === 'ສິນຄ້າໃກ້ໝົດ' && activeTab === 'Critical Stock') || 
                               (t === 'ໝົດແລ້ວ' && activeTab === 'Depleted') ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
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
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>{filteredProducts.length} ລາຍການສິນຄ້າ</span>
             </div>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '100px', textAlign: 'center' }}>
            <div className="spinner" style={{ margin: '0 auto 24px' }}></div>
             <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>ກຳລັງດຶງຂໍ້ມູນສະຕັອກສິນຄ້າ...</p>
          </div>
        ) : (
          <>
            <table style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
              <thead>
                <tr>
                  <th style={{ paddingLeft: '32px', width: '35%' }}>ລາຍການສິນຄ້າ</th>
                  <th>ຈຳນວນຄົງເຫຼືອ</th>
                  <th>ສະຖານະສະຕັອກ</th>
                  <th style={{ width: '180px' }}>ປັບປຸງສະຕັອກ</th>
                  <th style={{ textAlign: 'right', paddingRight: '32px' }}>ການຈັດການ</th>
                </tr>
              </thead>
              <tbody>
                {currentProducts.map((product) => {
                  const status = getStockStatus(product.stock);
                  return (
                    <tr key={product.id} className="directory-row">
                      <td style={{ paddingLeft: '32px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div style={{ 
                            width: '52px', height: '52px', borderRadius: '16px', 
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
                            <p style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '1rem' }}>{product.name}</p>
                            {selectedShopId === '' && (
                              <p style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 800 }}>{product.shop_name}</p>
                            )}
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>ຫົວໜ່ວຍ: {product.unit.toUpperCase()}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontWeight: 900, fontSize: '1.2rem', color: 'var(--text-main)' }}>{product.stock}</td>
                      <td>
                        <span className={`badge ${status.badge}`}>
                          {status.label}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid var(--border-strong)', width: 'fit-content' }}>
                          <span style={{ fontWeight: 900, fontSize: '1.1rem', color: 'var(--primary)' }}>{product.stock}</span>
                          <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)' }}>{product.unit.toUpperCase()}</span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'right', paddingRight: '32px' }}>
                        {currentUser?.role === 'admin' ? (
                          <button 
                            onClick={() => { setSelectedProduct(product); setShowAdjustModal(true); }}
                            className="btn-primary"
                            style={{ 
                              padding: '10px 24px', 
                              borderRadius: '12px', 
                              fontSize: '0.85rem',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '8px'
                            }}
                          >
                            <Edit3 size={16} />
                            <span>ປັບປຸງ</span>
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>ສະເພາະຜູ້ເບິ່ງແຍງ</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
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
                  ກຳລັງສະແດງ <span style={{ color: 'var(--text-main)' }}>{totalItems === 0 ? 0 : indexOfFirstItem + 1}</span> ຫາ <span style={{ color: 'var(--text-main)' }}>{Math.min(indexOfLastItem, totalItems)}</span> ຈາກ <span style={{ color: 'var(--text-main)' }}>{totalItems}</span> ລາຍການ
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

      {/* Stock Adjustment Modal */}
      {showAdjustModal && selectedProduct && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(8px)' }}>
          <div style={{ background: '#fff', width: '90%', maxWidth: '450px', borderRadius: '32px', padding: '40px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', position: 'relative' }}>
            <div style={{ display: 'flex', gap: '20px', marginBottom: '32px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                <img src={`${IMAGE_BASE_URL}/${selectedProduct.imagePath}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e: any) => { e.target.src = `${IMAGE_BASE_URL}/assets/images/default.png`; }} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 900 }}>ປັບປຸງສະຕັອກສິນຄ້າ</h2>
                <p style={{ fontWeight: 800, color: 'var(--primary)' }}>{selectedProduct.name}</p>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>ຈຳນວນປັດຈຸບັນ: {selectedProduct.stock} {selectedProduct.unit.toUpperCase()}</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '32px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 900, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>ຈຳນວນທີ່ປ່ຽນແປງ (±)</label>
                <div style={{ position: 'relative' }}>
                  <Package size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
                  <input 
                    type="number" 
                    className="input-premium" 
                    style={{ paddingLeft: '48px' }}
                    value={adjustAmount}
                    onChange={(e) => setAdjustAmount(e.target.value)}
                    placeholder="ຕົວຢ່າງ: 50 ຫຼື -10"
                  />
                </div>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '8px', fontWeight: 600 }}>* ໃຊ້ຄ່າບວກເພື່ອ ເພີ່ມ, ຄ່າລົບເພື່ອ ຫຼຸດ</p>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 900, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>ຮູບແບບການປັບປຸງ</label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button 
                    onClick={() => setAdjustType('Restock')}
                    type="button"
                    style={{ 
                      flex: 1, padding: '12px', borderRadius: '14px', border: '1px solid var(--border-strong)',
                      background: adjustType === 'Restock' ? 'var(--primary)' : '#fff',
                      color: adjustType === 'Restock' ? '#fff' : 'var(--text-main)',
                      fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'var(--transition)'
                    }}
                  >
                    <ArrowUpCircle size={18} /> ເພີ່ມສະຕັອກ
                  </button>
                  <button 
                    onClick={() => setAdjustType('Adjustment')}
                    type="button"
                    style={{ 
                      flex: 1, padding: '12px', borderRadius: '14px', border: '1px solid var(--border-strong)',
                      background: adjustType === 'Adjustment' ? '#3b82f6' : '#fff',
                      color: adjustType === 'Adjustment' ? '#fff' : 'var(--text-main)',
                      fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'var(--transition)'
                    }}
                  >
                    <RefreshCw size={18} /> ປັບປຸງສະຕັອກ
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 900, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>ເຫດຜົນໃນການປັບປຸງ (Audit)</label>
                <textarea 
                  className="input-premium"
                  style={{ height: '80px', resize: 'none' }}
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="ລະບຸເຫດຜົນໃນການປັບປຸງ (ເຊັ່ນ: ສິນຄ້າເຂົ້າໃໝ່, ສິນຄ້າເປ່ເພ, ນັບສະຕັອກຜິດ)..."
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <button onClick={() => setShowAdjustModal(false)} className="btn-secondary" style={{ flex: 1, padding: '14px', borderRadius: '16px', fontWeight: 800 }}>ຍົກເລີກ</button>
              <button 
                onClick={handleAdjustStock}
                disabled={isAdjusting || !adjustAmount || !adjustReason}
                className="btn-primary" 
                style={{ flex: 1, padding: '14px', borderRadius: '16px', fontWeight: 800 }}
              >
                {isAdjusting ? 'ກຳລັງດຳເນີນການ...' : 'ຢືນຢັນການປ່ຽນແປງ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockManagement;
