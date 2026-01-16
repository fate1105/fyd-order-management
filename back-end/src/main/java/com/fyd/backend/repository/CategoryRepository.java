package com.fyd.backend.repository;

import com.fyd.backend.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findBySlug(String slug);
    
    @Query("SELECT c FROM Category c WHERE c.parent IS NULL AND c.status = 'ACTIVE' ORDER BY c.sortOrder")
    List<Category> findRootCategories();
    
    @Query("SELECT c FROM Category c WHERE c.parent.id = :parentId AND c.status = 'ACTIVE' ORDER BY c.sortOrder")
    List<Category> findByParentId(Long parentId);
    
    @Query("SELECT c FROM Category c WHERE c.status = 'ACTIVE' ORDER BY c.sortOrder")
    List<Category> findAllActive();
}
