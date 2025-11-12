import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Header.css"; 

function Header({ auth }) {
  const navigate = useNavigate();
  const isLoggedIn = auth?.user?.role;
  const isRoot = auth?.user?.role === "root_user";
  const [searchTerm, setSearchTerm] = useState("");

  const handleLogout = () => {
    auth.logout();
    navigate("/login");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchTerm)}`);
      setSearchTerm("");
    }
  };

  return (
    <header className="app-header">
      <nav className="app-nav">
        {/* Logo */}
        <Link to="/" className="app-logo">
          ☕ Quản Lý Cafe
        </Link>

        {/* Menu chính */}
        <div className="nav-links">
          <Link to="/" className="nav-link">
            Trang Chủuhhshshshhshsh
          </Link>
          <Link to="/products" className="nav-link">
            Sản Phẩm
          </Link>
          <Link to="/blog" className="nav-link">
            Blogs
          </Link>
          <Link to="/news" className="nav-link">
            Tin Tức
          </Link>

          {isRoot && (
            <>
              <Link to="/admin" className="nav-link">
                Admin Dashboard
              </Link>
              <Link to="/admin/products" className="nav-link">
                Master Data
              </Link>
              <Link to="/admin/tables" className="nav-link">
                Quản Lý Bàn
              </Link>
              <Link to="/admin/report" className="nav-link">
                Báo Cáo
              </Link>
            </>
          )}
        </div>

        {/* Phần bên phải */}
        <div className="nav-right">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Tìm sản phẩm, bài viết..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-button">
              🔍
            </button>
          </form>

          {isLoggedIn ? (
            <button onClick={handleLogout} className="logout-btn">
              Đăng Xuất ({auth.user.role})
            </button>
          ) : (
            <>
              <Link to="/login" className="nav-link">
                Đăng Nhập
              </Link>
              <Link to="/register" className="nav-link">
                Đăng Ký
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Header;
