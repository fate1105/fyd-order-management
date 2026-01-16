package com.fyd.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;

import java.util.Map;

/**
 * Service for OAuth authentication with Google and Facebook.
 * Handles token verification and user info retrieval.
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4
 */
@Service
public class OAuthService {

    @Value("${oauth.google.client-id:}")
    private String googleClientId;

    @Value("${oauth.facebook.app-id:}")
    private String facebookAppId;

    @Value("${oauth.facebook.app-secret:}")
    private String facebookAppSecret;

    private final RestTemplate restTemplate;

    public OAuthService() {
        this.restTemplate = new RestTemplate();
    }

    /**
     * Verify Google OAuth token and retrieve user info.
     * 
     * Requirement 2.1: WHEN a customer clicks "Đăng nhập với Google" 
     * THEN THE Customer_Auth_System SHALL initiate Google OAuth flow
     * 
     * @param accessToken Google OAuth access token
     * @return OAuthUserInfo with user details, or null if verification fails
     */
    public OAuthUserInfo verifyGoogleToken(String accessToken) {
        if (accessToken == null || accessToken.isBlank()) {
            return null;
        }

        try {
            // Google's tokeninfo endpoint to verify the access token
            String url = "https://www.googleapis.com/oauth2/v3/userinfo";
            
            // Make request with access token in Authorization header
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.setBearerAuth(accessToken);
            org.springframework.http.HttpEntity<String> entity = new org.springframework.http.HttpEntity<>(headers);
            
            ResponseEntity<Map> response = restTemplate.exchange(
                url, 
                org.springframework.http.HttpMethod.GET, 
                entity, 
                Map.class
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> userInfo = response.getBody();
                
                String email = (String) userInfo.get("email");
                String name = (String) userInfo.get("name");
                String sub = (String) userInfo.get("sub"); // Google user ID
                String picture = (String) userInfo.get("picture");

                if (email != null && sub != null) {
                    return new OAuthUserInfo(sub, email, name, picture, "google");
                }
            }
        } catch (Exception e) {
            // Log error but don't expose details to client
            System.err.println("Google OAuth verification failed: " + e.getMessage());
        }

        return null;
    }

    /**
     * Verify Facebook OAuth token and retrieve user info.
     * 
     * Requirement 2.2: WHEN a customer clicks "Đăng nhập với Facebook" 
     * THEN THE Customer_Auth_System SHALL initiate Facebook OAuth flow
     * 
     * @param accessToken Facebook OAuth access token
     * @return OAuthUserInfo with user details, or null if verification fails
     */
    public OAuthUserInfo verifyFacebookToken(String accessToken) {
        if (accessToken == null || accessToken.isBlank()) {
            return null;
        }

        try {
            // Facebook Graph API to get user info
            String url = "https://graph.facebook.com/me?fields=id,name,email,picture&access_token=" + accessToken;
            
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> userInfo = response.getBody();
                
                String id = (String) userInfo.get("id");
                String email = (String) userInfo.get("email");
                String name = (String) userInfo.get("name");
                
                // Extract picture URL from nested object
                String picture = null;
                if (userInfo.get("picture") instanceof Map) {
                    Map<String, Object> pictureData = (Map<String, Object>) userInfo.get("picture");
                    if (pictureData.get("data") instanceof Map) {
                        Map<String, Object> data = (Map<String, Object>) pictureData.get("data");
                        picture = (String) data.get("url");
                    }
                }

                if (id != null) {
                    // Facebook may not always return email (depends on permissions)
                    return new OAuthUserInfo(id, email, name, picture, "facebook");
                }
            }
        } catch (Exception e) {
            // Log error but don't expose details to client
            System.err.println("Facebook OAuth verification failed: " + e.getMessage());
        }

        return null;
    }

    /**
     * Data class to hold OAuth user information.
     */
    public static class OAuthUserInfo {
        private final String oauthId;
        private final String email;
        private final String name;
        private final String picture;
        private final String provider;

        public OAuthUserInfo(String oauthId, String email, String name, String picture, String provider) {
            this.oauthId = oauthId;
            this.email = email;
            this.name = name;
            this.picture = picture;
            this.provider = provider;
        }

        public String getOauthId() { return oauthId; }
        public String getEmail() { return email; }
        public String getName() { return name; }
        public String getPicture() { return picture; }
        public String getProvider() { return provider; }
    }
}
