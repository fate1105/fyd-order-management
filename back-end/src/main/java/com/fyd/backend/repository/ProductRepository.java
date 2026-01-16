package com.fyd.backend.repository;

import com.fyd.backend.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    Optional<Product> findBySku(String sku);
    Optional<Product> findBySlug(String slug);
    
    @Query("SELECT p FROM Product p WHERE p.status = 'ACTIVE'")
    List<Product> findAllActive();
    
    @Query("SELECT p FROM Product p WHERE p.isFeatured = true AND p.status = 'ACTIVE'")
    List<Product> findFeatured();
    
    @Query("SELECT p FROM Product p WHERE p.isNew = true AND p.status = 'ACTIVE'")
    List<Product> findNewArrivals();
    
    @Query("SELECT p FROM Product p WHERE p.category.id = :categoryId AND p.status = 'ACTIVE'")
    List<Product> findByCategory(@Param("categoryId") Long categoryId);
    
    @Query("SELECT p FROM Product p WHERE " +
           "(LOWER(p.name) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(p.sku) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(p.category.name) LIKE LOWER(CONCAT('%', :q, '%')))")
    Page<Product> search(@Param("q") String q, Pageable pageable);
    
    @Query("SELECT p FROM Product p ORDER BY p.soldCount DESC")
    List<Product> findTopSelling(Pageable pageable);
}
