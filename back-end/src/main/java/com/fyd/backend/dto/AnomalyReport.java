package com.fyd.backend.dto;

import java.time.LocalDateTime;

public class AnomalyReport {
    
    public enum AnomalyType {
        REVENUE,    // Doanh thu bất thường
        ORDER,      // Đơn hàng bất thường
        INVENTORY   // Tồn kho bất thường
    }
    
    public enum Severity {
        LOW,
        MEDIUM,
        HIGH
    }

    private AnomalyType type;
    private Severity severity;
    private String title;
    private String description;
    private LocalDateTime detectedAt;
    private String relatedValue;
    private String suggestion;

    public AnomalyReport() {}

    public AnomalyReport(AnomalyType type, Severity severity, String title, String description, String relatedValue) {
        this.type = type;
        this.severity = severity;
        this.title = title;
        this.description = description;
        this.detectedAt = LocalDateTime.now();
        this.relatedValue = relatedValue;
    }

    public AnomalyReport(AnomalyType type, Severity severity, String title, String description, String relatedValue, String suggestion) {
        this(type, severity, title, description, relatedValue);
        this.suggestion = suggestion;
    }

    public AnomalyType getType() {
        return type;
    }

    public void setType(AnomalyType type) {
        this.type = type;
    }

    public Severity getSeverity() {
        return severity;
    }

    public void setSeverity(Severity severity) {
        this.severity = severity;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getDetectedAt() {
        return detectedAt;
    }

    public void setDetectedAt(LocalDateTime detectedAt) {
        this.detectedAt = detectedAt;
    }

    public String getRelatedValue() {
        return relatedValue;
    }

    public void setRelatedValue(String relatedValue) {
        this.relatedValue = relatedValue;
    }

    public String getSuggestion() {
        return suggestion;
    }

    public void setSuggestion(String suggestion) {
        this.suggestion = suggestion;
    }
}
