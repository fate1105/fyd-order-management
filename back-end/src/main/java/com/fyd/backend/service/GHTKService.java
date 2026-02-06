package com.fyd.backend.service;

import com.fyd.backend.entity.Order;
import com.fyd.backend.entity.OrderItem;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class GHTKService {

    @Value("${ghtk.api-token}")
    private String apiToken;

    @Value("${ghtk.api-url}")
    private String apiUrl;

    @Value("${ghtk.tracking-url:https://services.ghtk.vn/services/shipment/v2/status/}")
    private String trackingUrl;

    private final RestTemplate restTemplate;

    public GHTKService() {
        org.springframework.http.client.SimpleClientHttpRequestFactory factory = new org.springframework.http.client.SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5000);
        factory.setReadTimeout(10000);
        this.restTemplate = new RestTemplate(factory);
    }

    public Map<String, Object> createShippingOrder(Order order) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Token", apiToken);
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> body = new HashMap<>();
        
        // Product info
        List<Map<String, Object>> products = new ArrayList<>();
        for (OrderItem item : order.getItems()) {
            Map<String, Object> p = new HashMap<>();
            p.put("name", item.getProductName());
            p.put("weight", 0.5); // Default weight in kg
            p.put("quantity", item.getQuantity());
            p.put("product_code", item.getVariant() != null ? item.getVariant().getSkuVariant() : "");
            products.add(p);
        }

        // Order info
        Map<String, Object> orderInfo = new HashMap<>();
        orderInfo.put("id", order.getOrderCode());
        orderInfo.put("pick_name", "FYD Store");
        orderInfo.put("pick_address", "123 Lý Tự Trọng");
        orderInfo.put("pick_province", "TP. Hồ Chí Minh");
        orderInfo.put("pick_district", "Quận 1");
        orderInfo.put("pick_ward", "Phường Bến Thành");
        orderInfo.put("pick_tel", "0912345678");
        
        orderInfo.put("tel", order.getShippingPhone());
        orderInfo.put("name", order.getShippingName());
        orderInfo.put("address", order.getShippingAddress());
        orderInfo.put("province", order.getShippingProvince());
        orderInfo.put("district", order.getShippingDistrict());
        orderInfo.put("ward", order.getShippingWard());
        
        orderInfo.put("hamlet", "Khác");
        orderInfo.put("is_freeship", (order.getShippingFee() != null && order.getShippingFee().doubleValue() == 0) ? 1 : 0);
        orderInfo.put("pick_money", "COD".equalsIgnoreCase(order.getPaymentMethod()) ? order.getTotalAmount().intValue() : 0);
        orderInfo.put("value", order.getTotalAmount().intValue());
        orderInfo.put("transport", "road");

        body.put("products", products);
        body.put("order", orderInfo);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(apiUrl, HttpMethod.POST, entity, Map.class);
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                return (Map<String, Object>) response.getBody();
            }
        } catch (org.springframework.web.client.HttpClientErrorException e) {
            System.err.println("GHTK API Error Body: " + e.getResponseBodyAsString());
            try {
                // Try to parse the error body as a Map
                return new com.fasterxml.jackson.databind.ObjectMapper().readValue(e.getResponseBodyAsString(), Map.class);
            } catch (Exception ex) {
                return Map.of("success", false, "message", e.getMessage(), "error_body", e.getResponseBodyAsString());
            }
        } catch (Exception e) {
            System.err.println("GHTK API Error: " + e.getMessage());
            return Map.of("success", false, "message", e.getMessage());
        }

        return Map.of("success", false, "message", "Unknown error occurred");
    }

    /**
     * Get tracking status from GHTK
     */
    public Map<String, Object> getTrackingInfo(String trackingNumber) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Token", apiToken);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        try {
            String url = trackingUrl + trackingNumber;
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, entity, Map.class);
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                return (Map<String, Object>) response.getBody();
            }
        } catch (Exception e) {
            System.err.println("GHTK Tracking API Error: " + e.getMessage());
        }
        return null;
    }
}
