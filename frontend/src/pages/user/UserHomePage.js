import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const API_PRODUCTS = 'http://localhost:8080/api/admin/products'; 

function UserHomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      // Khách có thể xem Menu/Product (chỉ cần API GET Products)
      const response = await axios.get(API_PRODUCTS);
      setProducts(response.data.slice(0, 5)); // Chỉ hiện 5 món nổi bật
      setLoading(false);
    } catch (error) {
      console.error("Lỗi khi tải menu:", error);
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>Chào mừng đến với Quán Cafe! ☕</h1>
      <p style={subtitleStyle}>Chúng tôi phục vụ cà phê tuyệt vời và chỗ ngồi thoải mái.</p>

      <div style={actionSectionStyle}>
        <h3>Sẵn sàng trải nghiệm?</h3>
        <Link to="/" style={linkButtonStyle}>
          Xem Bàn Trống & Order Ngay
        </Link>
      </div>

      <div style={menuSectionStyle}>
        <h3>Menu Nổi Bật</h3>
        {loading ? (
          <p>Đang tải Menu...</p>
        ) : (
          <ul style={listStyle}>
            {products.map(p => (
              <li key={p.id} style={listItemStyle}>
                **{p.name}** - {p.price.toLocaleString('vi-VN')} VND
                <p style={{fontSize: '0.9em', color: '#666'}}>{p.description}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// Basic Styles
const containerStyle = { maxWidth: '800px', margin: '0 auto', textAlign: 'center' };
const titleStyle = { color: '#4a2c22', marginTop: '40px' };
const subtitleStyle = { color: '#666' };
const actionSectionStyle = { 
    margin: '40px 0', 
    padding: '30px', 
    backgroundColor: '#f8f8f8', 
    borderRadius: '8px',
    border: '1px solid #eee'
};
const linkButtonStyle = {
    display: 'inline-block',
    padding: '10px 20px',
    backgroundColor: '#ff6600',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '5px',
    marginTop: '15px'
};
const menuSectionStyle = { marginTop: '40px', textAlign: 'left' };
const listStyle = { listStyleType: 'none', padding: 0 };
const listItemStyle = { 
    borderBottom: '1px dotted #ccc', 
    padding: '10px 0', 
    display: 'flex', 
    flexDirection: 'column' 
};

export default UserHomePage;