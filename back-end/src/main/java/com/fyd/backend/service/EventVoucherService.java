package com.fyd.backend.service;

import com.fyd.backend.entity.Customer;
import com.fyd.backend.entity.CustomerCoupon;
import com.fyd.backend.entity.EventVoucherRule;
import com.fyd.backend.entity.EventVoucherRule.EventType;
import com.fyd.backend.repository.CustomerCouponRepository;
import com.fyd.backend.repository.CustomerRepository;
import com.fyd.backend.repository.EventVoucherRuleRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

/**
 * Service for processing event-based voucher rules and generating coupons.
 */
@Service
public class EventVoucherService {

    private static final Logger logger = LoggerFactory.getLogger(EventVoucherService.class);

    @Autowired
    private EventVoucherRuleRepository ruleRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private CustomerCouponRepository couponRepository;

    /**
     * Scheduled job to process all event rules daily at 8:00 AM
     */
    @Scheduled(cron = "0 0 8 * * *")
    @Transactional
    public void processAllEvents() {
        logger.info("Starting daily event voucher processing...");

        processBirthdayEvents();
        processNewUserEvents();
        processInactiveEvents();
        processHolidayEvents();

        logger.info("Completed daily event voucher processing");
    }

    /**
     * Process birthday event rules
     */
    @Transactional
    public int processBirthdayEvents() {
        List<EventVoucherRule> rules = ruleRepository.findActiveBirthdayRules();
        if (rules.isEmpty()) {
            return 0;
        }

        LocalDate today = LocalDate.now();
        List<Customer> birthdayCustomers = customerRepository.findCustomersWithBirthday(
                today.getMonthValue(), today.getDayOfMonth());

        logger.info("Found {} customers with birthday today", birthdayCustomers.size());

        int count = 0;
        for (EventVoucherRule rule : rules) {
            for (Customer customer : birthdayCustomers) {
                if (generateCouponIfEligible(customer, rule)) {
                    count++;
                }
            }
        }

        logger.info("Generated {} birthday coupons", count);
        return count;
    }

    /**
     * Process new user event rules
     */
    @Transactional
    public int processNewUserEvents() {
        List<EventVoucherRule> rules = ruleRepository.findActiveNewUserRules();
        if (rules.isEmpty()) {
            return 0;
        }

        int count = 0;
        for (EventVoucherRule rule : rules) {
            int days = rule.getNewUserDays() != null ? rule.getNewUserDays() : 7;
            LocalDateTime since = LocalDateTime.now().minusDays(days);
            List<Customer> newCustomers = customerRepository.findNewCustomers(since);

            for (Customer customer : newCustomers) {
                if (generateCouponIfEligible(customer, rule)) {
                    count++;
                }
            }
        }

        logger.info("Generated {} new user coupons", count);
        return count;
    }

    /**
     * Process inactive customer event rules
     */
    @Transactional
    public int processInactiveEvents() {
        List<EventVoucherRule> rules = ruleRepository.findActiveInactiveRules();
        if (rules.isEmpty()) {
            return 0;
        }

        int count = 0;
        for (EventVoucherRule rule : rules) {
            int days = rule.getInactiveDays() != null ? rule.getInactiveDays() : 30;
            LocalDateTime since = LocalDateTime.now().minusDays(days);
            List<Customer> inactiveCustomers = customerRepository.findInactiveCustomers(since);

            for (Customer customer : inactiveCustomers) {
                if (generateCouponIfEligible(customer, rule)) {
                    count++;
                }
            }
        }

        logger.info("Generated {} inactive customer coupons", count);
        return count;
    }

    /**
     * Process holiday event rules for today
     */
    @Transactional
    public int processHolidayEvents() {
        String today = LocalDate.now().format(DateTimeFormatter.ofPattern("MM-dd"));
        List<EventVoucherRule> rules = ruleRepository.findActiveHolidayRulesForDate(today);

        if (rules.isEmpty()) {
            return 0;
        }

        List<Customer> allCustomers = customerRepository.findAllActiveCustomers();
        logger.info("Processing holiday rules for {} customers", allCustomers.size());

        int count = 0;
        for (EventVoucherRule rule : rules) {
            for (Customer customer : allCustomers) {
                if (isCustomerEligibleForTier(customer, rule)) {
                    if (generateCouponIfEligible(customer, rule)) {
                        count++;
                    }
                }
            }
        }

        logger.info("Generated {} holiday coupons", count);
        return count;
    }

    /**
     * Process first order event (called after order completion)
     */
    @Transactional
    public int processFirstOrderEvent(Customer customer) {
        if (customer.getTotalOrders() != 1) {
            return 0;
        }

        List<EventVoucherRule> rules = ruleRepository.findActiveFirstOrderRules();
        int count = 0;

        for (EventVoucherRule rule : rules) {
            if (generateCouponIfEligible(customer, rule)) {
                count++;
            }
        }

        return count;
    }

    /**
     * Process VIP tier upgrade event (called when customer tier changes)
     */
    @Transactional
    public int processVipTierEvent(Customer customer, Long newTierId) {
        List<EventVoucherRule> rules = ruleRepository.findActiveVipTierRulesForTier(newTierId);
        int count = 0;

        for (EventVoucherRule rule : rules) {
            if (generateCouponIfEligible(customer, rule)) {
                count++;
            }
        }

        return count;
    }

    /**
     * Manually trigger a specific rule for all eligible customers
     */
    @Transactional
    public int triggerRule(Long ruleId) {
        EventVoucherRule rule = ruleRepository.findById(ruleId)
                .orElseThrow(() -> new RuntimeException("Rule not found"));

        List<Customer> customers = getEligibleCustomersForRule(rule);
        int count = 0;

        for (Customer customer : customers) {
            if (generateCouponIfEligible(customer, rule)) {
                count++;
            }
        }

        logger.info("Manually triggered rule '{}', generated {} coupons", rule.getName(), count);
        return count;
    }

    /**
     * Get eligible customers for a rule based on event type
     */
    private List<Customer> getEligibleCustomersForRule(EventVoucherRule rule) {
        LocalDate today = LocalDate.now();

        switch (rule.getEventType()) {
            case BIRTHDAY:
                return customerRepository.findCustomersWithBirthday(
                        today.getMonthValue(), today.getDayOfMonth());
            case NEW_USER:
                int newDays = rule.getNewUserDays() != null ? rule.getNewUserDays() : 7;
                return customerRepository.findNewCustomers(LocalDateTime.now().minusDays(newDays));
            case INACTIVE:
                int inactiveDays = rule.getInactiveDays() != null ? rule.getInactiveDays() : 30;
                return customerRepository.findInactiveCustomers(LocalDateTime.now().minusDays(inactiveDays));
            case HOLIDAY:
            case FIRST_ORDER:
                return customerRepository.findAllActiveCustomers();
            case VIP_TIER:
                if (rule.getTargetTierId() != null) {
                    return customerRepository.findByTierId(rule.getTargetTierId());
                }
                return List.of();
            default:
                return List.of();
        }
    }

    /**
     * Generate coupon for customer if eligible (no duplicate, tier matches)
     */
    private boolean generateCouponIfEligible(Customer customer, EventVoucherRule rule) {
        // Check tier eligibility
        if (!isCustomerEligibleForTier(customer, rule)) {
            return false;
        }

        // Check for duplicate if once per year
        if (Boolean.TRUE.equals(rule.getOncePerYear())) {
            int currentYear = LocalDate.now().getYear();
            boolean exists = couponRepository.existsByCustomerAndEventRuleInYear(
                    customer.getId(), rule.getId(), currentYear);
            if (exists) {
                return false;
            }
        }

        // Generate coupon
        CustomerCoupon coupon = createCoupon(customer, rule);
        couponRepository.save(coupon);

        logger.debug("Generated coupon {} for customer {} from rule {}",
                coupon.getCode(), customer.getId(), rule.getName());

        return true;
    }

    /**
     * Check if customer is eligible based on tier restrictions
     */
    private boolean isCustomerEligibleForTier(Customer customer, EventVoucherRule rule) {
        String eligibleTiers = rule.getEligibleTierIds();
        if (eligibleTiers == null || eligibleTiers.isEmpty()) {
            return true; // No tier restriction
        }

        if (customer.getTier() == null) {
            return false;
        }

        String customerTierId = String.valueOf(customer.getTier().getId());
        String[] tierIds = eligibleTiers.split(",");

        for (String tierId : tierIds) {
            if (tierId.trim().equals(customerTierId)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Create a new CustomerCoupon from rule
     */
    private CustomerCoupon createCoupon(Customer customer, EventVoucherRule rule) {
        CustomerCoupon coupon = new CustomerCoupon();

        coupon.setCustomer(customer);
        coupon.setCode(generateUniqueCode());
        coupon.setDiscountType(rule.getDiscountType());
        coupon.setDiscountValue(rule.getDiscountValue());
        coupon.setMaxDiscount(rule.getMaxDiscount());
        coupon.setMinOrderAmount(rule.getMinOrderAmount());
        coupon.setExpiredAt(LocalDateTime.now().plusDays(rule.getValidityDays()));
        coupon.setStatus("ACTIVE");
        coupon.setEventType(rule.getEventType().name());
        coupon.setEventRule(rule);

        return coupon;
    }

    /**
     * Generate a unique coupon code
     */
    private String generateUniqueCode() {
        String prefix = "EVT";
        String code;
        do {
            code = prefix + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        } while (couponRepository.existsByCode(code));
        return code;
    }

    /**
     * Get all rules
     */
    public List<EventVoucherRule> getAllRules() {
        return ruleRepository.findAll();
    }

    /**
     * Get active rules
     */
    public List<EventVoucherRule> getActiveRules() {
        return ruleRepository.findByIsActiveTrueOrderByCreatedAtDesc();
    }

    /**
     * Create new rule
     */
    @Transactional
    public EventVoucherRule createRule(EventVoucherRule rule) {
        return ruleRepository.save(rule);
    }

    /**
     * Update rule
     */
    @Transactional
    public EventVoucherRule updateRule(Long id, EventVoucherRule updated) {
        EventVoucherRule rule = ruleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rule not found"));

        rule.setName(updated.getName());
        rule.setDescription(updated.getDescription());
        rule.setEventType(updated.getEventType());
        rule.setDiscountType(updated.getDiscountType());
        rule.setDiscountValue(updated.getDiscountValue());
        rule.setMaxDiscount(updated.getMaxDiscount());
        rule.setMinOrderAmount(updated.getMinOrderAmount());
        rule.setValidityDays(updated.getValidityDays());
        rule.setInactiveDays(updated.getInactiveDays());
        rule.setNewUserDays(updated.getNewUserDays());
        rule.setHolidayDate(updated.getHolidayDate());
        rule.setHolidayName(updated.getHolidayName());
        rule.setTargetTierId(updated.getTargetTierId());
        rule.setEligibleTierIds(updated.getEligibleTierIds());
        rule.setIsActive(updated.getIsActive());
        rule.setOncePerYear(updated.getOncePerYear());

        return ruleRepository.save(rule);
    }

    /**
     * Delete rule
     */
    @Transactional
    public void deleteRule(Long id) {
        ruleRepository.deleteById(id);
    }

    /**
     * Toggle rule active status
     */
    @Transactional
    public EventVoucherRule toggleRuleStatus(Long id) {
        EventVoucherRule rule = ruleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rule not found"));

        rule.setIsActive(!rule.getIsActive());
        return ruleRepository.save(rule);
    }

    /**
     * Get rule statistics
     */
    public int getCouponsGeneratedByRule(Long ruleId) {
        return couponRepository.countByEventRuleId(ruleId);
    }
}
