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

function App() {
  const user = localStorage.getItem('user');
  const isAuthenticated = !!user;

  return (
    <Routes>
      {/* Auth Route */}
      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
      <Route path="/register-shop" element={<RegisterShop />} />

      {/* Protected Routes */}
      <Route path="/" element={isAuthenticated ? <Layout /> : <Navigate to="/login" />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="products" element={<Products />} />
        <Route path="products/add" element={<AddProduct />} />
        <Route path="products/edit/:id" element={<UpdateProduct />} />
        <Route path="stock" element={<StockManagement />} />
        <Route path="orders" element={<Orders />} />
        <Route path="customers" element={<Users />} /> {/* Map Customers menu to Users for now or separate */}
        <Route path="users" element={<Users />} />
        <Route path="reports/sales" element={<SaleReports />} />
        <Route path="reports/stock" element={<StockReports />} />
        <Route path="shops" element={<Shops />} />
        <Route path="*" element={<div>404 Page Not Found</div>} />
      </Route>
    </Routes>
  );
}

export default App;
