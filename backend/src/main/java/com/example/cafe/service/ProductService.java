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

    // Thư mục resources/uploads
    private static final String UPLOAD_DIR = "D:/kHAIITDEVERLOPER/LAPTRINHWEB2/cafe-management-project/backend/src/main/resources/uploads/";

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

        // Nếu có ảnh → xóa file vật lý
        if (product.getImageUrl() != null && !product.getImageUrl().isEmpty()) {
            Path path = Paths.get(UPLOAD_DIR + product.getImageUrl().replace("/uploads/", ""));
            try {
                Files.deleteIfExists(path);
            } catch (IOException e) {
                throw new RuntimeException("Lỗi xóa file ảnh: " + e.getMessage());
            }
        }

        // Xóa sản phẩm
        productRepository.deleteById(id);
    }


    // Lưu sản phẩm kèm ảnh
    public ProductDto saveProductWithImage(String name, Long price, String description, Long categoryId, MultipartFile image) {
        try {
            // Tạo thư mục nếu chưa tồn tại
            File dir = new File(UPLOAD_DIR);
            if (!dir.exists()) dir.mkdirs();

            // Tạo tên file duy nhất
            String fileName = UUID.randomUUID() + "_" + image.getOriginalFilename();
            Path filePath = Paths.get(UPLOAD_DIR + fileName);

            // Lưu ảnh
            Files.copy(image.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // URL ảnh truy cập từ frontend
            String imageUrl = "/uploads/" + fileName;

            // Tạo Product
            Product product = new Product();
            product.setName(name);
            product.setPrice(price);
            product.setDescription(description);

            Category category = new Category();
            category.setId(categoryId);
            product.setCategory(category);

            product.setImageUrl(imageUrl);

            productRepository.save(product);

            // Trả về DTO
            return convertToDto(product); 

        } catch (IOException e) {
            throw new RuntimeException(" Lỗi khi lưu ảnh: " + e.getMessage());
        }
    }

}