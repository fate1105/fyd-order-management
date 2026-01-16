package com.fyd.backend.repository;

import com.fyd.backend.entity.Brand;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface BrandRepository extends JpaRepository<Brand, Long> {
    Optional<Brand> findBySlug(String slug);
    
    @Query("SELECT b FROM Brand b WHERE b.status = 'ACTIVE'")
    List<Brand> findAllActive();
}
