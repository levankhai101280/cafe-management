package com.example.cafe.service;

import com.example.cafe.dto.ProductDto;
import com.example.cafe.model.Category;
import com.example.cafe.model.Product;
import com.example.cafe.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Optional; 
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private S3StorageService s3StorageService;

    // PHƯƠNG THỨC TIỆN ÍCH MỚI: Chuyển đổi Entity sang DTO
    // Khai báo là static để sử dụng trong Stream API và tránh lỗi 'this'
    private static ProductDto convertToDto(Product product) {
        if (product == null) return null;

        // Đảm bảo Category không null trước khi truy cập
        Long categoryId = product.getCategory() != null ? product.getCategory().getId() : null;
        String categoryName = product.getCategory() != null ? product.getCategory().getName() : null;

        return new ProductDto(
                product.getId(),
                product.getName(),
                product.getPrice(),
                product.getDescription(),
                categoryId,
                categoryName,
                product.getImageUrl()
        );
    }
    //---------------------------------------------------------------------------------------------------------------------
    public List<ProductDto> getAllProducts() {
        return productRepository.findAllWithCategory().stream()
                // Sử dụng ProductService::convertToDto (static method reference)
                .map(ProductService::convertToDto)
                .collect(Collectors.toList());
    }

    public List<ProductDto> searchProducts(String keyword) {
        return productRepository.searchByName(keyword).stream()
                // Sử dụng ProductService::convertToDto
                .map(ProductService::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Phương thức mới: Lấy ProductDto theo ID (cho trang chi tiết)
     */
    public ProductDto getProductDtoById(Long id) {
        // 1. Tìm Product bằng findById
        Optional<Product> productOptional = productRepository.findById(id);

        // 2. Sử dụng Optional.map và orElse để chuyển đổi an toàn
        return productOptional
                .map(ProductService::convertToDto)
                .orElse(null); // Trả về null nếu không tìm thấy
    }
    //---------------------------------------------------------------------------------------------------------------------
    public Product createProduct(Product product) {
        return productRepository.save(product);
    }

    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại"));

        // Nếu có ảnh → xóa file trên S3
        if (product.getImageUrl() != null && !product.getImageUrl().isEmpty()) {
            // Gọi service S3 để xóa
            s3StorageService.deleteFile(product.getImageUrl());
        }

        // Xóa sản phẩm khỏi database
        productRepository.deleteById(id);
    }


    // Lưu sản phẩm kèm ảnh
    public ProductDto saveProductWithImage(String name, Long price, String description, Long categoryId, MultipartFile image) {

        // 1. Upload ảnh lên S3 và lấy URL
        String imageUrl = s3StorageService.uploadFile(image);

        // 2. Tạo Product
        Product product = new Product();
        product.setName(name);
        product.setPrice(price);
        product.setDescription(description);

        Category category = new Category();
        category.setId(categoryId);
        product.setCategory(category);

        // 3. Lưu URL từ S3 vào database
        product.setImageUrl(imageUrl);

        // 4. Lưu product
        Product savedProduct = productRepository.save(product);

        // 5. Trả về DTO
        return convertToDto(savedProduct);
    }

}