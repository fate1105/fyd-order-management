package com.fyd.backend.repository;

import com.fyd.backend.entity.EventVoucherRule;
import com.fyd.backend.entity.EventVoucherRule.EventType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EventVoucherRuleRepository extends JpaRepository<EventVoucherRule, Long> {

    /**
     * Find all active rules
     */
    List<EventVoucherRule> findByIsActiveTrueOrderByCreatedAtDesc();

    /**
     * Find active rules by event type
     */
    List<EventVoucherRule> findByEventTypeAndIsActiveTrue(EventType eventType);

    /**
     * Find active holiday rules for today's date (MM-DD format)
     */
    @Query("SELECT r FROM EventVoucherRule r WHERE r.eventType = 'HOLIDAY' AND r.isActive = true AND r.holidayDate = :today")
    List<EventVoucherRule> findActiveHolidayRulesForDate(@Param("today") String today);

    /**
     * Find active birthday rules
     */
    @Query("SELECT r FROM EventVoucherRule r WHERE r.eventType = 'BIRTHDAY' AND r.isActive = true")
    List<EventVoucherRule> findActiveBirthdayRules();

    /**
     * Find active new user rules
     */
    @Query("SELECT r FROM EventVoucherRule r WHERE r.eventType = 'NEW_USER' AND r.isActive = true")
    List<EventVoucherRule> findActiveNewUserRules();

    /**
     * Find active inactive customer rules
     */
    @Query("SELECT r FROM EventVoucherRule r WHERE r.eventType = 'INACTIVE' AND r.isActive = true")
    List<EventVoucherRule> findActiveInactiveRules();

    /**
     * Find active first order rules
     */
    @Query("SELECT r FROM EventVoucherRule r WHERE r.eventType = 'FIRST_ORDER' AND r.isActive = true")
    List<EventVoucherRule> findActiveFirstOrderRules();

    /**
     * Find active VIP tier rules for specific tier
     */
    @Query("SELECT r FROM EventVoucherRule r WHERE r.eventType = 'VIP_TIER' AND r.isActive = true AND r.targetTierId = :tierId")
    List<EventVoucherRule> findActiveVipTierRulesForTier(@Param("tierId") Long tierId);

    /**
     * Check if rule name already exists
     */
    boolean existsByName(String name);

    Optional<EventVoucherRule> findByName(String name);
}
