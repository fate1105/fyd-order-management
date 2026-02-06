package com.fyd.backend.controller;

import com.fyd.backend.dto.SharedWishlistDTO;
import com.fyd.backend.service.SharedWishlistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/wishlist")
@CrossOrigin(origins = "*")
public class SharedWishlistController {

    @Autowired
    private SharedWishlistService sharedWishlistService;

    /**
     * Create a shareable link for the given wishlist
     * POST /api/wishlist/share
     */
    @PostMapping("/share")
    public ResponseEntity<SharedWishlistDTO.ShareResponse> createShareLink(
            @RequestBody SharedWishlistDTO.CreateRequest request) {
        try {
            SharedWishlistDTO.ShareResponse response = sharedWishlistService.createShareLink(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Get a shared wishlist by its share code
     * GET /api/wishlist/share/{code}
     */
    @GetMapping("/share/{code}")
    public ResponseEntity<SharedWishlistDTO.ViewResponse> getSharedWishlist(@PathVariable("code") String code) {
        try {
            SharedWishlistDTO.ViewResponse response = sharedWishlistService.getSharedWishlist(code);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
