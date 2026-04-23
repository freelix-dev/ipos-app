import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Users, 
  Package, 
  Settings, 
  LogOut, 
  Database,
  Layers,
  PieChart,
  LineChart
} from 'lucide-react';

const Sidebar = () => {
  const navigate = useNavigate();
  const userJson = localStorage.getItem('user');
  const currentUser = userJson ? JSON.parse(userJson) : null;
  const isSystemAdmin = currentUser && !currentUser.shop_id;

  const menuItems = [
    { icon: <LayoutDashboard size={19} />, label: 'Dashboard', path: '/dashboard' },
    { icon: <ShoppingCart size={19} />, label: 'Orders', path: '/orders' },
    { icon: <Package size={19} />, label: 'Products', path: '/products' },
    { icon: <Database size={19} />, label: 'Stock', path: '/stock' },
    { icon: <LineChart size={19} />, label: 'Sale Report', path: '/reports/sales' },
    { icon: <PieChart size={19} />, label: 'Stock Report', path: '/reports/stock' },
    ...(isSystemAdmin ? [{ icon: <Layers size={19} />, label: 'Manage Shops', path: '/shops' }] : []),
    { icon: <Users size={19} />, label: 'Manage Users', path: '/users' },
    { icon: <Settings size={19} />, label: 'Settings', path: '/settings' },
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
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};


export default Sidebar;

