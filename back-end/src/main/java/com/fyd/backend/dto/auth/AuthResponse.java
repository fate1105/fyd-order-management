package com.fyd.backend.dto.auth;

import com.fyd.backend.dto.CustomerDTO;

/**
 * Response DTO for authentication operations
 */
public class AuthResponse {
    private boolean success;
    private String token;
    private CustomerDTO customer;
    private String message;

    public AuthResponse() {}

    public AuthResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
    }

    public AuthResponse(boolean success, String token, CustomerDTO customer) {
        this.success = success;
        this.token = token;
        this.customer = customer;
    }

    public AuthResponse(boolean success, String token, CustomerDTO customer, String message) {
        this.success = success;
        this.token = token;
        this.customer = customer;
        this.message = message;
    }

    // Static factory methods for common responses
    public static AuthResponse success(String token, CustomerDTO customer) {
        return new AuthResponse(true, token, customer);
    }

    public static AuthResponse success(String token, CustomerDTO customer, String message) {
        return new AuthResponse(true, token, customer, message);
    }

    public static AuthResponse error(String message) {
        return new AuthResponse(false, message);
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public CustomerDTO getCustomer() {
        return customer;
    }

    public void setCustomer(CustomerDTO customer) {
        this.customer = customer;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
