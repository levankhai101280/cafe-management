package com.example.cafe.controller;

import com.example.cafe.dto.ProductDto;
import com.example.cafe.model.Category;
import com.example.cafe.model.Product;
import com.example.cafe.model.TableEntity;
import com.example.cafe.service.CategoryService;
import com.example.cafe.service.ProductService;
import com.example.cafe.service.TableService;
import com.example.cafe.model.Order;
import com.example.cafe.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.MediaType; // 👈 Import mới cho MediaType
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile; // 👈 Import mới cho MultipartFile
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminController {

    @Autowired private OrderService orderService;
    @Autowired private ProductService productService;
    @Autowired private TableService tableService;
    @Autowired private CategoryService categoryService;


    // === QUẢN LÝ DANH MỤC ===
    @GetMapping("/categories")
    public List<Category> getAllCategories() {
        return categoryService.getAllCategories();
    }

    @PostMapping("/categories")
    public ResponseEntity<Category> createCategory(@RequestBody Category category) {
        return ResponseEntity.ok(categoryService.createCategory(category));
    }


    // === QUẢN LÝ SẢN PHẨM ===

    // API GET: Lấy tất cả sản phẩm (cho bảng quản lý)
    @GetMapping("/products")
    public List<ProductDto> getAllProducts() {
        return productService.getAllProducts();
    }

    // API POST: Thêm sản phẩm (Dạng JSON cũ - Nên dùng /products/upload)
    // Giữ lại nếu cần, nhưng không khuyến khích khi có upload file
    @PostMapping("/products")
    public ResponseEntity<Object> createProduct(@RequestBody Product product) {
        // ... (Logic tạo sản phẩm cũ) ...
        // Logic này bị bỏ qua do frontend Admin đã chuyển sang dùng /products/upload
        return ResponseEntity.badRequest().body("Vui lòng sử dụng API /products/upload.");
    }

    // API POST: Thêm sản phẩm kèm ảnh (TỪ FRONTEND ProductManagement)
    @PostMapping(value = "/products/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductDto> uploadProduct(
            @RequestParam("name") String name,
            @RequestParam("price") Long price,
            @RequestParam("description") String description,
            @RequestParam("categoryId") Long categoryId,
            @RequestParam("image") MultipartFile image
    ) {
        ProductDto newProduct = productService.saveProductWithImage(name, price, description, categoryId, image);
        return ResponseEntity.ok(newProduct);
    }

    // API DELETE: Xóa sản phẩm
    @DeleteMapping("/products/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }


    // === QUẢN LÝ BÀN ===
    @PostMapping("/tables")
    public ResponseEntity<TableEntity> createTable(@RequestBody TableEntity table) {
        return ResponseEntity.ok(tableService.createTable(table));
    }

    @GetMapping("/tables")
    public List<TableEntity> getAllTables() {
        return tableService.getAllTables();
    }

    @PutMapping("/tables/{id}/status")
    public ResponseEntity<TableEntity> updateTableStatus(@PathVariable Long id, @RequestParam String status) {
        TableEntity updatedTable = tableService.updateTableStatus(id, status);
        return ResponseEntity.ok(updatedTable);
    }

    @GetMapping("/tables/{tableId}/active-order")
    // Mặc định @RequestMapping("/api/admin") đã yêu cầu ROOT_USER
    public ResponseEntity<Order> getActiveOrder(@PathVariable Long tableId) {
        try {
            // ⭐️ Gọi hàm Service có tồn tại (getActiveOrderByTableId) ⭐️
            Order order = orderService.getActiveOrderByTableId(tableId); 
            return ResponseEntity.ok(order);
        } catch (RuntimeException e) {
            // Trả về 404 nếu không tìm thấy Order đang hoạt động
            return ResponseEntity.status(404).body(null); 
        }
    }
}