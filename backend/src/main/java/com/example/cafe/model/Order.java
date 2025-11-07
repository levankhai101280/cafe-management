package com.example.cafe.model;

import jakarta.persistence.*; 
import java.time.LocalDateTime;
import java.util.List;

import com.example.cafe.model.User; 

@Entity
@Table(name = "cafe_order")
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Liên kết với bàn
    @ManyToOne
    @JoinColumn(name = "table_id")
    private TableEntity table;

    @ManyToOne // Mối quan hệ: Nhiều Order thuộc về một User
    @JoinColumn(name = "user_id", nullable = false) // Tên cột khóa ngoại, không cho phép null
    private User user; // Thêm trường user


    // Tổng tiền
    private Long totalAmount;

    // Số lượng khách
    private Integer numberOfCustomers;

    // Trạng thái đơn hàng
    private String status;

    // Thời gian đặt hàng
    private LocalDateTime orderTime;

    // Chi tiết đơn hàng (các món)
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderDetail> orderDetails;

    // Constructors
    public Order() {
        this.orderTime = LocalDateTime.now();
        this.status = "CHỜ XỬ LÝ"; // Trạng thái mặc định khi tạo
    }

    // --- Getters and Setters ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public TableEntity getTable() { return table; }
    public void setTable(TableEntity table) { this.table = table; }

    public User getUser() {
        return user;
    }

    public void setUser(User user) { // <-- Phương thức đã được thêm
        this.user = user;
    }


    public Long getTotalAmount() { return totalAmount; }
    public void setTotalAmount(Long totalAmount) { this.totalAmount = totalAmount; }

    public Integer getNumberOfCustomers() { return numberOfCustomers; }
    public void setNumberOfCustomers(Integer numberOfCustomers) { this.numberOfCustomers = numberOfCustomers; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getOrderTime() { return orderTime; }
    public void setOrderTime(LocalDateTime orderTime) { this.orderTime = orderTime; }

    public List<OrderDetail> getOrderDetails() { return orderDetails; }
    public void setOrderDetails(List<OrderDetail> orderDetails) {
        this.orderDetails = orderDetails;
        if (orderDetails != null) {
            // Đảm bảo mỗi OrderDetail đều có tham chiếu ngược lại Order này
            orderDetails.forEach(detail -> detail.setOrder(this));
        }
    }
}