package com.fyd.backend.controller;

import com.fyd.backend.dto.StaffDTO;
import com.fyd.backend.entity.Role;
import com.fyd.backend.service.StaffService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/staff")
@CrossOrigin(origins = "*")
@PreAuthorize("hasAnyRole('ADMIN')")
public class StaffController {

    @Autowired
    private StaffService staffService;

    /**
     * Lấy danh sách tất cả nhân viên
     */
    @GetMapping
    @PreAuthorize("hasAuthority('staff:read')")
    public ResponseEntity<List<StaffDTO>> getAllStaff(@RequestParam(required = false) String role) {
        List<StaffDTO> staff;
        if (role != null && !role.isEmpty()) {
            staff = staffService.getStaffByRole(role);
        } else {
            staff = staffService.getAllStaff();
        }
        return ResponseEntity.ok(staff);
    }

    /**
     * Lấy thông tin nhân viên theo ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('staff:read')")
    public ResponseEntity<?> getStaffById(@PathVariable Long id) {
        return staffService.getStaffById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Tạo nhân viên mới
     */
    @PostMapping
    @PreAuthorize("hasAuthority('staff:create') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> createStaff(@RequestBody StaffDTO dto) {
        try {
            StaffDTO created = staffService.createStaff(dto);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Tạo nhân viên thành công");
            response.put("data", created);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Cập nhật thông tin nhân viên
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('staff:update') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> updateStaff(@PathVariable Long id, @RequestBody StaffDTO dto) {
        try {
            StaffDTO updated = staffService.updateStaff(id, dto);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Cập nhật thành công");
            response.put("data", updated);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Đổi mật khẩu nhân viên
     */
    @PutMapping("/{id}/password")
    @PreAuthorize("hasAuthority('staff:update') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> changePassword(
            @PathVariable Long id,
            @RequestBody PasswordChangeRequest request) {
        try {
            staffService.changePassword(id, request.getNewPassword());
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Đổi mật khẩu thành công");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Khóa/Mở khóa tài khoản nhân viên
     */
    @PutMapping("/{id}/toggle-status")
    @PreAuthorize("hasAuthority('staff:update') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> toggleStatus(@PathVariable Long id) {
        try {
            staffService.toggleStatus(id);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Cập nhật trạng thái thành công");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Xóa nhân viên
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('staff:delete') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> deleteStaff(@PathVariable Long id) {
        try {
            staffService.deleteStaff(id);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Xóa nhân viên thành công");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Lấy danh sách các role
     */
    @GetMapping("/roles")
    public ResponseEntity<List<Role>> getAllRoles() {
        return ResponseEntity.ok(staffService.getAllRoles());
    }

    // Request DTO for password change
    public static class PasswordChangeRequest {
        private String newPassword;

        public String getNewPassword() { return newPassword; }
        public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
    }
}
