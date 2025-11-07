package com.example.cafe.service;

import com.example.cafe.dto.OrderRequest;
import com.example.cafe.dto.OrderItemDto;
import com.example.cafe.dto.ReportDto;
import com.example.cafe.model.*;
import com.example.cafe.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {

    @Autowired private OrderRepository orderRepository;
    @Autowired private TableRepository tableRepository;
    @Autowired private ProductRepository productRepository;
    @Autowired private UserRepository userRepository; 

    
    @Transactional 
    public Order createOrder(String username, OrderRequest request) { 
        
        // 1. Tìm User đã đăng nhập
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại: " + username));

        // 2. Tìm Bàn
        TableEntity table = tableRepository.findById(request.getTableId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bàn"));

        // Kiểm tra xem bàn có đang trống không (quan trọng!)
        if (!"TRỐNG".equalsIgnoreCase(table.getStatus())) {
             throw new RuntimeException("Bàn số " + table.getTableNumber() + " đang được sử dụng hoặc chờ dọn.");
        }

        // 3. Tạo Order mới
        Order order = new Order();
        order.setTable(table);
        order.setUser(user);
        order.setNumberOfCustomers(request.getNumberOfCustomers() != null ? request.getNumberOfCustomers() : 1);
        order.setOrderTime(LocalDateTime.now()); 
        order.setStatus("CHỜ XỬ LÝ"); // Trạng thái ban đầu

        // 4. Tạo chi tiết đơn hàng
        List<OrderDetail> details = request.getItems().stream().map(itemDto -> {
            Product product = productRepository.findById(itemDto.getProductId())
                    .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại: ID " + itemDto.getProductId()));

            OrderDetail detail = new OrderDetail();
            detail.setProduct(product);
            detail.setQuantity(itemDto.getQuantity());
            detail.setPriceAtOrder(product.getPrice());
            detail.setOrder(order); // Liên kết ngược lại Order cha
            return detail;
        }).collect(Collectors.toList());

        // 5. Gán chi tiết và tính tổng tiền
        order.setOrderDetails(details); // Gán danh sách chi tiết vào Order
        Long totalAmount = details.stream()
                .mapToLong(d -> d.getPriceAtOrder() * d.getQuantity())
                .sum();
        order.setTotalAmount(totalAmount);

        // 6. Cập nhật trạng thái bàn
        table.setStatus("ĐANG SỬ DỤNG"); // Hoặc tên trạng thái bạn dùng
        tableRepository.save(table);

        // 7. Lưu Order (Cascade sẽ tự lưu OrderDetail)
        return orderRepository.save(order);
    }

    // === CHỨC NĂNG CỦA ADMIN/NHÂN VIÊN (XEM VÀ THANH TOÁN) ===
    @Transactional 
    public Order finishOrderAndPay(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

        if ("ĐÃ THANH TOÁN".equalsIgnoreCase(order.getStatus())) {
            throw new RuntimeException("Đơn hàng này đã được thanh toán rồi.");
        }

        order.setStatus("ĐÃ THANH TOÁN");

        TableEntity table = order.getTable();
        if (table != null) { // Kiểm tra null phòng trường hợp dữ liệu cũ
             table.setStatus("TRỐNG"); // Đặt lại trạng thái bàn
             tableRepository.save(table);
        } else {
             // Ghi log cảnh báo nếu không tìm thấy bàn liên kết
             System.err.println("Cảnh báo: Không tìm thấy bàn liên kết với Order ID: " + orderId);
        }


        return orderRepository.save(order);
    }

    // === CHỨC NĂNG BÁO CÁO (ADMIN) ===
    public ReportDto getDailyReport(LocalDate date) {
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(23, 59, 59);


        List<Order> paidOrders = orderRepository.findByStatusAndOrderTimeBetween("ĐÃ THANH TOÁN", startOfDay, endOfDay);

        Long totalRevenue = paidOrders.stream()
                .mapToLong(Order::getTotalAmount)
                .sum();

        Integer totalCustomers = paidOrders.stream()
                .mapToInt(Order::getNumberOfCustomers)
                .sum();

        return new ReportDto(date, totalRevenue, totalCustomers, paidOrders.size());
    }
    public Order getActiveOrderByTableId(Long tableId) {
        // Giả sử OrderRepository có sẵn phương thức tìm kiếm này:
        // findByTableIdAndStatusNot(Long tableId, String status)
        List<Order> activeOrders = orderRepository.findByTableIdAndStatusNot(tableId, "ĐÃ THANH TOÁN");
        
        if (activeOrders.isEmpty()) {
            throw new RuntimeException("Bàn này không có đơn hàng đang hoạt động.");
        }
        return activeOrders.get(0);
    }
}