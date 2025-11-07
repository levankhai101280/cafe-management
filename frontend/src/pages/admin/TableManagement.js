import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// CẬP NHẬT CÁC HẰNG SỐ API
const API_ADMIN_TABLES = 'http://localhost:8080/api/admin/tables';
const API_ADMIN = 'http://localhost:8080/api/admin';      
const API_ORDERS = 'http://localhost:8080/api/orders';    

// HÀM TIỆN ÍCH CHO JWT
const getAuthHeader = () => {
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        return user && user.token ? { 'Authorization': `Bearer ${user.token}` } : {};
    } catch (e) {
        return {};
    }
};

// Hàm xử lý lỗi tập trung (Dùng lại từ các file Admin khác)
const handleAuthError = (error, navigate, setMessage) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        // Thông báo lỗi rõ ràng hơn
        const errorText = error.response.status === 403 
                          ? "Bạn không có quyền Root User để truy cập trang này." 
                          : "Phiên hết hạn. Vui lòng đăng nhập lại.";
        setMessage(errorText);
        localStorage.removeItem('user'); 
        navigate('/login'); 
        return true; 
    }
    return false;
};

function TableManagement() {
  const [tables, setTables] = useState([]);
  const [newTableNum, setNewTableNum] = useState('');
  const [newCapacity, setNewCapacity] = useState('');
  const [message, setMessage] = useState('');
  const [newStatus, setNewStatus] = useState('TRỐNG'); // 👈 State mới cho trạng thái mặc định
  

  const navigate = useNavigate(); // Khởi tạo useNavigate

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    const authHeaders = getAuthHeader();
    
    // 💡 BƯỚC MỚI: Kiểm tra nhanh nếu không có token trước khi gọi API
    if (Object.keys(authHeaders).length === 0) {
        // Điều này chỉ xảy ra khi component mount trước khi ProtectedRoute kịp chuyển hướng
        // hoặc Token đã bị xóa khỏi localStorage nhưng component chưa bị hủy.
        setMessage("Vui lòng đăng nhập để xem thông tin quản lý.");
        return; 
    }
    
    try {
      const response = await axios.get(API_ADMIN_TABLES, { headers: authHeaders }); 
      setTables(response.data);
    } catch (error) {
      // Xử lý lỗi 403/401
      if (handleAuthError(error, navigate, setMessage)) return; 
      
      console.error("Lỗi khi tải danh sách bàn:", error);
      // Chỉ hiển thị lỗi nếu nó không phải là lỗi phân quyền (đã được handleAuthError xử lý)
      setMessage("Lỗi khi tải danh sách bàn.", "red"); 
    }
  };


  const handleAddTable = async (e) => {
    e.preventDefault();
    setMessage('');
    const authHeaders = getAuthHeader();
    try {
      const tableData = {
        tableNumber: parseInt(newTableNum),
        capacity: parseInt(newCapacity),
        status: newStatus // 👈 SỬ DỤNG TRẠNG THÁI MỚI
      };
      await axios.post(API_ADMIN_TABLES, tableData, { headers: authHeaders });
      setMessage("Thêm bàn mới thành công!");
      setNewTableNum(''); 
      setNewCapacity('');
      setNewStatus('TRỐNG'); // Reset trạng thái về TRỐNG
      fetchTables();
    } catch (error) {
      if (handleAuthError(error, navigate, (text) => setMessage(text))) return;
      console.error("Lỗi khi thêm bàn:", error);
      setMessage("Lỗi khi thêm bàn.", "red");
    }
  };


  // 2. HÀM THANH TOÁN (SỬ DỤNG TOKEN)
  const handlePayAndFreeTable = async (tableId) => {
    setMessage('');
    const authHeaders = getAuthHeader(); // Lấy header
    try {
      // BƯỚC 1: Lấy Order ID đang hoạt động của bàn (API ADMIN)
      const orderRes = await axios.get(`${API_ADMIN}/tables/${tableId}/active-order`, { headers: authHeaders }); // 👈 Gửi Token
      const activeOrder = orderRes.data;
      const orderId = activeOrder.id;

      if (!orderId) {
        setMessage(`Bàn ${tableId} không có Order đang hoạt động để thanh toán.`);
        return;
      }
      
      // BƯỚC 2: Gọi API Thanh toán thực sự (API PROTECTED)
      await axios.post(`${API_ORDERS}/${orderId}/pay`, null, { headers: authHeaders }); // 👈 Gửi Token
      
      setMessage(`Thanh toán thành công Order ${orderId}. Bàn ${tableId} đã được giải phóng.`);
      fetchTables();
      
    } catch (error) {
      if (handleAuthError(error, navigate, (text) => setMessage(text))) return;
      // Xử lý lỗi khi không tìm thấy Order (status 404) hoặc lỗi khác
      let errorMsg = "Lỗi kết nối hoặc không tìm thấy đơn hàng.";
      if (error.response) {
        errorMsg = error.response.data || `Lỗi ${error.response.status}. Kiểm tra console.`;
        if (error.response.status === 404) {
          errorMsg = `Bàn ${tableId} không có đơn hàng đang hoạt động.`;
        }
      }
      
      console.error("Lỗi khi thanh toán/giải phóng bàn:", error);
      setMessage(`Thanh toán thất bại cho Bàn ${tableId}. Lỗi: ${errorMsg}`);
    }
  };


    return (
      <div>
        <h2>Quản lý Bàn và Trạng thái</h2>
        {message && <p style={{ color: message.includes('thành công') ? 'green' : (message.includes('thất bại') ? 'red' : 'black') }}>{message}</p>}

        {/* 1. Form thêm bàn */}
        <div style={sectionStyle}>
          <h3>Tạo Bàn Mới</h3>
          <form onSubmit={handleAddTable} style={formStyle}>
            <input 
              type="number" 
              placeholder="Số bàn" 
              value={newTableNum} 
              onChange={(e) => setNewTableNum(e.target.value)} 
              required 
              style={inputStyle} 
            />
            <input 
              type="number" 
              placeholder="Sức chứa" 
              value={newCapacity} 
              onChange={(e) => setNewCapacity(e.target.value)} 
              required 
              style={inputStyle} 
            />
            
            {/* 👈 TRƯỜNG NHẬP TRẠNG THÁI */}
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              style={inputStyle}
            >
              <option value="TRỐNG">TRỐNG (Chưa có khách)</option>
              <option value="ĐANG SỬ DỤNG">ĐANG SỬ DỤNG (Đã có khách)</option>
              <option value="ĐÃ DỌN">ĐÃ DỌN (Chưa có khách)</option>
            </select>
            {/* KẾT THÚC TRƯỜNG NHẬP TRẠNG THÁI */}

            <button type="submit" style={buttonAddStyle}>Thêm Bàn</button>
          </form>
        </div>


        {/* 2. Danh sách bàn & Trạng thái */}
        <div style={sectionStyle}>
          <h3>Trạng thái Bàn Hiện tại</h3>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>ID</th>
                <th style={thStyle}>Số Bàn</th>
                <th style={thStyle}>Sức Chứa</th>
                <th style={thStyle}>Trạng Thái</th>
                <th style={thStyle}>Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {tables.map(t => (
                <tr key={t.id}>
                  <td style={tdStyle}>{t.id}</td>
                  <td style={tdStyle}>{t.tableNumber}</td>
                  <td style={tdStyle}>{t.capacity}</td>
                  <td style={{...tdStyle, color: t.status === 'TRỐNG' ? 'green' : (t.status === 'ĐANG SỬ DỤNG' ? 'orange' : 'red')}}>
                    {t.status}
                  </td>
                  <td style={tdStyle}>
                    {t.status === 'ĐANG SỬ DỤNG' && (
                      <button 
                        onClick={() => handlePayAndFreeTable(t.id)} 
                        style={buttonActionStyle}
                      >
                        Thanh Toán & Giải Phóng
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Basic Styles
  const sectionStyle = { marginBottom: '30px', padding: '20px', border: '1px solid #eee', borderRadius: '8px' };
  const formStyle = { display: 'flex', gap: '10px', alignItems: 'center' };
  const inputStyle = { padding: '8px', border: '1px solid #ccc', borderRadius: '4px', width: '120px' };
  const buttonAddStyle = { padding: '8px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' };
  const tableStyle = { width: '100%', borderCollapse: 'collapse', marginTop: '15px' };
  const thStyle = { border: '1px solid #ddd', padding: '10px', backgroundColor: '#f2f2f2', textAlign: 'left' };
  const tdStyle = { border: '1px solid #ddd', padding: '10px' };
  const buttonActionStyle = { padding: '5px 10px', backgroundColor: '#ffc107', border: 'none', borderRadius: '4px', cursor: 'pointer' };

  export default TableManagement;