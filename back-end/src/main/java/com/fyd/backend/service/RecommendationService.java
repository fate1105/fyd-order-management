package com.fyd.backend.service;

import com.fyd.backend.entity.Product;
import com.fyd.backend.entity.Order;
import com.fyd.backend.entity.OrderItem;
import com.fyd.backend.repository.ProductRepository;
import com.fyd.backend.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for AI-powered product recommendations.
 * Uses content-based filtering (similar products by category) and 
 * collaborative filtering (products frequently bought together).
 */
@Service
public class RecommendationService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderRepository orderRepository;

    /**
     * Get products similar to the given product (content-based filtering).
     * Returns products in the same category, sorted by popularity.
     *
     * @param productId The product to find similar products for
     * @param limit Maximum number of recommendations
     * @return List of similar products
     */
    public List<Product> getSimilarProducts(Long productId, int limit) {
        Optional<Product> productOpt = productRepository.findById(productId);
        if (productOpt.isEmpty()) {
            return Collections.emptyList();
        }

        Product product = productOpt.get();
        Long categoryId = product.getCategory() != null ? product.getCategory().getId() : null;

        if (categoryId == null) {
            // If no category, return popular products
            return getPopularProducts(limit);
        }

        // Find products in the same category, excluding the current product
        List<Product> similar = productRepository.findByCategory(categoryId)
                .stream()
                .filter(p -> !p.getId().equals(productId) && "ACTIVE".equals(p.getStatus()))
                .sorted((a, b) -> {
                    // Sort by sold count (popularity)
                    Integer soldA = a.getSoldCount() != null ? a.getSoldCount() : 0;
                    Integer soldB = b.getSoldCount() != null ? b.getSoldCount() : 0;
                    return soldB.compareTo(soldA);
                })
                .limit(limit)
                .collect(Collectors.toList());

        // If not enough products in category, fill with popular products
        if (similar.size() < limit) {
            Set<Long> existingIds = similar.stream().map(Product::getId).collect(Collectors.toSet());
            existingIds.add(productId);
            
            List<Product> popular = getPopularProducts(limit - similar.size() + 1)
                    .stream()
                    .filter(p -> !existingIds.contains(p.getId()))
                    .limit(limit - similar.size())
                    .collect(Collectors.toList());
            
            similar.addAll(popular);
        }

        return similar;
    }

    /**
     * Get products frequently bought together (collaborative filtering).
     * Analyzes order history to find products commonly purchased with the given product.
     *
     * @param productId The product to find related products for
     * @param limit Maximum number of recommendations
     * @return List of frequently bought together products
     */
    public List<Product> getFrequentlyBoughtTogether(Long productId, int limit) {
        // Find all orders containing this product
        List<Order> ordersWithProduct = orderRepository.findAll()
                .stream()
                .filter(order -> order.getItems() != null && 
                        order.getItems().stream().anyMatch(item -> 
                                item.getProduct() != null && 
                                item.getProduct().getId().equals(productId)))
                .collect(Collectors.toList());

        if (ordersWithProduct.isEmpty()) {
            return getSimilarProducts(productId, limit);
        }

        // Count co-occurrences of other products
        Map<Long, Integer> coOccurrenceCount = new HashMap<>();
        for (Order order : ordersWithProduct) {
            for (OrderItem item : order.getItems()) {
                if (item.getProduct() != null && !item.getProduct().getId().equals(productId)) {
                    Long otherProductId = item.getProduct().getId();
                    coOccurrenceCount.merge(otherProductId, 1, Integer::sum);
                }
            }
        }

        // Sort by co-occurrence count and get top products
        List<Long> topProductIds = coOccurrenceCount.entrySet()
                .stream()
                .sorted(Map.Entry.<Long, Integer>comparingByValue().reversed())
                .limit(limit)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());

        // Fetch and return products
        return topProductIds.stream()
                .map(id -> productRepository.findById(id).orElse(null))
                .filter(p -> p != null && "ACTIVE".equals(p.getStatus()))
                .collect(Collectors.toList());
    }

    /**
     * Get popular products across the store.
     * Sorted by sold count and view count.
     *
     * @param limit Maximum number of products
     * @return List of popular products
     */
    public List<Product> getPopularProducts(int limit) {
        return productRepository.findAllActive()
                .stream()
                .sorted((a, b) -> {
                    // Primary: sold count
                    Integer soldA = a.getSoldCount() != null ? a.getSoldCount() : 0;
                    Integer soldB = b.getSoldCount() != null ? b.getSoldCount() : 0;
                    int soldCompare = soldB.compareTo(soldA);
                    if (soldCompare != 0) return soldCompare;
                    
                    // Secondary: view count
                    Integer viewsA = a.getViewCount() != null ? a.getViewCount() : 0;
                    Integer viewsB = b.getViewCount() != null ? b.getViewCount() : 0;
                    return viewsB.compareTo(viewsA);
                })
                .limit(limit)
                .collect(Collectors.toList());
    }

    /**
     * Get personalized recommendations for a customer based on their purchase history.
     *
     * @param customerId The customer ID
     * @param limit Maximum number of recommendations
     * @return List of recommended products
     */
    public List<Product> getPersonalizedRecommendations(Long customerId, int limit) {
        // Get customer's purchase history
        List<Order> customerOrders = orderRepository.findByCustomerId(customerId);
        
        if (customerOrders.isEmpty()) {
            // New customer - return popular products
            return getPopularProducts(limit);
        }

        // Get categories the customer has purchased from
        Set<Long> purchasedCategoryIds = customerOrders.stream()
                .flatMap(order -> order.getItems() != null ? order.getItems().stream() : java.util.stream.Stream.empty())
                .filter(item -> item.getProduct() != null && item.getProduct().getCategory() != null)
                .map(item -> item.getProduct().getCategory().getId())
                .collect(Collectors.toSet());

        // Get products the customer has already purchased
        Set<Long> purchasedProductIds = customerOrders.stream()
                .flatMap(order -> order.getItems() != null ? order.getItems().stream() : java.util.stream.Stream.empty())
                .filter(item -> item.getProduct() != null)
                .map(item -> item.getProduct().getId())
                .collect(Collectors.toSet());

        // Recommend products from preferred categories that haven't been purchased
        List<Product> recommendations = purchasedCategoryIds.stream()
                .flatMap(catId -> productRepository.findByCategory(catId).stream())
                .filter(p -> !purchasedProductIds.contains(p.getId()) && "ACTIVE".equals(p.getStatus()))
                .sorted((a, b) -> {
                    Integer soldA = a.getSoldCount() != null ? a.getSoldCount() : 0;
                    Integer soldB = b.getSoldCount() != null ? b.getSoldCount() : 0;
                    return soldB.compareTo(soldA);
                })
                .limit(limit)
                .collect(Collectors.toList());

        // Fill with popular products if needed
        if (recommendations.size() < limit) {
            Set<Long> existingIds = recommendations.stream().map(Product::getId).collect(Collectors.toSet());
            existingIds.addAll(purchasedProductIds);
            
            List<Product> popular = getPopularProducts(limit - recommendations.size() + 5)
                    .stream()
                    .filter(p -> !existingIds.contains(p.getId()))
                    .limit(limit - recommendations.size())
                    .collect(Collectors.toList());
            
            recommendations.addAll(popular);
        }

        return recommendations;
    }

    /**
     * Get "Customers also viewed" products based on browsing patterns.
     * For simplicity, returns similar products from the same category.
     *
     * @param productId The currently viewed product
     * @param limit Maximum number of products
     * @return List of products others viewed
     */
    public List<Product> getCustomersAlsoViewed(Long productId, int limit) {
        // For now, this is same as similar products
        // In a real implementation, this would use browsing session data
        return getSimilarProducts(productId, limit);
    }
}
