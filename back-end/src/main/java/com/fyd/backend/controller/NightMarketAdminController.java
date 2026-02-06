package com.fyd.backend.controller;

import com.fyd.backend.entity.NightMarketConfig;
import com.fyd.backend.repository.NightMarketConfigRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/night-market")
@CrossOrigin(origins = "*")
public class NightMarketAdminController {

    @Autowired
    private NightMarketConfigRepository configRepository;

    @GetMapping("/config")
    public ResponseEntity<?> getConfig() {
        NightMarketConfig config = configRepository.findFirstByIsActiveTrue()
                .orElseGet(() -> {
                    NightMarketConfig newConfig = new NightMarketConfig();
                    return configRepository.save(newConfig);
                });
        return ResponseEntity.ok(config);
    }

    @PutMapping("/config")
    public ResponseEntity<?> updateConfig(@RequestBody NightMarketConfig config) {
        NightMarketConfig existing = configRepository.findFirstByIsActiveTrue()
                .orElseGet(NightMarketConfig::new);
        
        existing.setMinOffers(config.getMinOffers());
        existing.setMaxOffers(config.getMaxOffers());
        existing.setMinDiscountPercent(config.getMinDiscountPercent());
        existing.setMaxDiscountPercent(config.getMaxDiscountPercent());
        existing.setOfferDurationDays(config.getOfferDurationDays());
        existing.setIsActive(true);
        
        return ResponseEntity.ok(configRepository.save(existing));
    }
}
