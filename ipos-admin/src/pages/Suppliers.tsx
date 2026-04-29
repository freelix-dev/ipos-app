import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  Plus, 
  Search, 
  Phone, 
  Mail, 
  MapPin, 
  Trash2, 
  Edit2, 
  X,
  Filter,
  ChevronLeft,
  ChevronRight,
  ChevronLast,
  ChevronFirst,
  User
} from 'lucide-react';
import { api } from '../services/api';

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', contact_name: '', phone: '', email: '', address: '', shop_id: '' });
  const [shops, setShops] = useState<any[]>([]);
  const [selectedShopId, setSelectedShopId] = useState(() => localStorage.getItem('selectedShopId') || '');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const userJson = localStorage.getItem('user');
  const currentUser = userJson ? JSON.parse(userJson) : null;
  const isSystemAdmin = currentUser && !currentUser.shop_id;

  useEffect(() => {
    loadShops();
    loadSuppliers();
  }, [selectedShopId]);

  const loadShops = async () => {
    try {
      const data = await api.getShops(isSystemAdmin ? undefined : (currentUser?.owner_id || currentUser?.id));
      setShops(data);
    } catch (error) {
      console.error('Failed to load shops:', error);
    }
  };

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const data = await api.getSuppliers(selectedShopId || undefined);
      setSuppliers(data);
    } catch (error) {
      console.error('Failed to load suppliers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSupplier) {
        await api.updateSupplier(editingSupplier.id, formData);
      } else {
        await api.addSupplier(formData);
      }
      setIsModalOpen(false);
      setEditingSupplier(null);
      setFormData({ name: '', contact_name: '', phone: '', email: '', address: '', shop_id: '' });
      loadSuppliers();
    } catch (err: any) {
      alert(err.message || 'Failed to save supplier');
    }
  };

  const handleEdit = (supplier: any) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name || '',
      contact_name: supplier.contact_name || '',
      phone: supplier.phone || '',
      email: supplier.email || '',
      address: supplier.address || '',
      shop_id: supplier.shop_id || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete supplier "${name}"?`)) {
      try {
        await api.deleteSupplier(id);
        loadSuppliers();
      } catch (err: any) {
        alert(err.message || 'Failed to delete supplier');
      }
    }
  };

  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (s.contact_name && s.contact_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalItems = filteredSuppliers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const currentSuppliers = filteredSuppliers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="animate-slide-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '48px' }}>
        <div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: '8px', color: 'var(--text-main)' }}>Supplier Network</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 500 }}>Manage inventory sources and procurement contacts</p>
        </div>
        {currentUser?.role === 'admin' && (
          <button 
            onClick={() => { setEditingSupplier(null); setFormData({ name: '', contact_name: '', phone: '', email: '', address: '', shop_id: selectedShopId }); setIsModalOpen(true); }}
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
          >
            <Plus size={20} />
            <span>Onboard Supplier</span>
          </button>
        )}
      </div>

      <div className="table-container" style={{ border: 'none', boxShadow: 'var(--shadow-premium)', background: '#fff', borderRadius: '24px', overflow: 'hidden' }}>
        <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border)', display: 'flex', gap: '16px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search suppliers..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ 
                width: '100%', height: '50px', padding: '0 16px 0 48px', 
                borderRadius: '16px', border: '1px solid var(--border-strong)', 
                background: '#f8fafc', fontSize: '0.9rem', outline: 'none'
              }}
            />
          </div>
          
          {(isSystemAdmin || (currentUser?.role === 'admin')) && (
            <select 
              value={selectedShopId}
              onChange={(e) => setSelectedShopId(e.target.value)}
              style={{ 
                height: '50px', padding: '0 16px', borderRadius: '16px', border: '1px solid var(--border-strong)',
                background: '#fff', fontWeight: 800, color: 'var(--primary)', outline: 'none'
              }}
            >
              <option value="">All Branches</option>
              {shops.map(shop => <option key={shop.id} value={shop.id}>{shop.name}</option>)}
            </select>
          )}
        </div>

        {loading ? (
          <div style={{ padding: '80px', textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto' }}></div></div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ textAlign: 'left', padding: '20px 32px' }}>Supplier Detail</th>
                <th style={{ textAlign: 'left', padding: '20px' }}>Contact Person</th>
                <th style={{ textAlign: 'left', padding: '20px' }}>Communication</th>
                <th style={{ textAlign: 'right', padding: '20px 32px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentSuppliers.map((supplier) => (
                <tr key={supplier.id} style={{ borderBottom: '1px solid var(--border)' }} className="directory-row">
                  <td style={{ padding: '24px 32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '12px', borderRadius: '14px' }}>
                        <Truck size={20} />
                      </div>
                      <div>
                        <p style={{ fontWeight: 800, color: 'var(--text-main)' }}>{supplier.name}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{supplier.address || 'No address'}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '24px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)', fontWeight: 600 }}>
                      <User size={16} opacity={0.5} />
                      <span>{supplier.contact_name || 'N/A'}</span>
                    </div>
                  </td>
                  <td style={{ padding: '24px 20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)', fontSize: '0.85rem' }}>
                        <Phone size={14} opacity={0.5} />
                        <span>{supplier.phone || 'No phone'}</span>
                      </div>
                      {supplier.email && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                          <Mail size={14} opacity={0.5} />
                          <span>{supplier.email}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '24px 32px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                      <button onClick={() => handleEdit(supplier)} className="row-action-btn" style={{ padding: '8px', borderRadius: '10px', border: '1px solid var(--border)', background: '#fff', cursor: 'pointer' }}>
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(supplier.id, supplier.name)} className="row-delete-btn" style={{ padding: '8px', borderRadius: '10px', border: '1px solid #fee2e2', background: '#fff', color: '#dc2626', cursor: 'pointer' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ background: '#fff', width: '100%', maxWidth: '500px', borderRadius: '24px', overflow: 'hidden' }}>
            <div style={{ padding: '32px', background: 'var(--bg-sidebar)', color: '#fff', display: 'flex', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 900 }}>{editingSupplier ? 'Edit Supplier' : 'New Supplier'}</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: '32px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 800, marginBottom: '8px', fontSize: '0.85rem' }}>SUPPLIER NAME</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="input-premium" />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 800, marginBottom: '8px', fontSize: '0.85rem' }}>CONTACT PERSON</label>
                  <input type="text" value={formData.contact_name} onChange={e => setFormData({...formData, contact_name: e.target.value})} className="input-premium" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 800, marginBottom: '8px', fontSize: '0.85rem' }}>PHONE</label>
                    <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="input-premium" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 800, marginBottom: '8px', fontSize: '0.85rem' }}>EMAIL</label>
                    <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="input-premium" />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 800, marginBottom: '8px', fontSize: '0.85rem' }}>ADDRESS</label>
                  <textarea value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="input-premium" style={{ height: '80px', resize: 'none' }} />
                </div>
                {isSystemAdmin && (
                  <div>
                    <label style={{ display: 'block', fontWeight: 800, marginBottom: '8px', fontSize: '0.85rem' }}>ASSIGN TO SHOP</label>
                    <select value={formData.shop_id} onChange={e => setFormData({...formData, shop_id: e.target.value})} className="input-premium">
                      <option value="">Global / All Shops</option>
                      {shops.map(shop => <option key={shop.id} value={shop.id}>{shop.name}</option>)}
                    </select>
                  </div>
                )}
                <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                  <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '14px', borderRadius: '12px', border: '1px solid var(--border)', fontWeight: 800, cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" className="btn-primary" style={{ flex: 2 }}>{editingSupplier ? 'Save Changes' : 'Onboard'}</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .directory-row td { transition: var(--transition); }
        .directory-row:hover td { background: #fcfdfe; }
        .row-action-btn:hover { border-color: var(--primary) !important; color: var(--primary) !important; transform: scale(1.05); }
        .row-delete-btn:hover { background: #fef2f2 !important; transform: scale(1.05); }
        .spinner { width: 44px; height: 44px; border: 4px solid #f1f5f9; border-top: 4px solid var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Suppliers;
