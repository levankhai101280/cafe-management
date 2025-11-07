package com.example.cafe.dto;

import java.util.List;

public class OrderRequest {
    private Long tableId;
    private Integer numberOfCustomers;
    private List<OrderItemDto> items;

    // Getters and Setters
    public Long getTableId() { return tableId; }
    public void setTableId(Long tableId) { this.tableId = tableId; }
    public Integer getNumberOfCustomers() { return numberOfCustomers; }
    public void setNumberOfCustomers(Integer numberOfCustomers) { this.numberOfCustomers = numberOfCustomers; }
    public List<OrderItemDto> getItems() { return items; }
    public void setItems(List<OrderItemDto> items) { this.items = items; }
}