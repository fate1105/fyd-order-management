package com.fyd.backend.controller;

import com.fyd.backend.dto.LuckySpinAdminDTO.*;
import com.fyd.backend.service.LuckySpinService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/lucky-spin")
@CrossOrigin(origins = "*")
public class AdminLuckySpinController {

    @Autowired
    private LuckySpinService luckySpinService;

    @GetMapping("/info")
    public ResponseEntity<?> getAdminInfo() {
        AdminProgramInfo info = luckySpinService.getAdminInfo();
        if (info == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(info);
    }

    @PutMapping("/program")
    public ResponseEntity<?> updateProgram(@RequestBody AdminProgramInfo dto) {
        if (luckySpinService.updateProgram(dto)) {
            return ResponseEntity.ok(Map.of("message", "Cập nhật chương trình thành công"));
        }
        return ResponseEntity.badRequest().body(Map.of("message", "Cập nhật thất bại"));
    }

    @PutMapping("/rewards/{id}")
    public ResponseEntity<?> updateReward(@PathVariable Long id, @RequestBody AdminRewardInfo dto) {
        dto.setId(id);
        if (luckySpinService.updateReward(dto)) {
            return ResponseEntity.ok(Map.of("message", "Cập nhật phần thưởng thành công"));
        }
        return ResponseEntity.badRequest().body(Map.of("message", "Cập nhật thất bại"));
    }
}
