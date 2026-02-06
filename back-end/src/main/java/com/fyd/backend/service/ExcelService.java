package com.fyd.backend.service;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@Service
public class ExcelService {
    
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
    private static final DateTimeFormatter DATE_ONLY_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    
    /**
     * Generate Orders Report Excel
     */
    public byte[] generateOrdersReport(List<Map<String, Object>> data, String title) throws IOException {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Đơn hàng");
            
            // Styles
            CellStyle headerStyle = createHeaderStyle(workbook);
            CellStyle dateStyle = createDateStyle(workbook);
            CellStyle currencyStyle = createCurrencyStyle(workbook);
            CellStyle normalStyle = createNormalStyle(workbook);
            
            // Title
            Row titleRow = sheet.createRow(0);
            Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue(title);
            titleCell.setCellStyle(createTitleStyle(workbook));
            sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 7));
            
            // Headers
            Row headerRow = sheet.createRow(2);
            String[] headers = {"Mã đơn", "Khách hàng", "SĐT", "Tổng tiền", "Trạng thái", "Ngày tạo", "Địa chỉ"};
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }
            
            // Data rows
            int rowNum = 3;
            for (Map<String, Object> order : data) {
                Row row = sheet.createRow(rowNum++);
                
                Cell cell0 = row.createCell(0);
                cell0.setCellValue(getString(order, "orderCode"));
                cell0.setCellStyle(normalStyle);
                
                Cell cell1 = row.createCell(1);
                cell1.setCellValue(getString(order, "customerName"));
                cell1.setCellStyle(normalStyle);
                
                Cell cell2 = row.createCell(2);
                cell2.setCellValue(getString(order, "shippingPhone"));
                cell2.setCellStyle(normalStyle);
                
                Cell cell3 = row.createCell(3);
                cell3.setCellValue(getDouble(order, "totalAmount"));
                cell3.setCellStyle(currencyStyle);
                
                Cell cell4 = row.createCell(4);
                cell4.setCellValue(translateStatus(getString(order, "status")));
                cell4.setCellStyle(normalStyle);
                
                Cell cell5 = row.createCell(5);
                cell5.setCellValue(formatDate(order.get("createdAt")));
                cell5.setCellStyle(dateStyle);
                
                Cell cell6 = row.createCell(6);
                cell6.setCellValue(getString(order, "shippingAddress"));
                cell6.setCellStyle(normalStyle);
            }
            
            // Auto-size columns
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }
            
            return toByteArray(workbook);
        }
    }
    
    /**
     * Generate Revenue Report Excel
     */
    public byte[] generateRevenueReport(List<Map<String, Object>> dailyData, Map<String, Object> summary) throws IOException {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Doanh thu");
            
            CellStyle headerStyle = createHeaderStyle(workbook);
            CellStyle currencyStyle = createCurrencyStyle(workbook);
            CellStyle normalStyle = createNormalStyle(workbook);
            CellStyle summaryStyle = createSummaryStyle(workbook);
            
            // Title
            Row titleRow = sheet.createRow(0);
            Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue("Báo cáo doanh thu");
            titleCell.setCellStyle(createTitleStyle(workbook));
            sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 3));
            
            // Summary section
            int rowNum = 2;
            Row summaryRow1 = sheet.createRow(rowNum++);
            summaryRow1.createCell(0).setCellValue("Tổng doanh thu:");
            Cell revCell = summaryRow1.createCell(1);
            revCell.setCellValue(getDouble(summary, "totalRevenue"));
            revCell.setCellStyle(currencyStyle);
            
            Row summaryRow2 = sheet.createRow(rowNum++);
            summaryRow2.createCell(0).setCellValue("Tổng đơn hàng:");
            summaryRow2.createCell(1).setCellValue(getLong(summary, "totalOrders"));
            
            rowNum++; // Empty row
            
            // Daily breakdown headers
            Row headerRow = sheet.createRow(rowNum++);
            String[] headers = {"Ngày", "Số đơn", "Doanh thu"};
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }
            
            // Daily data
            for (Map<String, Object> day : dailyData) {
                Row row = sheet.createRow(rowNum++);
                
                Cell cell0 = row.createCell(0);
                cell0.setCellValue(getString(day, "date"));
                cell0.setCellStyle(normalStyle);
                
                Cell cell1 = row.createCell(1);
                cell1.setCellValue(getLong(day, "orders"));
                cell1.setCellStyle(normalStyle);
                
                Cell cell2 = row.createCell(2);
                cell2.setCellValue(getDouble(day, "revenue"));
                cell2.setCellStyle(currencyStyle);
            }
            
            // Auto-size
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }
            
            return toByteArray(workbook);
        }
    }
    
    /**
     * Generate Inventory Report Excel
     */
    public byte[] generateInventoryReport(List<Map<String, Object>> data) throws IOException {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Tồn kho");
            
            CellStyle headerStyle = createHeaderStyle(workbook);
            CellStyle normalStyle = createNormalStyle(workbook);
            CellStyle warningStyle = createWarningStyle(workbook);
            
            // Title
            Row titleRow = sheet.createRow(0);
            Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue("Báo cáo tồn kho");
            titleCell.setCellStyle(createTitleStyle(workbook));
            sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 5));
            
            // Headers
            Row headerRow = sheet.createRow(2);
            String[] headers = {"SKU", "Tên sản phẩm", "Biến thể", "Số lượng", "Trạng thái"};
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }
            
            // Data rows
            int rowNum = 3;
            for (Map<String, Object> item : data) {
                Row row = sheet.createRow(rowNum++);
                int quantity = getInt(item, "quantity");
                boolean isLow = quantity < 10;
                
                CellStyle style = isLow ? warningStyle : normalStyle;
                
                Cell cell0 = row.createCell(0);
                cell0.setCellValue(getString(item, "sku"));
                cell0.setCellStyle(normalStyle);
                
                Cell cell1 = row.createCell(1);
                cell1.setCellValue(getString(item, "productName"));
                cell1.setCellStyle(normalStyle);
                
                Cell cell2 = row.createCell(2);
                cell2.setCellValue(getString(item, "variant"));
                cell2.setCellStyle(normalStyle);
                
                Cell cell3 = row.createCell(3);
                cell3.setCellValue(quantity);
                cell3.setCellStyle(style);
                
                Cell cell4 = row.createCell(4);
                cell4.setCellValue(isLow ? "Sắp hết" : "Đủ hàng");
                cell4.setCellStyle(style);
            }
            
            // Auto-size
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }
            
            return toByteArray(workbook);
        }
    }
    
    // ============ STYLE HELPERS ============
    
    private CellStyle createTitleStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 16);
        style.setFont(font);
        return style;
    }
    
    private CellStyle createHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        return style;
    }
    
    private CellStyle createNormalStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        return style;
    }
    
    private CellStyle createDateStyle(Workbook workbook) {
        CellStyle style = createNormalStyle(workbook);
        style.setAlignment(HorizontalAlignment.CENTER);
        return style;
    }
    
    private CellStyle createCurrencyStyle(Workbook workbook) {
        CellStyle style = createNormalStyle(workbook);
        DataFormat format = workbook.createDataFormat();
        style.setDataFormat(format.getFormat("#,##0"));
        style.setAlignment(HorizontalAlignment.RIGHT);
        return style;
    }
    
    private CellStyle createSummaryStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        style.setFont(font);
        return style;
    }
    
    private CellStyle createWarningStyle(Workbook workbook) {
        CellStyle style = createNormalStyle(workbook);
        style.setFillForegroundColor(IndexedColors.LIGHT_YELLOW.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        return style;
    }
    
    // ============ DATA HELPERS ============
    
    private String getString(Map<String, Object> map, String key) {
        Object value = map.get(key);
        return value != null ? value.toString() : "";
    }
    
    private double getDouble(Map<String, Object> map, String key) {
        Object value = map.get(key);
        if (value == null) return 0;
        if (value instanceof Number) return ((Number) value).doubleValue();
        try {
            return Double.parseDouble(value.toString());
        } catch (NumberFormatException e) {
            return 0;
        }
    }
    
    private long getLong(Map<String, Object> map, String key) {
        Object value = map.get(key);
        if (value == null) return 0;
        if (value instanceof Number) return ((Number) value).longValue();
        try {
            return Long.parseLong(value.toString());
        } catch (NumberFormatException e) {
            return 0;
        }
    }
    
    private int getInt(Map<String, Object> map, String key) {
        return (int) getLong(map, key);
    }
    
    private String formatDate(Object dateObj) {
        if (dateObj == null) return "";
        if (dateObj instanceof LocalDateTime) {
            return ((LocalDateTime) dateObj).format(DATE_FORMAT);
        }
        return dateObj.toString();
    }
    
    private String translateStatus(String status) {
        if (status == null) return "";
        return switch (status) {
            case "PENDING" -> "Chờ xử lý";
            case "CONFIRMED" -> "Đã xác nhận";
            case "PROCESSING" -> "Đang xử lý";
            case "SHIPPING" -> "Đang giao";
            case "DELIVERED" -> "Đã giao";
            case "COMPLETED" -> "Hoàn thành";
            case "CANCELLED" -> "Đã hủy";
            default -> status;
        };
    }
    
    private byte[] toByteArray(Workbook workbook) throws IOException {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        workbook.write(out);
        return out.toByteArray();
    }
}
