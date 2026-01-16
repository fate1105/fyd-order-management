package com.fyd.backend.repository;

import com.fyd.backend.entity.Size;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SizeRepository extends JpaRepository<Size, Long> {
    @Query("SELECT s FROM Size s ORDER BY s.sortOrder")
    List<Size> findAllOrdered();
}
