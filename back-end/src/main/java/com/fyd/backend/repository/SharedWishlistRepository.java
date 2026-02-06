package com.fyd.backend.repository;

import com.fyd.backend.entity.SharedWishlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface SharedWishlistRepository extends JpaRepository<SharedWishlist, Long> {
    Optional<SharedWishlist> findByShareCode(String shareCode);
    
    void deleteByExpiresAtBefore(LocalDateTime dateTime);
}
