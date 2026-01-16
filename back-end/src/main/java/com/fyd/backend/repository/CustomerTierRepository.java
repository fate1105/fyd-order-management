package com.fyd.backend.repository;

import com.fyd.backend.entity.CustomerTier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface CustomerTierRepository extends JpaRepository<CustomerTier, Long> {
    Optional<CustomerTier> findByName(String name);
}
