package com.fyd.backend.controller;

import com.fyd.backend.dto.ProductDTO;
import com.fyd.backend.dto.VariantDTO;
import com.fyd.backend.entity.Product;
import com.fyd.backend.entity.ProductVariant;
import com.fyd.backend.repository.ProductRepository;
import com.fyd.backend.repository.ProductVariantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/inventory")
@CrossOrigin(origins = "*")
public class InventoryController {

    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private ProductVariantRepository variantRepository;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getInventory(
            @RequestParam(defaultValue = "") String q,
            @RequestParam(defaultValue = "all") String filter,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long sizeId,
            @RequestParam(defaultValue = "stockAsc") String sort) {
        
        List<ProductVariant> variants = variantRepository.findAll();
        
        // Calculate counts for the original total variants before q/filter/categoryId
        long lowCount = variants.stream().filter(v -> v.getStockQuantity() > 0 && v.getStockQuantity() <= 6).count();
        long outCount = variants.stream().filter(v -> v.getStockQuantity() <= 0).count();
        int totalOriginal = variants.size();

        // 1. Filter by search query (q)
        if (!q.isEmpty()) {
            String query = q.toLowerCase();
            variants = variants.stream()
                .filter(v -> v.getSkuVariant().toLowerCase().contains(query) 
                    || v.getProduct().getName().toLowerCase().contains(query)
                    || (v.getProduct().getCategory() != null && v.getProduct().getCategory().getName().toLowerCase().contains(query)))
                .collect(Collectors.toList());
        }

        // 2. Filter by category
        if (categoryId != null) {
            variants = variants.stream()
                .filter(v -> v.getProduct().getCategory() != null && v.getProduct().getCategory().getId().equals(categoryId))
                .collect(Collectors.toList());
        }

        // 3. Filter by size
        if (sizeId != null) {
            variants = variants.stream()
                .filter(v -> v.getSize() != null && v.getSize().getId().equals(sizeId))
                .collect(Collectors.toList());
        }
        
        // 4. Filter by status (low/out)
        if (filter.equals("low")) {
            variants = variants.stream()
                .filter(v -> v.getStockQuantity() > 0 && v.getStockQuantity() <= 6)
                .collect(Collectors.toList());
        } else if (filter.equals("out")) {
            variants = variants.stream()
                .filter(v -> v.getStockQuantity() <= 0)
                .collect(Collectors.toList());
        }

        // 4. Map to DTO-like maps
        List<Map<String, Object>> items = variants.stream().map(v -> {
            Map<String, Object> item = new HashMap<>();
            item.put("id", v.getId());
            item.put("sku", v.getSkuVariant() != null ? v.getSkuVariant() : v.getId().toString());
            
            String sizeName = v.getSize() != null ? v.getSize().getName() : "-";
            String colorName = v.getColor() != null ? v.getColor().getName() : "-";
            String fullName = v.getProduct().getName() + " - " + sizeName + " / " + colorName;
            
            item.put("name", fullName);
            item.put("category", v.getProduct().getCategory() != null ? v.getProduct().getCategory().getName() : "N/A");
            item.put("price", v.getProduct().getSalePrice() != null ? v.getProduct().getSalePrice() : v.getProduct().getBasePrice());
            
            int stock = v.getStockQuantity() != null ? v.getStockQuantity() : 0;
            item.put("stock", stock);
            
            String stockStatus = stock <= 0 ? "out" : (stock <= 6 ? "low" : "ok");
            item.put("stockStatus", stockStatus);
            return item;
        }).collect(Collectors.toList());

        // 5. Apply sorting
        switch (sort) {
            case "stockDesc":
                items.sort((a, b) -> ((Integer) b.get("stock")).compareTo((Integer) a.get("stock")));
                break;
            case "priceAsc":
                items.sort((a, b) -> ((BigDecimal) a.get("price")).compareTo((BigDecimal) b.get("price")));
                break;
            case "priceDesc":
                items.sort((a, b) -> ((BigDecimal) b.get("price")).compareTo((BigDecimal) a.get("price")));
                break;
            case "stockAsc":
            default:
                items.sort((a, b) -> ((Integer) a.get("stock")).compareTo((Integer) b.get("stock")));
                break;
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("items", items);
        response.put("total", totalOriginal);
        response.put("lowCount", (int) lowCount);
        response.put("outCount", (int) outCount);
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/low-stock")
    public ResponseEntity<List<VariantDTO>> getLowStock(@RequestParam(defaultValue = "6") int threshold) {
        List<VariantDTO> variants = variantRepository.findLowStock(threshold).stream()
            .map(VariantDTO::fromEntity)
            .collect(Collectors.toList());
        return ResponseEntity.ok(variants);
    }

    @GetMapping("/out-of-stock")
    public ResponseEntity<List<VariantDTO>> getOutOfStock() {
        List<VariantDTO> variants = variantRepository.findOutOfStock().stream()
            .map(VariantDTO::fromEntity)
            .collect(Collectors.toList());
        return ResponseEntity.ok(variants);
    }

    @PatchMapping("/variant/{id}")
    public ResponseEntity<VariantDTO> updateVariantStock(
            @PathVariable Long id,
            @RequestParam int quantity) {
        return variantRepository.findById(id)
            .map(variant -> {
                variant.setStockQuantity(Math.max(0, variant.getStockQuantity() + quantity));
                ProductVariant saved = variantRepository.save(variant);
                return ResponseEntity.ok(VariantDTO.fromEntity(saved));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/variant/{id}/stock")
    public ResponseEntity<VariantDTO> setVariantStock(
            @PathVariable Long id,
            @RequestParam int stock) {
        return variantRepository.findById(id)
            .map(variant -> {
                variant.setStockQuantity(Math.max(0, stock));
                ProductVariant saved = variantRepository.save(variant);
                return ResponseEntity.ok(VariantDTO.fromEntity(saved));
            })
            .orElse(ResponseEntity.notFound().build());
    }
}
