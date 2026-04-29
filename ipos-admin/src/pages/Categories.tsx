import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  Plus, 
  Search, 
  Trash2, 
  Edit2, 
  X,
  ChevronLeft,
  Store,
  Tag
} from 'lucide-react';
import { api } from '../services/api';

const Categories = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', description: '', shop_id: '' });
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
    loadCategories();
  }, [selectedShopId]);

  const loadShops = async () => {
    try {
      const data = await api.getShops(isSystemAdmin ? undefined : (currentUser?.owner_id || currentUser?.id));
      setShops(data);
    } catch (error) {
      console.error('Failed to load shops:', error);
    }
  };

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await api.getCategories(selectedShopId || undefined);
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await api.updateCategory(editingCategory.id, formData);
      } else {
        await api.addCategory(formData);
      }
      setIsModalOpen(false);
      setEditingCategory(null);
      setFormData({ name: '', description: '', shop_id: selectedShopId });
      loadCategories();
    } catch (err: any) {
      alert(err.message || 'Failed to save category');
    }
  };

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setFormData({
      name: category.name || '',
      description: category.description || '',
      shop_id: category.shop_id || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete category "${name}"?`)) {
      try {
        await api.deleteCategory(id);
        loadCategories();
      } catch (err: any) {
        alert(err.message || 'Failed to delete category');
      }
    }
  };

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalItems = filteredCategories.length;
  const currentCategories = filteredCategories.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="animate-slide-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '48px' }}>
        <div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: '8px', color: 'var(--text-main)' }}>Inventory Categories</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 500 }}>Organize your products for better reporting and navigation</p>
        </div>
        {currentUser?.role === 'admin' && (
          <button 
            onClick={() => { setEditingCategory(null); setFormData({ name: '', description: '', shop_id: selectedShopId }); setIsModalOpen(true); }}
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
          >
            <Plus size={20} />
            <span>Create Category</span>
          </button>
        )}
      </div>

      <div className="table-container" style={{ border: 'none', boxShadow: 'var(--shadow-premium)', background: '#fff', borderRadius: '24px', overflow: 'hidden' }}>
        <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border)', display: 'flex', gap: '16px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search categories..." 
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
                <th style={{ textAlign: 'left', padding: '20px 32px' }}>Category Name</th>
                <th style={{ textAlign: 'left', padding: '20px' }}>Description</th>
                <th style={{ textAlign: 'left', padding: '20px' }}>Branch</th>
                <th style={{ textAlign: 'right', padding: '20px 32px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentCategories.map((cat) => (
                <tr key={cat.id} style={{ borderBottom: '1px solid var(--border)' }} className="directory-row">
                  <td style={{ padding: '24px 32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '12px', borderRadius: '14px' }}>
                        <Tag size={20} />
                      </div>
                      <p style={{ fontWeight: 800, color: 'var(--text-main)' }}>{cat.name}</p>
                    </div>
                  </td>
                  <td style={{ padding: '24px 20px' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{cat.description || 'No description provided'}</span>
                  </td>
                  <td style={{ padding: '24px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: 700, fontSize: '0.85rem' }}>
                      <Store size={14} />
                      <span>{shops.find(s => s.id === cat.shop_id)?.name || 'Global'}</span>
                    </div>
                  </td>
                  <td style={{ padding: '24px 32px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                      <button onClick={() => handleEdit(cat)} className="row-action-btn" style={{ padding: '8px', borderRadius: '10px', border: '1px solid var(--border)', background: '#fff', cursor: 'pointer' }}>
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(cat.id, cat.name)} className="row-delete-btn" style={{ padding: '8px', borderRadius: '10px', border: '1px solid #fee2e2', background: '#fff', color: '#dc2626', cursor: 'pointer' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {currentCategories.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <Layers size={48} style={{ opacity: 0.1, marginBottom: '16px' }} />
                    <p>No categories found for this filter</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ background: '#fff', width: '100%', maxWidth: '500px', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ padding: '32px', background: 'var(--bg-sidebar)', color: '#fff', display: 'flex', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 900 }}>{editingCategory ? 'Edit Category' : 'New Category'}</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: '32px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 800, marginBottom: '8px', fontSize: '0.85rem' }}>CATEGORY NAME</label>
                  <input type="text" required placeholder="e.g. Beverages, Snacks" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="input-premium" />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 800, marginBottom: '8px', fontSize: '0.85rem' }}>DESCRIPTION</label>
                  <textarea placeholder="Briefly describe what this category contains" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="input-premium" style={{ height: '100px', resize: 'none' }} />
                </div>
                {isSystemAdmin && (
                  <div>
                    <label style={{ display: 'block', fontWeight: 800, marginBottom: '8px', fontSize: '0.85rem' }}>ASSIGN TO BRANCH</label>
                    <select value={formData.shop_id} onChange={e => setFormData({...formData, shop_id: e.target.value})} className="input-premium">
                      <option value="">Global / All Branches</option>
                      {shops.map(shop => <option key={shop.id} value={shop.id}>{shop.name}</option>)}
                    </select>
                  </div>
                )}
                <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                  <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '14px', borderRadius: '12px', border: '1px solid var(--border)', fontWeight: 800, cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" className="btn-primary" style={{ flex: 2 }}>{editingCategory ? 'Save Changes' : 'Create Category'}</button>
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

export default Categories;
