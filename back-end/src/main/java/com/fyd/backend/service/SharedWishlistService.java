package com.fyd.backend.service;

import com.fyd.backend.dto.SharedWishlistDTO;
import com.fyd.backend.entity.Product;
import com.fyd.backend.entity.ProductImage;
import com.fyd.backend.entity.ProductVariant;
import com.fyd.backend.entity.SharedWishlist;
import com.fyd.backend.repository.ProductRepository;
import com.fyd.backend.repository.SharedWishlistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class SharedWishlistService {

    @Autowired
    private SharedWishlistRepository sharedWishlistRepository;

    @Autowired
    private ProductRepository productRepository;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Transactional
    public SharedWishlistDTO.ShareResponse createShareLink(SharedWishlistDTO.CreateRequest request) {
        if (request.getProductIds() == null || request.getProductIds().isEmpty()) {
            throw new IllegalArgumentException("Product IDs cannot be empty");
        }

        // Generate unique share code
        String shareCode = UUID.randomUUID().toString().substring(0, 8);

        // Convert product IDs to comma-separated string
        String productIdsStr = request.getProductIds().stream()
                .map(String::valueOf)
                .collect(Collectors.joining(","));

        SharedWishlist wishlist = new SharedWishlist();
        wishlist.setShareCode(shareCode);
        wishlist.setProductIds(productIdsStr);
        wishlist.setOwnerName(request.getOwnerName());

        sharedWishlistRepository.save(wishlist);

        String shareUrl = frontendUrl + "/shop/wishlist/" + shareCode;
        return new SharedWishlistDTO.ShareResponse(shareCode, shareUrl);
    }

    @Transactional
    public SharedWishlistDTO.ViewResponse getSharedWishlist(String shareCode) {
        SharedWishlist wishlist = sharedWishlistRepository.findByShareCode(shareCode)
                .orElseThrow(() -> new RuntimeException("Shared wishlist not found or expired"));

        // Increment view count
        wishlist.setViewCount(wishlist.getViewCount() + 1);
        sharedWishlistRepository.save(wishlist);

        // Parse product IDs
        List<Long> productIds = Arrays.stream(wishlist.getProductIds().split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .map(Long::parseLong)
                .collect(Collectors.toList());

        // Fetch products
        List<Product> products = productRepository.findAllById(productIds);

        // Convert to ProductSummary
        List<SharedWishlistDTO.ProductSummary> productSummaries = products.stream()
                .map(this::toProductSummary)
                .collect(Collectors.toList());

        SharedWishlistDTO.ViewResponse response = new SharedWishlistDTO.ViewResponse();
        response.setShareCode(shareCode);
        response.setOwnerName(wishlist.getOwnerName());
        response.setProducts(productSummaries);
        response.setViewCount(wishlist.getViewCount());

        return response;
    }

    private SharedWishlistDTO.ProductSummary toProductSummary(Product product) {
        SharedWishlistDTO.ProductSummary summary = new SharedWishlistDTO.ProductSummary();
        summary.setId(product.getId());
        summary.setName(product.getName());
        summary.setSlug(product.getSlug());
        summary.setBasePrice(product.getBasePrice());
        summary.setSalePrice(product.getSalePrice());

        if (product.getCategory() != null) {
            summary.setCategoryName(product.getCategory().getName());
        }

        // Get thumbnail
        List<ProductImage> images = product.getImages();
        if (images != null && !images.isEmpty()) {
            ProductImage thumbnail = images.stream()
                    .filter(img -> Boolean.TRUE.equals(img.getIsPrimary()))
                    .findFirst()
                    .orElse(images.get(0));
            summary.setThumbnail(thumbnail.getImageUrl());
        }

        // Calculate total stock
        int totalStock = 0;
        if (product.getVariants() != null) {
            totalStock = product.getVariants().stream()
                    .mapToInt(v -> v.getStockQuantity() != null ? v.getStockQuantity() : 0)
                    .sum();
        }
        summary.setTotalStock(totalStock);

        return summary;
    }
}
