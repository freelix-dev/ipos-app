import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  DollarSign, 
  Calendar, 
  Tag, 
  FileText,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';

const Expenses = () => {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [shops, setShops] = useState<any[]>([]);
  const [selectedShopId, setSelectedShopId] = useState(() => localStorage.getItem('selectedShopId') || '');
  
  const [newExpense, setNewExpense] = useState({
    category: 'Supplies',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const userJson = localStorage.getItem('user');
  const currentUser = userJson ? JSON.parse(userJson) : null;
  const isSystemAdmin = currentUser && !currentUser.shop_id;

  const categories = ["Supplies", "Utilities", "Rent", "Salaries", "Maintenance", "Marketing", "Other"];

  useEffect(() => {
    loadShops();
    loadExpenses();
  }, [selectedShopId]);

  const loadShops = async () => {
    try {
      const data = await api.getShops(isSystemAdmin ? undefined : (currentUser?.owner_id || currentUser?.id));
      setShops(data);
    } catch (error) {
      console.error('Failed to load shops:', error);
    }
  };

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const isOwner = currentUser?.role === 'admin' && !currentUser?.owner_id;
      const effectiveShopId = (isSystemAdmin || isOwner) ? selectedShopId : (selectedShopId || currentUser?.shop_id);
      if (effectiveShopId) {
        const data = await api.getExpenses(effectiveShopId);
        setExpenses(data);
      }
    } catch (error) {
      console.error('Failed to load expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const isOwner = currentUser?.role === 'admin' && !currentUser?.owner_id;
      const shopId = (isSystemAdmin || isOwner) ? selectedShopId : currentUser?.shop_id;
      
      if (!shopId) {
        alert('Please select a shop first');
        return;
      }

      await api.createExpense({
        ...newExpense,
        shop_id: shopId,
        amount: parseFloat(newExpense.amount)
      });
      setShowAddModal(false);
      setNewExpense({
        category: 'Supplies',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
      loadExpenses();
    } catch (error) {
      alert('Failed to add expense');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      await api.deleteExpense(id);
      loadExpenses();
    } catch (error) {
      alert('Failed to delete');
    }
  };

  const filteredExpenses = expenses.filter(e => {
    const matchesCategory = categoryFilter === 'All' || e.category === categoryFilter;
    const matchesSearch = e.description?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          e.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalExpense = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="animate-slide-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '48px' }}>
        <div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: '8px' }}>Expense Management</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 500 }}>Track operational costs and overheads</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 28px' }}>
          <Plus size={20} />
          <span>Record Expense</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        <div className="card-premium" style={{ background: 'linear-gradient(135deg, #fff 0%, #f8fafc 100%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: '#fee2e2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={24} />
            </div>
            <div>
              <p style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Expenditure</p>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ef4444' }}>{new Intl.NumberFormat('lo-LA', { style: 'currency', currency: 'LAK' }).format(totalExpense)}</h2>
            </div>
          </div>
        </div>
        
        <div className="card-premium">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: '#e0f2fe', color: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Tag size={24} />
            </div>
            <div>
              <p style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Primary Category</p>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 900 }}>Utilities & Rent</h2>
            </div>
          </div>
        </div>
      </div>

      <div className="table-container" style={{ border: 'none', boxShadow: 'var(--shadow-premium)' }}>
        <div style={{ padding: '24px 32px', background: '#fff', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px' }}>
          <div style={{ display: 'flex', gap: '16px', flex: 1 }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
              <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-sidebar)', opacity: 0.6 }} />
              <input 
                type="text" 
                placeholder="Search descriptions or categories..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', height: '48px', padding: '0 16px 0 48px', borderRadius: '14px', border: '1px solid var(--border-strong)', background: '#f8fafc', fontWeight: 600 }}
              />
            </div>
            
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{ padding: '0 16px', height: '48px', borderRadius: '14px', border: '1px solid var(--border-strong)', background: '#fff', fontWeight: 700, color: 'var(--primary)', outline: 'none' }}
            >
              <option value="All">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {(isSystemAdmin || currentUser?.role === 'admin') && (
            <select 
              value={selectedShopId}
              onChange={(e) => {
                setSelectedShopId(e.target.value);
                localStorage.setItem('selectedShopId', e.target.value);
              }}
              style={{ height: '48px', padding: '0 20px', borderRadius: '14px', border: '1px solid var(--border-strong)', fontWeight: 800, color: 'var(--primary)' }}
            >
              <option value="">Select Branch</option>
              {shops.map(shop => <option key={shop.id} value={shop.id}>{shop.name}</option>)}
            </select>
          )}
        </div>

        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <div className="spinner" style={{ margin: '0 auto 20px' }}></div>
            <p style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Analyzing financial records...</p>
          </div>
        ) : (
          <table style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr>
                <th style={{ paddingLeft: '32px' }}>Date</th>
                <th>Category</th>
                <th>Description</th>
                <th>Amount</th>
                <th style={{ textAlign: 'right', paddingRight: '32px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.map((expense) => (
                <tr key={expense.id} className="directory-row">
                  <td style={{ paddingLeft: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Calendar size={16} color="var(--primary)" />
                      <span style={{ fontWeight: 700 }}>{new Date(expense.date).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td>
                    <span style={{ 
                      padding: '6px 12px', borderRadius: '8px', background: '#f1f5f9', 
                      fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-main)',
                      border: '1px solid var(--border-strong)'
                    }}>
                      {expense.category.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{expense.description || '-'}</td>
                  <td style={{ fontWeight: 900, color: '#ef4444', fontSize: '1rem' }}>
                    {new Intl.NumberFormat('lo-LA', { style: 'currency', currency: 'LAK' }).format(expense.amount)}
                  </td>
                  <td style={{ textAlign: 'right', paddingRight: '32px' }}>
                    <button onClick={() => handleDelete(expense.id)} style={{ padding: '8px', borderRadius: '10px', background: 'none', border: '1px solid #fee2e2', color: '#ef4444', cursor: 'pointer' }}>
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredExpenses.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)', fontWeight: 600 }}>
                    No expense records found for this period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' }}>
          <form onSubmit={handleAddExpense} className="animate-slide-up" style={{ background: '#fff', width: '90%', maxWidth: '500px', borderRadius: '32px', padding: '40px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '8px' }}>Record Expense</h2>
            <p style={{ color: 'var(--text-muted)', fontWeight: 600, marginBottom: '32px' }}>Enter the details of your operational expenditure.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '32px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 900, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Classification</label>
                <select 
                  className="input-premium"
                  value={newExpense.category}
                  onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 900, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Financial Valuation (LAK)</label>
                <div style={{ position: 'relative' }}>
                  <DollarSign size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
                  <input 
                    type="number" 
                    className="input-premium" 
                    style={{ paddingLeft: '48px' }}
                    required
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 900, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Chronological Date</label>
                <input 
                  type="date" 
                  className="input-premium"
                  required
                  value={newExpense.date}
                  onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 900, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Particulars / Remark</label>
                <textarea 
                  className="input-premium"
                  style={{ height: '100px', resize: 'none' }}
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                  placeholder="Describe the nature of this expense..."
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary" style={{ flex: 1, padding: '14px', borderRadius: '16px', fontWeight: 800 }}>Cancel</button>
              <button type="submit" className="btn-primary" style={{ flex: 1, padding: '14px', borderRadius: '16px', fontWeight: 800 }}>Commit Entry</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Expenses;
