package com.fyd.backend.dto;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * DTO for AI action apply request and response.
 */
public class AiActionResult {
    
    // Request fields
    private String insightId;
    private String actionType;
    private String category;
    private Map<String, Object> insightData;
    
    // Result fields
    private boolean success;
    private String title;
    private String summary;
    private String reasoning;
    private ActionDetails actionDetails;
    private RiskAssessment riskAssessment;
    private LocalDateTime timestamp;
    
    public static class ActionDetails {
        private String actionPerformed;
        private String sku;
        private String productName;
        private Integer currentStock;
        private Integer recommendedQuantity;
        private Integer safetyStock;
        private Double dailySalesVelocity;
        private Integer daysUntilRestock;
        private String priority; // HIGH, MEDIUM, LOW
        private String status; // PENDING, CREATED
        private LocalDateTime reminderTime; // Thời gian nhắc hẹn
        
        // Getters and Setters
        public String getActionPerformed() { return actionPerformed; }
        public void setActionPerformed(String actionPerformed) { this.actionPerformed = actionPerformed; }
        
        public String getSku() { return sku; }
        public void setSku(String sku) { this.sku = sku; }
        
        public String getProductName() { return productName; }
        public void setProductName(String productName) { this.productName = productName; }
        
        public Integer getCurrentStock() { return currentStock; }
        public void setCurrentStock(Integer currentStock) { this.currentStock = currentStock; }
        
        public Integer getRecommendedQuantity() { return recommendedQuantity; }
        public void setRecommendedQuantity(Integer recommendedQuantity) { this.recommendedQuantity = recommendedQuantity; }
        
        public Integer getSafetyStock() { return safetyStock; }
        public void setSafetyStock(Integer safetyStock) { this.safetyStock = safetyStock; }
        
        public Double getDailySalesVelocity() { return dailySalesVelocity; }
        public void setDailySalesVelocity(Double dailySalesVelocity) { this.dailySalesVelocity = dailySalesVelocity; }
        
        public Integer getDaysUntilRestock() { return daysUntilRestock; }
        public void setDaysUntilRestock(Integer daysUntilRestock) { this.daysUntilRestock = daysUntilRestock; }
        
        public String getPriority() { return priority; }
        public void setPriority(String priority) { this.priority = priority; }
        
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        
        public LocalDateTime getReminderTime() { return reminderTime; }
        public void setReminderTime(LocalDateTime reminderTime) { this.reminderTime = reminderTime; }
    }
    
    public static class RiskAssessment {
        private String riskLevel; // HIGH, MEDIUM, LOW
        private String riskDescription;
        private Integer estimatedLostSales;
        private String recommendation;
        
        // Getters and Setters
        public String getRiskLevel() { return riskLevel; }
        public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }
        
        public String getRiskDescription() { return riskDescription; }
        public void setRiskDescription(String riskDescription) { this.riskDescription = riskDescription; }
        
        public Integer getEstimatedLostSales() { return estimatedLostSales; }
        public void setEstimatedLostSales(Integer estimatedLostSales) { this.estimatedLostSales = estimatedLostSales; }
        
        public String getRecommendation() { return recommendation; }
        public void setRecommendation(String recommendation) { this.recommendation = recommendation; }
    }
    
    // Builder
    public static Builder builder() { return new Builder(); }
    
    public static class Builder {
        private final AiActionResult result = new AiActionResult();
        
        public Builder success(boolean success) { result.success = success; return this; }
        public Builder title(String title) { result.title = title; return this; }
        public Builder summary(String summary) { result.summary = summary; return this; }
        public Builder reasoning(String reasoning) { result.reasoning = reasoning; return this; }
        public Builder actionDetails(ActionDetails details) { result.actionDetails = details; return this; }
        public Builder riskAssessment(RiskAssessment risk) { result.riskAssessment = risk; return this; }
        public Builder timestamp(LocalDateTime timestamp) { result.timestamp = timestamp; return this; }
        
        public AiActionResult build() { return result; }
    }
    
    // Getters and Setters
    public String getInsightId() { return insightId; }
    public void setInsightId(String insightId) { this.insightId = insightId; }
    
    public String getActionType() { return actionType; }
    public void setActionType(String actionType) { this.actionType = actionType; }
    
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    
    public Map<String, Object> getInsightData() { return insightData; }
    public void setInsightData(Map<String, Object> insightData) { this.insightData = insightData; }
    
    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }
    
    public String getReasoning() { return reasoning; }
    public void setReasoning(String reasoning) { this.reasoning = reasoning; }
    
    public ActionDetails getActionDetails() { return actionDetails; }
    public void setActionDetails(ActionDetails actionDetails) { this.actionDetails = actionDetails; }
    
    public RiskAssessment getRiskAssessment() { return riskAssessment; }
    public void setRiskAssessment(RiskAssessment riskAssessment) { this.riskAssessment = riskAssessment; }
    
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
