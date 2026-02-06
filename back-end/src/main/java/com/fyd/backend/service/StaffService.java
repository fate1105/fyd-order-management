package com.fyd.backend.service;

import com.fyd.backend.dto.StaffDTO;
import com.fyd.backend.entity.Role;
import com.fyd.backend.entity.User;
import com.fyd.backend.repository.RoleRepository;
import com.fyd.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class StaffService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public List<StaffDTO> getAllStaff() {
        return userRepository.findAll().stream()
                .map(StaffDTO::fromUser)
                .collect(Collectors.toList());
    }

    public List<StaffDTO> getStaffByRole(String roleName) {
        return userRepository.findAll().stream()
                .filter(u -> u.getRole() != null && roleName.equals(u.getRole().getName()))
                .map(StaffDTO::fromUser)
                .collect(Collectors.toList());
    }

    public Optional<StaffDTO> getStaffById(Long id) {
        return userRepository.findById(id).map(StaffDTO::fromUser);
    }

    @Transactional
    public StaffDTO createStaff(StaffDTO dto) {
        // Validate unique constraints
        if (userRepository.existsByUsername(dto.getUsername())) {
            throw new RuntimeException("Username đã tồn tại");
        }
        if (dto.getEmail() != null && userRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Email đã tồn tại");
        }

        // Get role
        Role role = roleRepository.findById(dto.getRoleId())
                .orElseThrow(() -> new RuntimeException("Role không tồn tại"));

        User user = new User();
        user.setUsername(dto.getUsername());
        user.setEmail(dto.getEmail());
        user.setFullName(dto.getFullName());
        user.setPhone(dto.getPhone());
        user.setAvatarUrl(dto.getAvatarUrl());
        user.setRole(role);
        user.setStatus("ACTIVE");
        user.setCreatedAt(LocalDateTime.now());

        // Hash password
        String hashedPassword = passwordEncoder.encode(dto.getPassword() != null ? dto.getPassword() : "123456");
        user.setPasswordHash(hashedPassword);

        User saved = userRepository.save(user);
        return StaffDTO.fromUser(saved);
    }

    @Transactional
    public StaffDTO updateStaff(Long id, StaffDTO dto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Nhân viên không tồn tại"));

        // Check unique constraints for changed values
        if (dto.getUsername() != null && !dto.getUsername().equals(user.getUsername())) {
            if (userRepository.existsByUsername(dto.getUsername())) {
                throw new RuntimeException("Username đã tồn tại");
            }
            user.setUsername(dto.getUsername());
        }

        if (dto.getEmail() != null && !dto.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(dto.getEmail())) {
                throw new RuntimeException("Email đã tồn tại");
            }
            user.setEmail(dto.getEmail());
        }

        if (dto.getFullName() != null) {
            user.setFullName(dto.getFullName());
        }
        if (dto.getPhone() != null) {
            user.setPhone(dto.getPhone());
        }
        if (dto.getAvatarUrl() != null) {
            user.setAvatarUrl(dto.getAvatarUrl());
        }
        if (dto.getStatus() != null) {
            user.setStatus(dto.getStatus());
        }

        // Update role if provided
        if (dto.getRoleId() != null) {
            Role role = roleRepository.findById(dto.getRoleId())
                    .orElseThrow(() -> new RuntimeException("Role không tồn tại"));
            user.setRole(role);
        }

        user.setUpdatedAt(LocalDateTime.now());
        User saved = userRepository.save(user);
        return StaffDTO.fromUser(saved);
    }

    @Transactional
    public void changePassword(Long id, String newPassword) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Nhân viên không tồn tại"));
        
        String hashedPassword = passwordEncoder.encode(newPassword);
        user.setPasswordHash(hashedPassword);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
    }

    @Transactional
    public void toggleStatus(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Nhân viên không tồn tại"));
        
        String newStatus = "ACTIVE".equals(user.getStatus()) ? "LOCKED" : "ACTIVE";
        user.setStatus(newStatus);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
    }

    @Transactional
    public void deleteStaff(Long id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("Nhân viên không tồn tại");
        }
        userRepository.deleteById(id);
    }

    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }
}
