package com.fyd.backend.controller;

import com.fyd.backend.dto.ProductDTO;
import com.fyd.backend.entity.Product;
import com.fyd.backend.entity.ProductVariant;
import com.fyd.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")
public class ProductController {

    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private ProductVariantRepository variantRepository;
    
    @Autowired
    private CategoryRepository categoryRepository;
    
    @Autowired
    private BrandRepository brandRepository;
    
    @Autowired
    private ProductImageRepository imageRepository;

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> getProducts(
            @RequestParam(defaultValue = "") String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase("asc") 
            ? Sort.by(sortBy).ascending() 
            : Sort.by(sortBy).descending();
        PageRequest pageRequest = PageRequest.of(page, size, sort);
        
        Page<Product> productPage;
        if (q.isEmpty()) {
            productPage = productRepository.findAll(pageRequest);
        } else {
            productPage = productRepository.search(q, pageRequest);
        }
        
        // Force load lazy collections within transaction
        List<ProductDTO> products = productPage.getContent().stream()
            .map(p -> {
                // Initialize lazy collections
                p.getVariants().size();
                p.getImages().size();
                return ProductDTO.fromEntity(p);
            })
            .collect(Collectors.toList());
        
        Map<String, Object> response = new HashMap<>();
        response.put("products", products);
        response.put("currentPage", productPage.getNumber());
        response.put("totalItems", productPage.getTotalElements());
        response.put("totalPages", productPage.getTotalPages());
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public ResponseEntity<ProductDTO> getProduct(@PathVariable Long id) {
        return productRepository.findById(id)
            .map(p -> {
                p.getVariants().size();
                p.getImages().size();
                return ProductDTO.fromEntity(p);
            })
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/sku/{sku}")
    @Transactional(readOnly = true)
    public ResponseEntity<ProductDTO> getProductBySku(@PathVariable String sku) {
        return productRepository.findBySku(sku)
            .map(p -> {
                p.getVariants().size();
                p.getImages().size();
                return ProductDTO.fromEntity(p);
            })
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ProductDTO> createProduct(@RequestBody ProductDTO dto) {
        Product product = new Product();
        updateProductFromDTO(product, dto);
        product.setCreatedAt(LocalDateTime.now());
        Product saved = productRepository.save(product);
        return ResponseEntity.ok(ProductDTO.fromEntity(saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductDTO> updateProduct(@PathVariable Long id, @RequestBody ProductDTO dto) {
        return productRepository.findById(id)
            .map(product -> {
                updateProductFromDTO(product, dto);
                product.setUpdatedAt(LocalDateTime.now());
                Product saved = productRepository.save(product);
                return ResponseEntity.ok(ProductDTO.fromEntity(saved));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        if (productRepository.existsById(id)) {
            productRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PatchMapping("/{id}/stock")
    public ResponseEntity<ProductDTO> updateStock(
            @PathVariable Long id,
            @RequestParam Long variantId,
            @RequestParam int quantity) {
        return variantRepository.findById(variantId)
            .map(variant -> {
                variant.setStockQuantity(Math.max(0, variant.getStockQuantity() + quantity));
                variantRepository.save(variant);
                return productRepository.findById(id)
                    .map(ProductDTO::fromEntity)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/primary-image")
    @Transactional
    public ResponseEntity<ProductDTO> setPrimaryImage(
            @PathVariable Long id,
            @RequestParam Long imageId) {
        return productRepository.findById(id)
            .map(product -> {
                // Clear all primary flags for this product
                imageRepository.clearPrimaryByProductId(id);
                // Set the new primary image
                imageRepository.setPrimaryById(imageId);
                // Reload and return
                product.getImages().size(); // Force load
                return ResponseEntity.ok(ProductDTO.fromEntity(product));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/featured")
    @Transactional(readOnly = true)
    public ResponseEntity<List<ProductDTO>> getFeatured() {
        List<ProductDTO> products = productRepository.findFeatured().stream()
            .map(p -> {
                p.getVariants().size();
                p.getImages().size();
                return ProductDTO.fromEntity(p);
            })
            .collect(Collectors.toList());
        return ResponseEntity.ok(products);
    }

    @GetMapping("/new")
    @Transactional(readOnly = true)
    public ResponseEntity<List<ProductDTO>> getNewArrivals() {
        List<ProductDTO> products = productRepository.findNewArrivals().stream()
            .map(p -> {
                p.getVariants().size();
                p.getImages().size();
                return ProductDTO.fromEntity(p);
            })
            .collect(Collectors.toList());
        return ResponseEntity.ok(products);
    }

    @GetMapping("/top-selling")
    @Transactional(readOnly = true)
    public ResponseEntity<List<ProductDTO>> getTopSelling(@RequestParam(defaultValue = "10") int limit) {
        List<ProductDTO> products = productRepository.findTopSelling(PageRequest.of(0, limit)).stream()
            .map(p -> {
                p.getVariants().size();
                p.getImages().size();
                return ProductDTO.fromEntity(p);
            })
            .collect(Collectors.toList());
        return ResponseEntity.ok(products);
    }

    private void updateProductFromDTO(Product product, ProductDTO dto) {
        product.setSku(dto.getSku());
        product.setName(dto.getName());
        product.setSlug(dto.getSlug() != null ? dto.getSlug() : dto.getSku().toLowerCase());
        product.setBasePrice(dto.getBasePrice());
        product.setSalePrice(dto.getSalePrice());
        product.setDescription(dto.getDescription());
        product.setShortDescription(dto.getShortDescription());
        product.setMaterial(dto.getMaterial());
        product.setStatus(dto.getStatus() != null ? dto.getStatus() : "ACTIVE");
        product.setIsFeatured(dto.getIsFeatured() != null ? dto.getIsFeatured() : false);
        product.setIsNew(dto.getIsNew() != null ? dto.getIsNew() : false);
        
        if (dto.getCategoryId() != null) {
            categoryRepository.findById(dto.getCategoryId())
                .ifPresent(product::setCategory);
        }
        if (dto.getBrandId() != null) {
            brandRepository.findById(dto.getBrandId())
                .ifPresent(product::setBrand);
        }
    }
}
