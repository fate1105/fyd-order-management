package com.fyd.backend.controller;

import com.fyd.backend.entity.User;
import com.fyd.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Collections;
import java.util.stream.Collectors;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.fyd.backend.service.JwtService;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody LoginRequest request) {
        return userRepository.findByUsername(request.getUsername())
            .or(() -> userRepository.findByEmail(request.getUsername()))
            .map(user -> {
                // Verify password hash
                if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
                    Map<String, Object> error = new HashMap<>();
                    error.put("success", false);
                    error.put("message", "Mật khẩu không chính xác");
                    return ResponseEntity.badRequest().body(error);
                }

                if (!"ACTIVE".equals(user.getStatus())) {
                    Map<String, Object> error = new HashMap<>();
                    error.put("success", false);
                    error.put("message", "Tài khoản đã bị khóa");
                    return ResponseEntity.badRequest().body(error);
                }
                
                // Update last login
                user.setLastLoginAt(LocalDateTime.now());
                userRepository.save(user);
                
                String token = jwtService.generateToken(user);
                
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("user", userToMap(user));
                response.put("token", token); 
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
        if (token == null || !token.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }
        
        String jwt = token.substring(7);
        if (!jwtService.validateToken(jwt)) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid token"));
        }

        try {
            Long userId = jwtService.extractCustomerId(jwt); // Reuse extractCustomerId as it just parses the subject string to Long
            return userRepository.findById(userId)
                .map(user -> ResponseEntity.ok(userToMap(user)))
                .orElse(ResponseEntity.status(401).body(Map.of("message", "User not found")));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "Token processing error"));
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<Map<String, Object>> updateProfile(
            @RequestHeader(value = "Authorization", required = false) String token,
            @RequestBody UpdateProfileRequest request) {
        
        if (token == null || !token.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }
        
        String jwt = token.substring(7);
        if (!jwtService.validateToken(jwt)) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid token"));
        }

        try {
            Long userId = jwtService.extractCustomerId(jwt);
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

    @GetMapping("/sessions")
    public ResponseEntity<List<Map<String, Object>>> getSessions() {
        List<Map<String, Object>> sessions = new ArrayList<>();
        
        Map<String, Object> s1 = new HashMap<>();
        s1.put("id", 1);
        s1.put("device", "Windows PC - Chrome");
        s1.put("location", "Hà Nội, VN");
        s1.put("ip", "1.52.221.141");
        s1.put("time", LocalDateTime.now().minusMinutes(30).toString());
        s1.put("isCurrent", true);
        
        Map<String, Object> s2 = new HashMap<>();
        s2.put("id", 2);
        s2.put("device", "iPhone 15 - iOS App");
        s2.put("location", "Hồ Chí Minh, VN");
        s2.put("ip", "27.79.141.22");
        s2.put("time", LocalDateTime.now().minusDays(1).toString());
        s2.put("isCurrent", false);
        
        sessions.add(s1);
        sessions.add(s2);
        
        return ResponseEntity.ok(sessions);
    }

    @GetMapping("/activities")
    public ResponseEntity<List<Map<String, Object>>> getActivities() {
        List<Map<String, Object>> activities = new ArrayList<>();
        
        Map<String, Object> a1 = new HashMap<>();
        a1.put("id", 1);
        a1.put("type", "login");
        a1.put("text", "Đăng nhập vào hệ thống");
        a1.put("time", LocalDateTime.now().minusMinutes(35).toString());
        
        Map<String, Object> a2 = new HashMap<>();
        a2.put("id", 2);
        a2.put("type", "update_profile");
        a2.put("text", "Cập nhật ảnh đại diện");
        a2.put("time", LocalDateTime.now().minusHours(2).toString());
        
        Map<String, Object> a3 = new HashMap<>();
        a3.put("id", 3);
        a3.put("type", "order_process");
        a3.put("text", "Xác nhận đơn hàng #FYD-20260125-839");
        a3.put("time", LocalDateTime.now().minusHours(3).toString());
        
        activities.add(a1);
        activities.add(a2);
        activities.add(a3);
        
        return ResponseEntity.ok(activities);
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
        
        // Add permissions to response
        if (user.getRole() != null && user.getRole().getPermissions() != null) {
            List<String> perms = user.getRole().getPermissions().stream()
                .map(p -> p.getName())
                .collect(Collectors.toList());
            map.put("permissions", perms);
        } else {
            map.put("permissions", Collections.emptyList());
        }

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
