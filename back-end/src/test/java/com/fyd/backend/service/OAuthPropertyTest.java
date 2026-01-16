package com.fyd.backend.service;

import com.fyd.backend.dto.auth.AuthResponse;
import com.fyd.backend.entity.Customer;
import com.fyd.backend.repository.CustomerRepository;
import net.jqwik.api.*;
import net.jqwik.api.lifecycle.BeforeTry;
import org.assertj.core.api.Assertions;
import org.mockito.Mockito;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

/**
 * Property-based tests for OAuth account handling functionality.
 * 
 * Feature: customer-authentication, Property 8: OAuth Account Handling
 * Feature: customer-authentication, Property 9: OAuth Error Response
 * 
 * **Validates: Requirements 2.3, 2.4, 2.5, 2.6**
 */
class OAuthPropertyTest {

    private CustomerRepository customerRepository;
    private JwtService jwtService;
    private OAuthService oAuthService;
    private CustomerAuthService customerAuthService;

    @BeforeTry
    void setup() {
        customerRepository = Mockito.mock(CustomerRepository.class);
        jwtService = Mockito.mock(JwtService.class);
        oAuthService = Mockito.mock(OAuthService.class);
        customerAuthService = new CustomerAuthService(customerRepository, jwtService, oAuthService);
        
        // Default mock behavior
        when(jwtService.generateToken(any(Customer.class))).thenReturn("mock_jwt_token");
        when(customerRepository.save(any(Customer.class))).thenAnswer(invocation -> {
            Customer c = invocation.getArgument(0);
            if (c.getId() == null) {
                c.setId(System.currentTimeMillis()); // Simulate ID generation
            }
            return c;
        });
    }

    /**
     * Provides valid OAuth user info for testing.
     */
    @Provide
    Arbitrary<OAuthService.OAuthUserInfo> validOAuthUserInfo() {
        return Arbitraries.of("google", "facebook")
            .flatMap(provider -> 
                Arbitraries.strings().alpha().ofMinLength(10).ofMaxLength(30)
                    .flatMap(oauthId ->
                        Arbitraries.strings().alpha().ofMinLength(3).ofMaxLength(10)
                            .flatMap(localPart ->
                                Arbitraries.strings().alpha().ofMinLength(3).ofMaxLength(8)
                                    .flatMap(domain ->
                                        Arbitraries.strings().alpha().ofMinLength(3).ofMaxLength(20)
                                            .map(name -> new OAuthService.OAuthUserInfo(
                                                oauthId,
                                                localPart + "@" + domain + ".com",
                                                name,
                                                "https://example.com/avatar.jpg",
                                                provider
                                            ))
                                    )
                            )
                    )
            );
    }

    /**
     * Provides OAuth providers for testing.
     */
    @Provide
    Arbitrary<String> oauthProviders() {
        return Arbitraries.of("google", "facebook");
    }

    /**
     * Provides valid access tokens for testing.
     */
    @Provide
    Arbitrary<String> validAccessTokens() {
        return Arbitraries.strings().alpha().numeric().ofMinLength(20).ofMaxLength(100);
    }

    // ==================== Property 8: OAuth Account Handling ====================

    /**
     * Property 8.1: OAuth Account Handling - New Account Creation
     * 
     * **Validates: Requirements 2.3, 2.6**
     * 
     * For any successful OAuth authentication with a new email, the system SHALL
     * create a new customer record with OAuth provider info.
     */
    @Property(tries = 20)
    @Label("Feature: customer-authentication, Property 8: OAuth Account Handling - Creates new account for new email")
    void oauthCreatesNewAccountForNewEmail(
            @ForAll("validOAuthUserInfo") OAuthService.OAuthUserInfo userInfo,
            @ForAll("validAccessTokens") String accessToken) {
        
        // Setup: No existing customer with this OAuth ID or email
        when(customerRepository.findByOauthProviderAndOauthId(anyString(), anyString()))
            .thenReturn(Optional.empty());
        when(customerRepository.findByEmail(anyString()))
            .thenReturn(Optional.empty());
        
        // Mock OAuth service to return valid user info
        if ("google".equals(userInfo.getProvider())) {
            when(oAuthService.verifyGoogleToken(accessToken)).thenReturn(userInfo);
        } else {
            when(oAuthService.verifyFacebookToken(accessToken)).thenReturn(userInfo);
        }

        // Execute OAuth login
        AuthResponse response = customerAuthService.oauthLogin(userInfo.getProvider(), accessToken);

        // Property: Should succeed and create new account
        Assertions.assertThat(response.isSuccess())
            .as("OAuth login should succeed for new email")
            .isTrue();
        
        Assertions.assertThat(response.getToken())
            .as("Should return a JWT token")
            .isNotNull();
        
        Assertions.assertThat(response.getCustomer())
            .as("Should return customer data")
            .isNotNull();
        
        // Verify customer was saved with OAuth info
        verify(customerRepository).save(argThat(customer -> 
            customer.getOauthProvider().equals(userInfo.getProvider()) &&
            customer.getOauthId().equals(userInfo.getOauthId()) &&
            customer.getEmail().equals(userInfo.getEmail())
        ));
    }

    /**
     * Property 8.2: OAuth Account Handling - Link to Existing Account by Email
     * 
     * **Validates: Requirements 2.3, 2.5**
     * 
     * For any successful OAuth authentication where email matches an existing customer,
     * the system SHALL link the OAuth provider to the existing account.
     */
    @Property(tries = 20)
    @Label("Feature: customer-authentication, Property 8: OAuth Account Handling - Links OAuth to existing account by email")
    void oauthLinksToExistingAccountByEmail(
            @ForAll("validOAuthUserInfo") OAuthService.OAuthUserInfo userInfo,
            @ForAll("validAccessTokens") String accessToken) {
        
        // Setup: Existing customer with same email but no OAuth
        Customer existingCustomer = new Customer();
        existingCustomer.setId(123L);
        existingCustomer.setEmail(userInfo.getEmail());
        existingCustomer.setFullName("Existing Customer");
        existingCustomer.setStatus("ACTIVE");
        existingCustomer.setCreatedAt(LocalDateTime.now());
        existingCustomer.setUpdatedAt(LocalDateTime.now());
        
        when(customerRepository.findByOauthProviderAndOauthId(anyString(), anyString()))
            .thenReturn(Optional.empty());
        when(customerRepository.findByEmail(userInfo.getEmail()))
            .thenReturn(Optional.of(existingCustomer));
        
        // Mock OAuth service
        if ("google".equals(userInfo.getProvider())) {
            when(oAuthService.verifyGoogleToken(accessToken)).thenReturn(userInfo);
        } else {
            when(oAuthService.verifyFacebookToken(accessToken)).thenReturn(userInfo);
        }

        // Execute OAuth login
        AuthResponse response = customerAuthService.oauthLogin(userInfo.getProvider(), accessToken);

        // Property: Should succeed and link OAuth to existing account
        Assertions.assertThat(response.isSuccess())
            .as("OAuth login should succeed for existing email")
            .isTrue();
        
        // Verify OAuth info was linked to existing customer
        verify(customerRepository).save(argThat(customer -> 
            customer.getId().equals(123L) &&
            customer.getOauthProvider().equals(userInfo.getProvider()) &&
            customer.getOauthId().equals(userInfo.getOauthId())
        ));
    }

    /**
     * Property 8.3: OAuth Account Handling - Return Existing OAuth Account
     * 
     * **Validates: Requirements 2.3**
     * 
     * For any successful OAuth authentication where OAuth ID already exists,
     * the system SHALL return the existing linked account.
     */
    @Property(tries = 20)
    @Label("Feature: customer-authentication, Property 8: OAuth Account Handling - Returns existing OAuth-linked account")
    void oauthReturnsExistingOAuthAccount(
            @ForAll("validOAuthUserInfo") OAuthService.OAuthUserInfo userInfo,
            @ForAll("validAccessTokens") String accessToken) {
        
        // Setup: Existing customer already linked with this OAuth
        Customer existingCustomer = new Customer();
        existingCustomer.setId(456L);
        existingCustomer.setEmail(userInfo.getEmail());
        existingCustomer.setFullName(userInfo.getName());
        existingCustomer.setOauthProvider(userInfo.getProvider());
        existingCustomer.setOauthId(userInfo.getOauthId());
        existingCustomer.setStatus("ACTIVE");
        existingCustomer.setCreatedAt(LocalDateTime.now());
        existingCustomer.setUpdatedAt(LocalDateTime.now());
        
        when(customerRepository.findByOauthProviderAndOauthId(userInfo.getProvider(), userInfo.getOauthId()))
            .thenReturn(Optional.of(existingCustomer));
        
        // Mock OAuth service
        if ("google".equals(userInfo.getProvider())) {
            when(oAuthService.verifyGoogleToken(accessToken)).thenReturn(userInfo);
        } else {
            when(oAuthService.verifyFacebookToken(accessToken)).thenReturn(userInfo);
        }

        // Execute OAuth login
        AuthResponse response = customerAuthService.oauthLogin(userInfo.getProvider(), accessToken);

        // Property: Should succeed and return existing account
        Assertions.assertThat(response.isSuccess())
            .as("OAuth login should succeed for existing OAuth account")
            .isTrue();
        
        Assertions.assertThat(response.getCustomer().getId())
            .as("Should return the existing customer ID")
            .isEqualTo(456L);
        
        // Verify findByEmail was NOT called (short-circuit)
        verify(customerRepository, never()).findByEmail(anyString());
    }

    /**
     * Property 8.4: OAuth Account Handling - Blocked Account Rejection
     * 
     * **Validates: Requirements 2.3**
     * 
     * For any OAuth authentication attempt on a blocked account,
     * the system SHALL reject the login.
     */
    @Property(tries = 20)
    @Label("Feature: customer-authentication, Property 8: OAuth Account Handling - Rejects blocked accounts")
    void oauthRejectsBlockedAccounts(
            @ForAll("validOAuthUserInfo") OAuthService.OAuthUserInfo userInfo,
            @ForAll("validAccessTokens") String accessToken) {
        
        // Setup: Existing blocked customer
        Customer blockedCustomer = new Customer();
        blockedCustomer.setId(789L);
        blockedCustomer.setEmail(userInfo.getEmail());
        blockedCustomer.setFullName(userInfo.getName());
        blockedCustomer.setOauthProvider(userInfo.getProvider());
        blockedCustomer.setOauthId(userInfo.getOauthId());
        blockedCustomer.setStatus("BLOCKED"); // Account is blocked
        blockedCustomer.setCreatedAt(LocalDateTime.now());
        blockedCustomer.setUpdatedAt(LocalDateTime.now());
        
        when(customerRepository.findByOauthProviderAndOauthId(userInfo.getProvider(), userInfo.getOauthId()))
            .thenReturn(Optional.of(blockedCustomer));
        
        // Mock OAuth service
        if ("google".equals(userInfo.getProvider())) {
            when(oAuthService.verifyGoogleToken(accessToken)).thenReturn(userInfo);
        } else {
            when(oAuthService.verifyFacebookToken(accessToken)).thenReturn(userInfo);
        }

        // Execute OAuth login
        AuthResponse response = customerAuthService.oauthLogin(userInfo.getProvider(), accessToken);

        // Property: Should fail for blocked account
        Assertions.assertThat(response.isSuccess())
            .as("OAuth login should fail for blocked account")
            .isFalse();
        
        Assertions.assertThat(response.getMessage())
            .as("Should return blocked account message")
            .contains("khóa");
    }

    // ==================== Property 9: OAuth Error Response ====================

    /**
     * Property 9.1: OAuth Error Response - Invalid Token
     * 
     * **Validates: Requirements 2.4**
     * 
     * For any failed OAuth authentication (invalid token), the system SHALL
     * return an error response that allows the user to retry.
     */
    @Property(tries = 20)
    @Label("Feature: customer-authentication, Property 9: OAuth Error Response - Returns error for invalid token")
    void oauthReturnsErrorForInvalidToken(
            @ForAll("oauthProviders") String provider,
            @ForAll("validAccessTokens") String accessToken) {
        
        // Setup: OAuth service returns null (verification failed)
        when(oAuthService.verifyGoogleToken(anyString())).thenReturn(null);
        when(oAuthService.verifyFacebookToken(anyString())).thenReturn(null);

        // Execute OAuth login
        AuthResponse response = customerAuthService.oauthLogin(provider, accessToken);

        // Property: Should fail with error message
        Assertions.assertThat(response.isSuccess())
            .as("OAuth login should fail for invalid token")
            .isFalse();
        
        Assertions.assertThat(response.getMessage())
            .as("Should return error message mentioning the provider")
            .isNotNull()
            .isNotEmpty();
        
        Assertions.assertThat(response.getMessage())
            .as("Error message should allow retry")
            .containsIgnoringCase("thử lại");
    }

    /**
     * Property 9.2: OAuth Error Response - Empty Token
     * 
     * **Validates: Requirements 2.4**
     * 
     * For any OAuth request with empty or null token, the system SHALL
     * return an error response.
     */
    @Property(tries = 10)
    @Label("Feature: customer-authentication, Property 9: OAuth Error Response - Returns error for empty token")
    void oauthReturnsErrorForEmptyToken(@ForAll("oauthProviders") String provider) {
        // Test with null token
        AuthResponse responseNull = customerAuthService.oauthLogin(provider, null);
        Assertions.assertThat(responseNull.isSuccess())
            .as("OAuth login should fail for null token")
            .isFalse();
        
        // Test with empty token
        AuthResponse responseEmpty = customerAuthService.oauthLogin(provider, "");
        Assertions.assertThat(responseEmpty.isSuccess())
            .as("OAuth login should fail for empty token")
            .isFalse();
        
        // Test with whitespace token
        AuthResponse responseWhitespace = customerAuthService.oauthLogin(provider, "   ");
        Assertions.assertThat(responseWhitespace.isSuccess())
            .as("OAuth login should fail for whitespace token")
            .isFalse();
    }

    /**
     * Property 9.3: OAuth Error Response - Unsupported Provider
     * 
     * **Validates: Requirements 2.4**
     * 
     * For any OAuth request with unsupported provider, the system SHALL
     * return an error response.
     */
    @Property(tries = 10)
    @Label("Feature: customer-authentication, Property 9: OAuth Error Response - Returns error for unsupported provider")
    void oauthReturnsErrorForUnsupportedProvider(@ForAll("validAccessTokens") String accessToken) {
        // Test with unsupported providers
        String[] unsupportedProviders = {"twitter", "github", "linkedin", "apple", "unknown", ""};
        
        for (String provider : unsupportedProviders) {
            AuthResponse response = customerAuthService.oauthLogin(provider, accessToken);
            
            Assertions.assertThat(response.isSuccess())
                .as("OAuth login should fail for unsupported provider: " + provider)
                .isFalse();
        }
    }

    /**
     * Property 9.4: OAuth Error Response - Response Contains Message
     * 
     * **Validates: Requirements 2.4**
     * 
     * For any failed OAuth authentication, the response SHALL contain
     * a non-empty error message.
     */
    @Property(tries = 20)
    @Label("Feature: customer-authentication, Property 9: OAuth Error Response - Error response always has message")
    void oauthErrorResponseAlwaysHasMessage(
            @ForAll("oauthProviders") String provider,
            @ForAll("validAccessTokens") String accessToken) {
        
        // Setup: OAuth service returns null (verification failed)
        when(oAuthService.verifyGoogleToken(anyString())).thenReturn(null);
        when(oAuthService.verifyFacebookToken(anyString())).thenReturn(null);

        // Execute OAuth login
        AuthResponse response = customerAuthService.oauthLogin(provider, accessToken);

        // Property: Error response should always have a message
        Assertions.assertThat(response.isSuccess()).isFalse();
        Assertions.assertThat(response.getMessage())
            .as("Error response should have a non-empty message")
            .isNotNull()
            .isNotEmpty();
    }
}
