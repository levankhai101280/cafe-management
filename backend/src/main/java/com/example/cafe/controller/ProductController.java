package com.example.cafe.controller;

import com.example.cafe.dto.ProductDto;
import com.example.cafe.service.ProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "http://localhost:3000")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    // API PUBLIC: Lấy tất cả sản phẩm (Menu)
    @GetMapping
    public List<ProductDto> getAllProducts() {
        return productService.getAllProducts();
    }

    // API PUBLIC: Tìm kiếm sản phẩm theo tên
    @GetMapping("/search")
    public List<ProductDto> searchProducts(@RequestParam String name) {
        return productService.searchProducts(name);
    }
    @GetMapping("/{id}")
    public ResponseEntity<ProductDto> getProductById(@PathVariable Long id) {
        try {
            // Giả định ProductService có phương thức trả về ProductDto
            ProductDto product = productService.getProductDtoById(id);
            if (product == null) {
                return ResponseEntity.notFound().build(); // Trả về 404 nếu không tìm thấy
            }
            return ResponseEntity.ok(product); // Trả về 200 OK
        } catch (Exception e) {
            // Xử lý lỗi nếu ID không hợp lệ hoặc lỗi server
            return ResponseEntity.badRequest().build();
        }
    }

    // 🚨 Các API POST, DELETE, /upload ĐÃ ĐƯỢC CHUYỂN HOẶC BẢO VỆ
    // Frontend Admin giờ sẽ gọi đến /api/admin/products/upload và /api/admin/products/{id} (DELETE)
}