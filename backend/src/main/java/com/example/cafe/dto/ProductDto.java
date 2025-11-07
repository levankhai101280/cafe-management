package com.example.cafe.dto;

// DTO này được dùng để trả về dữ liệu Product cho Frontend
public class ProductDto {
    private Long id;
    private String name;
    private Long price;
    private String description;

    private Long categoryId;
    private String categoryName;
    private String imageUrl;

    // Constructor để chuyển đổi từ Entity
    public ProductDto(Long id, String name, Long price, String description,
                      Long categoryId, String categoryName, String imageUrl) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.description = description;
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.imageUrl = imageUrl;
    }

    // Getters and Setters (Bạn có thể tự bổ sung phần còn lại)
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Long getPrice() { return price; }
    public void setPrice(Long price) { this.price = price; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
}