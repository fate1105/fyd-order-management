package com.fyd.backend.dto;

public class AiChatRequest {
    private String message;
    private String context; // "shop" or "admin"
    private Long customerId; // For personalized shop responses

    public AiChatRequest() {}

    public AiChatRequest(String message, String context) {
        this.message = message;
        this.context = context;
    }

    public AiChatRequest(String message, String context, Long customerId) {
        this.message = message;
        this.context = context;
        this.customerId = customerId;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getContext() {
        return context;
    }

    public void setContext(String context) {
        this.context = context;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }
}
