// TRONG FILE: backend/src/main/java/com/example/cafe/repository/OrderRepository.java

package com.example.cafe.repository;

import com.example.cafe.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional; // Import này là cần thiết

public interface OrderRepository extends JpaRepository<Order, Long> {

    // Hàm cũ (Giữ nguyên)
    List<Order> findByTableIdAndStatusNot(Long tableId, String status);

    // HÀM MỚI (Khuyến nghị sử dụng): Tìm Order theo Bàn và Trạng thái Cụ thể
    Optional<Order> findByTableIdAndStatus(Long tableId, String status);


    // Dùng cho Báo cáo: lấy các đơn hàng đã thanh toán trong ngày
    List<Order> findByStatusAndOrderTimeBetween(String status, LocalDateTime startOfDay, LocalDateTime endOfDay);
}