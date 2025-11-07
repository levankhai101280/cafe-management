import React, { useState, useEffect } from "react";
import axios from "axios";

const API_PRODUCTS = "http://localhost:8080/api/admin/products";

export default function ProductPreview({ onClose }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(API_PRODUCTS)
      .then((res) => {
        setProducts(res.data);
      })
      .catch((err) => console.error(" Lỗi tải sản phẩm:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h2 style={{ marginBottom: "15px" }}>Danh sách sản phẩm</h2>
        <button onClick={onClose} style={closeButtonStyle}>
          ✖
        </button>
        {loading ? (
          <p>Đang tải sản phẩm...</p>
        ) : products.length === 0 ? (
          <p>Không có sản phẩm nào</p>
        ) : (
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Tên</th>
                <th style={thStyle}>Giá</th>
                <th style={thStyle}>Danh mục</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td style={tdStyle}>{p.name}</td>
                  <td style={tdStyle}>
                    {p.price?.toLocaleString("vi-VN")} VND
                  </td>
                  <td style={tdStyle}>{p.categoryName || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// CSS inline
const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.6)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 2000,
};

const modalStyle = {
  backgroundColor: "#fff",
  borderRadius: "8px",
  padding: "20px",
  maxWidth: "700px",
  width: "90%",
  position: "relative",
  boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
  maxHeight: "80vh",
  overflowY: "auto",
};

const closeButtonStyle = {
  position: "absolute",
  top: "10px",
  right: "10px",
  border: "none",
  background: "none",
  cursor: "pointer",
  fontSize: "18px",
};

const tableStyle = { width: "100%", borderCollapse: "collapse" };
const thStyle = {
  border: "1px solid #ddd",
  padding: "10px",
  backgroundColor: "#f2f2f2",
};
const tdStyle = { border: "1px solid #ddd", padding: "10px" };
