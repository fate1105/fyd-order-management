package com.fyd.backend.controller;

import com.fyd.backend.entity.Color;
import com.fyd.backend.entity.Size;
import com.fyd.backend.repository.ColorRepository;
import com.fyd.backend.repository.SizeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ColorSizeController {

    @Autowired
    private ColorRepository colorRepository;
    
    @Autowired
    private SizeRepository sizeRepository;

    // ==================== COLORS ====================

    @GetMapping("/colors")
    public ResponseEntity<List<Map<String, Object>>> getColors() {
        List<Map<String, Object>> colors = colorRepository.findAll().stream()
            .map(this::colorToMap)
            .collect(Collectors.toList());
        return ResponseEntity.ok(colors);
    }

    @GetMapping("/colors/{id}")
    public ResponseEntity<Map<String, Object>> getColor(@PathVariable Long id) {
        return colorRepository.findById(id)
            .map(this::colorToMap)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/colors")
    public ResponseEntity<Map<String, Object>> createColor(@RequestBody ColorDTO dto) {
        try {
            Color color = new Color();
            color.setName(dto.getName());
            color.setHexCode(dto.getHexCode());
            Color saved = colorRepository.save(color);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", colorToMap(saved));
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PutMapping("/colors/{id}")
    public ResponseEntity<Map<String, Object>> updateColor(@PathVariable Long id, @RequestBody ColorDTO dto) {
        return colorRepository.findById(id)
            .map(color -> {
                if (dto.getName() != null) color.setName(dto.getName());
                if (dto.getHexCode() != null) color.setHexCode(dto.getHexCode());
                Color saved = colorRepository.save(color);
                
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("data", colorToMap(saved));
                return ResponseEntity.ok(response);
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/colors/{id}")
    public ResponseEntity<Map<String, Object>> deleteColor(@PathVariable Long id) {
        if (!colorRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        colorRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("success", true, "message", "Đã xóa màu"));
    }

    // ==================== SIZES ====================

    @GetMapping("/sizes")
    public ResponseEntity<List<Map<String, Object>>> getSizes() {
        List<Map<String, Object>> sizes = sizeRepository.findAllOrdered().stream()
            .map(this::sizeToMap)
            .collect(Collectors.toList());
        return ResponseEntity.ok(sizes);
    }

    @GetMapping("/sizes/{id}")
    public ResponseEntity<Map<String, Object>> getSize(@PathVariable Long id) {
        return sizeRepository.findById(id)
            .map(this::sizeToMap)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/sizes")
    public ResponseEntity<Map<String, Object>> createSize(@RequestBody SizeDTO dto) {
        try {
            Size size = new Size();
            size.setName(dto.getName());
            size.setSortOrder(dto.getSortOrder() != null ? dto.getSortOrder() : 0);
            Size saved = sizeRepository.save(size);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", sizeToMap(saved));
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PutMapping("/sizes/{id}")
    public ResponseEntity<Map<String, Object>> updateSize(@PathVariable Long id, @RequestBody SizeDTO dto) {
        return sizeRepository.findById(id)
            .map(size -> {
                if (dto.getName() != null) size.setName(dto.getName());
                if (dto.getSortOrder() != null) size.setSortOrder(dto.getSortOrder());
                Size saved = sizeRepository.save(size);
                
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("data", sizeToMap(saved));
                return ResponseEntity.ok(response);
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/sizes/{id}")
    public ResponseEntity<Map<String, Object>> deleteSize(@PathVariable Long id) {
        if (!sizeRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        sizeRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("success", true, "message", "Đã xóa size"));
    }

    @PutMapping("/sizes/reorder")
    public ResponseEntity<Map<String, Object>> reorderSizes(@RequestBody List<ReorderDTO> orders) {
        try {
            for (ReorderDTO order : orders) {
                sizeRepository.findById(order.getId()).ifPresent(size -> {
                    size.setSortOrder(order.getSortOrder());
                    sizeRepository.save(size);
                });
            }
            return ResponseEntity.ok(Map.of("success", true, "message", "Đã cập nhật thứ tự"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // ==================== HELPER METHODS ====================

    private Map<String, Object> colorToMap(Color c) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", c.getId());
        map.put("name", c.getName());
        map.put("hexCode", c.getHexCode());
        return map;
    }

    private Map<String, Object> sizeToMap(Size s) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", s.getId());
        map.put("name", s.getName());
        map.put("sortOrder", s.getSortOrder());
        return map;
    }

    // ==================== DTOs ====================

    public static class ColorDTO {
        private String name;
        private String hexCode;
        
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getHexCode() { return hexCode; }
        public void setHexCode(String hexCode) { this.hexCode = hexCode; }
    }

    public static class SizeDTO {
        private String name;
        private Integer sortOrder;
        
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public Integer getSortOrder() { return sortOrder; }
        public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }
    }

    public static class ReorderDTO {
        private Long id;
        private Integer sortOrder;
        
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Integer getSortOrder() { return sortOrder; }
        public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }
    }
}
