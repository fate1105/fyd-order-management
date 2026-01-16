package com.fyd.backend.service;

import com.fyd.backend.entity.Customer;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import net.jqwik.api.*;
import net.jqwik.api.constraints.LongRange;
import net.jqwik.api.constraints.NotBlank;
import net.jqwik.api.constraints.StringLength;
import org.assertj.core.api.Assertions;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.UUID;

/**
 * Property-based tests for JwtService token generation functionality.
 * 
 * Feature: customer-authentication, Property 14: JWT Token Structure
 * Feature: customer-authentication, Property 15: Invalid Token Rejection
 * 
 * **Validates: Requirements 7.7, 7.8**
 * THE Customer_Auth_System SHALL generate JWT tokens with appropriate expiration
 * IF invalid token is provided THEN THE Customer_Auth_System SHALL return 401 Unauthorized
 */
class JwtServicePropertyTest {

    private static final String TEST_SECRET = "fyd-ecommerce-customer-auth-secret-key-2024-minimum-256-bits";
    private static final long DEFAULT_EXPIRATION_MS = 86400000L; // 24 hours

    /**
     * Provides valid customer IDs (positive Long values).
     */
    @Provide
    Arbitrary<Long> validCustomerIds() {
        return Arbitraries.longs().between(1L, Long.MAX_VALUE);
    }

    /**
     * Provides valid email addresses for testing.
     */
    @Provide
    Arbitrary<String> validEmails() {
        return Arbitraries.strings()
            .alpha()
            .ofMinLength(3)
            .ofMaxLength(20)
            .map(name -> name.toLowerCase() + "@example.com");
    }

    /**
     * Provides valid full names for testing.
     */
    @Provide
    Arbitrary<String> validFullNames() {
        return Arbitraries.strings()
            .alpha()
            .ofMinLength(2)
            .ofMaxLength(50);
    }

    /**
     * Creates a Customer entity for testing.
     */
    private Customer createTestCustomer(Long id, String email, String fullName) {
        Customer customer = new Customer();
        customer.setId(id);
        customer.setEmail(email);
        customer.setFullName(fullName);
        customer.setStatus("ACTIVE");
        return customer;
    }

    // ============================================================================
    // Property 14: JWT Token Structure
    // Feature: customer-authentication, Property 14: JWT Token Structure
    // **Validates: Requirements 7.7**
    // ============================================================================

    /**
     * Property 14: JWT Token Structure - Expiration in Future
     * 
     * **Validates: Requirements 7.7**
     * 
     * For any generated JWT token, the token SHALL contain a valid expiration claim
     * that is in the future at time of generation.
     */
    @Property(tries = 20)
    @Label("Feature: customer-authentication, Property 14: JWT Token Structure - Expiration is in the future")
    void tokenExpirationIsInFuture(
            @ForAll("validCustomerIds") Long customerId,
            @ForAll("validEmails") String email,
            @ForAll("validFullNames") String fullName) {
        
        // Create JwtService and test customer
        JwtService jwtService = new JwtService(TEST_SECRET, DEFAULT_EXPIRATION_MS);
        Customer customer = createTestCustomer(customerId, email, fullName);
        
        // Record time before token generation
        Date beforeGeneration = new Date();
        
        // Generate token
        String token = jwtService.generateToken(customer);
        
        // Parse the token to extract claims
        SecretKey secretKey = Keys.hmacShaKeyFor(TEST_SECRET.getBytes(StandardCharsets.UTF_8));
        Claims claims = Jwts.parser()
            .verifyWith(secretKey)
            .build()
            .parseSignedClaims(token)
            .getPayload();
        
        Date expiration = claims.getExpiration();
        
        // Property: Expiration must be in the future at time of generation
        Assertions.assertThat(expiration)
            .as("Token expiration should be in the future")
            .isAfter(beforeGeneration);
    }

    /**
     * Property 14: JWT Token Structure - Contains Customer ID as Subject
     * 
     * **Validates: Requirements 7.7**
     * 
     * For any generated JWT token, the token SHALL contain the customer ID as subject.
     */
    @Property(tries = 20)
    @Label("Feature: customer-authentication, Property 14: JWT Token Structure - Contains customer ID as subject")
    void tokenContainsCustomerIdAsSubject(
            @ForAll("validCustomerIds") Long customerId,
            @ForAll("validEmails") String email,
            @ForAll("validFullNames") String fullName) {
        
        // Create JwtService and test customer
        JwtService jwtService = new JwtService(TEST_SECRET, DEFAULT_EXPIRATION_MS);
        Customer customer = createTestCustomer(customerId, email, fullName);
        
        // Generate token
        String token = jwtService.generateToken(customer);
        
        // Parse the token to extract claims
        SecretKey secretKey = Keys.hmacShaKeyFor(TEST_SECRET.getBytes(StandardCharsets.UTF_8));
        Claims claims = Jwts.parser()
            .verifyWith(secretKey)
            .build()
            .parseSignedClaims(token)
            .getPayload();
        
        String subject = claims.getSubject();
        
        // Property: Subject must equal the customer ID as string
        Assertions.assertThat(subject)
            .as("Token subject should be the customer ID")
            .isEqualTo(customerId.toString());
    }

    /**
     * Property 14: JWT Token Structure - Token Valid Immediately After Generation
     * 
     * **Validates: Requirements 7.7**
     * 
     * For any generated JWT token, the token SHALL be valid immediately after generation.
     */
    @Property(tries = 20)
    @Label("Feature: customer-authentication, Property 14: JWT Token Structure - Token valid immediately after generation")
    void tokenIsValidImmediatelyAfterGeneration(
            @ForAll("validCustomerIds") Long customerId,
            @ForAll("validEmails") String email,
            @ForAll("validFullNames") String fullName) {
        
        // Create JwtService and test customer
        JwtService jwtService = new JwtService(TEST_SECRET, DEFAULT_EXPIRATION_MS);
        Customer customer = createTestCustomer(customerId, email, fullName);
        
        // Generate token
        String token = jwtService.generateToken(customer);
        
        // Property: Token should be valid immediately after generation
        boolean isValid = jwtService.validateToken(token);
        
        Assertions.assertThat(isValid)
            .as("Token should be valid immediately after generation")
            .isTrue();
    }

    /**
     * Property 14: JWT Token Structure - Expiration Matches Configuration
     * 
     * **Validates: Requirements 7.7**
     * 
     * For any generated JWT token, the expiration time SHALL be approximately
     * (issuedAt + expirationMs).
     */
    @Property(tries = 20)
    @Label("Feature: customer-authentication, Property 14: JWT Token Structure - Expiration matches configuration")
    void tokenExpirationMatchesConfiguration(
            @ForAll("validCustomerIds") Long customerId,
            @ForAll("validEmails") String email,
            @ForAll("validFullNames") String fullName) {
        
        // Create JwtService and test customer
        JwtService jwtService = new JwtService(TEST_SECRET, DEFAULT_EXPIRATION_MS);
        Customer customer = createTestCustomer(customerId, email, fullName);
        
        // Generate token
        String token = jwtService.generateToken(customer);
        
        // Parse the token to extract claims
        SecretKey secretKey = Keys.hmacShaKeyFor(TEST_SECRET.getBytes(StandardCharsets.UTF_8));
        Claims claims = Jwts.parser()
            .verifyWith(secretKey)
            .build()
            .parseSignedClaims(token)
            .getPayload();
        
        Date issuedAt = claims.getIssuedAt();
        Date expiration = claims.getExpiration();
        
        // Calculate expected expiration
        long actualDuration = expiration.getTime() - issuedAt.getTime();
        
        // Property: Duration between issuedAt and expiration should equal configured expiration
        Assertions.assertThat(actualDuration)
            .as("Token duration should match configured expiration")
            .isEqualTo(DEFAULT_EXPIRATION_MS);
    }

    /**
     * Property 14: JWT Token Structure - Customer ID Extractable
     * 
     * **Validates: Requirements 7.7**
     * 
     * For any generated JWT token, the extractCustomerId method SHALL return
     * the original customer ID.
     */
    @Property(tries = 20)
    @Label("Feature: customer-authentication, Property 14: JWT Token Structure - Customer ID extractable")
    void customerIdIsExtractable(
            @ForAll("validCustomerIds") Long customerId,
            @ForAll("validEmails") String email,
            @ForAll("validFullNames") String fullName) {
        
        // Create JwtService and test customer
        JwtService jwtService = new JwtService(TEST_SECRET, DEFAULT_EXPIRATION_MS);
        Customer customer = createTestCustomer(customerId, email, fullName);
        
        // Generate token
        String token = jwtService.generateToken(customer);
        
        // Extract customer ID
        Long extractedId = jwtService.extractCustomerId(token);
        
        // Property: Extracted ID should equal original customer ID
        Assertions.assertThat(extractedId)
            .as("Extracted customer ID should match original")
            .isEqualTo(customerId);
    }


    // ============================================================================
    // Property 15: Invalid Token Rejection
    // Feature: customer-authentication, Property 15: Invalid Token Rejection
    // **Validates: Requirements 7.8**
    // ============================================================================

    /**
     * Provides random strings that are not valid JWT tokens.
     */
    @Provide
    Arbitrary<String> randomNonJwtStrings() {
        return Arbitraries.oneOf(
            // Random alphanumeric strings
            Arbitraries.strings().alpha().ofMinLength(1).ofMaxLength(100),
            // Random strings with special characters
            Arbitraries.strings().ascii().ofMinLength(1).ofMaxLength(100),
            // Strings that look like JWTs but aren't (wrong format)
            Arbitraries.strings().alpha().ofMinLength(10).ofMaxLength(30)
                .map(s -> s + "." + s),
            // Random UUIDs
            Arbitraries.create(() -> UUID.randomUUID().toString()),
            // Base64-like strings
            Arbitraries.strings()
                .withChars("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=")
                .ofMinLength(10).ofMaxLength(200)
        );
    }

    /**
     * Provides different secret keys for testing wrong-secret scenarios.
     */
    @Provide
    Arbitrary<String> differentSecrets() {
        return Arbitraries.strings()
            .alpha()
            .ofMinLength(32)
            .ofMaxLength(64)
            .filter(s -> !s.equals(TEST_SECRET));
    }

    /**
     * Provides blank strings (empty or whitespace only).
     */
    @Provide
    Arbitrary<String> blankStrings() {
        return Arbitraries.oneOf(
            // Empty string
            Arbitraries.just(""),
            // Single space
            Arbitraries.just(" "),
            // Multiple spaces
            Arbitraries.strings().withChars(' ').ofMinLength(1).ofMaxLength(10),
            // Tabs
            Arbitraries.just("\t"),
            // Newlines
            Arbitraries.just("\n"),
            // Mixed whitespace
            Arbitraries.strings().withChars(" \t\n\r").ofMinLength(1).ofMaxLength(10)
        );
    }

    /**
     * Property 15: Invalid Token Rejection - Random Non-JWT Strings
     * 
     * **Validates: Requirements 7.8**
     * 
     * For any random string that is not a valid JWT, validateToken SHALL return false.
     */
    @Property(tries = 20)
    @Label("Feature: customer-authentication, Property 15: Invalid Token Rejection - Random non-JWT strings rejected")
    void randomNonJwtStringsAreRejected(
            @ForAll("randomNonJwtStrings") String randomString) {
        
        // Create JwtService
        JwtService jwtService = new JwtService(TEST_SECRET, DEFAULT_EXPIRATION_MS);
        
        // Property: Any random non-JWT string should be rejected
        boolean isValid = jwtService.validateToken(randomString);
        
        Assertions.assertThat(isValid)
            .as("Random non-JWT string '%s' should be rejected", randomString)
            .isFalse();
    }

    /**
     * Property 15: Invalid Token Rejection - Tokens Signed with Different Secret
     * 
     * **Validates: Requirements 7.8**
     * 
     * For any token signed with a different secret, validateToken SHALL return false.
     */
    @Property(tries = 20)
    @Label("Feature: customer-authentication, Property 15: Invalid Token Rejection - Wrong secret tokens rejected")
    void tokensSignedWithDifferentSecretAreRejected(
            @ForAll("validCustomerIds") Long customerId,
            @ForAll("validEmails") String email,
            @ForAll("validFullNames") String fullName,
            @ForAll("differentSecrets") String differentSecret) {
        
        // Create JwtService with the original secret for validation
        JwtService validatorService = new JwtService(TEST_SECRET, DEFAULT_EXPIRATION_MS);
        
        // Create a different JwtService with a different secret for token generation
        JwtService differentSecretService = new JwtService(differentSecret, DEFAULT_EXPIRATION_MS);
        
        // Create test customer
        Customer customer = createTestCustomer(customerId, email, fullName);
        
        // Generate token with different secret
        String tokenWithDifferentSecret = differentSecretService.generateToken(customer);
        
        // Property: Token signed with different secret should be rejected
        boolean isValid = validatorService.validateToken(tokenWithDifferentSecret);
        
        Assertions.assertThat(isValid)
            .as("Token signed with different secret should be rejected")
            .isFalse();
    }

    /**
     * Property 15: Invalid Token Rejection - Expired Tokens
     * 
     * **Validates: Requirements 7.8**
     * 
     * For any expired token, validateToken SHALL return false.
     */
    @Property(tries = 20)
    @Label("Feature: customer-authentication, Property 15: Invalid Token Rejection - Expired tokens rejected")
    void expiredTokensAreRejected(
            @ForAll("validCustomerIds") Long customerId,
            @ForAll("validEmails") String email,
            @ForAll("validFullNames") String fullName) {
        
        // Create JwtService with very short expiration (1 millisecond)
        JwtService shortExpirationService = new JwtService(TEST_SECRET, 1L);
        
        // Create test customer
        Customer customer = createTestCustomer(customerId, email, fullName);
        
        // Generate token that will expire almost immediately
        String token = shortExpirationService.generateToken(customer);
        
        // Wait for token to expire
        try {
            Thread.sleep(10); // Wait 10ms to ensure token is expired
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        
        // Property: Expired token should be rejected
        boolean isValid = shortExpirationService.validateToken(token);
        
        Assertions.assertThat(isValid)
            .as("Expired token should be rejected")
            .isFalse();
    }

    /**
     * Property 15: Invalid Token Rejection - Null Token
     * 
     * **Validates: Requirements 7.8**
     * 
     * For null token, validateToken SHALL return false.
     */
    @Property(tries = 20)
    @Label("Feature: customer-authentication, Property 15: Invalid Token Rejection - Null token rejected")
    void nullTokenIsRejected() {
        
        // Create JwtService
        JwtService jwtService = new JwtService(TEST_SECRET, DEFAULT_EXPIRATION_MS);
        
        // Property: Null token should be rejected
        boolean isValid = jwtService.validateToken(null);
        
        Assertions.assertThat(isValid)
            .as("Null token should be rejected")
            .isFalse();
    }

    /**
     * Property 15: Invalid Token Rejection - Blank Tokens
     * 
     * **Validates: Requirements 7.8**
     * 
     * For any blank token (empty or whitespace only), validateToken SHALL return false.
     */
    @Property(tries = 20)
    @Label("Feature: customer-authentication, Property 15: Invalid Token Rejection - Blank tokens rejected")
    void blankTokensAreRejected(
            @ForAll @From("blankStrings") String blankToken) {
        
        // Create JwtService
        JwtService jwtService = new JwtService(TEST_SECRET, DEFAULT_EXPIRATION_MS);
        
        // Property: Blank token should be rejected
        boolean isValid = jwtService.validateToken(blankToken);
        
        Assertions.assertThat(isValid)
            .as("Blank token '%s' should be rejected", blankToken)
            .isFalse();
    }

    /**
     * Property 15: Invalid Token Rejection - Tampered Tokens (Header)
     * 
     * **Validates: Requirements 7.8**
     * 
     * For any valid token with a tampered header, validateToken SHALL return false.
     */
    @Property(tries = 20)
    @Label("Feature: customer-authentication, Property 15: Invalid Token Rejection - Tampered header rejected")
    void tamperedHeaderTokensAreRejected(
            @ForAll("validCustomerIds") Long customerId,
            @ForAll("validEmails") String email,
            @ForAll("validFullNames") String fullName) {
        
        // Create JwtService
        JwtService jwtService = new JwtService(TEST_SECRET, DEFAULT_EXPIRATION_MS);
        
        // Create test customer
        Customer customer = createTestCustomer(customerId, email, fullName);
        
        // Generate valid token
        String validToken = jwtService.generateToken(customer);
        
        // Split token into parts (header.payload.signature)
        String[] parts = validToken.split("\\.");
        if (parts.length != 3) {
            return;
        }
        
        // Tamper with header by replacing a character in the middle
        String header = parts[0];
        if (header.length() > 2) {
            int midIndex = header.length() / 2;
            char originalChar = header.charAt(midIndex);
            char newChar = (originalChar == 'A') ? 'B' : 'A';
            parts[0] = header.substring(0, midIndex) + newChar + header.substring(midIndex + 1);
        }
        String tamperedToken = String.join(".", parts);
        
        // Property: Tampered token should be rejected
        boolean isValid = jwtService.validateToken(tamperedToken);
        
        Assertions.assertThat(isValid)
            .as("Tampered token (header modified) should be rejected")
            .isFalse();
    }

    /**
     * Property 15: Invalid Token Rejection - Tampered Tokens (Payload)
     * 
     * **Validates: Requirements 7.8**
     * 
     * For any valid token with a tampered payload, validateToken SHALL return false.
     */
    @Property(tries = 20)
    @Label("Feature: customer-authentication, Property 15: Invalid Token Rejection - Tampered payload rejected")
    void tamperedPayloadTokensAreRejected(
            @ForAll("validCustomerIds") Long customerId,
            @ForAll("validEmails") String email,
            @ForAll("validFullNames") String fullName) {
        
        // Create JwtService
        JwtService jwtService = new JwtService(TEST_SECRET, DEFAULT_EXPIRATION_MS);
        
        // Create test customer
        Customer customer = createTestCustomer(customerId, email, fullName);
        
        // Generate valid token
        String validToken = jwtService.generateToken(customer);
        
        // Split token into parts (header.payload.signature)
        String[] parts = validToken.split("\\.");
        if (parts.length != 3) {
            return;
        }
        
        // Tamper with payload by replacing a character in the middle
        String payload = parts[1];
        if (payload.length() > 2) {
            int midIndex = payload.length() / 2;
            char originalChar = payload.charAt(midIndex);
            char newChar = (originalChar == 'A') ? 'B' : 'A';
            parts[1] = payload.substring(0, midIndex) + newChar + payload.substring(midIndex + 1);
        }
        String tamperedToken = String.join(".", parts);
        
        // Property: Tampered token should be rejected
        boolean isValid = jwtService.validateToken(tamperedToken);
        
        Assertions.assertThat(isValid)
            .as("Tampered token (payload modified) should be rejected")
            .isFalse();
    }

    /**
     * Property 15: Invalid Token Rejection - Tampered Tokens (Signature)
     * 
     * **Validates: Requirements 7.8**
     * 
     * For any valid token with a tampered signature, validateToken SHALL return false.
     */
    @Property(tries = 20)
    @Label("Feature: customer-authentication, Property 15: Invalid Token Rejection - Tampered signature rejected")
    void tamperedSignatureTokensAreRejected(
            @ForAll("validCustomerIds") Long customerId,
            @ForAll("validEmails") String email,
            @ForAll("validFullNames") String fullName) {
        
        // Create JwtService
        JwtService jwtService = new JwtService(TEST_SECRET, DEFAULT_EXPIRATION_MS);
        
        // Create test customer
        Customer customer = createTestCustomer(customerId, email, fullName);
        
        // Generate valid token
        String validToken = jwtService.generateToken(customer);
        
        // Split token into parts (header.payload.signature)
        String[] parts = validToken.split("\\.");
        if (parts.length != 3) {
            return;
        }
        
        // Tamper with signature by replacing a character in the middle
        String signature = parts[2];
        if (signature.length() > 2) {
            int midIndex = signature.length() / 2;
            char originalChar = signature.charAt(midIndex);
            char newChar = (originalChar == 'A') ? 'B' : 'A';
            parts[2] = signature.substring(0, midIndex) + newChar + signature.substring(midIndex + 1);
        }
        String tamperedToken = String.join(".", parts);
        
        // Property: Tampered token should be rejected
        boolean isValid = jwtService.validateToken(tamperedToken);
        
        Assertions.assertThat(isValid)
            .as("Tampered token (signature modified) should be rejected")
            .isFalse();
    }
}
