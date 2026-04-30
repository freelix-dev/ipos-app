import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Users, 
  Package, 
  Settings, 
  LogOut, 
  Database,
  Layers,
  PieChart,
  TrendingUp,
  Store,
  Coins,
  ChevronDown,
  ChevronUp,
  Truck,
  History,
  FileText,
  Smartphone,
  Tag,
  Wallet,
  Activity
} from 'lucide-react';

const Sidebar = () => {
  const navigate = useNavigate();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const userJson = localStorage.getItem('user');
  const currentUser = userJson ? JSON.parse(userJson) : null;
  const isSystemAdmin = currentUser && !currentUser.shop_id;

  const menuItems = [
    ...(isSystemAdmin ? [
      { icon: <Activity size={20} />, label: 'ຂໍ້ມູນວິເຄາະຜູ້ດູແລ', path: '/admin-insights' }
    ] : []),
    { icon: <LayoutDashboard size={19} />, label: 'ແຜງຄວບຄຸມ', path: '/dashboard' },
    { icon: <ShoppingBag size={20} />, label: 'ລາຍການສັ່ງຊື້', path: '/orders' },
    { icon: <Wallet size={20} />, label: 'ຄ່າໃຊ້ຈ່າຍ', path: '/expenses' },
    { icon: <Package size={20} />, label: 'ສິນຄ້າ', path: '/products' },
    { icon: <Layers size={20} />, label: 'ສະຕັອກ', path: '/stock' },
    { icon: <TrendingUp size={20} />, label: 'ລາຍງານການຂາຍ', path: '/reports/sales' },
    { icon: <PieChart size={20} />, label: 'ລາຍງານສະຕັອກ', path: '/reports/stock' },
    { icon: <Users size={20} />, label: 'ຈັດການຜູ້ໃຊ້', path: '/users' },
    { icon: <Truck size={20} />, label: 'ຜູ້ສະໜອງ', path: '/suppliers' },
    { icon: <Tag size={20} />, label: 'ໝວດໝູ່', path: '/categories' },
    // Only System Admin or Shop Owners (Admins) can manage shops
    ...(currentUser?.role === 'admin' ? [
      { icon: <Store size={20} />, label: 'ຈັດການຮ້ານຄ້າ', path: '/shops' }
    ] : []),
  ];

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
    window.location.reload();
  };

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div style={{ 
          background: 'linear-gradient(135deg, var(--primary), #059669)', 
          padding: '10px', 
          borderRadius: '14px', 
          display: 'flex',
          boxShadow: '0 8px 24px rgba(16, 185, 129, 0.25)',
          transform: 'rotate(-2deg)'
        }}>
          <Layers size={24} color="white" />
        </div>
        <span style={{ fontSize: '1.4rem', letterSpacing: '-0.04em' }}>
          iPOS <span style={{ color: 'var(--primary)', fontWeight: 900 }}>PRO</span>
        </span>
      </div>
      
      <nav className="sidebar-nav">
        {menuItems.map((item, index) => (
          <NavLink 
            key={index} 
            to={item.path} 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <div style={{ display: 'flex', alignItems: 'center', transition: 'var(--transition)' }}>
              {item.icon}
            </div>
            <span>{item.label}</span>
          </NavLink>
        ))}


        {/* Collapsible Settings Menu */}
        <div className="settings-menu-group">
          <div 
            className={`nav-item ${settingsOpen ? 'active' : ''}`} 
            onClick={() => setSettingsOpen(!settingsOpen)}
            style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Settings size={20} />
              </div>
              <span>ສູນຄວບຄຸມ</span>
            </div>
            {settingsOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
          
          {settingsOpen && (
            <div className="submenu" style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
              {currentUser?.role === 'admin' && (
                <>
                  <NavLink 
                    to="/exchange-rates" 
                    className={({ isActive }) => `nav-item submenu-item ${isActive ? 'active' : ''}`}
                    style={{ fontSize: '0.9rem', padding: '10px 18px' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Coins size={18} />
                    </div>
                    <span>ອັດຕາແລກປ່ຽນ</span>
                  </NavLink>
                  <NavLink 
                    to="/settings" 
                    className={({ isActive }) => `nav-item submenu-item ${isActive ? 'active' : ''}`}
                    style={{ fontSize: '0.9rem', padding: '10px 18px' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Database size={18} />
                    </div>
                    <span>ຕັ້ງຄ່າລະບົບ</span>
                  </NavLink>
                  <NavLink 
                    to="/audit-logs" 
                    className={({ isActive }) => `nav-item submenu-item ${isActive ? 'active' : ''}`}
                    style={{ fontSize: '0.9rem', padding: '10px 18px' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <History size={18} />
                    </div>
                    <span>ປະຫວັດການໃຊ້ງານ</span>
                  </NavLink>
                  <NavLink 
                    to="/receipt-settings" 
                    className={({ isActive }) => `nav-item submenu-item ${isActive ? 'active' : ''}`}
                    style={{ fontSize: '0.9rem', padding: '10px 18px' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <FileText size={18} />
                    </div>
                    <span>ອອກແບບໃບບິນ</span>
                  </NavLink>
                  <NavLink 
                    to="/stock-history" 
                    className={({ isActive }) => `nav-item submenu-item ${isActive ? 'active' : ''}`}
                    style={{ fontSize: '0.9rem', padding: '10px 18px' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <History size={18} />
                    </div>
                    <span>ບັນຊີສະຕັອກ</span>
                  </NavLink>
                  {isSystemAdmin && (
                    <NavLink 
                      to="/app-management" 
                      className={({ isActive }) => `nav-item submenu-item ${isActive ? 'active' : ''}`}
                      style={{ fontSize: '0.9rem', padding: '10px 18px' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Smartphone size={18} />
                      </div>
                      <span>ລະບົບນິເວດແອັບ</span>
                    </NavLink>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </nav>

      <div style={{ 
        marginTop: 'auto', 
        paddingTop: '32px', 
        borderTop: '1px solid rgba(255,255,255,0.08)' 
      }}>
        <button 
          onClick={handleLogout}
          className="nav-item" 
          style={{ 
            color: '#f87171', 
            background: 'transparent', 
            border: 'none', 
            width: '100%', 
            cursor: 'pointer',
            padding: '14px 18px'
          }}
        >
          <LogOut size={19} />
          <span>ອອກຈາກລະບົບ</span>
        </button>
      </div>

      <style>{`
        .submenu-item {
          opacity: 0.8;
          transform: scale(0.95);
          margin-left: 10px;
        }
        .submenu-item.active {
          opacity: 1;
          transform: scale(1);
          background: rgba(16, 185, 129, 0.1) !important;
          color: var(--primary) !important;
        }
        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 18px;
          border-radius: 12px;
          color: #64748b;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.2s;
        }
        .nav-item:hover {
          background: #f1f5f9;
          color: var(--primary);
        }
        .nav-item.active {
          background: var(--primary);
          color: white;
        }
      `}</style>
    </div>
  );
};

export default Sidebar;
