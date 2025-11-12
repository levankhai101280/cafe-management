import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';

import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

import AdminDashboard from './pages/admin/AdminDashboard';
import ProductManagement from './pages/admin/ProductManagement';
import TableManagement from './pages/admin/TableManagement';
import ReportPage from './pages/admin/ReportPage';

import TableBooking from './pages/user/TableBooking';
import ProductList from './pages/user/ProductList';
import News from './pages/user/News';
import SearchPage from './pages/user/SearchPage';
import Blog from './pages/user/Blog';
import ProductDetailPage from './pages/user/ProductDetailPage';

const useAuth = () => {
    
    // 🚨 BƯỚC 1: Đọc thông tin xác thực từ item 'user' duy nhất
    const [user, setUser] = useState(() => {
        try {
            // Lấy toàn bộ đối tượng user (chứa token, id, role) được lưu từ LoginPage
            const userDataString = localStorage.getItem('user');
            if (userDataString) {
                const userData = JSON.parse(userDataString);
                // Trích xuất ID và Role để thiết lập state React
                return { id: userData.userId, role: userData.role };
            }
        } catch (e) {
            console.error("Lỗi khi đọc user từ localStorage:", e);
        }
        // Fallback nếu không tìm thấy hoặc lỗi
        return { id: null, role: null };
    });

    const login = (userData) => {
        // 🚨 BƯỚC 2: Khi login thành công, chỉ cần cập nhật state React. 
        // Việc lưu toàn bộ đối tượng {token, userId, role} vào item 'user' 
        // đã được thực hiện trong LoginPage.js.
        setUser({ id: userData.userId, role: userData.role });
        
        // Loại bỏ các key lưu trữ cũ để dọn dẹp
        localStorage.removeItem('userId');
        localStorage.removeItem('userRole');
    };

    const logout = () => {
        // 🚨 BƯỚC 3: XÓA item 'user' chứa JWT Token
        localStorage.removeItem('user'); 
        
        // Xóa các key lưu trữ cũ (cũng nên xóa để đảm bảo sạch sẽ)
        localStorage.removeItem('userId'); 
        localStorage.removeItem('userRole');
        
        setUser({ id: null, role: null });
    };

    return { user, login, logout };
};


// Component bảo vệ Route
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  if (!user.role) {
    return <Navigate to="/login" replace />;
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />; 
  }
  return children;
};


function App() {
  const auth = useAuth();

  return (
    <Router>
      <Header auth={auth} />
      <div className="container" style={{paddingTop: '60px'}}>
        <Routes>
          <Route path="/login" element={<LoginPage login={auth.login} />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<TableBooking />} /> 
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['root_user']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/products" element={
            <ProtectedRoute allowedRoles={['root_user']}>
              <ProductManagement />
            </ProtectedRoute>
          } />
          <Route path="/admin/tables" element={
            <ProtectedRoute allowedRoles={['root_user']}>
              <TableManagement />
            </ProtectedRoute>
          } />
           <Route path="/admin/report" element={
            <ProtectedRoute allowedRoles={['root_user']}>
              <ReportPage />
            </ProtectedRoute>
          } />
          <Route path="/products" element={<ProductList />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/news" element={<News />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;