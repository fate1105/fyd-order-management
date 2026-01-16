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
            @RequestParam(defaultValue = "all") String filter) {
        
        List<Product> products = productRepository.findAll();
        
        // Filter by search query
        if (!q.isEmpty()) {
            String query = q.toLowerCase();
            products = products.stream()
                .filter(p -> p.getSku().toLowerCase().contains(query) 
                    || p.getName().toLowerCase().contains(query)
                    || (p.getCategory() != null && p.getCategory().getName().toLowerCase().contains(query)))
                .collect(Collectors.toList());
        }
        
        // Calculate stock for each product
        List<Map<String, Object>> items = new ArrayList<>();
        int lowCount = 0;
        int outCount = 0;
        
        for (Product p : products) {
            Integer totalStock = variantRepository.getTotalStockByProduct(p.getId());
            if (totalStock == null) totalStock = 0;
            
            String stockStatus;
            if (totalStock <= 0) {
                stockStatus = "out";
                outCount++;
            } else if (totalStock <= 6) {
                stockStatus = "low";
                lowCount++;
            } else {
                stockStatus = "ok";
            }
            
            // Apply filter
            if (filter.equals("low") && !stockStatus.equals("low")) continue;
            if (filter.equals("out") && !stockStatus.equals("out")) continue;
            
            Map<String, Object> item = new HashMap<>();
            item.put("id", p.getId());
            item.put("sku", p.getSku());
            item.put("name", p.getName());
            item.put("category", p.getCategory() != null ? p.getCategory().getName() : null);
            item.put("price", p.getSalePrice() != null ? p.getSalePrice() : p.getBasePrice());
            item.put("stock", totalStock);
            item.put("stockStatus", stockStatus);
            items.add(item);
        }
        
        // Sort by stock ascending (lowest first)
        items.sort(Comparator.comparingInt(a -> (Integer) a.get("stock")));
        
        Map<String, Object> response = new HashMap<>();
        response.put("items", items);
        response.put("total", products.size());
        response.put("lowCount", lowCount);
        response.put("outCount", outCount);
        
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
}
