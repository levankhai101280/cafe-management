import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function LoginPage({ login }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post('http://localhost:8080/api/auth/login', { username, password });
      
      // 🚨 ĐÃ SỬA: Xử lý response JSON có JWT Token và thông tin user
      const { token, userId, role } = response.data;
      
      // Lưu Token và thông tin user vào Local Storage
      // Đây là nơi các component khác (như TableBooking, ProductManagement) sẽ lấy Token
      localStorage.setItem('user', JSON.stringify({ token, userId, role }));
      
      login({ userId, role });

      // Điều hướng sau khi đăng nhập thành công
      if (role === 'root_user') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error('Login error:', err.response?.data || err.message);
      // Lỗi 401 Unauthorized sẽ trả về message lỗi từ backend
      setError(err.response?.data || 'Đăng nhập thất bại. Vui lòng kiểm tra lại tên đăng nhập và mật khẩu.');
    }
  };

  return (
    <div style={formContainerStyle}>
      <h2>Trang Đăng Nhập</h2>
      <form onSubmit={handleSubmit} style={formStyle}>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <div style={inputGroupStyle}>
          <label>Tên đăng nhập:</label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required style={inputStyle} />
        </div>
        <div style={inputGroupStyle}>
          <label>Mật khẩu:</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={inputStyle} />
        </div>
        <button type="submit" style={buttonSubmitStyle}>Đăng Nhập</button>
        <p style={{textAlign: 'center', marginTop: '10px'}}>
          Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
        </p>
      </form>
    </div>
  );
}

// Basic Styles (Giữ nguyên)
const formContainerStyle = { maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' };
const formStyle = { display: 'flex', flexDirection: 'column', gap: '15px' };
const inputGroupStyle = { display: 'flex', flexDirection: 'column' };
const inputStyle = { padding: '10px', border: '1px solid #ddd', borderRadius: '4px' };
const buttonSubmitStyle = { padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' };

export default LoginPage;
