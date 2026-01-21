package com.fyd.backend.service;

import com.fyd.backend.dto.AiAdminSummary;
import com.fyd.backend.dto.AiChatResponse;
import com.fyd.backend.dto.AiProductResponse;
import com.fyd.backend.dto.AnomalyReport;
import com.fyd.backend.entity.Product;
import com.fyd.backend.entity.ProductVariant;
import com.fyd.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.NumberFormat;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AiService {

    @Value("${groq.api.key}")
    private String apiKey;

    @Value("${groq.api.model}")
    private String model;

    @Value("${groq.api.url}")
    private String apiUrl;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductVariantRepository variantRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    private final WebClient webClient;

    public AiService() {
        this.webClient = WebClient.builder()
                .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(16 * 1024 * 1024))
                .build();
    }

    /**
     * Chat with AI for shop customers - answers questions about products
     */
    public AiChatResponse chatForShop(String userMessage) {
        try {
            // Get product context
            String productContext = buildProductContext();
            
            String systemPrompt = """
                Bạn là trợ lý FYD Shop. Trả lời ngắn gọn.
                
                SẢN PHẨM:
                %s
                
                QUY TẮC BẮT BUỘC:
                1. Khi giới thiệu sản phẩm, PHẢI dùng CHÍNH XÁC format này: PRODUCT[ID|Tên|Giá|Ảnh]
                2. ID là số, Giá là số không có dấu phẩy, Ảnh là URL
                3. VÍ DỤ ĐÚNG: "Dạ có PRODUCT[5|Áo Polo|450000|http://localhost:8080/uploads/polo.jpg] ạ!"
                4. KHÔNG được viết tên sản phẩm ra ngoài format PRODUCT[...]
                5. Mỗi sản phẩm phải nằm trong PRODUCT[...]
                """.formatted(productContext);

            String fullPrompt = systemPrompt + "\n\nKhách: " + userMessage;
            
            return callGroqAPI(fullPrompt);
        } catch (Exception e) {
            return AiChatResponse.error("Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.");
        }
    }

    /**
     * Chat with AI for admin - answers questions about business metrics
     */
    public AiChatResponse chatForAdmin(String userMessage) {
        try {
            String businessContext = buildBusinessContext();
            String productContext = buildProductContextForAdmin();
            
            String systemPrompt = """
                Bạn là trợ lý phân tích kinh doanh cho FYD. Trả lời ngắn gọn, đi thẳng vào vấn đề.
                
                DỮ LIỆU KINH DOANH:
                %s
                
                SẢN PHẨM:
                %s
                
                QUY TẮC TRẢ LỜI:
                - KHÔNG chào hỏi, trả lời thẳng câu hỏi
                - Dựa vào dữ liệu thực tế
                - Đưa con số cụ thể
                - Gợi ý hành động nếu cần
                - Tối đa 3-4 câu
                
                QUY TẮC HIỂN THỊ SẢN PHẨM:
                Khi nhắc đến sản phẩm cụ thể, PHẢI dùng format: PRODUCT[ID|Tên|Giá|Ảnh]
                VÍ DỤ: "Sản phẩm PRODUCT[5|Áo Polo|450000|http://localhost:8080/uploads/polo.jpg] sắp hết"
                """.formatted(businessContext, productContext);

            String fullPrompt = systemPrompt + "\n\nCâu hỏi: " + userMessage;
            
            return callGroqAPI(fullPrompt);
        } catch (Exception e) {
            return AiChatResponse.error("Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.");
        }
    }

    /**
     * Get auto-generated admin summary
     */
    public AiAdminSummary getAdminSummary() {
        AiAdminSummary summary = new AiAdminSummary();
        
        LocalDateTime todayStart = LocalDateTime.now().with(LocalTime.MIN);
        LocalDateTime yesterdayStart = todayStart.minusDays(1);
        
        // Today's revenue
        BigDecimal todayRevenue = orderRepository.getRevenueFrom(todayStart);
        if (todayRevenue == null) todayRevenue = BigDecimal.ZERO;
        summary.setTodayRevenue(todayRevenue);
        
        // Today's orders count
        Long todayOrderCount = orderRepository.countFrom(todayStart);
        summary.setTodayOrders(todayOrderCount != null ? todayOrderCount.intValue() : 0);
        
        // Pending orders
        Long pendingCount = orderRepository.countByStatus("PENDING");
        summary.setPendingOrders(pendingCount != null ? pendingCount.intValue() : 0);
        
        // Revenue change
        BigDecimal yesterdayRevenue = orderRepository.getRevenueBetween(yesterdayStart, todayStart);
        if (yesterdayRevenue == null || yesterdayRevenue.compareTo(BigDecimal.ZERO) == 0) {
            summary.setRevenueChange("N/A");
        } else {
            BigDecimal change = todayRevenue.subtract(yesterdayRevenue)
                .divide(yesterdayRevenue, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100));
            String sign = change.compareTo(BigDecimal.ZERO) >= 0 ? "+" : "";
            summary.setRevenueChange(sign + change.setScale(1, RoundingMode.HALF_UP) + "%");
        }
        
        // Top products (last 7 days)
        LocalDateTime weekAgo = todayStart.minusDays(7);
        List<Object[]> topProducts = orderItemRepository.getTopProductsByRevenueFrom(weekAgo);
        summary.setTopProducts(topProducts.stream()
            .limit(3)
            .map(row -> row[1].toString())
            .collect(Collectors.toList()));
        
        // Low stock alerts
        List<ProductVariant> lowStock = variantRepository.findLowStock(6);
        summary.setInventoryAlerts(lowStock.stream()
            .limit(3)
            .map(v -> v.getProduct().getName() + " (" + v.getSkuVariant() + ") - còn " + v.getStockQuantity())
            .collect(Collectors.toList()));
        
        // Generate AI summary text
        try {
            String summaryPrompt = buildSummaryPrompt(summary);
            AiChatResponse aiResponse = callGroqAPI(summaryPrompt);
            if (aiResponse.isSuccess()) {
                summary.setSummaryText(aiResponse.getReply());
            } else {
                summary.setSummaryText(buildFallbackSummary(summary));
            }
        } catch (Exception e) {
            summary.setSummaryText(buildFallbackSummary(summary));
        }
        
        return summary;
    }

    private String buildProductContext() {
        List<Product> products = productRepository.findAll();
        StringBuilder context = new StringBuilder();
        
        NumberFormat vndFormat = NumberFormat.getInstance(new Locale("vi", "VN"));
        
        for (Product p : products) {
            context.append("- ").append(p.getName());
            context.append(" | ID: ").append(p.getId());
            context.append(" | Giá: ").append(vndFormat.format(p.getBasePrice())).append("đ");
            context.append(" | SKU: ").append(p.getSku());
            
            // Add primary image URL
            if (p.getImages() != null && !p.getImages().isEmpty()) {
                p.getImages().stream()
                    .filter(img -> Boolean.TRUE.equals(img.getIsPrimary()))
                    .findFirst()
                    .ifPresent(img -> context.append(" | Ảnh: ").append(img.getImageUrl()));
            }
            
            if (p.getVariants() != null && !p.getVariants().isEmpty()) {
                List<String> variants = p.getVariants().stream()
                    .filter(v -> v.getStockQuantity() > 0)
                    .map(v -> v.getSize() + "/" + v.getColor() + "(còn " + v.getStockQuantity() + ")")
                    .limit(5)
                    .collect(Collectors.toList());
                if (!variants.isEmpty()) {
                    context.append(" | Có sẵn: ").append(String.join(", ", variants));
                }
            }
            context.append("\n");
            
            if (context.length() > 5000) break; // Increase limit for images
        }
        
        return context.toString();
    }

    private String buildProductContextForAdmin() {
        List<Product> products = productRepository.findAll();
        StringBuilder context = new StringBuilder();
        
        for (Product p : products) {
            context.append("- ID: ").append(p.getId());
            context.append(" | ").append(p.getName());
            context.append(" | Giá: ").append(p.getBasePrice().intValue());
            context.append(" | SKU: ").append(p.getSku());
            
            // Add primary image URL
            if (p.getImages() != null && !p.getImages().isEmpty()) {
                p.getImages().stream()
                    .filter(img -> Boolean.TRUE.equals(img.getIsPrimary()))
                    .findFirst()
                    .or(() -> p.getImages().stream().findFirst())
                    .ifPresent(img -> context.append(" | Ảnh: ").append(img.getImageUrl()));
            }
            
            // Add stock info
            if (p.getVariants() != null && !p.getVariants().isEmpty()) {
                int totalStock = p.getVariants().stream()
                    .mapToInt(v -> v.getStockQuantity() != null ? v.getStockQuantity() : 0)
                    .sum();
                context.append(" | Tồn kho: ").append(totalStock);
            }
            
            context.append("\n");
            
            if (context.length() > 3000) break; // Limit for token size
        }
        
        return context.toString();
    }

    private String buildBusinessContext() {
        StringBuilder context = new StringBuilder();
        
        LocalDateTime todayStart = LocalDateTime.now().with(LocalTime.MIN);
        LocalDateTime weekAgo = todayStart.minusDays(7);
        
        NumberFormat vndFormat = NumberFormat.getInstance(new Locale("vi", "VN"));
        
        // Revenue
        BigDecimal todayRevenue = orderRepository.getRevenueFrom(todayStart);
        if (todayRevenue == null) todayRevenue = BigDecimal.ZERO;
        context.append("Doanh thu hôm nay: ").append(vndFormat.format(todayRevenue)).append("đ\n");
        
        BigDecimal weekRevenue = orderRepository.getRevenueFrom(weekAgo);
        if (weekRevenue == null) weekRevenue = BigDecimal.ZERO;
        context.append("Doanh thu 7 ngày qua: ").append(vndFormat.format(weekRevenue)).append("đ\n");
        
        // Orders
        context.append("Đơn chờ xử lý: ").append(orderRepository.countByStatus("PENDING")).append("\n");
        context.append("Đơn đang giao: ").append(orderRepository.countByStatus("SHIPPING")).append("\n");
        context.append("Đơn hoàn thành: ").append(orderRepository.countByStatus("DELIVERED")).append("\n");
        
        // Low stock - with full product info for PRODUCT format
        List<ProductVariant> lowStock = variantRepository.findLowStock(6);
        context.append("Sản phẩm sắp hết hàng: ").append(lowStock.size()).append(" items\n");
        for (ProductVariant v : lowStock.stream().limit(5).collect(Collectors.toList())) {
            Product p = v.getProduct();
            String imageUrl = "";
            if (p.getImages() != null && !p.getImages().isEmpty()) {
                imageUrl = p.getImages().stream()
                    .filter(img -> Boolean.TRUE.equals(img.getIsPrimary()))
                    .findFirst()
                    .or(() -> p.getImages().stream().findFirst())
                    .map(img -> img.getImageUrl())
                    .orElse("");
            }
            // Provide complete info for PRODUCT format: ID|Name|Price|Image
            context.append("  - PRODUCT[").append(p.getId())
                   .append("|").append(p.getName())
                   .append("|").append(p.getBasePrice().intValue())
                   .append("|").append(imageUrl).append("]")
                   .append(" (SKU: ").append(v.getSkuVariant())
                   .append(", còn ").append(v.getStockQuantity()).append(")\n");
        }
        
        // Top products
        List<Object[]> topProducts = orderItemRepository.getTopProductsByRevenueFrom(weekAgo);
        context.append("Top sản phẩm tuần này:\n");
        for (int i = 0; i < Math.min(3, topProducts.size()); i++) {
            Object[] row = topProducts.get(i);
            context.append("  ").append(i + 1).append(". ").append(row[1])
                   .append(" - ").append(row[2]).append(" đơn, ")
                   .append(vndFormat.format(((Number) row[3]).longValue())).append("đ\n");
        }
        
        return context.toString();
    }

    private String buildSummaryPrompt(AiAdminSummary data) {
        NumberFormat vndFormat = NumberFormat.getInstance(new Locale("vi", "VN"));
        
        return """
            Hãy tạo một bản tóm tắt ngắn gọn (2-3 câu) về tình hình kinh doanh hôm nay dựa trên dữ liệu:
            - Doanh thu: %sđ (%s so với hôm qua)
            - Số đơn hàng: %d đơn (%d đơn chờ xử lý)
            - Sản phẩm bán chạy: %s
            - Cảnh báo tồn kho: %d sản phẩm sắp hết
            
            Hãy viết ngắn gọn, chuyên nghiệp, bằng tiếng Việt.
            """.formatted(
                vndFormat.format(data.getTodayRevenue()),
                data.getRevenueChange(),
                data.getTodayOrders(),
                data.getPendingOrders(),
                data.getTopProducts().isEmpty() ? "Chưa có" : String.join(", ", data.getTopProducts()),
                data.getInventoryAlerts().size()
            );
    }

    private String buildFallbackSummary(AiAdminSummary data) {
        NumberFormat vndFormat = NumberFormat.getInstance(new Locale("vi", "VN"));
        return String.format(
            "Hôm nay: Doanh thu %sđ với %d đơn hàng. Có %d đơn đang chờ xử lý và %d sản phẩm cần bổ sung tồn kho.",
            vndFormat.format(data.getTodayRevenue()),
            data.getTodayOrders(),
            data.getPendingOrders(),
            data.getInventoryAlerts().size()
        );
    }

    private AiChatResponse callGroqAPI(String prompt) {
        try {
            // Build OpenAI-compatible request for Groq
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", model);
            
            List<Map<String, String>> messages = new ArrayList<>();
            messages.add(Map.of("role", "user", "content", prompt));
            requestBody.put("messages", messages);
            
            requestBody.put("temperature", 0.7);
            requestBody.put("max_tokens", 2000);

            Map response = webClient.post()
                .uri(apiUrl)
                .header("Authorization", "Bearer " + apiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

            if (response != null && response.containsKey("choices")) {
                List<Map> choices = (List<Map>) response.get("choices");
                if (!choices.isEmpty()) {
                    Map choice = choices.get(0);
                    Map message = (Map) choice.get("message");
                    if (message != null) {
                        String text = (String) message.get("content");
                        if (text != null && !text.isEmpty()) {
                            return AiChatResponse.success(text.trim());
                        }
                    }
                }
            }
            
            // Check for error in response
            if (response != null && response.containsKey("error")) {
                Map errorMap = (Map) response.get("error");
                String errorMessage = errorMap.get("message").toString();
                System.err.println("Groq API Error: " + errorMessage);
                return AiChatResponse.error("Lỗi từ AI: " + errorMessage);
            }
            
            return AiChatResponse.error("Không nhận được phản hồi từ AI");
        } catch (Exception e) {
            e.printStackTrace();
            String errorMsg = e.getMessage();
            
            // Handle 429 rate limit error
            if (errorMsg != null && errorMsg.contains("429")) {
                return AiChatResponse.error("AI đang bận, vui lòng đợi 1-2 phút rồi thử lại.");
            }
            
            // Handle 401 unauthorized
            if (errorMsg != null && errorMsg.contains("401")) {
                return AiChatResponse.error("API key không hợp lệ.");
            }
            
            return AiChatResponse.error("Lỗi kết nối AI: " + errorMsg);
        }
    }

    /**
     * Generate product description using AI
     */
    public AiProductResponse generateProductDescription(String productName, String category) {
        try {
            String prompt = """
                Bạn là chuyên gia viết mô tả sản phẩm thời trang. Hãy viết mô tả sản phẩm hấp dẫn cho:
                
                Tên sản phẩm: %s
                Danh mục: %s
                
                Yêu cầu:
                - Mô tả ngắn gọn, 2-3 câu
                - Nhấn mạnh chất liệu, kiểu dáng, phong cách
                - Sử dụng ngôn ngữ bán hàng chuyên nghiệp
                - Viết bằng tiếng Việt
                - KHÔNG thêm tiêu đề hay định dạng đặc biệt
                """.formatted(productName, category != null ? category : "Thời trang");

            AiChatResponse response = callGroqAPI(prompt);
            if (response.isSuccess()) {
                return AiProductResponse.descriptionOnly(response.getReply());
            }
            return AiProductResponse.error(response.getError());
        } catch (Exception e) {
            return AiProductResponse.error("Lỗi khi sinh mô tả: " + e.getMessage());
        }
    }

    /**
     * Suggest category and keywords for a product
     */
    public AiProductResponse suggestCategoryAndKeywords(String productName, String description) {
        try {
            // Get existing categories
            List<String> existingCategories = productRepository.findAll().stream()
                .map(p -> p.getCategory() != null ? p.getCategory().getName() : null)
                .filter(Objects::nonNull)
                .distinct()
                .collect(Collectors.toList());

            String categoriesList = existingCategories.isEmpty() 
                ? "Áo, Quần, Giày, Túi, Phụ kiện" 
                : String.join(", ", existingCategories);

            String prompt = """
                Phân tích sản phẩm thời trang sau và gợi ý danh mục phù hợp:
                
                Tên sản phẩm: %s
                Mô tả: %s
                
                Các danh mục có sẵn: %s
                
                Trả lời theo format CHÍNH XÁC như sau (không thêm gì khác):
                CATEGORY: [tên danh mục phù hợp nhất]
                KEYWORDS: [từ khóa 1], [từ khóa 2], [từ khóa 3]
                """.formatted(
                    productName, 
                    description != null ? description : "Chưa có mô tả",
                    categoriesList
                );

            AiChatResponse response = callGroqAPI(prompt);
            if (response.isSuccess()) {
                String reply = response.getReply();
                String category = "";
                List<String> keywords = new ArrayList<>();

                // Parse response
                String[] lines = reply.split("\n");
                for (String line : lines) {
                    if (line.toUpperCase().startsWith("CATEGORY:")) {
                        category = line.substring(9).trim();
                    } else if (line.toUpperCase().startsWith("KEYWORDS:")) {
                        String keywordsStr = line.substring(9).trim();
                        keywords = Arrays.stream(keywordsStr.split(","))
                            .map(String::trim)
                            .filter(s -> !s.isEmpty())
                            .collect(Collectors.toList());
                    }
                }

                return AiProductResponse.categoryOnly(category, keywords);
            }
            return AiProductResponse.error(response.getError());
        } catch (Exception e) {
            return AiProductResponse.error("Lỗi khi gợi ý danh mục: " + e.getMessage());
        }
    }

    /**
     * Detect anomalies in business data
     */
    public List<AnomalyReport> detectAnomalies() {
        List<AnomalyReport> anomalies = new ArrayList<>();
        
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime todayStart = now.with(LocalTime.MIN);
        LocalDateTime yesterdayStart = todayStart.minusDays(1);
        LocalDateTime weekAgo = todayStart.minusDays(7);
        
        NumberFormat vndFormat = NumberFormat.getInstance(new Locale("vi", "VN"));

        // 1. Check revenue anomalies
        try {
            BigDecimal todayRevenue = orderRepository.getRevenueFrom(todayStart);
            BigDecimal yesterdayRevenue = orderRepository.getRevenueBetween(yesterdayStart, todayStart);
            
            if (todayRevenue == null) todayRevenue = BigDecimal.ZERO;
            if (yesterdayRevenue == null) yesterdayRevenue = BigDecimal.ZERO;
            
            // Revenue drop more than 50%
            if (yesterdayRevenue.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal dropPercent = yesterdayRevenue.subtract(todayRevenue)
                    .divide(yesterdayRevenue, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
                
                if (dropPercent.compareTo(BigDecimal.valueOf(50)) > 0) {
                    anomalies.add(new AnomalyReport(
                        AnomalyReport.AnomalyType.REVENUE,
                        AnomalyReport.Severity.HIGH,
                        "Doanh thu giảm mạnh",
                        "Doanh thu hôm nay giảm " + dropPercent.setScale(0, RoundingMode.HALF_UP) + "% so với hôm qua",
                        vndFormat.format(todayRevenue) + "đ",
                        "Kiểm tra các chiến dịch marketing hoặc vấn đề kỹ thuật"
                    ));
                }
            }
            
            // No revenue today but had yesterday
            if (todayRevenue.compareTo(BigDecimal.ZERO) == 0 && 
                yesterdayRevenue.compareTo(BigDecimal.ZERO) > 0 && 
                now.getHour() >= 12) {
                anomalies.add(new AnomalyReport(
                    AnomalyReport.AnomalyType.REVENUE,
                    AnomalyReport.Severity.MEDIUM,
                    "Chưa có doanh thu hôm nay",
                    "Đã qua nửa ngày nhưng chưa có đơn hàng nào hoàn tất",
                    "0đ",
                    "Kiểm tra trạng thái website và đơn hàng đang chờ xử lý"
                ));
            }
        } catch (Exception e) {
            // Skip revenue anomaly check on error
        }

        // 2. Check order anomalies
        try {
            Long pendingCancelCount = orderRepository.countByStatus("PENDING_CANCEL");
            if (pendingCancelCount != null && pendingCancelCount >= 3) {
                anomalies.add(new AnomalyReport(
                    AnomalyReport.AnomalyType.ORDER,
                    AnomalyReport.Severity.MEDIUM,
                    "Nhiều đơn hàng chờ hủy",
                    pendingCancelCount + " đơn hàng đang chờ xác nhận hủy",
                    pendingCancelCount + " đơn",
                    "Xem xét và xử lý các yêu cầu hủy đơn"
                ));
            }

            Long pendingCount = orderRepository.countByStatus("PENDING");
            if (pendingCount != null && pendingCount >= 10) {
                anomalies.add(new AnomalyReport(
                    AnomalyReport.AnomalyType.ORDER,
                    AnomalyReport.Severity.MEDIUM,
                    "Tồn đọng đơn hàng",
                    pendingCount + " đơn hàng đang chờ xử lý",
                    pendingCount + " đơn",
                    "Cần xử lý đơn hàng để tránh delay giao hàng"
                ));
            }
        } catch (Exception e) {
            // Skip order anomaly check on error
        }

        // 3. Check inventory anomalies
        try {
            List<ProductVariant> outOfStock = variantRepository.findLowStock(0);
            if (outOfStock != null && outOfStock.size() >= 5) {
                anomalies.add(new AnomalyReport(
                    AnomalyReport.AnomalyType.INVENTORY,
                    AnomalyReport.Severity.HIGH,
                    "Nhiều sản phẩm hết hàng",
                    outOfStock.size() + " biến thể sản phẩm đã hết hàng hoàn toàn",
                    outOfStock.size() + " SKU",
                    "Liên hệ nhà cung cấp để nhập thêm hàng"
                ));
            }

            List<ProductVariant> lowStock = variantRepository.findLowStock(6);
            int criticalLowStock = (int) lowStock.stream()
                .filter(v -> v.getStockQuantity() <= 2 && v.getStockQuantity() > 0)
                .count();
            
            if (criticalLowStock >= 5) {
                anomalies.add(new AnomalyReport(
                    AnomalyReport.AnomalyType.INVENTORY,
                    AnomalyReport.Severity.MEDIUM,
                    "Sản phẩm sắp hết hàng",
                    criticalLowStock + " biến thể sản phẩm còn dưới 3 sản phẩm",
                    criticalLowStock + " SKU",
                    "Lên kế hoạch nhập hàng bổ sung"
                ));
            }
        } catch (Exception e) {
            // Skip inventory anomaly check on error
        }

        return anomalies;
    }
}
