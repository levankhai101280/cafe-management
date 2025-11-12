import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom'; // 👈 Import useNavigate

// HÀM TIỆN ÍCH CHO JWT
const getAuthHeader = () => {
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        // Kiểm tra token và trả về Authorization Header
        return user && user.token ? { 'Authorization': `Bearer ${user.token}` } : {};
    } catch (e) {
        return {};
    }
};

// Hàm xử lý lỗi tập trung và chuyển hướng
const handleAuthError = (error, navigate, showMessage) => {
    // 401: Unauthorized (Token hết hạn/sai), 403: Forbidden (Không đủ quyền)
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        showMessage("🚫 Phiên hết hạn hoặc không có quyền truy cập. Vui lòng đăng nhập lại.", "error");
        localStorage.removeItem('user'); 
        navigate('/login'); // Chuyển hướng người dùng về trang đăng nhập
        return true; 
    }
    return false;
};

// CẬP NHẬT CÁC HẰNG SỐ API
const API_PRODUCTS_PUBLIC = "/api/products"; // Dùng để hiển thị ảnh, không cần Token
const API_ADMIN_PRODUCTS = "/api/admin/products"; // Dùng cho DELETE
const API_UPLOAD = "/api/admin/products/upload"; // Dùng cho POST
const API_CATEGORIES = "/api/admin/categories"; // Dùng cho Admin

export default function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");

  const navigate = useNavigate(); // Khởi tạo useNavigate

  // 🔹 Load sản phẩm và danh mục khi khởi động
  useEffect(() => {
    fetchData();
  }, []);

  const showMessage = (text, type = "info") => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 3000);
  };

  const fetchData = async () => {
    const authHeaders = getAuthHeader(); // Lấy header
    try {
      const [productRes, categoryRes] = await Promise.all([
        axios.get(API_PRODUCTS_PUBLIC), // Public API
        axios.get(API_CATEGORIES, { headers: authHeaders }), // Admin API, cần Token
      ]);
      setProducts(productRes.data);
      setCategories(categoryRes.data);

      if (categoryRes.data.length > 0) {
        setCategoryId(categoryRes.data[0].id.toString());
      }
    } catch (error) {
      if (handleAuthError(error, navigate, showMessage)) return; // Xử lý lỗi phân quyền
      console.error("❌ Lỗi tải dữ liệu:", error);
      showMessage("Không thể tải sản phẩm hoặc danh mục.", "error");
    }
  };

  // 🔹 Xử lý chọn ảnh
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // 🔹 Thêm sản phẩm mới (SỬ DỤNG TOKEN VÀ API UPLOAD)
  const handleAddProduct = async (e) => {
    e.preventDefault();

    if (!imageFile) {
      showMessage("⚠️ Vui lòng chọn ảnh sản phẩm!", "error");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", price);
    formData.append("description", description);
    formData.append("categoryId", categoryId);
    formData.append("image", imageFile);

    const authHeaders = getAuthHeader(); // Lấy header
    try {
      await axios.post(API_UPLOAD, formData, {
        headers: { ...authHeaders, "Content-Type": "multipart/form-data" }, // Gửi Token
      });
      showMessage("✅ Thêm sản phẩm thành công!", "success");
      setName("");
      setPrice("");
      setDescription("");
      setImageFile(null);
      setImagePreview("");
      fetchData();
    } catch (error) {
      if (handleAuthError(error, navigate, showMessage)) return; // Xử lý lỗi phân quyền
      console.error("❌ Lỗi khi thêm sản phẩm:", error);
      showMessage("❌ Thêm sản phẩm thất bại." + (error.response?.data || ''), "error");
    }
  };

  // 🔹 Thêm danh mục mới (SỬ DỤNG TOKEN)
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      showMessage("⚠️ Tên danh mục không được để trống.", "error");
      return;
    }

    const authHeaders = getAuthHeader(); // Lấy header
    try {
      await axios.post(API_CATEGORIES, { name: newCategoryName }, { headers: authHeaders }); // Gửi Token
      showMessage("✅ Thêm danh mục thành công!", "success");
      setNewCategoryName("");
      fetchData();
    } catch (error) {
      if (handleAuthError(error, navigate, showMessage)) return; // Xử lý lỗi phân quyền
      console.error("❌ Lỗi khi thêm danh mục:", error);
      showMessage("❌ Thêm danh mục thất bại.", "error");
    }
  };
  
  // 🔹 Xóa sản phẩm (SỬ DỤNG TOKEN VÀ API ADMIN)
  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa sản phẩm này?")) return;

    const authHeaders = getAuthHeader(); // Lấy header
    try {
      await axios.delete(`${API_ADMIN_PRODUCTS}/${id}`, { headers: authHeaders }); // Gửi Token
      showMessage("Xóa sản phẩm thành công!", "success");
      fetchData(); // tải lại danh sách sản phẩm
    } catch (error) {
      if (handleAuthError(error, navigate, showMessage)) return; // Xử lý lỗi phân quyền
      console.error(" Lỗi khi xóa sản phẩm:", error);
      showMessage("Xóa sản phẩm thất bại.", "error");
    }
  };



  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>🧩 Quản lý Sản phẩm & Danh mục</h2>

      {/* Thông báo */}
      {message && (
        <div
          style={{
            ...alertStyle,
            backgroundColor:
              messageType === "success"
                ? "#d4edda"
                : messageType === "error"
                ? "#f8d7da"
                : "#fff3cd",
            color:
              messageType === "success"
                ? "#155724"
                : messageType === "error"
                ? "#721c24"
                : "#856404",
            border:
              messageType === "success"
                ? "1px solid #c3e6cb"
                : messageType === "error"
                ? "1px solid #f5c6cb"
                : "1px solid #ffeeba",
          }}
        >
          {message}
        </div>
      )}

      {/* 🔹 Form thêm danh mục */}
      <div style={sectionStyle}>
        <h3> Thêm Danh mục</h3>
        <form onSubmit={handleAddCategory} style={formStyle}>
          <input
            type="text"
            placeholder="Tên danh mục (e.g. Cà phê, Trà sữa)"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            style={inputStyle}
          />
          <button type="submit" style={buttonSubmitStyle}>
            Thêm
          </button>
        </form>
      </div>

      {/* 🔹 Form thêm sản phẩm */}
      <div style={sectionStyle}>
        <h3> Thêm Sản phẩm mới</h3>
        <form onSubmit={handleAddProduct} style={formStyle}>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
            style={inputStyle}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id.toString()}>
                {c.name}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Tên sản phẩm"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={inputStyle}
          />

          <input
            type="number"
            placeholder="Giá (VND)"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            style={inputStyle}
          />

          <input
            type="text"
            placeholder="Mô tả"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={inputStyle}
          />

          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={inputStyle}
          />

          {imagePreview && (
            <div style={{ textAlign: "center" }}>
              <img
                src={imagePreview}
                alt="preview"
                style={previewImageStyle}
              />
            </div>
          )}

          <button type="submit" style={buttonSubmitStyle}>
            Thêm Sản Phẩm
          </button>
        </form>
      </div>

      {/* 🔹 Bảng sản phẩm */}
      <div style={sectionStyle}>
        <h3>📋 Danh sách sản phẩm</h3>
        <table style={tableStyle}>
          <thead>
          <tr>
            <th style={thStyle}>Ảnh</th>
            <th style={thStyle}>Tên</th>
            <th style={thStyle}>Giá</th>
            <th style={thStyle}>Danh mục</th>
            <th style={thStyle}>Mô tả</th>
            <th style={thStyle}>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {products.length === 0 ? (
            <tr>
              <td colSpan="6" style={{ textAlign: "center", padding: "15px" }}>
                Không có sản phẩm nào
              </td>
            </tr>
          ) : (
            products.map((p) => (
              <tr key={p.id}>
                <td style={tdStyle}>
                  <img
                    src={p.imageUrl}git 
                    alt={p.name}
                    style={productImageStyle}
                  />
                </td>
                <td style={tdStyle}>{p.name}</td>
                <td style={tdStyle}>{p.price?.toLocaleString("vi-VN")} VND</td>
                <td style={tdStyle}>{p.categoryName || "N/A"}</td>
                <td style={tdStyle}>{p.description}</td>
                <td style={tdStyle}>
                  <button
                    onClick={() => handleDeleteProduct(p.id)}
                    style={{
                      padding: "6px 10px",
                      backgroundColor: "#dc3545",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>

        </table>
      </div>
    </div>
  );
}

/* ==== Styles ==== */
const containerStyle = {
  maxWidth: "950px",
  margin: "auto",
  marginTop: "20px",
  padding: "20px",
};
const titleStyle = { textAlign: "center", marginBottom: "25px" };
const alertStyle = {
  padding: "10px 15px",
  borderRadius: "6px",
  marginBottom: "20px",
  textAlign: "center",
};
const sectionStyle = {
  marginBottom: "30px",
  padding: "20px",
  border: "1px solid #eee",
  borderRadius: "8px",
  backgroundColor: "#fafafa",
  boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
};
const formStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "10px",
};
const inputStyle = {
  padding: "8px",
  border: "1px solid #ccc",
  borderRadius: "4px",
};
const buttonSubmitStyle = {
  padding: "10px",
  backgroundColor: "#007bff",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  transition: "background-color 0.3s",
};
const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: "15px",
};
const thStyle = {
  border: "1px solid #ddd",
  padding: "10px",
  backgroundColor: "#f2f2f2",
  textAlign: "left",
};
const tdStyle = { border: "1px solid #ddd", padding: "10px" };
const productImageStyle = {
  width: "100px",
  height: "80px",
  objectFit: "cover",
  borderRadius: "4px",
};
const previewImageStyle = {
  width: "200px",
  height: "150px",
  objectFit: "cover",
  borderRadius: "6px",
  border: "1px solid #ccc",
  marginTop: "10px",
};

