package com.fyd.backend.controller;

import com.fyd.backend.service.ForecastService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * REST Controller for AI-powered sales forecasting.
 * Provides endpoints for sales predictions and trend analysis.
 */
@RestController
@RequestMapping("/api/forecast")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000", "https://fydvn.vercel.app"})
public class ForecastController {

    @Autowired
    private ForecastService forecastService;

    /**
     * Get sales forecast for the next N days.
     */
    @GetMapping("/sales")
    public ResponseEntity<Map<String, Object>> getSalesForecast(
            @RequestParam(defaultValue = "7") int days) {
        try {
            Map<String, Object> forecast = forecastService.getSalesForecast(days);
            return ResponseEntity.ok(forecast);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", "Error generating forecast: " + e.getMessage()
            ));
        }
    }

    /**
     * Get product-specific demand forecast.
     */
    @GetMapping("/product/{productId}")
    public ResponseEntity<Map<String, Object>> getProductDemandForecast(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "14") int days) {
        try {
            Map<String, Object> forecast = forecastService.getProductDemandForecast(productId, days);
            return ResponseEntity.ok(forecast);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", "Error generating forecast: " + e.getMessage()
            ));
        }
    }

    /**
     * Get monthly revenue forecast with trend analysis.
     */
    @GetMapping("/revenue")
    public ResponseEntity<Map<String, Object>> getRevenueForecast() {
        try {
            Map<String, Object> forecast = forecastService.getRevenueForecast();
            return ResponseEntity.ok(forecast);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", "Error generating forecast: " + e.getMessage()
            ));
        }
    }
}
