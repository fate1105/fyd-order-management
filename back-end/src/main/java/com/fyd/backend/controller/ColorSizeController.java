package com.fyd.backend.controller;

import com.fyd.backend.entity.Brand;
import com.fyd.backend.entity.Color;
import com.fyd.backend.entity.Size;
import com.fyd.backend.repository.BrandRepository;
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
    
    @Autowired
    private BrandRepository brandRepository;

    @GetMapping("/colors")
    public ResponseEntity<List<Map<String, Object>>> getColors() {
        List<Map<String, Object>> colors = colorRepository.findAll().stream()
            .map(c -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", c.getId());
                map.put("name", c.getName());
                map.put("hexCode", c.getHexCode());
                return map;
            })
            .collect(Collectors.toList());
        return ResponseEntity.ok(colors);
    }

    @GetMapping("/sizes")
    public ResponseEntity<List<Map<String, Object>>> getSizes() {
        List<Map<String, Object>> sizes = sizeRepository.findAllOrdered().stream()
            .map(s -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", s.getId());
                map.put("name", s.getName());
                map.put("sortOrder", s.getSortOrder());
                return map;
            })
            .collect(Collectors.toList());
        return ResponseEntity.ok(sizes);
    }

    @GetMapping("/brands")
    public ResponseEntity<List<Map<String, Object>>> getBrands() {
        List<Map<String, Object>> brands = brandRepository.findAllActive().stream()
            .map(b -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", b.getId());
                map.put("name", b.getName());
                map.put("slug", b.getSlug());
                map.put("description", b.getDescription());
                map.put("logo", b.getLogoUrl());
                map.put("website", b.getWebsite());
                return map;
            })
            .collect(Collectors.toList());
        return ResponseEntity.ok(brands);
    }
}
