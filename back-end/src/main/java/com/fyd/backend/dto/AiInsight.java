package com.fyd.backend.dto;

import java.util.List;
import java.util.Map;

/**
 * DTO for AI-powered business insights.
 * Each insight includes actionable recommendations with explanations.
 */
public class AiInsight {
    
    private String id;
    private String category;        // inventory_warning, sales_trend, combo_suggestion, promotion_smart
    private String type;            // warning, success, info, alert
    private String title;
    private String description;
    private String reasoning;       // "Vì sao AI đưa ra gợi ý này?"
    private double confidence;      // 0.0 - 1.0
    private Map<String, Object> data;   // Background data (tooltip/expand)
    private List<InsightAction> actions;
    private List<String> skus;
    
    public static class InsightAction {
        private String type;        // apply_sku, create_promotion, create_combo, create_reminder, push_featured
        private String label;
        private String icon;
        private Map<String, Object> payload;
        
        public InsightAction() {}
        
        public InsightAction(String type, String label, String icon) {
            this.type = type;
            this.label = label;
            this.icon = icon;
        }
        
        public InsightAction(String type, String label, String icon, Map<String, Object> payload) {
            this.type = type;
            this.label = label;
            this.icon = icon;
            this.payload = payload;
        }

        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        
        public String getLabel() { return label; }
        public void setLabel(String label) { this.label = label; }
        
        public String getIcon() { return icon; }
        public void setIcon(String icon) { this.icon = icon; }
        
        public Map<String, Object> getPayload() { return payload; }
        public void setPayload(Map<String, Object> payload) { this.payload = payload; }
    }
    
    // Builder pattern for convenient construction
    public static Builder builder() {
        return new Builder();
    }
    
    public static class Builder {
        private final AiInsight insight = new AiInsight();
        
        public Builder id(String id) { insight.id = id; return this; }
        public Builder category(String category) { insight.category = category; return this; }
        public Builder type(String type) { insight.type = type; return this; }
        public Builder title(String title) { insight.title = title; return this; }
        public Builder description(String description) { insight.description = description; return this; }
        public Builder reasoning(String reasoning) { insight.reasoning = reasoning; return this; }
        public Builder confidence(double confidence) { insight.confidence = confidence; return this; }
        public Builder data(Map<String, Object> data) { insight.data = data; return this; }
        public Builder actions(List<InsightAction> actions) { insight.actions = actions; return this; }
        public Builder skus(List<String> skus) { insight.skus = skus; return this; }
        
        public AiInsight build() { return insight; }
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getReasoning() { return reasoning; }
    public void setReasoning(String reasoning) { this.reasoning = reasoning; }

    public double getConfidence() { return confidence; }
    public void setConfidence(double confidence) { this.confidence = confidence; }

    public Map<String, Object> getData() { return data; }
    public void setData(Map<String, Object> data) { this.data = data; }

    public List<InsightAction> getActions() { return actions; }
    public void setActions(List<InsightAction> actions) { this.actions = actions; }

    public List<String> getSkus() { return skus; }
    public void setSkus(List<String> skus) { this.skus = skus; }
}
