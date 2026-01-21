package com.fyd.backend.dto;

public class AiChatRequest {
    private String message;
    private String context; // "shop" or "admin"

    public AiChatRequest() {}

    public AiChatRequest(String message, String context) {
        this.message = message;
        this.context = context;
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
}
