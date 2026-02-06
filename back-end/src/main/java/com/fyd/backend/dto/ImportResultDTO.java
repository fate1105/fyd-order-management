package com.fyd.backend.dto;

import java.util.ArrayList;
import java.util.List;

/**
 * DTO for import execution result
 * Contains success/failure counts and created product IDs
 */
public class ImportResultDTO {
    private int successCount;
    private int failureCount;
    private List<String> errors;
    private List<Long> createdProductIds;
    
    public ImportResultDTO() {
        this.successCount = 0;
        this.failureCount = 0;
        this.errors = new ArrayList<>();
        this.createdProductIds = new ArrayList<>();
    }
    
    public void incrementSuccess(Long productId) {
        this.successCount++;
        this.createdProductIds.add(productId);
    }
    
    public void incrementFailure(String error) {
        this.failureCount++;
        this.errors.add(error);
    }
    
    // Getters and Setters
    public int getSuccessCount() { return successCount; }
    public void setSuccessCount(int successCount) { this.successCount = successCount; }
    
    public int getFailureCount() { return failureCount; }
    public void setFailureCount(int failureCount) { this.failureCount = failureCount; }
    
    public List<String> getErrors() { return errors; }
    public void setErrors(List<String> errors) { this.errors = errors; }
    
    public List<Long> getCreatedProductIds() { return createdProductIds; }
    public void setCreatedProductIds(List<Long> createdProductIds) { this.createdProductIds = createdProductIds; }
}
