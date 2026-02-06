package com.fyd.backend.controller;

import com.fyd.backend.dto.GiftCardDTO;
import com.fyd.backend.entity.GiftCard;
import com.fyd.backend.service.GiftCardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class GiftCardController {

    @Autowired
    private GiftCardService giftCardService;

    // ========== PUBLIC ENDPOINTS ==========

    @GetMapping("/gift-cards/{code}/balance")
    public ResponseEntity<?> checkBalance(@PathVariable String code) {
        try {
            GiftCardDTO dto = giftCardService.checkBalance(code);
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/gift-cards/{code}/redeem")
    public ResponseEntity<?> redeemGiftCard(
            @PathVariable String code,
            @RequestBody Map<String, Object> request) {
        try {
            BigDecimal amount = new BigDecimal(request.get("amount").toString());
            Long orderId = request.get("orderId") != null ?
                    Long.parseLong(request.get("orderId").toString()) : null;

            BigDecimal redeemedAmount = giftCardService.redeemGiftCard(code, amount, orderId);

            Map<String, Object> response = new HashMap<>();
            response.put("redeemedAmount", redeemedAmount);
            response.put("message", "Gift card redeemed successfully");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ========== ADMIN ENDPOINTS ==========

    @GetMapping("/admin/gift-cards")
    public ResponseEntity<?> getAllGiftCards(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search) {
        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
            Page<GiftCard> giftCards;

            if (search != null && !search.isEmpty()) {
                giftCards = giftCardService.searchGiftCards(search, pageable);
            } else {
                giftCards = giftCardService.getAllGiftCards(pageable);
            }

            Page<GiftCardDTO> dtoPage = giftCards.map(giftCardService::toDTO);
            return ResponseEntity.ok(dtoPage);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/admin/gift-cards")
    public ResponseEntity<?> createGiftCard(@RequestBody GiftCardDTO dto) {
        try {
            GiftCard created = giftCardService.createGiftCard(dto);
            return ResponseEntity.ok(giftCardService.toDTO(created));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/admin/gift-cards/{id}")
    public ResponseEntity<?> cancelGiftCard(@PathVariable Long id) {
        try {
            giftCardService.cancelGiftCard(id);
            return ResponseEntity.ok(Map.of("message", "Gift card cancelled"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
