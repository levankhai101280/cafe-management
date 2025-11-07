package com.example.cafe.controller;

import com.example.cafe.dto.OrderRequest;
import com.example.cafe.dto.ReportDto;
import com.example.cafe.model.Order;
import com.example.cafe.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize; 
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.security.Principal;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "http://localhost:3000") 
public class OrderController {

    @Autowired
    private OrderService orderService;

    // API PROTECTED (authenticated): Khách đặt món/bắt đầu order
    @PostMapping("/place")
    @PreAuthorize("isAuthenticated()") //  BẢO VỆ API: Yêu cầu đăng nhập
    public ResponseEntity<?> placeOrder(@RequestBody OrderRequest request, Principal principal) { // Đổi trả về ResponseEntity<?> để linh hoạt hơn

        // Principal được đảm bảo không null nhờ @PreAuthorize và JwtAuthFilter
        String authenticatedUsername = principal.getName();

        try {
            Order newOrder = orderService.createOrder(authenticatedUsername, request); // Gọi hàm mới
            return ResponseEntity.ok(newOrder); // Trả về 200 OK và Order đã tạo
        } catch (RuntimeException e) { // Bắt lỗi nghiệp vụ cụ thể hơn nếu có
            // Ghi log lỗi chi tiết ở đây nếu cần (dùng Logger)
            System.err.println("Lỗi khi đặt hàng cho user " + authenticatedUsername + ": " + e.getMessage());
            return ResponseEntity
                    .badRequest() // Trả về 400 Bad Request
                    .body("Lỗi khi tạo đơn hàng: " + e.getMessage()); // Gửi thông báo lỗi về frontend
        } catch (Exception e) { // Bắt các lỗi không mong muốn khác
             System.err.println("Lỗi không mong muốn khi đặt hàng: " + e.getMessage());
             return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR) // Trả về 500
                    .body("Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.");
        }
    }

    // API PROTECTED (ROLE_ROOT_USER): Thanh toán đơn hàng
    @PostMapping("/{orderId}/pay")
    @PreAuthorize("hasRole('ROOT_USER')") //  BẢO VỆ API: Chỉ Admin (đã có trong SecurityConfig nhưng thêm ở đây rõ ràng hơn)
    public ResponseEntity<?> payOrder(@PathVariable Long orderId) {
        try {
             Order paidOrder = orderService.finishOrderAndPay(orderId);
             return ResponseEntity.ok(paidOrder);
        } catch (RuntimeException e) {
             return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi hệ thống.");
        }
    }

    // API PROTECTED (ROLE_ROOT_USER): Báo cáo doanh thu
    @GetMapping("/report/daily")
    @PreAuthorize("hasRole('ROOT_USER')") //  BẢO VỆ API
    public ResponseEntity<?> getDailyReport(@RequestParam(required = false) String date) {
         try {
            LocalDate reportDate = (date != null) ? LocalDate.parse(date) : LocalDate.now();
            ReportDto report = orderService.getDailyReport(reportDate);
            return ResponseEntity.ok(report);
         } catch (Exception e) {
             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi khi lấy báo cáo.");
         }
    }
}