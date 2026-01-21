package com.fyd.backend.dto;

public class AiChatResponse {
    private String reply;
    private boolean success;
    private String error;

    public AiChatResponse() {}

    public AiChatResponse(String reply, boolean success) {
        this.reply = reply;
        this.success = success;
    }

    public static AiChatResponse success(String reply) {
        AiChatResponse response = new AiChatResponse();
        response.setReply(reply);
        response.setSuccess(true);
        return response;
    }

    public static AiChatResponse error(String error) {
        AiChatResponse response = new AiChatResponse();
        response.setError(error);
        response.setSuccess(false);
        return response;
    }

    public String getReply() {
        return reply;
    }

    public void setReply(String reply) {
        this.reply = reply;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }
}
