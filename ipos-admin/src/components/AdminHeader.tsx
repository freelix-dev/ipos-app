import React from 'react';
import { Search, Bell, User, MoreVertical } from 'lucide-react';

const Header = () => {
  return (
    <header className="header">
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <Search size={19} style={{ 
          position: 'absolute', 
          left: '20px', 
          color: 'var(--text-sidebar)',
          zIndex: 10
        }} />
        <input 
          type="text" 
          placeholder="Global tracking search..." 
          className="search-input-premium"
          style={{
            padding: '14px 20px 14px 54px',
            borderRadius: '16px',
            border: '1px solid var(--border-strong)',
            width: '400px',
            outline: 'none',
            fontSize: '0.95rem',
            background: '#f8fafc',
            transition: 'var(--transition)',
            fontWeight: 500,
            color: 'var(--text-main)',
            boxShadow: 'var(--shadow-inner)'
          }}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <button style={{ 
          background: '#fff', 
          border: '1px solid var(--border-strong)', 
          borderRadius: '14px',
          padding: '12px',
          cursor: 'pointer', 
          color: 'var(--text-main)',
          display: 'flex',
          boxShadow: 'var(--shadow-sm)',
          transition: 'var(--transition)',
          position: 'relative'
        }}
        className="header-icon-btn"
        >
          <Bell size={20} />
          <div style={{ 
            position: 'absolute', 
            top: '10px', 
            right: '10px', 
            width: '8px', 
            height: '8px', 
            background: '#ef4444', 
            borderRadius: '50%',
            border: '2px solid #fff'
          }}></div>
        </button>
        
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '14px', 
          padding: '6px 6px 6px 20px',
          background: '#fff',
          borderRadius: '18px',
          border: '1px solid var(--border-strong)',
          boxShadow: 'var(--shadow-md)',
          cursor: 'pointer',
          transition: 'var(--transition)'
        }}
        onMouseOver={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-lg)'}
        onMouseOut={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
        >
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.01em' }}>Admin Operator</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', opacity: 0.8 }}>System Owner</p>
          </div>
          <div style={{ 
            background: 'linear-gradient(135deg, #0f172a, #1e293b)', 
            padding: '12px', 
            borderRadius: '14px', 
            color: '#fff',
            boxShadow: '0 8px 16px rgba(15, 23, 42, 0.15)',
            display: 'flex'
          }}>
            <User size={19} />
          </div>
        </div>
      </div>
      
      <style>{`
        .search-input-premium:focus {
          width: 480px;
          background: #fff;
          border-color: var(--primary);
          box-shadow: 0 0 0 4px var(--primary-glow);
        }
        .header-icon-btn:hover {
          background: #f8fafc;
          border-color: var(--primary);
          color: var(--primary);
          transform: translateY(-2px);
        }
      `}</style>
    </header>
  );
};


export default Header;

