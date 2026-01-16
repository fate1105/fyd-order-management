package com.fyd.backend.repository;

import com.fyd.backend.entity.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductImageRepository extends JpaRepository<ProductImage, Long> {
    
    List<ProductImage> findByProductId(Long productId);
    
    @Modifying
    @Query("UPDATE ProductImage pi SET pi.isPrimary = false WHERE pi.product.id = :productId")
    void clearPrimaryByProductId(@Param("productId") Long productId);
    
    @Modifying
    @Query("UPDATE ProductImage pi SET pi.isPrimary = true WHERE pi.id = :imageId")
    void setPrimaryById(@Param("imageId") Long imageId);
}
