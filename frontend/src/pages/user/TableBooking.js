import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // 👈 Cần import này
import ProductList from './ProductList';
import Footer from '../../components/Footer';
import "../../styles/TableBooking.css";

const API_TABLES = 'http://localhost:8080/api/user/tables/available';
const API_PRODUCTS = 'http://localhost:8080/api/products'; // 👈 Dùng API PUBLIC
const API_PLACE_ORDER = 'http://localhost:8080/api/orders/place'; // API PROTECTED

// HÀM TIỆN ÍCH CHO JWT VÀ USER (Đã dùng ở các file admin)
const getAuthUser = () => {
    try {
        const user = localStorage.getItem('user'); // Giả định { token, userId, role }
        return user ? JSON.parse(user) : null;
    } catch (e) {
        return null;
    }
};

const getAuthHeader = () => {
    const user = getAuthUser();
    return user && user.token ? { 'Authorization': `Bearer ${user.token}` } : {};
};

function TableBooking() {
  const [tables, setTables] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [orderItems, setOrderItems] = useState({}); // {productId: quantity}
  const [numCustomers, setNumCustomers] = useState(1);
  const [message, setMessage] = useState('');

  const navigate = useNavigate(); // 👈 Khởi tạo useNavigate

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tableRes, productRes] = await Promise.all([
        axios.get(API_TABLES),
        axios.get(API_PRODUCTS) // Không cần Token
      ]);
      setTables(tableRes.data);
      setProducts(productRes.data);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
      setMessage("Không thể tải dữ liệu bàn và menu.");
    }
  };


  //Đặt bàn
  const handleBookAndPlaceOrder = async (e) => {
    e.preventDefault();
    setMessage('');
    
    // 🚨 BƯỚC 1: KIỂM TRA ĐĂNG NHẬP
    const currentUser = getAuthUser();
    if (!currentUser || !currentUser.token) {
        // Debug: Xem console có hiển thị thông báo này không?
        console.log("CHUYỂN HƯỚNG: Chưa có token, chặn Order."); 
        navigate('/login'); 
        return; // Phải có return để đảm bảo code dừng ở đây
    }
    
    if (!selectedTable) {
      setMessage("Vui lòng chọn một bàn.");
      return;
    }
    
    // Chuyển orderItems thành format DTO
    const itemsDto = Object.keys(orderItems)
      .filter(id => orderItems[id] > 0)
      .map(id => ({ 
        productId: parseInt(id), 
        quantity: orderItems[id] 
      }));

    if (itemsDto.length === 0) {
        setMessage("Vui lòng chọn ít nhất một món.");
        return;
    }

    const orderRequest = {
        tableId: selectedTable.id,
        numberOfCustomers: numCustomers,
        items: itemsDto
    };

    const authHeaders = getAuthHeader(); // Lấy header

    try {
      // 🚨 BƯỚC 2: GỬI TOKEN KHI ĐẶT HÀNG
      await axios.post(API_PLACE_ORDER, orderRequest, { headers: authHeaders });
      setMessage(`Đã đặt thành công bàn số ${selectedTable.tableNumber} và tạo đơn hàng!`);
      
      // Reset state
      setSelectedTable(null);
      setOrderItems({});
      setNumCustomers(1);
      fetchData(); // Tải lại danh sách bàn
    } catch (error) {
      console.error("Lỗi khi đặt hàng:", error);
      // Xử lý lỗi phân quyền (401/403)
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          setMessage("Đặt hàng thất bại. Vui lòng đăng nhập lại.");
          localStorage.removeItem('user');
          navigate('/login');
          return;
      }
      setMessage("Đặt hàng thất bại. Vui lòng thử lại.");
    }
  };

  
  const handleItemChange = (productId, quantity) => {
    setOrderItems(prev => ({
        ...prev,
        [productId]: Math.max(0, quantity)
    }));
  };

  const currentTotal = Object.keys(orderItems).reduce((total, id) => {
    const product = products.find(p => p.id === parseInt(id));
    return total + (product ? product.price * orderItems[id] : 0);
  }, 0);

  return (
    <div className="table-booking-container">
      
      {message && (
        <p className={`message ${message.includes('thành công') ? 'success' : 'error'}`}>
          {message}
        </p>
      )}

      <div className="flex-container">
        {/* Cột 1 */}
        <div className="column">
          <div className="table-list">
            {tables.map(t => (
              <div 
                key={t.id}
                className={`table-card ${selectedTable?.id === t.id ? 'selected' : ''}`}
                onClick={() => setSelectedTable(t)}
              >
                <h4>Bàn số {t.tableNumber}</h4>
                <p>Sức chứa: {t.capacity} người</p>
                <p style={{ color: 'green' }}>{t.status}</p>
              </div>
            ))}
            {tables.length === 0 && <p>Hiện tại không còn bàn trống.</p>}
          </div>
        </div>

        {/* Cột 2 */}
        {selectedTable && (
          <div className="column order-section active">
            <h3>2. Đặt Món và Xác nhận</h3>

            <form onSubmit={handleBookAndPlaceOrder} className="order-form">
              <p>
                Đang đặt cho <strong>Bàn số {selectedTable.tableNumber}</strong> 
                (Sức chứa: {selectedTable.capacity})
              </p>

              <div className="form-group">
                <label>Số lượng khách:</label>
                <input
                  type="number"
                  min="1"
                  max={selectedTable.capacity}
                  value={numCustomers}
                  onChange={(e) => setNumCustomers(parseInt(e.target.value))}
                  className="form-input"
                  required
                />
              </div>

              <h4>Menu</h4>
              <ul className="menu-list">
                {products.map(p => (
                  <li key={p.id} className="menu-item">
                    <img
                      src={p.imageUrl ? `http://localhost:8080${p.imageUrl}` : "https://via.placeholder.com/80x60?text=No+Image"}
                      alt={p.name}
                    />
                    <span>{p.name} - {p.price.toLocaleString('vi-VN')} VND</span>
                    <input
                      type="number"
                      min="0"
                      value={orderItems[p.id] || 0}
                      onChange={(e) => handleItemChange(p.id, parseInt(e.target.value))}
                      className="quantity-input"
                    />
                  </li>
                ))}
              </ul>

              <h4>Tổng Cộng: {currentTotal.toLocaleString('vi-VN')} VND</h4>

              <button type="submit" className="btn-submit">
                Đặt Bàn & Order
              </button>
            </form>
          </div>
        )}
      </div>

      <ProductList />
      <Footer />
    </div>
  );
}

export default TableBooking;