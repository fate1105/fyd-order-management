package com.fyd.backend.repository;

import com.fyd.backend.entity.NightMarketConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface NightMarketConfigRepository extends JpaRepository<NightMarketConfig, Long> {
    Optional<NightMarketConfig> findFirstByIsActiveTrue();
}
