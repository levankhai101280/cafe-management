import React from 'react';
import { Link } from 'react-router-dom';

function AdminDashboard() {
  return (
    <div>
      <h2>Dashboard Quản Trị (Root User)</h2>
      <p>Chào mừng Admin! Đây là khu vực quản lý hệ thống quán Cafe.</p>

      <div style={gridContainerStyle}>
        <Link to="/admin/tables" style={cardStyle}>
          <h3>Quản Lý Bàn</h3>
          <p>Xem trạng thái bàn và cập nhật tình trạng sử dụng/thanh toán.</p>
        </Link>
        <Link to="/admin/products" style={cardStyle}>
          <h3>Master Data (Menu)</h3>
          <p>Thêm, sửa, xóa các sản phẩm và giá cả của quán.</p>
        </Link>
        <Link to="/admin/report" style={cardStyle}>
          <h3>Thống Kê Báo Cáo</h3>
          <p>Xem tổng doanh thu và số lượng khách hàng trong ngày.</p>
        </Link>
        {/* Thêm link cho Quản lý User nếu cần */}
      </div>
    </div>
  );
}

const gridContainerStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px',
    marginTop: '30px'
};

const cardStyle = {
    padding: '20px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    textDecoration: 'none',
    color: '#333',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s',
    backgroundColor: '#fff'
};

export default AdminDashboard;