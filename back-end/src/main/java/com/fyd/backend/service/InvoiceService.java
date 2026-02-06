package com.fyd.backend.service;

import com.fyd.backend.entity.Order;
import com.fyd.backend.entity.OrderItem;
import org.springframework.stereotype.Service;

import java.awt.*;
import java.awt.print.*;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

/**
 * Service for generating printable invoices.
 * Uses basic Java AWT printing for PDF-like output.
 * For production, consider using iText or Apache PDFBox.
 */
@Service
public class InvoiceService {

    private static final NumberFormat VND_FORMAT = NumberFormat.getCurrencyInstance(new Locale("vi", "VN"));
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
    
    /**
     * Generate HTML invoice for print/PDF
     */
    public String generateInvoiceHtml(Order order) {
        StringBuilder html = new StringBuilder();
        
        html.append("<!DOCTYPE html>");
        html.append("<html><head>");
        html.append("<meta charset='UTF-8'>");
        html.append("<title>Hóa đơn #").append(order.getOrderCode()).append("</title>");
        html.append("<style>");
        html.append(getInvoiceStyles());
        html.append("</style>");
        html.append("</head><body>");
        
        // Header
        html.append("<div class='invoice-container'>");
        html.append("<div class='invoice-header'>");
        html.append("<div class='company-info'>");
        html.append("<h1 class='company-name'>FYD STORE</h1>");
        html.append("<p>Địa chỉ: 123 Đường ABC, Quận 1, TP.HCM</p>");
        html.append("<p>Hotline: 1900 1234 | Email: support@fydstore.vn</p>");
        html.append("</div>");
        html.append("<div class='invoice-meta'>");
        html.append("<h2>HÓA ĐƠN BÁN HÀNG</h2>");
        html.append("<p><strong>Mã đơn:</strong> #").append(order.getOrderCode()).append("</p>");
        html.append("<p><strong>Ngày:</strong> ").append(order.getCreatedAt() != null ? order.getCreatedAt().format(DATE_FORMAT) : "").append("</p>");
        html.append("<p><strong>Trạng thái:</strong> ").append(translateStatus(order.getStatus())).append("</p>");
        html.append("</div>");
        html.append("</div>");
        
        // Customer info
        html.append("<div class='customer-section'>");
        html.append("<h3>Thông tin khách hàng</h3>");
        html.append("<table class='customer-table'>");
        html.append("<tr><td><strong>Họ tên:</strong></td><td>").append(order.getShippingName()).append("</td></tr>");
        html.append("<tr><td><strong>SĐT:</strong></td><td>").append(order.getShippingPhone()).append("</td></tr>");
        html.append("<tr><td><strong>Địa chỉ:</strong></td><td>").append(buildAddress(order)).append("</td></tr>");
        if (order.getCustomer() != null && order.getCustomer().getEmail() != null) {
            html.append("<tr><td><strong>Email:</strong></td><td>").append(order.getCustomer().getEmail()).append("</td></tr>");
        }
        html.append("</table>");
        html.append("</div>");
        
        // Items table
        html.append("<div class='items-section'>");
        html.append("<h3>Chi tiết đơn hàng</h3>");
        html.append("<table class='items-table'>");
        html.append("<thead><tr>");
        html.append("<th>#</th>");
        html.append("<th>Sản phẩm</th>");
        html.append("<th>Đơn giá</th>");
        html.append("<th>SL</th>");
        html.append("<th>Thành tiền</th>");
        html.append("</tr></thead>");
        html.append("<tbody>");
        
        int index = 1;
        if (order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                html.append("<tr>");
                html.append("<td class='center'>").append(index++).append("</td>");
                html.append("<td>");
                html.append(item.getProductName());
                if (item.getVariantInfo() != null && !item.getVariantInfo().isEmpty()) {
                    html.append("<br><small class='variant-info'>").append(item.getVariantInfo()).append("</small>");
                }
                html.append("</td>");
                html.append("<td class='right'>").append(formatMoney(item.getUnitPrice())).append("</td>");
                html.append("<td class='center'>").append(item.getQuantity()).append("</td>");
                html.append("<td class='right'>").append(formatMoney(item.getLineTotal())).append("</td>");
                html.append("</tr>");
            }
        }
        
        html.append("</tbody>");
        html.append("</table>");
        html.append("</div>");
        
        // Summary
        html.append("<div class='summary-section'>");
        html.append("<table class='summary-table'>");
        html.append("<tr><td>Tạm tính:</td><td>").append(formatMoney(order.getSubtotal())).append("</td></tr>");
        
        BigDecimal shippingFee = order.getShippingFee() != null ? order.getShippingFee() : BigDecimal.ZERO;
        html.append("<tr><td>Phí vận chuyển:</td><td>").append(formatMoney(shippingFee)).append("</td></tr>");
        
        if (order.getDiscountAmount() != null && order.getDiscountAmount().compareTo(BigDecimal.ZERO) > 0) {
            html.append("<tr class='discount'><td>Giảm giá:</td><td>-").append(formatMoney(order.getDiscountAmount())).append("</td></tr>");
        }
        
        html.append("<tr class='total'><td><strong>TỔNG CỘNG:</strong></td><td><strong>").append(formatMoney(order.getTotalAmount())).append("</strong></td></tr>");
        html.append("</table>");
        html.append("</div>");
        
        // Payment info
        html.append("<div class='payment-section'>");
        html.append("<p><strong>Phương thức thanh toán:</strong> ").append(translatePaymentMethod(order.getPaymentMethod())).append("</p>");
        if (order.getNotes() != null && !order.getNotes().isEmpty()) {
            html.append("<p><strong>Ghi chú:</strong> ").append(order.getNotes()).append("</p>");
        }
        html.append("</div>");
        
        // Footer
        html.append("<div class='invoice-footer'>");
        html.append("<p>Cảm ơn quý khách đã mua hàng tại FYD Store!</p>");
        html.append("<p class='print-note'>* Đây là hóa đơn điện tử, có giá trị như hóa đơn gốc</p>");
        html.append("</div>");
        
        html.append("</div>"); // invoice-container
        
        // Print script
        html.append("<script>window.onload = function() { window.print(); }</script>");
        
        html.append("</body></html>");
        
        return html.toString();
    }
    
    private String getInvoiceStyles() {
        return """
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@700&display=swap');
            
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
                font-family: 'Inter', sans-serif; 
                font-size: 14px; 
                line-height: 1.6; 
                color: #1e293b;
                background-color: #f8fafc;
            }
            .invoice-container { 
                max-width: 800px; 
                margin: 40px auto; 
                padding: 60px; 
                background: white;
                box-shadow: 0 10px 25px rgba(0,0,0,0.05);
                border-radius: 12px;
                position: relative;
                overflow: hidden;
            }
            .invoice-container::before {
                content: '';
                position: absolute;
                top: 0; left: 0; right: 0;
                height: 8px;
                background: linear-gradient(90deg, #0ea5e9, #6366f1);
            }
            .invoice-header { 
                display: flex; 
                justify-content: space-between; 
                margin-bottom: 40px; 
                padding-bottom: 30px; 
                border-bottom: 1px solid #f1f5f9; 
            }
            .company-name { 
                font-weight: 800;
                font-size: 32px; 
                letter-spacing: -1px;
                background: linear-gradient(135deg, #0ea5e9, #6366f1);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                margin-bottom: 8px; 
            }
            .company-info p { color: #64748b; font-size: 13px; margin: 2px 0; }
            .invoice-meta { text-align: right; }
            .invoice-meta h2 { 
                color: #0f172a; 
                font-size: 24px; 
                font-weight: 800;
                margin-bottom: 12px; 
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            .invoice-meta p { margin: 6px 0; font-size: 13px; color: #475569; }
            .invoice-meta strong { color: #0f172a; }
            
            .customer-section { 
                display: grid;
                grid-template-columns: 1fr;
                gap: 20px;
                margin-bottom: 40px;
                padding: 24px;
                background: #f8fafc;
                border-radius: 12px;
                border: 1px solid #f1f5f9;
            }
            h3 { 
                font-size: 13px; 
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 1px;
                color: #64748b; 
                margin-bottom: 12px; 
            }
            .customer-table { width: 100%; border-collapse: collapse; }
            .customer-table td { padding: 4px 0; vertical-align: top; font-size: 14px; }
            .customer-table td:first-child { width: 120px; color: #64748b; font-weight: 500; }
            .customer-table td:last-child { color: #0f172a; font-weight: 600; }
            
            .items-section { margin-bottom: 40px; }
            .items-table { width: 100%; border-collapse: collapse; }
            .items-table th { 
                padding: 14px 12px; 
                background: #f8fafc; 
                font-weight: 700; 
                font-size: 12px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                color: #64748b; 
                text-align: left;
                border-bottom: 2px solid #f1f5f9;
            }
            .items-table td { 
                padding: 16px 12px; 
                border-bottom: 1px solid #f1f5f9; 
                color: #334155;
            }
            .items-table .center { text-align: center; }
            .items-table .right { text-align: right; }
            .variant-info { color: #94a3b8; font-size: 12px; display: block; margin-top: 4px; }
            
            .summary-section { 
                display: flex;
                justify-content: flex-end;
                margin-bottom: 40px; 
            }
            .summary-table { width: 320px; }
            .summary-table td { padding: 10px 0; font-size: 14px; color: #64748b; }
            .summary-table td:last-child { 
                text-align: right; 
                font-weight: 600; 
                color: #0f172a; 
                font-family: 'JetBrains Mono', monospace;
            }
            .summary-table .discount td:last-child { color: #10b981; }
            .summary-table .total { border-top: 2px solid #f1f5f9; }
            .summary-table .total td { 
                padding-top: 20px;
                font-size: 20px; 
                font-weight: 800;
                color: #0ea5e9; 
            }
            .summary-table .total td:last-child { font-size: 24px; color: #0ea5e9; }
            
            .payment-section { 
                margin-bottom: 40px; 
                padding: 20px;
                border-radius: 8px;
                border-left: 4px solid #0ea5e9;
                background: rgba(14, 165, 233, 0.05);
            }
            .payment-section p { margin: 4px 0; font-size: 13px; color: #475569; }
            .payment-section strong { color: #0f172a; }
            
            .invoice-footer { 
                text-align: center; 
                margin-top: 60px; 
                padding-top: 30px; 
                border-top: 1px solid #f1f5f9; 
            }
            .invoice-footer p { color: #64748b; font-size: 14px; margin-bottom: 4px; }
            .print-note { font-size: 11px; color: #94a3b8 !important; }
            
            @media print { 
                body { background: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; } 
                .invoice-container { margin: 0; padding: 0; box-shadow: none; max-width: 100%; border-radius: 0; } 
            }
            """;
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
            default -> status;
        };
    }

    private String translatePaymentMethod(String method) {
        if (method == null) return "Thanh toán khi nhận hàng (COD)";
        return switch (method.toUpperCase()) {
            case "COD" -> "Thanh toán khi nhận hàng (COD)";
            case "BANK" -> "Chuyển khoản ngân hàng";
            case "MOMO" -> "Ví MoMo";
            case "VNPAY" -> "VNPay";
            default -> method;
        };
    }
}
