import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.tsx';
import AdminHeader from './AdminHeader.tsx';

const Layout = () => {
  return (
    <div className="admin-layout">
      <Sidebar />
      <main className="main-content">
        <AdminHeader />
        <div className="admin-page">
          {/* Outlet will render the current route's element */}
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
