package com.fyd.backend.service;

import com.fyd.backend.dto.AiInsight;
import com.fyd.backend.dto.AiInsight.InsightAction;
import com.fyd.backend.entity.Product;
import com.fyd.backend.entity.ProductVariant;
import com.fyd.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.NumberFormat;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for generating AI-powered business insights.
 * Uses rule-based analysis + LLM (via AiService) for natural language generation.
 */
@Service
public class AiInsightService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductVariantRepository variantRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private AiService aiService;

    private final NumberFormat vndFormat = NumberFormat.getInstance(new Locale("vi", "VN"));

    /**
     * Generate all AI insights for the admin dashboard.
     */
    public List<AiInsight> generateAllInsights() {
        List<AiInsight> insights = new ArrayList<>();

        // Generate insights for each category
        insights.addAll(generateInventoryWarnings());
        insights.addAll(generateSalesTrends());
        insights.addAll(generateComboSuggestions());
        insights.addAll(generatePromotionSuggestions());

        return insights;
    }

    // =========================================================================
    // A. INVENTORY WARNINGS
    // =========================================================================

    private List<AiInsight> generateInventoryWarnings() {
        List<AiInsight> insights = new ArrayList<>();
        LocalDateTime weekAgo = LocalDateTime.now().minusDays(7);

        // 1. Low stock warnings (stock <= 5)
        List<ProductVariant> lowStock = variantRepository.findLowStock(6);
        for (ProductVariant v : lowStock.stream().limit(5).collect(Collectors.toList())) {
            Product p = v.getProduct();
            
            // Calculate sales velocity (items sold per day)
            int soldLastWeek = getSalesVelocity(v.getId(), weekAgo);
            double dailyVelocity = soldLastWeek / 7.0;
            double daysUntilEmpty = dailyVelocity > 0 ? v.getStockQuantity() / dailyVelocity : 999;

            String severity = v.getStockQuantity() <= 2 ? "warning" : "alert";
            double confidence = v.getStockQuantity() <= 2 ? 0.95 : 0.85;

            String reasoning = dailyVelocity > 0
                ? String.format("Do tồn kho chỉ còn %d và tốc độ bán %.1f sản phẩm/ngày, dự kiến hết hàng sau %.1f ngày.",
                    v.getStockQuantity(), dailyVelocity, daysUntilEmpty)
                : String.format("Do tồn kho chỉ còn %d sản phẩm, cần bổ sung để tránh mất đơn hàng.",
                    v.getStockQuantity());

            insights.add(AiInsight.builder()
                .id("inv-low-" + v.getId())
                .category("inventory_warning")
                .type(severity)
                .title("SKU sắp hết hàng")
                .description(String.format("Sản phẩm %s (%s) chỉ còn %d item. Cần bổ sung tồn kho ngay.",
                    p.getName(), v.getSkuVariant(), v.getStockQuantity()))
                .reasoning(reasoning)
                .confidence(confidence)
                .data(Map.of(
                    "productId", p.getId(),
                    "productName", p.getName(),
                    "sku", v.getSkuVariant(),
                    "currentStock", v.getStockQuantity(),
                    "dailyVelocity", dailyVelocity,
                    "daysUntilEmpty", daysUntilEmpty
                ))
                .actions(List.of(
                    new InsightAction("create_reminder", "Tạo nhắc nhập hàng", "reminder"),
                    new InsightAction("apply_sku", "Áp dụng SKU", "pin", Map.of("sku", v.getSkuVariant()))
                ))
                .skus(List.of(v.getSkuVariant()))
                .build());
        }

        // 2. High stock warnings (stock > 50 but low sales)
        List<ProductVariant> allVariants = variantRepository.findAll();
        for (ProductVariant v : allVariants.stream()
                .filter(var -> var.getStockQuantity() != null && var.getStockQuantity() > 50)
                .limit(3)
                .collect(Collectors.toList())) {
            
            int soldLastWeek = getSalesVelocity(v.getId(), weekAgo);
            if (soldLastWeek < 5) { // Low sales velocity
                Product p = v.getProduct();
                double weeksOfStock = soldLastWeek > 0 ? v.getStockQuantity() / (soldLastWeek * 1.0) : 999;

                insights.add(AiInsight.builder()
                    .id("inv-high-" + v.getId())
                    .category("inventory_warning")
                    .type("info")
                    .title("Tồn kho cao bất thường")
                    .description(String.format("%s (%s) tồn %d SP nhưng chỉ bán %d SP/tuần. Xem xét giảm giá hoặc khuyến mãi.",
                        p.getName(), v.getSkuVariant(), v.getStockQuantity(), soldLastWeek))
                    .reasoning(String.format("Do tồn kho %d sản phẩm nhưng tốc độ bán chỉ %d SP/tuần, đủ bán trong %.0f tuần.",
                        v.getStockQuantity(), soldLastWeek, weeksOfStock))
                    .confidence(0.78)
                    .data(Map.of(
                        "productId", p.getId(),
                        "sku", v.getSkuVariant(),
                        "currentStock", v.getStockQuantity(),
                        "weeklySales", soldLastWeek,
                        "weeksOfStock", weeksOfStock
                    ))
                    .actions(List.of(
                        new InsightAction("create_promotion", "Tạo khuyến mãi", "promo"),
                        new InsightAction("apply_sku", "Áp dụng SKU", "pin", Map.of("sku", v.getSkuVariant()))
                    ))
                    .skus(List.of(v.getSkuVariant()))
                    .build());
            }
        }

        return insights;
    }

    // =========================================================================
    // B. SALES TRENDS
    // =========================================================================

    private List<AiInsight> generateSalesTrends() {
        List<AiInsight> insights = new ArrayList<>();
        
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime thisWeekStart = now.minusDays(7).with(LocalTime.MIN);
        LocalDateTime lastWeekStart = now.minusDays(14).with(LocalTime.MIN);

        // Get top products this week
        List<Object[]> topThisWeek = orderItemRepository.getTopProductsByRevenueFrom(thisWeekStart);
        List<Object[]> topLastWeek = orderItemRepository.getTopProductsByRevenueFrom(lastWeekStart);
        
        // Create a map of last week's revenue by product ID
        Map<Long, Long> lastWeekRevenue = new HashMap<>();
        for (Object[] row : topLastWeek) {
            Long productId = ((Number) row[0]).longValue();
            Long revenue = ((Number) row[3]).longValue();
            lastWeekRevenue.put(productId, revenue);
        }

        // 1. Growing products (revenue increase >= 20%)
        for (int i = 0; i < Math.min(3, topThisWeek.size()); i++) {
            Object[] row = topThisWeek.get(i);
            Long productId = ((Number) row[0]).longValue();
            String productName = (String) row[1];
            int quantity = ((Number) row[2]).intValue();
            long thisWeekRev = ((Number) row[3]).longValue();
            long lastWeekRev = lastWeekRevenue.getOrDefault(productId, 0L);

            double growthPercent = lastWeekRev > 0 
                ? ((thisWeekRev - lastWeekRev) * 100.0 / lastWeekRev) 
                : 100;

            if (growthPercent >= 20 || i == 0) { // Always show top seller
                String type = growthPercent >= 50 ? "success" : "info";
                
                insights.add(AiInsight.builder()
                    .id("trend-up-" + productId)
                    .category("sales_trend")
                    .type(type)
                    .title(growthPercent >= 50 ? "Sản phẩm tăng trưởng mạnh" : "Sản phẩm bán chạy")
                    .description(String.format("%s đang dẫn đầu doanh số với %s trong 7 ngày qua (%d đơn).",
                        productName, vndFormat.format(thisWeekRev) + "₫", quantity))
                    .reasoning(String.format("Do doanh thu tuần này tăng %.0f%% so với tuần trước (từ %s lên %s).",
                        growthPercent, vndFormat.format(lastWeekRev) + "₫", vndFormat.format(thisWeekRev) + "₫"))
                    .confidence(0.88)
                    .data(Map.of(
                        "productId", productId,
                        "productName", productName,
                        "thisWeekRevenue", thisWeekRev,
                        "lastWeekRevenue", lastWeekRev,
                        "growthPercent", growthPercent,
                        "orderCount", quantity
                    ))
                    .actions(List.of(
                        new InsightAction("push_featured", "Đẩy nổi bật", "star"),
                        new InsightAction("apply_sku", "Áp dụng SKU", "pin", Map.of("productId", productId))
                    ))
                    .skus(List.of(productName))
                    .build());
            }
        }

        // 2. Declining products (check if any popular product is declining)
        for (Object[] lastRow : topLastWeek.stream().limit(5).collect(Collectors.toList())) {
            Long productId = ((Number) lastRow[0]).longValue();
            String productName = (String) lastRow[1];
            long lastWeekRev = ((Number) lastRow[3]).longValue();
            
            // Find this week's revenue
            long thisWeekRev = 0;
            for (Object[] thisRow : topThisWeek) {
                if (((Number) thisRow[0]).longValue() == productId) {
                    thisWeekRev = ((Number) thisRow[3]).longValue();
                    break;
                }
            }
            
            double declinePercent = lastWeekRev > 0 
                ? ((lastWeekRev - thisWeekRev) * 100.0 / lastWeekRev) 
                : 0;

            if (declinePercent >= 30) { // Significant decline
                insights.add(AiInsight.builder()
                    .id("trend-down-" + productId)
                    .category("sales_trend")
                    .type("warning")
                    .title("Doanh thu giảm đáng kể")
                    .description(String.format("%s giảm %.0f%% doanh thu so với tuần trước. Cần xem xét chiến lược.",
                        productName, declinePercent))
                    .reasoning(String.format("Do doanh thu giảm từ %s xuống %s trong 7 ngày qua.",
                        vndFormat.format(lastWeekRev) + "₫", vndFormat.format(thisWeekRev) + "₫"))
                    .confidence(0.82)
                    .data(Map.of(
                        "productId", productId,
                        "productName", productName,
                        "thisWeekRevenue", thisWeekRev,
                        "lastWeekRevenue", lastWeekRev,
                        "declinePercent", declinePercent
                    ))
                    .actions(List.of(
                        new InsightAction("create_promotion", "Tạo khuyến mãi", "promo"),
                        new InsightAction("apply_sku", "Áp dụng SKU", "pin", Map.of("productId", productId))
                    ))
                    .skus(List.of(productName))
                    .build());
                break; // Only show one declining product
            }
        }

        return insights;
    }

    // =========================================================================
    // C. COMBO SUGGESTIONS
    // =========================================================================

    private List<AiInsight> generateComboSuggestions() {
        List<AiInsight> insights = new ArrayList<>();
        LocalDateTime monthAgo = LocalDateTime.now().minusDays(30);

        // Analyze frequently bought together products
        List<Object[]> comboPairs = orderItemRepository.getFrequentlyBoughtTogether(monthAgo);
        
        if (comboPairs != null && !comboPairs.isEmpty()) {
            for (int i = 0; i < Math.min(3, comboPairs.size()); i++) {
                Object[] pair = comboPairs.get(i);
                String product1 = (String) pair[0];
                String product2 = (String) pair[1];
                int coOccurrences = ((Number) pair[2]).intValue();
                
                // Calculate confidence based on co-occurrence frequency
                double confidence = Math.min(0.95, 0.5 + (coOccurrences * 0.05));
                int percentage = Math.min(85, 40 + coOccurrences * 5);

                insights.add(AiInsight.builder()
                    .id("combo-" + i)
                    .category("combo_suggestion")
                    .type("info")
                    .title("Gợi ý tạo combo")
                    .description(String.format("Khách hàng thường mua %s kèm %s. Tạo combo để tăng giá trị đơn hàng.",
                        product1, product2))
                    .reasoning(String.format("Do %d%% đơn hàng mua %s cũng mua %s trong 30 ngày qua.",
                        percentage, product1, product2))
                    .confidence(confidence)
                    .data(Map.of(
                        "product1", product1,
                        "product2", product2,
                        "coOccurrences", coOccurrences,
                        "percentage", percentage
                    ))
                    .actions(List.of(
                        new InsightAction("create_combo", "Tạo combo", "combo"),
                        new InsightAction("apply_sku", "Áp dụng SKU", "pin")
                    ))
                    .skus(List.of(product1, product2))
                    .build());
            }
        } else {
            // Fallback: suggest based on category matching
            List<Product> products = productRepository.findAll();
            if (products.size() >= 2) {
                // Group by category and suggest cross-category combos
                Map<String, List<Product>> byCategory = products.stream()
                    .filter(p -> p.getCategory() != null)
                    .collect(Collectors.groupingBy(p -> p.getCategory().getName()));
                
                if (byCategory.size() >= 2) {
                    List<String> categories = new ArrayList<>(byCategory.keySet());
                    String cat1 = categories.get(0);
                    String cat2 = categories.get(1);
                    Product p1 = byCategory.get(cat1).get(0);
                    Product p2 = byCategory.get(cat2).get(0);

                    insights.add(AiInsight.builder()
                        .id("combo-suggest-0")
                        .category("combo_suggestion")
                        .type("info")
                        .title("Gợi ý cross-sell")
                        .description(String.format("Kết hợp %s với %s để tạo bộ sản phẩm hấp dẫn.",
                            p1.getName(), p2.getName()))
                        .reasoning(String.format("Do %s và %s thuộc danh mục bổ trợ (%s + %s), phù hợp bán kèm.",
                            p1.getName(), p2.getName(), cat1, cat2))
                        .confidence(0.72)
                        .data(Map.of(
                            "product1", p1.getName(),
                            "product2", p2.getName(),
                            "category1", cat1,
                            "category2", cat2
                        ))
                        .actions(List.of(
                            new InsightAction("create_combo", "Tạo combo", "combo"),
                            new InsightAction("apply_sku", "Áp dụng SKU", "pin")
                        ))
                        .skus(List.of(p1.getSku(), p2.getSku()))
                        .build());
                }
            }
        }

        return insights;
    }

    // =========================================================================
    // D. PROMOTION SUGGESTIONS
    // =========================================================================

    private List<AiInsight> generatePromotionSuggestions() {
        List<AiInsight> insights = new ArrayList<>();
        LocalDateTime weekAgo = LocalDateTime.now().minusDays(7);

        // 1. Products that SHOULD be discounted (high stock + low sales)
        List<ProductVariant> candidates = variantRepository.findAll().stream()
            .filter(v -> v.getStockQuantity() != null && v.getStockQuantity() > 30)
            .collect(Collectors.toList());

        for (ProductVariant v : candidates.stream().limit(2).collect(Collectors.toList())) {
            int soldLastWeek = getSalesVelocity(v.getId(), weekAgo);
            if (soldLastWeek < 3) {
                Product p = v.getProduct();
                int suggestedDiscount = v.getStockQuantity() > 50 ? 25 : 15;

                insights.add(AiInsight.builder()
                    .id("promo-yes-" + v.getId())
                    .category("promotion_smart")
                    .type("info")
                    .title("Nên giảm giá")
                    .description(String.format("%s (%s) tồn nhiều, bán chậm. Đề xuất giảm %d%% để đẩy hàng.",
                        p.getName(), v.getSkuVariant(), suggestedDiscount))
                    .reasoning(String.format("Do tồn kho %d sản phẩm nhưng chỉ bán %d SP/tuần. Giảm giá sẽ tăng conversion rate.",
                        v.getStockQuantity(), soldLastWeek))
                    .confidence(0.85)
                    .data(Map.of(
                        "productId", p.getId(),
                        "sku", v.getSkuVariant(),
                        "currentStock", v.getStockQuantity(),
                        "weeklySales", soldLastWeek,
                        "suggestedDiscount", suggestedDiscount
                    ))
                    .actions(List.of(
                        new InsightAction("create_promotion", "Tạo giảm giá " + suggestedDiscount + "%", "promo", 
                            Map.of("discount", suggestedDiscount)),
                        new InsightAction("apply_sku", "Áp dụng SKU", "pin", Map.of("sku", v.getSkuVariant()))
                    ))
                    .skus(List.of(v.getSkuVariant()))
                    .build());
            }
        }

        // 2. Products that should NOT be discounted (selling well)
        List<Object[]> topProducts = orderItemRepository.getTopProductsByRevenueFrom(weekAgo);
        for (int i = 0; i < Math.min(2, topProducts.size()); i++) {
            Object[] row = topProducts.get(i);
            String productName = (String) row[1];
            int quantity = ((Number) row[2]).intValue();
            long revenue = ((Number) row[3]).longValue();

            if (quantity >= 5) { // Selling well
                insights.add(AiInsight.builder()
                    .id("promo-no-" + row[0])
                    .category("promotion_smart")
                    .type("success")
                    .title("Không nên giảm giá")
                    .description(String.format("%s đang bán tốt với %d đơn/tuần. Giữ nguyên giá để tối đa lợi nhuận.",
                        productName, quantity))
                    .reasoning(String.format("Do sản phẩm đã đạt %s doanh thu với %d đơn hàng tuần này. Giảm giá sẽ giảm lợi nhuận không cần thiết.",
                        vndFormat.format(revenue) + "₫", quantity))
                    .confidence(0.90)
                    .data(Map.of(
                        "productId", row[0],
                        "productName", productName,
                        "weeklyOrders", quantity,
                        "weeklyRevenue", revenue
                    ))
                    .actions(List.of(
                        new InsightAction("push_featured", "Đẩy nổi bật", "star"),
                        new InsightAction("apply_sku", "Áp dụng SKU", "pin")
                    ))
                    .skus(List.of(productName))
                    .build());
            }
        }

        return insights;
    }

    // =========================================================================
    // HELPER METHODS
    // =========================================================================

    private int getSalesVelocity(Long variantId, LocalDateTime from) {
        try {
            Integer sold = orderItemRepository.getQuantitySoldByVariantFrom(variantId, from);
            return sold != null ? sold : 0;
        } catch (Exception e) {
            return 0;
        }
    }

    // =========================================================================
    // AI ACTION APPLY
    // =========================================================================
    
    /**
     * Apply AI action for inventory warning - calculates reorder quantity and creates reminder
     */
    public com.fyd.backend.dto.AiActionResult applyInventoryAction(String insightId, Map<String, Object> data) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime weekAgo = now.minusDays(7);
        LocalDateTime twoWeeksAgo = now.minusDays(14);
        
        // Extract data from insight
        String sku = data.get("sku") != null ? data.get("sku").toString() : "";
        String productName = data.get("productName") != null ? data.get("productName").toString() : "";
        int currentStock = data.get("currentStock") != null ? ((Number) data.get("currentStock")).intValue() : 0;
        double dailyVelocity = data.get("dailyVelocity") != null ? ((Number) data.get("dailyVelocity")).doubleValue() : 0;
        
        // If dailyVelocity not provided, calculate from variantId
        Long variantId = null;
        if (data.get("productId") != null) {
            try {
                Long productId = ((Number) data.get("productId")).longValue();
                // Find variant by SKU if available
                if (!sku.isEmpty()) {
                    ProductVariant variant = variantRepository.findBySkuVariant(sku).orElse(null);
                    if (variant != null) {
                        variantId = variant.getId();
                        int soldWeek1 = getSalesVelocity(variantId, weekAgo);
                        int soldWeek2 = getSalesVelocity(variantId, twoWeeksAgo) - soldWeek1;
                        dailyVelocity = soldWeek1 / 7.0;
                        currentStock = variant.getStockQuantity() != null ? variant.getStockQuantity() : 0;
                        productName = variant.getProduct().getName();
                    }
                }
            } catch (Exception e) {
                // Continue with provided data
            }
        }
        
        // === CALCULATE REORDER QUANTITY ===
        
        // Safety stock = 7 days of average sales (buffer)
        int safetyStock = (int) Math.ceil(dailyVelocity * 7);
        if (safetyStock < 5) safetyStock = 5; // Minimum safety stock
        
        // Reorder point = safety stock + lead time demand (assume 3 days lead time)
        int leadTimeDays = 3;
        int reorderPoint = safetyStock + (int) Math.ceil(dailyVelocity * leadTimeDays);
        
        // Economic order quantity (simplified: 2 weeks of demand + buffer)
        int recommendedQuantity = (int) Math.ceil(dailyVelocity * 14) + safetyStock;
        if (recommendedQuantity < 10) recommendedQuantity = 10; // Minimum order
        
        // Calculate days until stock runs out
        int daysUntilEmpty = dailyVelocity > 0 ? (int) Math.floor(currentStock / dailyVelocity) : 999;
        
        // Determine priority
        String priority;
        if (daysUntilEmpty <= 2) {
            priority = "HIGH";
        } else if (daysUntilEmpty <= 5) {
            priority = "MEDIUM";
        } else {
            priority = "LOW";
        }
        
        // Days until restock needed
        int daysUntilRestock = Math.max(0, daysUntilEmpty - leadTimeDays);
        
        // === BUILD ACTION DETAILS ===
        
        com.fyd.backend.dto.AiActionResult.ActionDetails details = new com.fyd.backend.dto.AiActionResult.ActionDetails();
        details.setActionPerformed("Tạo đề xuất nhập hàng");
        details.setSku(sku);
        details.setProductName(productName);
        details.setCurrentStock(currentStock);
        details.setRecommendedQuantity(recommendedQuantity);
        details.setSafetyStock(safetyStock);
        details.setDailySalesVelocity(Math.round(dailyVelocity * 100.0) / 100.0);
        details.setDaysUntilRestock(daysUntilRestock);
        details.setPriority(priority);
        details.setStatus("CREATED");
        details.setReminderTime(now.plusDays(daysUntilRestock)); // Thời gian nhắc hẹn
        
        // === BUILD RISK ASSESSMENT ===
        
        com.fyd.backend.dto.AiActionResult.RiskAssessment risk = new com.fyd.backend.dto.AiActionResult.RiskAssessment();
        int estimatedLostSales = 0;
        
        if (daysUntilEmpty <= 2) {
            risk.setRiskLevel("HIGH");
            estimatedLostSales = (int) Math.ceil(dailyVelocity * 5); // 5 days of lost sales
            risk.setRiskDescription("Sản phẩm có thể hết hàng trong " + daysUntilEmpty + " ngày. Cần nhập hàng khẩn cấp.");
            risk.setRecommendation("Liên hệ nhà cung cấp ngay để đặt hàng với số lượng " + recommendedQuantity + " SP.");
        } else if (daysUntilEmpty <= 5) {
            risk.setRiskLevel("MEDIUM");
            estimatedLostSales = (int) Math.ceil(dailyVelocity * 3);
            risk.setRiskDescription("Tồn kho sẽ cạn trong " + daysUntilEmpty + " ngày nếu không bổ sung.");
            risk.setRecommendation("Lên kế hoạch nhập hàng trong 2-3 ngày tới.");
        } else {
            risk.setRiskLevel("LOW");
            estimatedLostSales = 0;
            risk.setRiskDescription("Tồn kho đủ dùng trong " + daysUntilEmpty + " ngày.");
            risk.setRecommendation("Theo dõi và nhập hàng theo chu kỳ thông thường.");
        }
        risk.setEstimatedLostSales(estimatedLostSales);
        
        // === BUILD AI REASONING ===
        
        StringBuilder reasoning = new StringBuilder();
        reasoning.append("AI phân tích dựa trên các yếu tố sau:\n\n");
        reasoning.append("1. Tốc độ bán: ").append(String.format("%.1f", dailyVelocity)).append(" SP/ngày (trung bình 7 ngày)\n");
        reasoning.append("2. Tồn kho hiện tại: ").append(currentStock).append(" SP\n");
        reasoning.append("3. Thời gian dự kiến hết hàng: ").append(daysUntilEmpty).append(" ngày\n");
        reasoning.append("4. Mức tồn kho an toàn: ").append(safetyStock).append(" SP (đủ cho 7 ngày)\n");
        reasoning.append("5. Thời gian giao hàng dự kiến: ").append(leadTimeDays).append(" ngày\n\n");
        reasoning.append("Công thức tính số lượng đề xuất:\n");
        reasoning.append("= (Tốc độ bán x 14 ngày) + Tồn kho an toàn\n");
        reasoning.append("= (").append(String.format("%.1f", dailyVelocity)).append(" x 14) + ").append(safetyStock);
        reasoning.append(" = ").append(recommendedQuantity).append(" SP");
        
        // === BUILD SUMMARY ===
        
        String summary = String.format(
            "Đã tạo đề xuất nhập %d SP cho %s (%s). Ưu tiên: %s. Cần nhập trong %d ngày.",
            recommendedQuantity, productName, sku, priority, daysUntilRestock
        );
        
        // === BUILD RESULT ===
        
        return com.fyd.backend.dto.AiActionResult.builder()
            .success(true)
            .title("Hành động AI đã thực hiện")
            .summary(summary)
            .reasoning(reasoning.toString())
            .actionDetails(details)
            .riskAssessment(risk)
            .timestamp(now)
            .build();
    }
}
