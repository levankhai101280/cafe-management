package com.example.cafe.model;

import jakarta.persistence.*;

@Entity
public class TableEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer tableNumber;
    private Integer capacity; // Sức chứa
    private String status; // TRỐNG, ĐANG SỬ DỤNG, ĐÃ ĐẶT

    // Constructors
    public TableEntity() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Integer getTableNumber() { return tableNumber; }
    public void setTableNumber(Integer tableNumber) { this.tableNumber = tableNumber; }
    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}