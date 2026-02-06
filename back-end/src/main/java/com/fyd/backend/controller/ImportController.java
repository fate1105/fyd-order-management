package com.fyd.backend.controller;

import com.fyd.backend.dto.ImportPreviewDTO;
import com.fyd.backend.dto.ImportResultDTO;
import com.fyd.backend.dto.ProductImportRow;
import com.fyd.backend.dto.ValidationResult;
import com.fyd.backend.service.ProductImportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controller for product import functionality
 * Handles template download, preview, and execution of imports
 */
@RestController
@RequestMapping("/api/import")
@CrossOrigin(origins = "*")
public class ImportController {
    
    @Autowired
    private ProductImportService importService;
    
    /**
     * Download Excel template for product import
     * GET /api/import/template
     */
    @GetMapping("/template")
    @PreAuthorize("hasAuthority('products:create') or hasRole('ADMIN')")
    public ResponseEntity<Resource> downloadTemplate() {
        try {
            byte[] templateBytes = importService.generateTemplate();
            ByteArrayResource resource = new ByteArrayResource(templateBytes);
            
            HttpHeaders headers = new HttpHeaders();
            headers.add(HttpHeaders.CONTENT_DISPOSITION, 
                       "attachment; filename=product_import_template.xlsx");
            headers.add(HttpHeaders.CONTENT_TYPE, 
                       "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            
            return ResponseEntity.ok()
                    .headers(headers)
                    .contentLength(templateBytes.length)
                    .contentType(MediaType.parseMediaType(
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .body(resource);
                    
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Preview import - parse and validate Excel file
     * POST /api/import/products/preview
     */
    @PostMapping("/products/preview")
    @PreAuthorize("hasAuthority('products:create') or hasRole('ADMIN')")
    public ResponseEntity<?> previewImport(@RequestParam("file") MultipartFile file) {
        try {
            // Validate file
            if (file.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "File is empty"));
            }
            
            String filename = file.getOriginalFilename();
            if (filename == null || (!filename.endsWith(".xlsx") && !filename.endsWith(".xls"))) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "File must be Excel format (.xlsx or .xls)"));
            }
            
            if (file.getSize() > 5 * 1024 * 1024) { // 5MB limit
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "File size must be less than 5MB"));
            }
            
            // Parse Excel
            List<ProductImportRow> rows = importService.parseExcel(file);
            
            if (rows.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "No data found in Excel file"));
            }
            
            // Validate all rows
            List<ValidationResult> validationResults = new ArrayList<>();
            for (ProductImportRow row : rows) {
                ValidationResult validation = importService.validateRow(row, row.getRowNumber());
                validationResults.add(validation);
            }
            
            // Create preview DTO
            ImportPreviewDTO preview = new ImportPreviewDTO(rows, validationResults);
            
            return ResponseEntity.ok(preview);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to parse Excel file: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    /**
     * Execute import - import valid products into database
     * POST /api/import/products/execute
     */
    @PostMapping("/products/execute")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> executeImport(@RequestParam("file") MultipartFile file) {
        try {
            // Validate file
            if (file.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "File is empty"));
            }
            
            String filename = file.getOriginalFilename();
            if (filename == null || (!filename.endsWith(".xlsx") && !filename.endsWith(".xls"))) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "File must be Excel format (.xlsx or .xls)"));
            }
            
            // Parse Excel
            List<ProductImportRow> rows = importService.parseExcel(file);
            
            if (rows.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "No data found in Excel file"));
            }
            
            // Execute import
            ImportResultDTO result = importService.importProducts(rows);
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to import products: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}
