package com.fyd.backend.controller;

import com.fyd.backend.entity.Category;
import com.fyd.backend.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin(origins = "*")
public class CategoryController {

    @Autowired
    private CategoryRepository categoryRepository;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getCategories() {
        List<Category> rootCategories = categoryRepository.findRootCategories();
        List<Map<String, Object>> result = new ArrayList<>();
        
        for (Category root : rootCategories) {
            Map<String, Object> cat = categoryToMap(root);
            List<Category> children = categoryRepository.findByParentId(root.getId());
            cat.put("children", children.stream()
                .map(this::categoryToMap)
                .collect(Collectors.toList()));
            result.add(cat);
        }
        
        return ResponseEntity.ok(result);
    }

    @GetMapping("/flat")
    public ResponseEntity<List<Map<String, Object>>> getCategoriesFlat() {
        List<Category> categories = categoryRepository.findAllActive();
        List<Map<String, Object>> result = categories.stream()
            .map(this::categoryToMap)
            .collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getCategory(@PathVariable Long id) {
        return categoryRepository.findById(id)
            .map(this::categoryToMap)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    private Map<String, Object> categoryToMap(Category c) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", c.getId());
        map.put("name", c.getName());
        map.put("slug", c.getSlug());
        map.put("description", c.getDescription());
        map.put("image", c.getImageUrl());
        map.put("parentId", c.getParent() != null ? c.getParent().getId() : null);
        map.put("sortOrder", c.getSortOrder());
        return map;
    }
}
