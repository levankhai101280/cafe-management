import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom'; // Dùng để lấy ID từ URL

// API Public để lấy chi tiết sản phẩm theo ID
const API_PRODUCT_BASE = '/api/products'; 

export default function ProductDetailPage() {
    const { id } = useParams(); // Lấy 'id' từ URL (ví dụ: /products/123)
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (id) {
            fetchProductDetails(id);
        }
    }, [id]);

    const fetchProductDetails = async (productId) => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get(`${API_PRODUCT_BASE}/${productId}`);
            setProduct(res.data);
        } catch (err) {
            console.error(`❌ Lỗi tải chi tiết sản phẩm ID ${productId}:`, err);
            setError("Không tìm thấy sản phẩm hoặc lỗi kết nối.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div style={containerStyle}><p style={loadingStyle}>Đang tải chi tiết sản phẩm...</p></div>;
    }

    if (error) {
        return <div style={containerStyle}><h2 style={{color: 'red'}}>{error}</h2></div>;
    }

    // Đảm bảo dữ liệu tồn tại trước khi render
    if (!product) {
        return <div style={containerStyle}><h2 style={{color: 'orange'}}>Không tìm thấy dữ liệu sản phẩm.</h2></div>;
    }

    return (
        <div style={containerStyle}>
            <div style={detailContainerStyle}>
                <div style={imageColStyle}>
                    <img 
                        src={product.imageUrl ? `http://18.234.214.71:8081${product.imageUrl}` : "https://via.placeholder.com/400x300?text=No+Image"} 
                        alt={product.name} 
                        style={productImageStyle}
                    />
                </div>
                <div style={infoColStyle}>
                    <h1 style={productNameStyle}>{product.name}</h1>
                    <p style={priceStyle}>
                        Giá: {product.price?.toLocaleString('vi-VN')} VND
                    </p>
                    <p style={categoryStyle}>
                        Danh mục: <strong>{product.categoryName || 'Chưa phân loại'}</strong>
                    </p>
                    
                    <h3 style={{marginTop: '30px', borderBottom: '1px solid #eee', paddingBottom: '5px'}}>Mô tả</h3>
                    <p style={descriptionStyle}>
                        {product.description || "Sản phẩm này hiện chưa có mô tả chi tiết."}
                    </p>

                    <button style={orderButtonStyle}>Thêm vào Order</button>
                </div>
            </div>
        </div>
    );
}

/* ===== Styles ===== */
const containerStyle = { maxWidth: '1000px', margin: '40px auto', padding: '20px', minHeight: '60vh' };
const loadingStyle = { textAlign: 'center', fontSize: '1.2em' };

const detailContainerStyle = { display: 'flex', gap: '40px', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', overflow: 'hidden' };
const imageColStyle = { flex: 1, padding: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center' };
const infoColStyle = { flex: 1, padding: '30px', display: 'flex', flexDirection: 'column' };

const productImageStyle = { width: '100%', maxWidth: '400px', height: 'auto', borderRadius: '8px', objectFit: 'cover', border: '1px solid #ddd' };

const productNameStyle = { fontSize: '2.5em', fontWeight: '700', color: '#333', marginBottom: '10px' };
const priceStyle = { fontSize: '1.8em', fontWeight: 'bold', color: '#e63946', marginBottom: '15px' };
const categoryStyle = { fontSize: '1.1em', color: '#555', marginBottom: '15px' };
const descriptionStyle = { lineHeight: '1.6', color: '#444' };

const orderButtonStyle = { backgroundColor: '#007bff', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '6px', cursor: 'pointer', fontSize: '1.1em', marginTop: '30px', alignSelf: 'flex-start' };