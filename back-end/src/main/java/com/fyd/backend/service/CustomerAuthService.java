package com.fyd.backend.service;

import com.fyd.backend.dto.CustomerDTO;
import com.fyd.backend.dto.auth.AuthResponse;
import com.fyd.backend.dto.auth.RegisterRequest;
import com.fyd.backend.entity.Customer;
import com.fyd.backend.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * Service for customer authentication operations.
 * Handles login, registration, OAuth, and current customer retrieval.
 * 
 * Requirement 7.6: THE Customer_Auth_System SHALL hash passwords using BCrypt before storing
 */
@Service
public class CustomerAuthService {

    private final CustomerRepository customerRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final OAuthService oAuthService;

    @Autowired
    public CustomerAuthService(CustomerRepository customerRepository, JwtService jwtService, OAuthService oAuthService) {
        this.customerRepository = customerRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
        this.jwtService = jwtService;
        this.oAuthService = oAuthService;
    }

    /**
     * Authenticate customer with email and password.
     * 
     * @param email Customer email
     * @param password Plain text password
     * @return AuthResponse with success/failure and customer data
     */
    public AuthResponse login(String email, String password) {
        // Validate inputs
        if (email == null || email.isBlank()) {
            return AuthResponse.error("Email không được để trống");
        }
        if (password == null || password.isBlank()) {
            return AuthResponse.error("Mật khẩu không được để trống");
        }

        // Find customer by email
        Optional<Customer> customerOpt = customerRepository.findByEmail(email);
        if (customerOpt.isEmpty()) {
            return AuthResponse.error("Email hoặc mật khẩu không đúng");
        }

        Customer customer = customerOpt.get();

        // Check if account is active
        if (!"ACTIVE".equals(customer.getStatus())) {
            return AuthResponse.error("Tài khoản đã bị khóa");
        }

        // Verify password with BCrypt
        if (!verifyPassword(password, customer.getPasswordHash())) {
            return AuthResponse.error("Email hoặc mật khẩu không đúng");
        }

        // Update last login time
        customer.setUpdatedAt(LocalDateTime.now());
        customerRepository.save(customer);

        // Generate JWT token using JwtService
        // Requirement 7.7: Generate JWT tokens with appropriate expiration
        String token = jwtService.generateToken(customer);

        return AuthResponse.success(token, CustomerDTO.fromEntity(customer));
    }

    /**
     * Register a new customer account.
     * 
     * Requirement 7.6: Hash passwords using BCrypt before storing
     * 
     * @param request Registration request with fullName, email, password
     * @return AuthResponse with success/failure
     */
    public AuthResponse register(RegisterRequest request) {
        // Validate inputs
        if (request.getFullName() == null || request.getFullName().isBlank()) {
            return AuthResponse.error("Họ tên không được để trống");
        }
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            return AuthResponse.error("Email không được để trống");
        }
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            return AuthResponse.error("Mật khẩu không được để trống");
        }

        // Check if email already exists
        if (customerRepository.findByEmail(request.getEmail()).isPresent()) {
            return AuthResponse.error("Email đã được sử dụng");
        }

        // Create new customer with hashed password
        Customer customer = new Customer();
        customer.setFullName(request.getFullName());
        customer.setEmail(request.getEmail());
        customer.setPasswordHash(hashPassword(request.getPassword()));
        customer.setStatus("ACTIVE");
        customer.setCreatedAt(LocalDateTime.now());
        customer.setUpdatedAt(LocalDateTime.now());

        Customer savedCustomer = customerRepository.save(customer);

        return AuthResponse.success(null, CustomerDTO.fromEntity(savedCustomer), 
            "Đăng ký thành công! Vui lòng đăng nhập.");
    }

    /**
     * Handle OAuth login flow.
     * 
     * Requirement 2.3: WHEN OAuth authentication succeeds THEN THE Customer_Auth_System 
     * SHALL create or link customer account and issue JWT_Token
     * 
     * Requirement 2.5: IF customer email from OAuth already exists THEN THE Customer_Auth_System 
     * SHALL link OAuth provider to existing account
     * 
     * Requirement 2.6: WHEN a new customer registers via OAuth THEN THE Customer_Auth_System 
     * SHALL create customer record with OAuth provider info
     * 
     * @param provider OAuth provider (google, facebook)
     * @param accessToken OAuth access token
     * @return AuthResponse with success/failure
     */
    public AuthResponse oauthLogin(String provider, String accessToken) {
        // Validate inputs
        if (accessToken == null || accessToken.isBlank()) {
            return AuthResponse.error("Access token không được để trống");
        }

        // Verify OAuth token and get user info
        OAuthService.OAuthUserInfo userInfo = null;
        
        if ("google".equalsIgnoreCase(provider)) {
            userInfo = oAuthService.verifyGoogleToken(accessToken);
        } else if ("facebook".equalsIgnoreCase(provider)) {
            userInfo = oAuthService.verifyFacebookToken(accessToken);
        } else {
            return AuthResponse.error("Provider không được hỗ trợ");
        }

        // Requirement 2.4: WHEN OAuth authentication fails THEN THE Customer_Auth_System 
        // SHALL display error message and allow retry
        if (userInfo == null) {
            String providerName = "google".equalsIgnoreCase(provider) ? "Google" : "Facebook";
            return AuthResponse.error("Đăng nhập " + providerName + " thất bại. Vui lòng thử lại.");
        }

        // Try to find existing customer by OAuth ID and provider
        Optional<Customer> existingByOAuth = customerRepository.findByOauthProviderAndOauthId(
            userInfo.getProvider(), userInfo.getOauthId()
        );

        if (existingByOAuth.isPresent()) {
            // Customer already linked with this OAuth account
            Customer customer = existingByOAuth.get();
            
            // Check if account is active
            if (!"ACTIVE".equals(customer.getStatus())) {
                return AuthResponse.error("Tài khoản đã bị khóa");
            }

            // Update last login time
            customer.setUpdatedAt(LocalDateTime.now());
            customerRepository.save(customer);

            String token = jwtService.generateToken(customer);
            return AuthResponse.success(token, CustomerDTO.fromEntity(customer));
        }

        // Requirement 2.5: Check if email already exists (link OAuth to existing account)
        if (userInfo.getEmail() != null) {
            Optional<Customer> existingByEmail = customerRepository.findByEmail(userInfo.getEmail());
            
            if (existingByEmail.isPresent()) {
                Customer customer = existingByEmail.get();
                
                // Check if account is active
                if (!"ACTIVE".equals(customer.getStatus())) {
                    return AuthResponse.error("Tài khoản đã bị khóa");
                }

                // Link OAuth provider to existing account
                customer.setOauthProvider(userInfo.getProvider());
                customer.setOauthId(userInfo.getOauthId());
                
                // Update avatar if not set
                if (customer.getAvatarUrl() == null && userInfo.getPicture() != null) {
                    customer.setAvatarUrl(userInfo.getPicture());
                }
                
                customer.setUpdatedAt(LocalDateTime.now());
                customerRepository.save(customer);

                String token = jwtService.generateToken(customer);
                return AuthResponse.success(token, CustomerDTO.fromEntity(customer));
            }
        }

        // Requirement 2.6: Create new customer with OAuth info
        Customer newCustomer = new Customer();
        newCustomer.setFullName(userInfo.getName() != null ? userInfo.getName() : "Khách hàng");
        newCustomer.setEmail(userInfo.getEmail());
        newCustomer.setOauthProvider(userInfo.getProvider());
        newCustomer.setOauthId(userInfo.getOauthId());
        newCustomer.setAvatarUrl(userInfo.getPicture());
        newCustomer.setStatus("ACTIVE");
        newCustomer.setCreatedAt(LocalDateTime.now());
        newCustomer.setUpdatedAt(LocalDateTime.now());
        // Password is null for OAuth-only accounts

        Customer savedCustomer = customerRepository.save(newCustomer);

        String token = jwtService.generateToken(savedCustomer);
        return AuthResponse.success(token, CustomerDTO.fromEntity(savedCustomer));
    }

    /**
     * Get current customer from token.
     * 
     * @param token JWT token
     * @return Customer if found and valid, null otherwise
     */
    public Customer getCurrentCustomer(String token) {
        if (token == null || token.isBlank()) {
            return null;
        }

        // Validate JWT token using JwtService
        // Requirement 7.8: IF invalid token is provided THEN return 401 Unauthorized
        if (!jwtService.validateToken(token)) {
            return null;
        }

        // Extract customer ID from token
        Long customerId = jwtService.extractCustomerId(token);
        if (customerId == null) {
            return null;
        }

        Optional<Customer> customerOpt = customerRepository.findById(customerId);
        
        if (customerOpt.isEmpty()) {
            return null;
        }

        Customer customer = customerOpt.get();
        
        // Check if account is active
        if (!"ACTIVE".equals(customer.getStatus())) {
            return null;
        }

        return customer;
    }

    /**
     * Hash a plain text password using BCrypt.
     * 
     * Requirement 7.6: THE Customer_Auth_System SHALL hash passwords using BCrypt before storing
     * 
     * @param plainPassword Plain text password
     * @return BCrypt hashed password
     */
    public String hashPassword(String plainPassword) {
        return passwordEncoder.encode(plainPassword);
    }

    /**
     * Verify a plain text password against a BCrypt hash.
     * 
     * @param plainPassword Plain text password to verify
     * @param hashedPassword BCrypt hashed password from database
     * @return true if password matches, false otherwise
     */
    public boolean verifyPassword(String plainPassword, String hashedPassword) {
        if (plainPassword == null || hashedPassword == null) {
            return false;
        }
        return passwordEncoder.matches(plainPassword, hashedPassword);
    }
}
