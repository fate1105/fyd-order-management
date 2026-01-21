package com.fyd.backend.dto;

import java.util.List;

public class AiProductResponse {
    private boolean success;
    private String generatedDescription;
    private String suggestedCategory;
    private List<String> suggestedKeywords;
    private String error;

    public static AiProductResponse success(String description, String category, List<String> keywords) {
        AiProductResponse response = new AiProductResponse();
        response.setSuccess(true);
        response.setGeneratedDescription(description);
        response.setSuggestedCategory(category);
        response.setSuggestedKeywords(keywords);
        return response;
    }

    public static AiProductResponse descriptionOnly(String description) {
        AiProductResponse response = new AiProductResponse();
        response.setSuccess(true);
        response.setGeneratedDescription(description);
        return response;
    }

    public static AiProductResponse categoryOnly(String category, List<String> keywords) {
        AiProductResponse response = new AiProductResponse();
        response.setSuccess(true);
        response.setSuggestedCategory(category);
        response.setSuggestedKeywords(keywords);
        return response;
    }

    public static AiProductResponse error(String errorMessage) {
        AiProductResponse response = new AiProductResponse();
        response.setSuccess(false);
        response.setError(errorMessage);
        return response;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getGeneratedDescription() {
        return generatedDescription;
    }

    public void setGeneratedDescription(String generatedDescription) {
        this.generatedDescription = generatedDescription;
    }

    public String getSuggestedCategory() {
        return suggestedCategory;
    }

    public void setSuggestedCategory(String suggestedCategory) {
        this.suggestedCategory = suggestedCategory;
    }

    public List<String> getSuggestedKeywords() {
        return suggestedKeywords;
    }

    public void setSuggestedKeywords(List<String> suggestedKeywords) {
        this.suggestedKeywords = suggestedKeywords;
    }

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }
}
