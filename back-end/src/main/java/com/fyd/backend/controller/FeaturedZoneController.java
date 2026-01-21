package com.fyd.backend.controller;

import com.fyd.backend.entity.FeaturedZone;
import com.fyd.backend.entity.Product;
import com.fyd.backend.repository.FeaturedZoneRepository;
import com.fyd.backend.repository.ProductRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/featured-zones")
@CrossOrigin(origins = "*")
public class FeaturedZoneController {

    @Autowired
    private FeaturedZoneRepository zoneRepository;

    @Autowired
    private ProductRepository productRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    // Get all zones
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllZones() {
        List<FeaturedZone> zones = zoneRepository.findAllByOrderByCreatedAtDesc();
        List<Map<String, Object>> result = zones.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    // Get single zone
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getZone(@PathVariable Long id) {
        return zoneRepository.findById(id)
                .map(zone -> ResponseEntity.ok(toDetailedDTO(zone)))
                .orElse(ResponseEntity.notFound().build());
    }

    // Get zone by slug (for frontend display)
    @GetMapping("/slug/{slug}")
    public ResponseEntity<Map<String, Object>> getZoneBySlug(@PathVariable String slug) {
        return zoneRepository.findBySlug(slug)
                .filter(FeaturedZone::getIsActive)
                .map(zone -> ResponseEntity.ok(toDetailedDTO(zone)))
                .orElse(ResponseEntity.notFound().build());
    }

    // Get all active zones (for shop display)
    @GetMapping("/active")
    public ResponseEntity<List<Map<String, Object>>> getActiveZones() {
        List<FeaturedZone> zones = zoneRepository.findByIsActiveTrueOrderByCreatedAtDesc();
        List<Map<String, Object>> result = zones.stream()
                .map(this::toDetailedDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    // Create zone
    @PostMapping
    @Transactional
    public ResponseEntity<Map<String, Object>> createZone(@RequestBody Map<String, Object> request) {
        FeaturedZone zone = new FeaturedZone();
        updateZoneFromRequest(zone, request);
        
        FeaturedZone saved = zoneRepository.save(zone);
        return ResponseEntity.ok(toDetailedDTO(saved));
    }

    // Update zone
    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<Map<String, Object>> updateZone(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        return zoneRepository.findById(id)
                .map(zone -> {
                    updateZoneFromRequest(zone, request);
                    FeaturedZone saved = zoneRepository.save(zone);
                    return ResponseEntity.ok(toDetailedDTO(saved));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Delete zone
    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Map<String, Object>> deleteZone(@PathVariable Long id) {
        if (!zoneRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        zoneRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("success", true));
    }

    // Helper: Update zone from request
    private void updateZoneFromRequest(FeaturedZone zone, Map<String, Object> request) {
        if (request.containsKey("name")) {
            zone.setName((String) request.get("name"));
        }
        if (request.containsKey("slug")) {
            zone.setSlug((String) request.get("slug"));
        }
        if (request.containsKey("position")) {
            zone.setPosition((String) request.get("position"));
        }
        if (request.containsKey("isActive")) {
            zone.setIsActive((Boolean) request.get("isActive"));
        }
        
        // Grid config
        if (request.containsKey("gridConfig")) {
            @SuppressWarnings("unchecked")
            Map<String, Object> gridConfig = (Map<String, Object>) request.get("gridConfig");
            if (gridConfig.containsKey("columns")) {
                zone.setGridColumns(((Number) gridConfig.get("columns")).intValue());
            }
            if (gridConfig.containsKey("gap")) {
                zone.setGridGap(((Number) gridConfig.get("gap")).intValue());
            }
            if (gridConfig.containsKey("aspectRatio")) {
                zone.setGridAspectRatio((String) gridConfig.get("aspectRatio"));
            }
        }

        // Products
        if (request.containsKey("productIds")) {
            try {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> productIds = (List<Map<String, Object>>) request.get("productIds");
                zone.setProductData(objectMapper.writeValueAsString(productIds));
            } catch (JsonProcessingException e) {
                e.printStackTrace();
            }
        }
    }

    // Helper: Convert to simple DTO (for list)
    private Map<String, Object> toDTO(FeaturedZone zone) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", zone.getId());
        dto.put("name", zone.getName());
        dto.put("slug", zone.getSlug());
        dto.put("position", zone.getPosition());
        dto.put("isActive", zone.getIsActive());
        
        // Count products
        int productCount = 0;
        if (zone.getProductData() != null && !zone.getProductData().isEmpty()) {
            try {
                List<?> products = objectMapper.readValue(zone.getProductData(), List.class);
                productCount = products.size();
            } catch (JsonProcessingException ignored) {}
        }
        dto.put("products", Collections.nCopies(productCount, null)); // Just for count
        
        return dto;
    }

    // Helper: Convert to detailed DTO (with products)
    private Map<String, Object> toDetailedDTO(FeaturedZone zone) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", zone.getId());
        dto.put("name", zone.getName());
        dto.put("slug", zone.getSlug());
        dto.put("position", zone.getPosition());
        dto.put("isActive", zone.getIsActive());
        
        // Grid config
        Map<String, Object> gridConfig = new HashMap<>();
        gridConfig.put("columns", zone.getGridColumns());
        gridConfig.put("gap", zone.getGridGap());
        gridConfig.put("aspectRatio", zone.getGridAspectRatio());
        dto.put("gridConfig", gridConfig);

        // Products with full info
        List<Map<String, Object>> products = new ArrayList<>();
        if (zone.getProductData() != null && !zone.getProductData().isEmpty()) {
            try {
                List<Map<String, Object>> productData = objectMapper.readValue(
                        zone.getProductData(),
                        new TypeReference<List<Map<String, Object>>>() {}
                );

                for (int i = 0; i < productData.size(); i++) {
                    Map<String, Object> pd = productData.get(i);
                    Long productId = ((Number) pd.get("productId")).longValue();
                    
                    Optional<Product> productOpt = productRepository.findById(productId);
                    if (productOpt.isPresent()) {
                        Product p = productOpt.get();
                        Map<String, Object> item = new HashMap<>();
                        item.put("id", productId); // Use productId as stable ID
                        item.put("productId", productId);
                        item.put("position", pd.getOrDefault("position", i));
                        item.put("customThumbnail", pd.get("customThumbnail"));
                        
                        Map<String, Object> productInfo = new HashMap<>();
                        productInfo.put("id", p.getId());
                        productInfo.put("name", p.getName());
                        productInfo.put("price", p.getSalePrice() != null ? p.getSalePrice() : p.getBasePrice());
                        
                        // Get primary image
                        String image = "/placeholder.jpg";
                        if (p.getImages() != null && !p.getImages().isEmpty()) {
                            image = p.getImages().stream()
                                    .filter(img -> Boolean.TRUE.equals(img.getIsPrimary()))
                                    .findFirst()
                                    .orElse(p.getImages().get(0))
                                    .getImageUrl();
                        }
                        productInfo.put("image", image);
                        
                        item.put("product", productInfo);
                        products.add(item);
                    }
                }
            } catch (JsonProcessingException e) {
                e.printStackTrace();
            }
        }
        dto.put("products", products);

        return dto;
    }
}
