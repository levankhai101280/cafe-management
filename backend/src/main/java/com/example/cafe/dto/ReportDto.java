package com.example.cafe.dto;

import java.time.LocalDate;

public class ReportDto {
    private LocalDate date;
    private Long totalRevenue;
    private Integer totalCustomers;
    private Integer totalOrders;

    // Constructor
    public ReportDto(LocalDate date, Long totalRevenue, Integer totalCustomers, Integer totalOrders) {
        this.date = date;
        this.totalRevenue = totalRevenue;
        this.totalCustomers = totalCustomers;
        this.totalOrders = totalOrders;
    }

    // Getters and Setters
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    public Long getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(Long totalRevenue) { this.totalRevenue = totalRevenue; }
    public Integer getTotalCustomers() { return totalCustomers; }
    public void setTotalCustomers(Integer totalCustomers) { this.totalCustomers = totalCustomers; }
    public Integer getTotalOrders() { return totalOrders; }
    public void setTotalOrders(Integer totalOrders) { this.totalOrders = totalOrders; }
}