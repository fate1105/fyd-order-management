package com.fyd.backend.controller;

import com.fyd.backend.dto.CustomerDTO;
import com.fyd.backend.dto.auth.AuthResponse;
import com.fyd.backend.dto.auth.LoginRequest;
import com.fyd.backend.dto.auth.OAuthRequest;
import com.fyd.backend.dto.auth.RegisterRequest;
import com.fyd.backend.entity.Customer;
import com.fyd.backend.service.CustomerAuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller for customer authentication endpoints.
 * Handles login, registration, OAuth, and current customer info.
 * 
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
 */
@RestController
@RequestMapping("/api/customer/auth")
@CrossOrigin(origins = "*")
public class CustomerAuthController {

    private final CustomerAuthService customerAuthService;

    @Autowired
    public CustomerAuthController(CustomerAuthService customerAuthService) {
        this.customerAuthService = customerAuthService;
    }

    /**
     * POST /api/customer/auth/login
     * Authenticate customer with email and password.
     * 
     * Requirement 7.1: THE Customer_Auth_System SHALL expose POST `/api/customer/auth/login` endpoint for email/password login
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        AuthResponse response = customerAuthService.login(request.getEmail(), request.getPassword());
        
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * POST /api/customer/auth/register
     * Register a new customer account.
     * 
     * Requirement 7.2: THE Customer_Auth_System SHALL expose POST `/api/customer/auth/register` endpoint for registration
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        AuthResponse response = customerAuthService.register(request);
        
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * POST /api/customer/auth/oauth/google
     * Authenticate customer with Google OAuth.
     * 
     * Requirement 7.3: THE Customer_Auth_System SHALL expose POST `/api/customer/auth/oauth/google` endpoint for Google OAuth
     */
    @PostMapping("/oauth/google")
    public ResponseEntity<AuthResponse> googleOAuth(@RequestBody OAuthRequest request) {
        AuthResponse response = customerAuthService.oauthLogin("google", request.getAccessToken());
        
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * POST /api/customer/auth/oauth/facebook
     * Authenticate customer with Facebook OAuth.
     * 
     * Requirement 7.4: THE Customer_Auth_System SHALL expose POST `/api/customer/auth/oauth/facebook` endpoint for Facebook OAuth
     */
    @PostMapping("/oauth/facebook")
    public ResponseEntity<AuthResponse> facebookOAuth(@RequestBody OAuthRequest request) {
        AuthResponse response = customerAuthService.oauthLogin("facebook", request.getAccessToken());
        
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * GET /api/customer/auth/me
     * Get current authenticated customer information.
     * 
     * Requirement 7.5: THE Customer_Auth_System SHALL expose GET `/api/customer/auth/me` endpoint to get current customer info
     */
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentCustomer(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        
        // Validate authorization header
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401)
                .body(AuthResponse.error("Unauthorized"));
        }

        String token = authHeader.substring(7); // Remove "Bearer " prefix

        Customer customer = customerAuthService.getCurrentCustomer(token);
        
        if (customer == null) {
            return ResponseEntity.status(401)
                .body(AuthResponse.error("Invalid token"));
        }

        return ResponseEntity.ok(CustomerDTO.fromEntity(customer));
    }
}
