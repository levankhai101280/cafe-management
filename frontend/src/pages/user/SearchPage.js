import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

export default function SearchPage() {
  const query = new URLSearchParams(useLocation().search).get("query");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (query) {
      fetchProducts(query);
    } else {
      setProducts([]);
      setLoading(false);
      setMessage("Vui lòng nhập từ khóa để tìm kiếm.");
    }
  }, [query]);

  const fetchProducts = async (keyword) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `http://localhost:8080/api/products/search?name=${encodeURIComponent(keyword)}`
      );
      setProducts(res.data);
      setMessage(
        res.data.length > 0
          ? `Tìm thấy ${res.data.length} sản phẩm phù hợp`
          : "Không tìm thấy sản phẩm nào."
      );
    } catch (error) {
      console.error(" Lỗi khi tìm kiếm:", error);
      setMessage("Không thể tải dữ liệu sản phẩm từ server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={headerSection}>
        <h2 style={titleStyle}> Kết quả tìm kiếm cho: “{query}”</h2>
        <p style={messageStyle}>{message}</p>
      </div>

      {loading ? (
        <p style={loadingStyle}>Đang tải dữ liệu...</p>
      ) : (
        <div style={productGridStyle}>
          {products.map((p) => (
            <div key={p.id} style={productCardStyle}>
              <div style={imageWrapperStyle}>
                <img
                  src={
                    p.imageUrl
                      ? `http://localhost:8080${p.imageUrl}`
                      : "https://via.placeholder.com/200x150?text=No+Image"
                  }
                  alt={p.name}
                  className="product-image"
                />
              </div>
              <div style={productInfoStyle}>
                <h3 style={productNameStyle}>{p.name}</h3>
                <p style={priceStyle}>
                  {p.price.toLocaleString("vi-VN")} <span style={{ fontSize: "14px" }}>₫</span>
                </p>
                <p style={descStyle}>
                  {p.description?.length > 80
                    ? p.description.slice(0, 80) + "..."
                    : p.description || "Không có mô tả"}
                </p>
                <p style={categoryStyle}>
                  Danh mục:{" "}
                  <span style={{ color: "#007bff" }}>
                    {p.categoryName || "Không có"}
                  </span>
                </p>
                <button style={viewButtonStyle}>Xem Chi Tiết</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ===== 🎨 Styles chuyên nghiệp ===== */
const containerStyle = {
  marginTop: "100px",
  padding: "40px 60px",
  backgroundColor: "#f9fafc",
  minHeight: "100vh",
};

const headerSection = {
  textAlign: "center",
  marginBottom: "30px",
};

const titleStyle = {
  fontSize: "28px",
  fontWeight: "700",
  color: "#222",
  marginBottom: "10px",
};

const messageStyle = {
  color: "#555",
  fontSize: "16px",
};

const loadingStyle = {
  textAlign: "center",
  fontSize: "18px",
  color: "#888",
};

const productGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
  gap: "25px",
};

const productCardStyle = {
  backgroundColor: "#fff",
  borderRadius: "12px",
  overflow: "hidden",
  boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  display: "flex",
  flexDirection: "column",
};

const imageWrapperStyle = {
  width: "100%",
  height: "200px",
  overflow: "hidden",
};

const productImageStyle = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  transition: "transform 0.3s ease",
};

const productInfoStyle = {
  padding: "15px 18px",
  display: "flex",
  flexDirection: "column",
  flexGrow: 1,
  justifyContent: "space-between",
};

const productNameStyle = {
  fontSize: "18px",
  fontWeight: "600",
  color: "#222",
  marginBottom: "8px",
};

const priceStyle = {
  color: "#e63946",
  fontSize: "17px",
  fontWeight: "bold",
  marginBottom: "10px",
};

const descStyle = {
  color: "#555",
  fontSize: "14px",
  marginBottom: "10px",
  lineHeight: "1.4",
};

const categoryStyle = {
  fontSize: "13px",
  color: "#777",
  marginBottom: "15px",
};

const viewButtonStyle = {
  backgroundColor: "#007bff",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  padding: "10px",
  cursor: "pointer",
  fontWeight: "500",
  fontSize: "15px",
  transition: "background-color 0.3s ease",
};

viewButtonStyle[":hover"] = {
  backgroundColor: "#0056b3",
};
