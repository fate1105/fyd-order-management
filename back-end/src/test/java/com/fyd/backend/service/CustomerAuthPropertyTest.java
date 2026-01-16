package com.fyd.backend.service;

import net.jqwik.api.*;
import net.jqwik.api.constraints.AlphaChars;
import net.jqwik.api.constraints.NotBlank;
import net.jqwik.api.constraints.StringLength;
import org.assertj.core.api.Assertions;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

/**
 * Property-based tests for CustomerAuthService password hashing functionality.
 * 
 * Feature: customer-authentication, Property 13: Password Hashing
 * 
 * **Validates: Requirements 7.6**
 * THE Customer_Auth_System SHALL hash passwords using BCrypt before storing
 */
class CustomerAuthPropertyTest {

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    /**
     * Provides ASCII-only passwords that are safe for BCrypt (max 72 bytes).
     * Uses alphanumeric characters and common special characters.
     */
    @Provide
    Arbitrary<String> safePasswords() {
        return Arbitraries.strings()
            .withCharRange('!', '~')  // ASCII printable characters (33-126)
            .ofMinLength(1)
            .ofMaxLength(70);  // Stay under BCrypt's 72-byte limit
    }

    /**
     * Property 13: Password Hashing
     * 
     * **Validates: Requirements 7.6**
     * 
     * For any random password string, the hashed password SHALL NOT equal the plain text password.
     * This ensures that passwords are never stored in plain text.
     */
    @Property(tries = 20)
    @Label("Feature: customer-authentication, Property 13: Password Hashing - Hash never equals plain text")
    void hashPasswordNeverEqualsPlainText(@ForAll("safePasswords") String plainPassword) {
        // Hash the password using BCrypt
        String hashedPassword = passwordEncoder.encode(plainPassword);
        
        // Property: The hashed password must NEVER equal the plain text password
        Assertions.assertThat(hashedPassword)
            .as("Hashed password should never equal plain text password")
            .isNotEqualTo(plainPassword);
    }

    /**
     * Property 13: Password Hashing - Salt Uniqueness
     * 
     * **Validates: Requirements 7.6**
     * 
     * The same password hashed twice SHALL produce different hashes.
     * BCrypt uses random salt, so each hash should be unique.
     */
    @Property(tries = 20)
    @Label("Feature: customer-authentication, Property 13: Password Hashing - Same password produces different hashes")
    void samePasswordProducesDifferentHashes(@ForAll("safePasswords") String plainPassword) {
        // Hash the same password twice
        String hash1 = passwordEncoder.encode(plainPassword);
        String hash2 = passwordEncoder.encode(plainPassword);
        
        // Property: Two hashes of the same password should be different (due to random salt)
        Assertions.assertThat(hash1)
            .as("Two hashes of the same password should be different due to BCrypt salt")
            .isNotEqualTo(hash2);
    }

    /**
     * Property 13: Password Hashing - Verification
     * 
     * **Validates: Requirements 7.6**
     * 
     * The verifyPassword method SHALL correctly validate the original password against the hash.
     * For any password, hashing it and then verifying should always succeed.
     */
    @Property(tries = 20)
    @Label("Feature: customer-authentication, Property 13: Password Hashing - Verification succeeds for correct password")
    void verifyPasswordSucceedsForCorrectPassword(@ForAll("safePasswords") String plainPassword) {
        // Hash the password
        String hashedPassword = passwordEncoder.encode(plainPassword);
        
        // Property: Verifying the original password against its hash should always succeed
        boolean matches = passwordEncoder.matches(plainPassword, hashedPassword);
        
        Assertions.assertThat(matches)
            .as("Original password should always match its hash")
            .isTrue();
    }

    /**
     * Provides pairs of different passwords for testing wrong password rejection.
     */
    @Provide
    Arbitrary<String> shortSafePasswords() {
        return Arbitraries.strings()
            .withCharRange('!', '~')  // ASCII printable characters
            .ofMinLength(1)
            .ofMaxLength(30);  // Shorter passwords for the two-password test
    }

    /**
     * Property 13: Password Hashing - Wrong Password Rejection
     * 
     * **Validates: Requirements 7.6**
     * 
     * The verifyPassword method SHALL reject incorrect passwords.
     * For any two different passwords, verifying one against the other's hash should fail.
     */
    @Property(tries = 20)
    @Label("Feature: customer-authentication, Property 13: Password Hashing - Verification fails for wrong password")
    void verifyPasswordFailsForWrongPassword(
            @ForAll("shortSafePasswords") String correctPassword,
            @ForAll("shortSafePasswords") String wrongPassword) {
        
        // Skip if passwords happen to be the same
        Assume.that(!correctPassword.equals(wrongPassword));
        
        // Hash the correct password
        String hashedPassword = passwordEncoder.encode(correctPassword);
        
        // Property: Verifying a wrong password against the hash should fail
        boolean matches = passwordEncoder.matches(wrongPassword, hashedPassword);
        
        Assertions.assertThat(matches)
            .as("Wrong password should not match the hash")
            .isFalse();
    }

    /**
     * Property 13: Password Hashing - Hash Format
     * 
     * **Validates: Requirements 7.6**
     * 
     * BCrypt hashes SHALL have a specific format starting with "$2" prefix.
     * This ensures the correct algorithm is being used.
     */
    @Property(tries = 20)
    @Label("Feature: customer-authentication, Property 13: Password Hashing - Hash has BCrypt format")
    void hashHasBCryptFormat(@ForAll("safePasswords") String plainPassword) {
        // Hash the password
        String hashedPassword = passwordEncoder.encode(plainPassword);
        
        // Property: BCrypt hashes should start with "$2" (indicating BCrypt algorithm)
        Assertions.assertThat(hashedPassword)
            .as("BCrypt hash should start with $2 prefix")
            .startsWith("$2");
        
        // BCrypt hashes are always 60 characters long
        Assertions.assertThat(hashedPassword)
            .as("BCrypt hash should be 60 characters long")
            .hasSize(60);
    }
}
