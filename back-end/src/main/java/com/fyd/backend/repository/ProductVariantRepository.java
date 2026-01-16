package com.fyd.backend.repository;

import com.fyd.backend.entity.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {
    List<ProductVariant> findByProductId(Long productId);
    Optional<ProductVariant> findBySkuVariant(String skuVariant);
    
    @Query("SELECT pv FROM ProductVariant pv WHERE pv.stockQuantity <= :threshold AND pv.status = 'ACTIVE'")
    List<ProductVariant> findLowStock(@Param("threshold") int threshold);
    
    @Query("SELECT pv FROM ProductVariant pv WHERE pv.stockQuantity = 0 AND pv.status = 'ACTIVE'")
    List<ProductVariant> findOutOfStock();
    
    @Query("SELECT SUM(pv.stockQuantity) FROM ProductVariant pv WHERE pv.product.id = :productId")
    Integer getTotalStockByProduct(@Param("productId") Long productId);
}
