import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import AddProduct from './pages/AddProduct';
import UpdateProduct from './pages/UpdateProduct';
import StockManagement from './pages/StockManagement';
import Orders from './pages/Orders';
import Users from './pages/Users';
import Login from './pages/Login';
import SaleReports from './pages/SaleReports';
import StockReports from './pages/StockReports';
import Shops from './pages/Shops';
import RegisterShop from './pages/RegisterShop';
import ExchangeRates from './pages/ExchangeRates';
import Suppliers from './pages/Suppliers';
import AuditLogs from './pages/AuditLogs';
import SystemSettings from './pages/SystemSettings';
import ReceiptSettings from './pages/ReceiptSettings';
import Categories from './pages/Categories';
import AppManagement from './pages/AppManagement';
import Expenses from './pages/Expenses.tsx';
import StockHistory from './pages/StockHistory.tsx';
import AdminInsights from './pages/AdminInsights';
import Pricing from './pages/Pricing';

function App() {
  const user = localStorage.getItem('user');
  const isAuthenticated = !!user;
  const currentUser = user ? JSON.parse(user) : null;
  const isAdmin = currentUser?.role === 'admin';
  const isSystemAdmin = currentUser?.role === 'admin' && !currentUser?.shop_id;

  return (
    <Routes>
      {/* Auth Route */}
      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
      <Route path="/register-shop" element={<RegisterShop />} />
      <Route path="/pricing" element={<Pricing />} />

      {/* Protected Routes */}
      <Route path="/" element={isAuthenticated ? <Layout /> : <Navigate to="/login" />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="products" element={<Products />} />
        
        {/* Admin Only Routes */}
        <Route path="products/add" element={isAdmin ? <AddProduct /> : <Navigate to="/dashboard" />} />
        <Route path="products/edit/:id" element={isAdmin ? <UpdateProduct /> : <Navigate to="/dashboard" />} />
        <Route path="users" element={isAdmin ? <Users /> : <Navigate to="/dashboard" />} />
        <Route path="shops" element={isAdmin ? <Shops /> : <Navigate to="/dashboard" />} />
        <Route path="exchange-rates" element={isAdmin ? <ExchangeRates /> : <Navigate to="/dashboard" />} />
        <Route path="suppliers" element={isAdmin ? <Suppliers /> : <Navigate to="/dashboard" />} />
        <Route path="categories" element={isAdmin ? <Categories /> : <Navigate to="/dashboard" />} />
        <Route path="audit-logs" element={isAdmin ? <AuditLogs /> : <Navigate to="/dashboard" />} />
        <Route path="settings" element={isAdmin ? <SystemSettings /> : <Navigate to="/dashboard" />} />
        <Route path="receipt-settings" element={isAdmin ? <ReceiptSettings /> : <Navigate to="/dashboard" />} />
        <Route path="app-management" element={isSystemAdmin ? <AppManagement /> : <Navigate to="/dashboard" />} />
        <Route path="admin-insights" element={isSystemAdmin ? <AdminInsights /> : <Navigate to="/dashboard" />} />
        
        <Route path="stock" element={<StockManagement />} />
        <Route path="orders" element={<Orders />} />
        <Route path="expenses" element={<Expenses />} />
        <Route path="stock-history" element={<StockHistory />} />
        <Route path="reports/sales" element={<SaleReports />} />
        <Route path="reports/stock" element={<StockReports />} />
        <Route path="*" element={<div>404 Page Not Found</div>} />
      </Route>
    </Routes>
  );
}

export default App;
