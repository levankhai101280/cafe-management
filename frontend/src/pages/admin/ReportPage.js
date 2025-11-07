import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_REPORT = 'http://localhost:8080/api/orders/report/daily';

// ==========================================================
// 🚨 HÀM TIỆN ÍCH CHO JWT (CẦN ĐƯỢC ĐỊNH NGHĨA HOẶC IMPORT)
// ==========================================================
const getAuthHeader = () => {
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        return user && user.token ? { 'Authorization': `Bearer ${user.token}` } : {};
    } catch (e) {
        return {};
    }
};

const handleAuthError = (error, navigate, setMessage) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        const errorText = error.response.status === 403 
                          ? "🚫 Bạn không có quyền Root User để truy cập trang này." 
                          : "🚫 Phiên hết hạn. Vui lòng đăng nhập lại.";
        setMessage(errorText);
        localStorage.removeItem('user'); 
        navigate('/login'); 
        return true; 
    }
    return false;
};


function ReportPage() {
  const [reportData, setReportData] = useState(null);
  const [date, setDate] = useState(() => {
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return local.toISOString().split('T')[0];
  }); 
  const [message, setMessage] = useState('');

  const navigate = useNavigate(); // Khởi tạo useNavigate

  useEffect(() => {
    fetchReport(date);
  }, [date]);

  const fetchReport = async (reportDate) => {
    setMessage('');
    setReportData(null);
    const authHeaders = getAuthHeader(); // Lấy header

    // Kiểm tra nhanh token trước khi gọi
    if (Object.keys(authHeaders).length === 0) {
        setMessage("Vui lòng đăng nhập với quyền Root User.");
        return;
    }
    
    try {
      const response = await axios.get(API_REPORT, {
        params: { date: reportDate },
        headers: authHeaders //  Gửi Token
      });
      setReportData(response.data);
      setMessage(`Đã tải báo cáo cho ngày ${reportDate}`);
    } catch (error) {
      // SỬ DỤNG HÀM XỬ LÝ LỖI
      if (handleAuthError(error, navigate, setMessage)) return; 
      
      console.error("Lỗi khi tải báo cáo:", error);
      setMessage("Không thể tải báo cáo. Vui lòng kiểm tra Backend hoặc quyền truy cập.");
    }
  };

  const handleDateChange = (e) => {
    setDate(e.target.value);
  };


  return (
    <div>
      <h2>Thống Kê Báo Cáo Doanh Thu (Admin)</h2>
      
      <div style={inputGroupStyle}>
        <label style={{marginRight: '10px'}}>Chọn Ngày Báo Cáo:</label>
        <input 
          type="date" 
          value={date} 
          onChange={handleDateChange} 
          style={inputStyle}
        />
      </div>
      
      {message && <p style={{ color: message.includes('Đã tải') ? 'green' : (message.includes('Lỗi') || message.includes('🚫') ? 'red' : 'black'), marginTop: '15px' }}>{message}</p>}

      {reportData && (
        <div style={reportContainerStyle}>
          <h3>Báo Cáo Tổng Hợp Ngày {reportData.date}</h3>
          
          <div style={cardGridStyle}>
            <div style={cardStyle}>
              <h4>Tổng Doanh Thu Trong Ngày</h4>
              <p style={dataStyle}>{reportData.totalRevenue.toLocaleString('vi-VN')} VND</p>
            </div>
            
            <div style={cardStyle}>
              <h4>Tổng Lượng Khách</h4>
              <p style={dataStyle}>{reportData.totalCustomers} Khách</p>
            </div>

            <div style={cardStyle}>
              <h4>Tổng Số Đơn Đã Thanh Toán</h4>
              <p style={dataStyle}>{reportData.totalOrders} Đơn</p>
            </div>
        </div>
      </div>
      )}
      {!reportData && !message.includes('Lỗi') && !message.includes('🚫') && <p>Đang tải báo cáo...</p>}
    </div>
  );
}

// Basic Styles (Giữ nguyên)
const inputGroupStyle = { marginTop: '20px', display: 'flex', alignItems: 'center' };
const inputStyle = { padding: '8px', border: '1px solid #ccc', borderRadius: '4px' };
const reportContainerStyle = { marginTop: '30px', padding: '20px', border: '1px solid #eee', borderRadius: '8px', backgroundColor: '#f9f9f9' };
const cardGridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '15px' };
const cardStyle = { padding: '15px', borderLeft: '5px solid #ff6600', backgroundColor: '#fff', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' };
const dataStyle = { fontSize: '1.8em', fontWeight: 'bold', color: '#ff6600', margin: '5px 0' };

export default ReportPage;
