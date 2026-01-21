package com.fyd.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "featured_zones")
public class FeaturedZone {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 100)
    private String slug;

    @Column(length = 50)
    private String position = "home_featured"; // home_hero, home_featured, home_bottom, category_top

    @Column(name = "is_active")
    private Boolean isActive = true;

    // Grid configuration as JSON
    @Column(name = "grid_columns")
    private Integer gridColumns = 4;

    @Column(name = "grid_gap")
    private Integer gridGap = 16;

    @Column(name = "grid_aspect_ratio", length = 20)
    private String gridAspectRatio = "3/4";

    // Product IDs as JSON array string
    @Column(name = "product_data", columnDefinition = "TEXT")
    private String productData; // JSON: [{"productId": 1, "position": 0, "customThumbnail": null}, ...]

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public String getPosition() { return position; }
    public void setPosition(String position) { this.position = position; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public Integer getGridColumns() { return gridColumns; }
    public void setGridColumns(Integer gridColumns) { this.gridColumns = gridColumns; }

    public Integer getGridGap() { return gridGap; }
    public void setGridGap(Integer gridGap) { this.gridGap = gridGap; }

    public String getGridAspectRatio() { return gridAspectRatio; }
    public void setGridAspectRatio(String gridAspectRatio) { this.gridAspectRatio = gridAspectRatio; }

    public String getProductData() { return productData; }
    public void setProductData(String productData) { this.productData = productData; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
