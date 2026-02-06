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

    @Query("SELECT COUNT(c) FROM Customer c WHERE c.createdAt >= :from")
    Long countFrom(@Param("from") java.time.LocalDateTime from);

    /**
     * Find customers with birthday today (matching month and day)
     */
    @Query("SELECT c FROM Customer c WHERE c.status = 'ACTIVE' AND c.dateOfBirth IS NOT NULL " +
           "AND MONTH(c.dateOfBirth) = :month AND DAY(c.dateOfBirth) = :day")
    java.util.List<Customer> findCustomersWithBirthday(@Param("month") int month, @Param("day") int day);

    /**
     * Find new customers registered within X days
     */
    @Query("SELECT c FROM Customer c WHERE c.status = 'ACTIVE' AND c.createdAt >= :since")
    java.util.List<Customer> findNewCustomers(@Param("since") java.time.LocalDateTime since);

    /**
     * Find customers who haven't ordered in X days
     */
    @Query(value = "SELECT c.* FROM customers c " +
           "WHERE c.status = 'ACTIVE' " +
           "AND c.total_orders > 0 " +
           "AND NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.created_at >= :since)",
           nativeQuery = true)
    java.util.List<Customer> findInactiveCustomers(@Param("since") java.time.LocalDateTime since);

    /**
     * Find all active customers (for holiday promotions)
     */
    @Query("SELECT c FROM Customer c WHERE c.status = 'ACTIVE'")
    java.util.List<Customer> findAllActiveCustomers();

    /**
     * Find customers by tier ID
     */
    java.util.List<Customer> findByTierId(Long tierId);
}
