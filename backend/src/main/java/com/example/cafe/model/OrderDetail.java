package com.example.cafe.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
public class OrderDetail {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Liên kết với đơn hàng
    @ManyToOne
    @JoinColumn(name = "order_id")
    @JsonIgnore
    private Order order;

    // Sản phẩm đã order
    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;

    private Integer quantity; // Số lượng món
    private Long priceAtOrder; // Giá tại thời điểm đặt


    // Constructors, Getters, Setters
    public OrderDetail() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Order getOrder() { return order; }
    public void setOrder(Order order) { this.order = order; }
    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public Long getPriceAtOrder() { return priceAtOrder; }
    public void setPriceAtOrder(Long priceAtOrder) { this.priceAtOrder = priceAtOrder; }
}