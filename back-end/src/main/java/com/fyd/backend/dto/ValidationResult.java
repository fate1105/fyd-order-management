package com.fyd.backend.dto;

import java.util.ArrayList;
import java.util.List;

/**
 * DTO representing validation result for a single import row
 */
public class ValidationResult {
    private int rowNumber;
    private boolean valid;
    private List<String> errors;
    
    public ValidationResult() {
        this.errors = new ArrayList<>();
    }
    
    public ValidationResult(int rowNumber) {
        this.rowNumber = rowNumber;
        this.valid = true;
        this.errors = new ArrayList<>();
    }
    
    public void addError(String error) {
        this.errors.add(error);
        this.valid = false;
    }
    
    public boolean hasErrors() {
        return !errors.isEmpty();
    }
    
    // Getters and Setters
    public int getRowNumber() { return rowNumber; }
    public void setRowNumber(int rowNumber) { this.rowNumber = rowNumber; }
    
    public boolean isValid() { return valid; }
    public void setValid(boolean valid) { this.valid = valid; }
    
    public List<String> getErrors() { return errors; }
    public void setErrors(List<String> errors) { this.errors = errors; }
}
