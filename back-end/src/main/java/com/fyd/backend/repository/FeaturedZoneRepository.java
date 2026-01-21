package com.fyd.backend.repository;

import com.fyd.backend.entity.FeaturedZone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FeaturedZoneRepository extends JpaRepository<FeaturedZone, Long> {
    List<FeaturedZone> findAllByOrderByCreatedAtDesc();
    List<FeaturedZone> findByIsActiveTrueOrderByCreatedAtDesc();
    Optional<FeaturedZone> findBySlug(String slug);
    List<FeaturedZone> findByPositionAndIsActiveTrue(String position);
}
