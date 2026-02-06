package com.fyd.backend.dto;

import java.util.List;

/**
 * DTO for import preview response
 * Contains parsed rows and validation results
 */
public class ImportPreviewDTO {
    private List<ProductImportRow> rows;
    private List<ValidationResult> validationResults;
    private int totalRows;
    private int validRows;
    private int invalidRows;
    
    public ImportPreviewDTO() {}
    
    public ImportPreviewDTO(List<ProductImportRow> rows, List<ValidationResult> validationResults) {
        this.rows = rows;
        this.validationResults = validationResults;
        this.totalRows = rows.size();
        this.validRows = (int) validationResults.stream().filter(ValidationResult::isValid).count();
        this.invalidRows = totalRows - validRows;
    }
    
    // Getters and Setters
    public List<ProductImportRow> getRows() { return rows; }
    public void setRows(List<ProductImportRow> rows) { this.rows = rows; }
    
    public List<ValidationResult> getValidationResults() { return validationResults; }
    public void setValidationResults(List<ValidationResult> validationResults) { this.validationResults = validationResults; }
    
    public int getTotalRows() { return totalRows; }
    public void setTotalRows(int totalRows) { this.totalRows = totalRows; }
    
    public int getValidRows() { return validRows; }
    public void setValidRows(int validRows) { this.validRows = validRows; }
    
    public int getInvalidRows() { return invalidRows; }
    public void setInvalidRows(int invalidRows) { this.invalidRows = invalidRows; }
}
