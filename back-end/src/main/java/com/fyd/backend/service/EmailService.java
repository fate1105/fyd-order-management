package com.fyd.backend.service;

import com.fyd.backend.entity.Order;
import com.fyd.backend.entity.OrderItem;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Service
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    @Value("${app.name:FYD Store}")
    private String appName;

    private static final NumberFormat VND_FORMAT = NumberFormat.getCurrencyInstance(new Locale("vi", "VN"));
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    /**
     * Check if email is configured
     */
    public boolean isConfigured() {
        return mailSender != null && fromEmail != null && !fromEmail.isEmpty();
    }

    /**
     * Send order confirmation email
     */
    @Async
    public void sendOrderConfirmation(Order order) {
        if (!isConfigured() || order.getCustomer() == null || order.getCustomer().getEmail() == null) {
            return;
        }

        try {
            String subject = "[" + appName + "] Xác nhận đơn hàng #" + order.getOrderCode();
            String html = buildOrderConfirmationHtml(order);
            sendHtmlEmail(order.getCustomer().getEmail(), subject, html);
        } catch (Exception e) {
            System.err.println("Failed to send order confirmation email: " + e.getMessage());
        }
    }

    /**
     * Send order status update email
     */
    @Async
    public void sendOrderStatusUpdate(Order order) {
        if (!isConfigured() || order.getCustomer() == null || order.getCustomer().getEmail() == null) {
            return;
        }

        try {
            String statusVi = translateStatus(order.getStatus());
            String subject = "[" + appName + "] Đơn hàng #" + order.getOrderCode() + " - " + statusVi;
            String html = buildOrderStatusUpdateHtml(order);
            sendHtmlEmail(order.getCustomer().getEmail(), subject, html);
        } catch (Exception e) {
            System.err.println("Failed to send order status update email: " + e.getMessage());
        }
    }

    /**
     * Send generic email
     */
    public void sendHtmlEmail(String to, String subject, String htmlContent) throws MessagingException {
        if (!isConfigured()) {
            throw new MessagingException("Email service is not configured");
        }

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        
        helper.setFrom(fromEmail);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlContent, true);
        
        mailSender.send(message);
    }

    // ============ HTML TEMPLATES ============

    private String buildOrderConfirmationHtml(Order order) {
        StringBuilder sb = new StringBuilder();
        sb.append("<!DOCTYPE html><html><head><meta charset='UTF-8'></head><body style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;'>");
        
        // Header
        sb.append("<div style='text-align: center; padding: 20px; background: linear-gradient(135deg, #0ea5e9, #06b6d4); color: white; border-radius: 10px 10px 0 0;'>");
        sb.append("<h1 style='margin: 0;'>").append(appName).append("</h1>");
        sb.append("<p style='margin: 10px 0 0 0;'>Xác nhận đơn hàng</p>");
        sb.append("</div>");

        // Order info
        sb.append("<div style='padding: 20px; background: #f9fafb; border: 1px solid #e5e7eb;'>");
        sb.append("<h2 style='color: #333; margin-top: 0;'>Cảm ơn bạn đã đặt hàng!</h2>");
        sb.append("<p>Xin chào <strong>").append(order.getShippingName()).append("</strong>,</p>");
        sb.append("<p>Đơn hàng <strong>#").append(order.getOrderCode()).append("</strong> của bạn đã được tiếp nhận.</p>");
        
        // Order details table
        sb.append("<table style='width: 100%; border-collapse: collapse; margin: 20px 0;'>");
        sb.append("<tr><td style='padding: 10px; border-bottom: 1px solid #e5e7eb; color: #666;'>Mã đơn hàng:</td>");
        sb.append("<td style='padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: bold;'>#").append(order.getOrderCode()).append("</td></tr>");
        sb.append("<tr><td style='padding: 10px; border-bottom: 1px solid #e5e7eb; color: #666;'>Ngày đặt:</td>");
        sb.append("<td style='padding: 10px; border-bottom: 1px solid #e5e7eb;'>").append(order.getCreatedAt() != null ? order.getCreatedAt().format(DATE_FORMAT) : "").append("</td></tr>");
        sb.append("<tr><td style='padding: 10px; border-bottom: 1px solid #e5e7eb; color: #666;'>Địa chỉ giao:</td>");
        sb.append("<td style='padding: 10px; border-bottom: 1px solid #e5e7eb;'>").append(buildAddress(order)).append("</td></tr>");
        sb.append("</table>");

        // Items
        sb.append("<h3 style='color: #333; border-bottom: 2px solid #0ea5e9; padding-bottom: 10px;'>Sản phẩm đã đặt</h3>");
        sb.append("<table style='width: 100%; border-collapse: collapse;'>");
        
        if (order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                sb.append("<tr>");
                sb.append("<td style='padding: 10px; border-bottom: 1px solid #e5e7eb;'>")
                  .append(item.getProductName());
                if (item.getVariantInfo() != null) {
                    sb.append(" <span style='color: #666; font-size: 0.9em;'>(").append(item.getVariantInfo()).append(")</span>");
                }
                sb.append("</td>");
                sb.append("<td style='padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;'>×").append(item.getQuantity()).append("</td>");
                sb.append("<td style='padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: bold;'>")
                  .append(formatMoney(item.getLineTotal())).append("</td>");
                sb.append("</tr>");
            }
        }
        
        // Total
        sb.append("<tr><td colspan='2' style='padding: 15px; text-align: right; font-weight: bold; font-size: 1.1em;'>Tổng cộng:</td>");
        sb.append("<td style='padding: 15px; text-align: right; font-weight: bold; font-size: 1.2em; color: #0ea5e9;'>")
          .append(formatMoney(order.getTotalAmount())).append("</td></tr>");
        sb.append("</table>");

        sb.append("</div>");

        // Footer
        sb.append("<div style='text-align: center; padding: 20px; color: #666; font-size: 0.9em;'>");
        sb.append("<p>Nếu bạn có thắc mắc, vui lòng liên hệ với chúng tôi.</p>");
        sb.append("<p>© ").append(appName).append("</p>");
        sb.append("</div>");

        sb.append("</body></html>");
        return sb.toString();
    }

    private String buildOrderStatusUpdateHtml(Order order) {
        String statusVi = translateStatus(order.getStatus());
        String statusColor = getStatusColor(order.getStatus());

        StringBuilder sb = new StringBuilder();
        sb.append("<!DOCTYPE html><html><head><meta charset='UTF-8'></head><body style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;'>");
        
        // Header
        sb.append("<div style='text-align: center; padding: 20px; background: linear-gradient(135deg, #0ea5e9, #06b6d4); color: white; border-radius: 10px 10px 0 0;'>");
        sb.append("<h1 style='margin: 0;'>").append(appName).append("</h1>");
        sb.append("<p style='margin: 10px 0 0 0;'>Cập nhật đơn hàng</p>");
        sb.append("</div>");

        // Content
        sb.append("<div style='padding: 20px; background: #f9fafb; border: 1px solid #e5e7eb;'>");
        sb.append("<p>Xin chào <strong>").append(order.getShippingName()).append("</strong>,</p>");
        sb.append("<p>Đơn hàng <strong>#").append(order.getOrderCode()).append("</strong> của bạn đã được cập nhật.</p>");
        
        // Status badge
        sb.append("<div style='text-align: center; margin: 30px 0;'>");
        sb.append("<span style='display: inline-block; padding: 12px 24px; background: ").append(statusColor)
          .append("; color: white; border-radius: 8px; font-weight: bold; font-size: 1.1em;'>").append(statusVi).append("</span>");
        sb.append("</div>");

        // Order summary
        sb.append("<p><strong>Tổng đơn hàng:</strong> ").append(formatMoney(order.getTotalAmount())).append("</p>");
        sb.append("<p><strong>Địa chỉ giao:</strong> ").append(buildAddress(order)).append("</p>");

        sb.append("</div>");

        // Footer
        sb.append("<div style='text-align: center; padding: 20px; color: #666; font-size: 0.9em;'>");
        sb.append("<p>Cảm ơn bạn đã mua hàng!</p>");
        sb.append("<p>© ").append(appName).append("</p>");
        sb.append("</div>");

        sb.append("</body></html>");
        return sb.toString();
    }

    // ============ HELPERS ============

    private String buildAddress(Order order) {
        StringBuilder sb = new StringBuilder();
        if (order.getShippingAddress() != null) sb.append(order.getShippingAddress());
        if (order.getShippingWard() != null) sb.append(", ").append(order.getShippingWard());
        if (order.getShippingDistrict() != null) sb.append(", ").append(order.getShippingDistrict());
        if (order.getShippingProvince() != null) sb.append(", ").append(order.getShippingProvince());
        return sb.toString();
    }

    private String formatMoney(BigDecimal amount) {
        if (amount == null) return "0₫";
        return VND_FORMAT.format(amount);
    }

    private String translateStatus(String status) {
        if (status == null) return "";
        return switch (status) {
            case "PENDING" -> "Chờ xử lý";
            case "CONFIRMED" -> "Đã xác nhận";
            case "PROCESSING" -> "Đang xử lý";
            case "SHIPPING" -> "Đang giao hàng";
            case "DELIVERED" -> "Đã giao hàng";
            case "COMPLETED" -> "Hoàn thành";
            case "CANCELLED" -> "Đã hủy";
            case "PENDING_CANCEL" -> "Chờ duyệt hủy";
            default -> status;
        };
    }

    private String getStatusColor(String status) {
        if (status == null) return "#888";
        return switch (status) {
            case "PENDING" -> "#f59e0b";
            case "CONFIRMED", "PROCESSING" -> "#3b82f6";
            case "SHIPPING" -> "#8b5cf6";
            case "DELIVERED", "COMPLETED" -> "#10b981";
            case "CANCELLED", "PENDING_CANCEL" -> "#ef4444";
            default -> "#888";
        };
    }
}
