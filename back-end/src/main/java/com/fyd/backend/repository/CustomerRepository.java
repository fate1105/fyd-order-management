package com.fyd.backend.repository;

import com.fyd.backend.entity.Customer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    Optional<Customer> findByEmail(String email);
    Optional<Customer> findByPhone(String phone);
    
    /**
     * Find customer by OAuth provider and OAuth ID.
     * Used for OAuth login to find existing linked accounts.
     * 
     * @param oauthProvider OAuth provider (google, facebook)
     * @param oauthId OAuth user ID from the provider
     * @return Optional containing the customer if found
     */
    Optional<Customer> findByOauthProviderAndOauthId(String oauthProvider, String oauthId);
    
    @Query("SELECT c FROM Customer c WHERE " +
           "(LOWER(c.fullName) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(c.email) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "c.phone LIKE CONCAT('%', :q, '%'))")
    Page<Customer> search(@Param("q") String q, Pageable pageable);
    
    @Query("SELECT c FROM Customer c WHERE c.tier.id = :tierId")
    Page<Customer> findByTier(@Param("tierId") Long tierId, Pageable pageable);
    
    @Query("SELECT COUNT(c) FROM Customer c WHERE c.tier.name = :tierName")
    Long countByTierName(@Param("tierName") String tierName);
}
