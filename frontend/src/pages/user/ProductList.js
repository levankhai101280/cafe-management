import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from 'react-router-dom';
import "../../styles/ProductList.css";

// 🚨 SỬA LỖI: Dùng API Public để Khách xem Menu
const API_PRODUCTS = "/api/products"; 

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(API_PRODUCTS) // KHÔNG cần headers/Token
      .then((res) => setProducts(res.data))
      .catch((err) => console.error("❌ Lỗi tải sản phẩm:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="product-list-container">

      {loading ? (
        <p style={{ textAlign: "center" }}>Đang tải sản phẩm...</p>
      ) : products.length === 0 ? (
        <p style={{ textAlign: "center" }}>Không có sản phẩm nào.</p>
      ) : (
        <div className="product-grid">
          {products.map((p) => (
            <Link 
                    key={p.id} 
                    to={`/products/${p.id}`} // Trỏ đến tuyến đường chi tiết
                    className="product-link" // Thêm class để dễ dàng quản lý CSS cho Link
                    style={{ textDecoration: 'none', color: 'inherit' }}
                >
                    <div className="product-card">
                      <img
                        src={p.imageUrl || "https://via.placeholder.com/200x150?text=No+Image"}
                        alt={p.name}
                        className="product-image"
                      />
                    <h3 className="product-name">{p.name}</h3>
                    <p className="product-price">
                      {p.price?.toLocaleString("vi-VN")} VND
                    </p>
                    <p className="product-category">
                      Danh mục: {p.categoryName || "Không có danh mục"}
                    </p>
                    <p className="product-description">
                      {p.description || "Không có mô tả."}
                    </p>
                </div>
                </Link>
          ))}
        </div>
      )}
    </div>
  );
}
