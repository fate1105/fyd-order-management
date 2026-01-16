package com.fyd.backend.controller;

import com.fyd.backend.entity.User;
import com.fyd.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody LoginRequest request) {
        // Simple login (no password hashing for demo)
        return userRepository.findByUsername(request.getUsername())
            .or(() -> userRepository.findByEmail(request.getUsername()))
            .map(user -> {
                // In production, verify password hash
                // For demo, just check if user exists and is active
                if (!"ACTIVE".equals(user.getStatus())) {
                    Map<String, Object> error = new HashMap<>();
                    error.put("success", false);
                    error.put("message", "Tài khoản đã bị khóa");
                    return ResponseEntity.badRequest().body(error);
                }
                
                // Update last login
                user.setLastLoginAt(LocalDateTime.now());
                userRepository.save(user);
                
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("user", userToMap(user));
                response.put("token", "demo-token-" + user.getId()); // Mock token
                return ResponseEntity.ok(response);
            })
            .orElseGet(() -> {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "Tài khoản không tồn tại");
                return ResponseEntity.badRequest().body(error);
            });
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getCurrentUser(@RequestHeader(value = "Authorization", required = false) String token) {
        // Mock: extract user from token
        if (token == null || !token.startsWith("Bearer demo-token-")) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }
        
        try {
            Long userId = Long.parseLong(token.replace("Bearer demo-token-", ""));
            return userRepository.findById(userId)
                .map(user -> ResponseEntity.ok(userToMap(user)))
                .orElse(ResponseEntity.status(401).body(Map.of("message", "User not found")));
        } catch (NumberFormatException e) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid token"));
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<Map<String, Object>> updateProfile(
            @RequestHeader(value = "Authorization", required = false) String token,
            @RequestBody UpdateProfileRequest request) {
        
        if (token == null || !token.startsWith("Bearer demo-token-")) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }
        
        try {
            Long userId = Long.parseLong(token.replace("Bearer demo-token-", ""));
            return userRepository.findById(userId)
                .map(user -> {
                    if (request.getFullName() != null) {
                        user.setFullName(request.getFullName());
                    }
                    if (request.getPhone() != null) {
                        user.setPhone(request.getPhone());
                    }
                    if (request.getAvatarUrl() != null) {
                        user.setAvatarUrl(request.getAvatarUrl());
                    }
                    user.setUpdatedAt(LocalDateTime.now());
                    User saved = userRepository.save(user);
                    
                    Map<String, Object> response = new HashMap<>();
                    response.put("success", true);
                    response.put("user", userToMap(saved));
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.status(401).body(Map.of("message", "User not found")));
        } catch (NumberFormatException e) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid token"));
        }
    }

    private Map<String, Object> userToMap(User user) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", user.getId());
        map.put("username", user.getUsername());
        map.put("email", user.getEmail());
        map.put("fullName", user.getFullName());
        map.put("phone", user.getPhone());
        map.put("avatar", user.getAvatarUrl());
        map.put("role", user.getRole() != null ? user.getRole().getName() : null);
        map.put("status", user.getStatus());
        map.put("createdAt", user.getCreatedAt());
        return map;
    }

    // Request DTOs
    public static class LoginRequest {
        private String username;
        private String password;

        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class UpdateProfileRequest {
        private String fullName;
        private String phone;
        private String avatarUrl;

        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public String getAvatarUrl() { return avatarUrl; }
        public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
    }
}
