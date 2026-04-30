import React, { useState, useEffect } from 'react';
import { 
  Users as UsersIcon, 
  Plus, 
  Mail, 
  Shield, 
  Trash2, 
  X, 
  Lock, 
  User, 
  UserPlus,
  Search,
  Filter,
  Settings,
  Store,
  ChevronLeft,
  ChevronRight,
  ChevronLast,
  ChevronFirst
} from 'lucide-react';
import { api } from '../services/api';

const Users = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [shops, setShops] = useState<any[]>([]);
  const [selectedShopId, setSelectedShopId] = useState(() => localStorage.getItem('selectedShopId') || '');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'staff', shop_id: '', shop_ids: [] as string[] });
  
  // Filtering & Pagination State
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const userJson = localStorage.getItem('user');
  const currentUser = userJson ? JSON.parse(userJson) : null;
  const isSystemAdmin = currentUser && !currentUser.shop_id && !currentUser.owner_id;

  useEffect(() => {
    loadUsers();
  }, [selectedShopId]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const [userData, shopData] = await Promise.all([
        api.getUsers(selectedShopId || undefined, isSystemAdmin ? undefined : (currentUser?.owner_id || currentUser?.id)),
        api.getShops(isSystemAdmin ? undefined : (currentUser?.owner_id || currentUser?.id))
      ]);
      setUsers(userData);
      setShops(shopData);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const [activeTab, setActiveTab] = useState('All Members');

  // Filtering Logic
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTab = activeTab === 'All Members' || 
                      (activeTab === 'Managers' && user.role === 'admin') ||
                      (activeTab === 'Staff' && user.role === 'staff') ||
                      (activeTab === 'Inactive' && user.status === 'BLOCK');
                      
    return matchesSearch && matchesTab;
  });

  // Pagination Logic
  const totalItems = filteredUsers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) return;

    try {
      if (editingUser) {
        await api.updateUser(editingUser.id, formData);
      } else {
        await api.addUser(formData);
      }
      setIsModalOpen(false);
      setEditingUser(null);
      setFormData({ name: '', email: '', password: '', confirmPassword: '', role: 'staff', shop_id: '', shop_ids: [] });
      loadUsers();
    } catch (err: any) {
      alert(err.message || 'ບໍ່ສາມາດດຳເນີນການໄດ້');
    }
  };

  const handleEdit = (user: any) => {
    setEditingUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      password: '', // Don't pre-fill password for security
      confirmPassword: '',
      role: user.role || 'staff',
      shop_id: user.shop_id || '',
      shop_ids: user.assigned_shop_ids || []
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`ເຈົ້າແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບ ${name}?`)) {
      try {
        await api.deleteUser(id);
        loadUsers();
      } catch (err: any) {
        alert(err.message || 'ບໍ່ສາມາດລຶບຜູ້ໃຊ້ໄດ້');
      }
    }
  };

  const isPasswordError = !!(formData.confirmPassword && formData.password !== formData.confirmPassword);


  return (
    <>
      <div className="animate-slide-up">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '48px' }}>
          <div>
            <h1 style={{ fontSize: '2.4rem', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: '8px', color: 'var(--text-main)' }}>ລາຍຊື່ທີມງານ</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 500 }}>ການຄວບຄຸມການເຂົ້າເຖິງທົ່ວໂລກ ແລະ ການຈັດການພະນັກງານ</p>
          </div>
          {currentUser?.role === 'admin' && (
            <button 
              onClick={() => {
                setEditingUser(null);
                setFormData({ name: '', email: '', password: '', confirmPassword: '', role: 'staff', shop_id: '', shop_ids: [] });
                setIsModalOpen(true);
              }}
              className="btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
            >
              <UserPlus size={20} />
              <span>ເພີ່ມສະມາຊິກທີມ</span>
            </button>
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
                  placeholder="ຄົ້ນຫາຕາມຊື່, ອີເມວ ຫຼື ລະຫັດພະນັກງານ..." 
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

            {/* Identity Filter Module */}
              <button style={{ 
                height: '50px', padding: '0 24px', borderRadius: '16px', 
                border: '1px solid var(--border-strong)', background: '#fff', 
                color: 'var(--text-main)', display: 'flex', alignItems: 'center', 
                gap: '12px', cursor: 'pointer', fontWeight: 800, fontSize: '0.9rem',
                transition: 'var(--transition)'
              }} className="btn-hover-premium">
                <Filter size={18} />
                <span>ໂຕຕອງຂໍ້ມູນ</span>
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '8px', background: '#f1f5f9', padding: '4px', borderRadius: '14px' }}>
                {['ສະມາຊິກທັງໝົດ', 'ຜູ້ຈັດການ', 'ພະນັກງານ', 'ບໍ່ໄດ້ໃຊ້ງານ'].map((t) => (
                  <button 
                    key={t}
                    onClick={() => { 
                      const mapTab = (txt: string) => {
                        if (txt === 'ສະມາຊິກທັງໝົດ') return 'All Members';
                        if (txt === 'ຜູ້ຈັດການ') return 'Managers';
                        if (txt === 'ພະນັກງານ') return 'Staff';
                        if (txt === 'ບໍ່ໄດ້ໃຊ້ງານ') return 'Inactive';
                        return txt;
                      };
                      setActiveTab(mapTab(t)); 
                      setCurrentPage(1); 
                    }}
                    style={{
                      padding: '8px 20px', borderRadius: '11px', border: 'none', cursor: 'pointer',
                      background: (t === 'ສະມາຊິກທັງໝົດ' && activeTab === 'All Members') || 
                                 (t === 'ຜູ້ຈັດການ' && activeTab === 'Managers') || 
                                 (t === 'ພະນັກງານ' && activeTab === 'Staff') || 
                                 (t === 'ບໍ່ໄດ້ໃຊ້ງານ' && activeTab === 'Inactive') ? '#fff' : 'transparent',
                      color: (t === 'ສະມາຊິກທັງໝົດ' && activeTab === 'All Members') || 
                                 (t === 'ຜູ້ຈັດການ' && activeTab === 'Managers') || 
                                 (t === 'ພະນັກງານ' && activeTab === 'Staff') || 
                                 (t === 'ບໍ່ໄດ້ໃຊ້ງານ' && activeTab === 'Inactive') ? 'var(--primary)' : 'var(--text-muted)',
                      fontWeight: 800, fontSize: '0.85rem',
                      boxShadow: (t === 'ສະມາຊິກທັງໝົດ' && activeTab === 'All Members') || 
                                 (t === 'ຜູ້ຈັດການ' && activeTab === 'Managers') || 
                                 (t === 'ພະນັກງານ' && activeTab === 'Staff') || 
                                 (t === 'ບໍ່ໄດ້ໃຊ້ງານ' && activeTab === 'Inactive') ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
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
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.04em' }}>ລາຍຊື່ທີ່ປອດໄພ</span>
                 </div>
                 <div style={{ width: '1px', height: '16px', background: 'var(--border-strong)' }}></div>
                 <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>{filteredUsers.length} ຄົນ</span>
              </div>
            </div>
          </div>

          {loading ? (
            <div style={{ padding: '100px', textAlign: 'center' }}>
              <div className="spinner" style={{ margin: '0 auto 24px' }}></div>
              <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>ກຳລັງຊິງຂໍ້ມູນລາຍຊື່...</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ borderCollapse: 'separate', borderSpacing: 0, width: '100%' }}>
                <thead>
                  <tr>
                    <th style={{ paddingLeft: '32px' }}>ຂໍ້ມູນສະມາຊິກ</th>
                    <th>ອີເມວ</th>
                    <th>ບົດບາດ / ໜ້າທີ່</th>
                    <th>ສະຖານະການເຮັດວຽກ</th>
                    <th style={{ textAlign: 'right', paddingRight: '32px' }}>ສູນຄວບຄຸມ</th>
                  </tr>
                </thead>
                <tbody>
                  {currentUsers.map((user) => (
                    <tr key={user.id} className="directory-row">
                      <td style={{ paddingLeft: '32px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div style={{ 
                            background: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)', 
                            padding: '12px', 
                            borderRadius: '16px', 
                            color: 'var(--bg-sidebar)',
                            boxShadow: 'var(--shadow-sm)',
                            display: 'flex'
                          }}>
                            <User size={20} />
                          </div>
                          <div>
                            <p style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '1rem' }}>{user.name}</p>
                            <p style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 700 }}>
                              {shops.find(s => s.id === user.shop_id)?.name || 'ບໍ່ມີຮ້ານຄ້າ'}
                            </p>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>UID: {user.id.toString().slice(-6)}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)', fontWeight: 500 }}>
                          <Mail size={15} style={{ opacity: 0.5 }} />
                          <span>{user.email}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${user.role === 'admin' ? 'badge-danger' : user.role === 'staff' ? 'badge-blue' : 'badge-success'}`}>
                          {user.role === 'admin' ? 'ຜູ້ຈັດການ' : user.role === 'staff' ? 'ພະນັກງານ' : 'ຜູ້ໃຊ້'}
                        </span>
                      </td>
                      <td>
                        <p style={{ fontWeight: 600, color: 'var(--text-muted)' }}>
                          {user.created_at ? new Date(user.created_at).toLocaleDateString('en-GB') : 'ຊິງອັດຕະໂນມັດ'}
                        </p>
                      </td>
                      <td style={{ textAlign: 'right', paddingRight: '32px' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                          {currentUser?.role === 'admin' ? (
                            <>
                              <button 
                                onClick={() => handleEdit(user)}
                                style={{ 
                                  padding: '10px', 
                                  borderRadius: '12px', 
                                  border: '1px solid var(--border-strong)', 
                                  background: '#fff', 
                                  color: 'var(--text-main)',
                                  cursor: 'pointer',
                                  transition: 'var(--transition)'
                                }} className="row-action-btn">
                                <Settings size={16} />
                              </button>
                              <button 
                                onClick={() => handleDelete(user.id, user.name)}
                                style={{ 
                                  padding: '10px', 
                                  borderRadius: '12px', 
                                  border: '1px solid #fee2e2', 
                                  background: '#fff', 
                                  color: '#dc2626', 
                                  cursor: 'pointer',
                                  transition: 'var(--transition)'
                                }} className="row-delete-btn">
                                <Trash2 size={16} />
                              </button>
                            </>
                          ) : (
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>ເບິ່ງຢ່າງດຽວ</span>
                          )}
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
                    ກຳລັງສະແດງ <span style={{ color: 'var(--text-main)' }}>{indexOfFirstItem + 1}</span> ຫາ <span style={{ color: 'var(--text-main)' }}>{Math.min(indexOfLastItem, totalItems)}</span> ຈາກ <span style={{ color: 'var(--text-main)' }}>{totalItems}</span> ສະມາຊິກ
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
                      // Only show current page and neighbors if many pages
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
            </div>
          )}
        </div>

        {/* Modal Level 2 */}
        {isModalOpen && (
          <div style={{ 
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
            background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)',
            zIndex: 3000, display: 'flex', justifyContent: 'center', alignItems: 'center',
            padding: '20px'
          }}>
            <div className="animate-slide-up" style={{ 
              width: '100%', maxWidth: '520px', background: '#fff', borderRadius: '32px', 
              overflow: 'hidden', boxShadow: '0 40px 100px -20px rgba(0,0,0,0.4)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <div style={{ 
                background: 'var(--bg-sidebar)', 
                padding: '36px 40px', 
                color: '#fff', 
                position: 'relative', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '20px' 
              }}>
                <div style={{ 
                  background: 'linear-gradient(135deg, var(--primary), #059669)', 
                  padding: '14px', 
                  borderRadius: '20px',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.3)'
                }}>
                  <UserPlus size={28} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 900 }}>{editingUser ? 'ແກ້ໄຂສະມາຊິກທີມ' : 'ເພີ່ມສະມາຊິກໃໝ່'}</h2>
                  <p style={{ opacity: 0.5, fontSize: '0.9rem', fontWeight: 500 }}>ກຳນົດບົດບາດ ແລະ ຂອບເຂດການເຂົ້າເຖິງ</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  style={{ 
                    position: 'absolute', top: '32px', right: '32px', 
                    background: 'rgba(255,255,255,0.08)', border: 'none', 
                    cursor: 'pointer', color: '#fff', padding: '10px', 
                    borderRadius: '14px', transition: 'var(--transition)'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} style={{ padding: '40px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 800, marginBottom: '10px', color: 'var(--text-main)' }}>ຊື່ແທ້ ແລະ ນາມສະກຸນ</label>
                    <input 
                      type="text" required value={formData.name}
                      placeholder="ເຊັ່ນ: ສົມໃຈ ວົງສຸວັນ"
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="input-premium"
                    />
                  </div>

                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 800, marginBottom: '10px', color: 'var(--text-main)' }}>ທີ່ຢູ່ອີເມວ</label>
                    <input 
                      type="email" required value={formData.email}
                      placeholder="alex@ipos-pro.com"
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="input-premium"
                      style={{ background: '#f8fafc' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      <div className="form-group">
                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 800, marginBottom: '10px' }}>ຕັ້ງລະຫັດຜ່ານ</label>
                        <input 
                          type="password" 
                          required={!editingUser}
                          value={formData.password}
                          placeholder="••••••••"
                          onChange={(e) => setFormData({...formData, password: e.target.value})}
                          className="input-premium"
                        />
                      </div>
                      <div className="form-group">
                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 800, marginBottom: '10px', color: isPasswordError ? '#dc2626' : 'inherit' }}>ຢືນຢັນລະຫັດຜ່ານ</label>
                        <input 
                          type="password" 
                          required={!editingUser}
                          value={formData.confirmPassword}
                          placeholder="••••••••"
                          onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                          className="input-premium"
                          style={{ borderColor: isPasswordError ? '#dc2626' : undefined, background: '#f8fafc' }}
                        />
                      </div>
                  </div>

                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 800, marginBottom: '10px' }}>ບົດບາດການເຂົ້າເຖິງ</label>
                    <div style={{ position: 'relative' }}>
                      <select 
                        value={formData.role}
                        onChange={(e) => {
                          setFormData({...formData, role: e.target.value, shop_ids: []});
                        }}
                        className="input-premium"
                        style={{ appearance: 'none', cursor: 'pointer', fontWeight: 600 }}
                      >
                        <option value="user">ຜູ້ໃຊ້ທົ່ວໄປ</option>
                        <option value="staff">ພະນັກງານ / ແຄັດເຊຍ</option>
                        <option value="admin">ຜູ້ຈັດການ / ຜູ້ດູແລທຸລະກິດ</option>
                      </select>
                      <div style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                        <Filter size={16} color="var(--text-sidebar)" />
                      </div>
                    </div>
                  </div>

                  {(isSystemAdmin || currentUser?.role === 'admin') && (
                    <div className="form-group">
                      <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 800, marginBottom: '12px' }}>
                        {formData.role === 'admin' ? 'ກຳນົດຮ້ານຄ້າທີ່ເຂົ້າເຖິງໄດ້ (ເລືອກໄດ້ຫຼາຍ)' : 'ກຳນົດຮ້ານຄ້າຫຼັກ (ເລືອກໄດ້ໜຶ່ງ)'}
                      </label>
                      
                      {formData.role === 'admin' ? (
                        /* Multi-select for Admins */
                        <div style={{ 
                          display: 'grid', 
                          gridTemplateColumns: '1fr 1fr', 
                          gap: '12px', 
                          background: '#f8fafc', 
                          padding: '20px', 
                          borderRadius: '20px',
                          border: '1px solid var(--border-strong)',
                          maxHeight: '200px',
                          overflowY: 'auto'
                        }}>
                          {shops.map(shop => (
                            <label key={shop.id} style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '10px', 
                              cursor: 'pointer',
                              padding: '8px 12px',
                              borderRadius: '12px',
                              background: formData.shop_ids.includes(shop.id) ? '#fff' : 'transparent',
                              boxShadow: formData.shop_ids.includes(shop.id) ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                              transition: 'var(--transition)'
                            }}>
                              <input 
                                type="checkbox" 
                                checked={formData.shop_ids.includes(shop.id)}
                                onChange={(e) => {
                                  const newIds = e.target.checked 
                                    ? [...formData.shop_ids, shop.id]
                                    : formData.shop_ids.filter(id => id !== shop.id);
                                  setFormData({...formData, shop_ids: newIds});
                                }}
                                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary)' }}
                              />
                              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: formData.shop_ids.includes(shop.id) ? 'var(--primary)' : 'var(--text-main)' }}>{shop.name}</span>
                            </label>
                          ))}
                        </div>
                      ) : (
                        /* Single-select for Staff/Others */
                        <div style={{ position: 'relative' }}>
                          <select 
                            value={formData.shop_ids[0] || ''}
                            onChange={(e) => setFormData({...formData, shop_ids: e.target.value ? [e.target.value] : []})}
                            className="input-premium"
                            style={{ appearance: 'none', cursor: 'pointer', fontWeight: 600 }}
                          >
                             <option value="">-- ຍັງບໍ່ທັນກຳນົດຮ້ານ --</option>
                            {shops.map(shop => (
                              <option key={shop.id} value={shop.id}>{shop.name}</option>
                            ))}
                          </select>
                          <div style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                            <Store size={16} color="var(--text-sidebar)" />
                          </div>
                        </div>
                      )}

                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px', fontWeight: 500 }}>
                        {formData.shop_ids.length === 0 
                          ? '⚠️ ຍັງບໍ່ທັນກຳນົດຮ້ານ (ເຫັນໄດ້ທຸກສາຂາ)' 
                          : formData.role === 'admin' 
                            ? `✓ ເລືອກແລ້ວ ${formData.shop_ids.length} ສາຂາ` 
                            : `✓ ກຳນົດໃຫ້: ${shops.find(s => s.id === formData.shop_ids[0])?.name}`}
                      </p>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
                    <button 
                      type="button" 
                      onClick={() => setIsModalOpen(false)} 
                      style={{ 
                        flex: 1, 
                        padding: '16px', 
                        borderRadius: '16px', 
                        border: '1px solid var(--border-strong)', 
                        background: '#fff', 
                        color: 'var(--text-main)', 
                        fontWeight: 800, 
                        cursor: 'pointer',
                        transition: 'var(--transition)'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'}
                      onMouseOut={(e) => e.currentTarget.style.background = '#fff'}
                    >
                      ຍົກເລີກ
                    </button>
                    <button 
                      type="submit" 
                      disabled={isPasswordError}
                      className="btn-primary"
                      style={{ flex: 1.8, justifyContent: 'center', opacity: isPasswordError ? 0.5 : 1, fontSize: '1rem' }}
                    >
                      {editingUser ? 'ບັນທຶກການປ່ຽນແປງ' : 'ສ້າງບັນຊີ'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      
      <style>{`
        .directory-row td { transition: var(--transition); }
        .directory-row:hover td { background: #fcfdfe; }
        .row-action-btn:hover { border-color: var(--primary) !important; color: var(--primary) !important; transform: scale(1.05); }
        .row-delete-btn:hover { background: #fef2f2 !important; transform: scale(1.05); }
        .spinner { width: 44px; height: 44px; border: 4px solid #f1f5f9; border-top: 4px solid var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .badge-blue { background: #e0f2fe; color: #0369a1; }
        .pagination-btn {
          width: 36px; height: 36px; border-radius: 10px; 
          border: 1px solid var(--border-strong); background: #fff; 
          color: var(--text-main); display: flex; align-items: center; 
          justify-content: center; cursor: pointer; transition: var(--transition);
        }
        .pagination-btn:hover:not(:disabled) { border-color: var(--primary); color: var(--primary); }
        .pagination-btn:disabled { opacity: 0.3; cursor: not-allowed; }
      `}</style>
    </>
  );
};

export default Users;



