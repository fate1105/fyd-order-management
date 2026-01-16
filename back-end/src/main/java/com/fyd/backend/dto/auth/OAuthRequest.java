package com.fyd.backend.dto.auth;

/**
 * Request DTO for OAuth authentication (Google/Facebook)
 */
public class OAuthRequest {
    private String accessToken;

    public OAuthRequest() {}

    public OAuthRequest(String accessToken) {
        this.accessToken = accessToken;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }
}
