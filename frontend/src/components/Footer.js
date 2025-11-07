import React from "react";
import "../styles/Footer.css";
import { FaFacebook, FaInstagram, FaTiktok, FaPhone, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";

function Footer() {
  return (
    <footer className="app-footer">
      <div className="footer-container">
        {/* Cột 1: Giới thiệu */}
        <div className="footer-column">
          <h3 className="footer-title">🍽 Cà phê & Nhà hàng Lê Văn Khải</h3>
          <p className="footer-text">
            Trải nghiệm không gian ấm cúng, món ăn hấp dẫn và dịch vụ tận tâm.  
            Chúng tôi luôn mang đến trải nghiệm ẩm thực tốt nhất cho bạn!
          </p>
        </div>

        {/* Cột 2: Liên hệ */}
        <div className="footer-column">
          <h4 className="footer-subtitle">Liên hệ</h4>
          <ul className="footer-list">
            <li><FaMapMarkerAlt className="footer-icon" /> 300 Xô Viết Nghệ Tĩnh, Đà Nẵng</li>
            <li><FaPhone className="footer-icon" /> 0388985684</li>
            <li><FaEnvelope className="footer-icon" /> khaiitdeverloper@gmail.com</li>
          </ul>
        </div>

        {/* Cột 3: Mạng xã hội */}
        <div className="footer-column">
          <h4 className="footer-subtitle">Theo dõi chúng tôi</h4>
          <div className="social-icons">
            <a href="https://facebook.com" target="_blank" rel="noreferrer"><FaFacebook /></a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer"><FaInstagram /></a>
            <a href="https://tiktok.com" target="_blank" rel="noreferrer"><FaTiktok /></a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        © {new Date().getFullYear()} Levankhai Café | Designed by Khai Dev
      </div>
    </footer>
  );
}

export default Footer;
