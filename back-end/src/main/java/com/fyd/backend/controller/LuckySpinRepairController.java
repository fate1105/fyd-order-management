package com.fyd.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
public class LuckySpinRepairController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @GetMapping("/repair-lucky-spin")
    public String repair() {
        try {
            // Fix Program Name & Description
            jdbcTemplate.update("UPDATE lucky_spin_programs SET name = ?, description = ? WHERE name LIKE 'V%ng Quay%'",
                    "Vòng Quay May Mắn Tết 2026",
                    "Quay vòng quay để nhận các mã giảm giá hấp dẫn! Mỗi ngày bạn được quay 1 lần miễn phí, hoặc dùng 50 điểm để đổi thêm lượt quay.");

            // Fix Reward Names
            jdbcTemplate.update("UPDATE lucky_spin_rewards SET name = ? WHERE name LIKE 'Gi%m 5%'", "Giảm 5%");
            jdbcTemplate.update("UPDATE lucky_spin_rewards SET name = ? WHERE name LIKE 'Gi%m 10%'", "Giảm 10%");
            jdbcTemplate.update("UPDATE lucky_spin_rewards SET name = ? WHERE name LIKE 'Gi%m 20%'", "Giảm 20%");
            jdbcTemplate.update("UPDATE lucky_spin_rewards SET name = ? WHERE name LIKE 'Gi%m 50.000%'", "Giảm 50.000đ");
            jdbcTemplate.update("UPDATE lucky_spin_rewards SET name = ? WHERE name LIKE 'Gi%m 100.000%'", "Giảm 100.000đ");
            jdbcTemplate.update("UPDATE lucky_spin_rewards SET name = ? WHERE name LIKE 'Gi%m 200.000%'", "Giảm 200.000đ");
            jdbcTemplate.update("UPDATE lucky_spin_rewards SET name = ? WHERE name LIKE 'Mi%n ph% v%n chuyển%'", "Miễn phí vận chuyển");
            jdbcTemplate.update("UPDATE lucky_spin_rewards SET name = ? WHERE name LIKE 'Ch%c may m%n%'", "Chúc may mắn lần sau!");

            return "LuckSpin Data Repaired Successfully!";
        } catch (Exception e) {
            return "Repair Failed: " + e.getMessage();
        }
    }
}
