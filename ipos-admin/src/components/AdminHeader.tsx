
import { Bell, User } from 'lucide-react';
const Header = () => {
  const userJson = localStorage.getItem('user');
  const currentUser = userJson ? JSON.parse(userJson) : { name: 'Guest', role: 'Viewer' };

  // Localized role for display
  const displayRole = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin': return currentUser.shop_id ? 'Shop Manager' : 'System Admin';
      case 'staff': return 'Staff';
      case 'user': return 'User';
      default: return role || 'Unknown';
    }
  };

  return (
    <header className="header" style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between', 
      padding: '0 40px',
      background: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
      height: '84px',
      position: 'sticky',
      top: 0,
      zIndex: 90
    }}>
      <div style={{ flex: 1 }}></div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Notifications */}
        <button className="header-action-btn" style={{ position: 'relative' }} title="Notifications">
          <Bell size={20} />
          <div style={{ 
            position: 'absolute', 
            top: '11px', 
            right: '11px', 
            width: '7px', 
            height: '7px', 
            background: '#10b981', 
            borderRadius: '50%',
            border: '2px solid #fff',
            boxShadow: '0 0 0 2px rgba(16, 185, 129, 0.25)'
          }}></div>
        </button>
        
        <div style={{ width: '1px', height: '24px', background: 'var(--border-strong)', margin: '0 8px' }}></div>

        {/* User Profile Area */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px', 
          padding: '4px 4px 4px 16px',
          background: 'rgba(255, 255, 255, 0.5)',
          borderRadius: '16px',
          border: '1px solid var(--border-strong)',
          cursor: 'pointer',
          transition: 'var(--transition)'
        }}
        className="user-profile-trigger"
        >
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              {currentUser.name}
            </p>
            <p style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {displayRole(currentUser.role)}
            </p>
          </div>
          <div style={{ 
            background: 'linear-gradient(135deg, var(--bg-sidebar), #1e293b)', 
            padding: '10px', 
            borderRadius: '12px', 
            color: '#fff',
            boxShadow: '0 4px 12px rgba(15, 23, 42, 0.1)',
            display: 'flex'
          }}>
            <User size={18} />
          </div>
        </div>
      </div>
      
      <style>{`
        .search-input-premium:focus {
          width: 440px;
          background: #fff;
          border-color: var(--primary);
          box-shadow: 0 0 0 4px var(--primary-glow);
        }
        .header-action-btn {
          background: #fff;
          border: 1px solid var(--border-strong);
          border-radius: 12px;
          padding: 10px;
          cursor: pointer;
          color: var(--text-muted);
          display: flex;
          transition: var(--transition);
          box-shadow: var(--shadow-sm);
        }
        .header-action-btn:hover {
          background: #f8fafc;
          border-color: var(--primary);
          color: var(--primary);
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }
        .user-profile-trigger:hover {
          border-color: var(--primary);
          background: #fff;
          box-shadow: var(--shadow-md);
        }
      `}</style>
    </header>
  );
};

export default Header;

