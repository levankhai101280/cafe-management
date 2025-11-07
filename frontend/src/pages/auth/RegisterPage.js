import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const response = await axios.post('http://localhost:8080/api/auth/register', { username, password });
      
      // 🚨 ĐÃ SỬA: Dùng trực tiếp message từ backend
      setMessage(`${response.data}. Bạn sẽ được chuyển đến trang đăng nhập.`);
      
      // Tự động chuyển hướng sau 3 giây
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (err) {
      console.error('Registration error:', err.response ? err.response.data : err.message);
      // 🚨 ĐÃ SỬA: Đảm bảo message lỗi là string
      const errorMsg = typeof err.response?.data === 'string' ? err.response.data : 'Lỗi kết nối hoặc tên đăng nhập đã tồn tại.';
      setMessage(`Đăng ký thất bại: ${errorMsg}`);
    }
  };

  return (
    <div style={formContainerStyle}>
      <h2>Trang Đăng Ký</h2>
      <form onSubmit={handleSubmit} style={formStyle}>
        {message && <p style={{ color: message.includes('thành công') ? 'green' : 'red' }}>{message}</p>}
        
        <div style={inputGroupStyle}>
          <label>Tên đăng nhập:</label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required style={inputStyle} />
        </div>
        <div style={inputGroupStyle}>
          <label>Mật khẩu:</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={inputStyle} />
        </div>
        <button type="submit" style={buttonSubmitStyle}>Đăng Ký</button>
        <p style={{textAlign: 'center', marginTop: '10px'}}>
          Đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link>
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
const buttonSubmitStyle = { padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' };

export default RegisterPage;
