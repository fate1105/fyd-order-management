package com.fyd.backend.controller;

import com.fyd.backend.dto.CustomerDTO;
import com.fyd.backend.entity.Customer;
import com.fyd.backend.repository.CustomerRepository;
import com.fyd.backend.repository.CustomerTierRepository;
import com.fyd.backend.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.util.StringUtils;
import org.springframework.http.MediaType;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/customers")
@CrossOrigin(origins = "*")
public class CustomerController {

    @Autowired
    private CustomerRepository customerRepository;
    
    @Autowired
    private CustomerTierRepository tierRepository;
    
    @Autowired
    private OrderRepository orderRepository;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getCustomers(
            @RequestParam(defaultValue = "") String q,
            @RequestParam(required = false) Long tierId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("createdAt").descending());
        
        Page<Customer> customerPage;
        if (tierId != null) {
            customerPage = customerRepository.findByTier(tierId, pageRequest);
        } else if (!q.isEmpty()) {
            customerPage = customerRepository.search(q, pageRequest);
        } else {
            customerPage = customerRepository.findAll(pageRequest);
        }
        
        List<CustomerDTO> customers = customerPage.getContent().stream()
            .map(CustomerDTO::fromEntity)
            .collect(Collectors.toList());
        
        // Tier counts
        Map<String, Long> tierCounts = new HashMap<>();
        tierCounts.put("all", customerRepository.count());
        tierCounts.put("VIP", customerRepository.countByTierName("VIP"));
        tierCounts.put("Gold", customerRepository.countByTierName("Gold"));
        tierCounts.put("Silver", customerRepository.countByTierName("Silver"));
        tierCounts.put("Member", customerRepository.countByTierName("Member"));
        tierCounts.put("New", customerRepository.countByTierName("New"));
        
        Map<String, Object> response = new HashMap<>();
        response.put("customers", customers);
        response.put("currentPage", customerPage.getNumber());
        response.put("totalItems", customerPage.getTotalElements());
        response.put("totalPages", customerPage.getTotalPages());
        response.put("tierCounts", tierCounts);
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CustomerDTO> getCustomer(@PathVariable Long id) {
        try {
            return customerRepository.findById(id)
                .map(customer -> {
                    try {
                        return CustomerDTO.fromEntity(customer);
                    } catch (Exception e) {
                        System.err.println("Error converting customer to DTO: " + e.getMessage());
                        e.printStackTrace();
                        throw new RuntimeException("Failed to convert customer", e);
                    }
                })
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            System.err.println("Error fetching customer " + id + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/phone/{phone}")
    public ResponseEntity<CustomerDTO> getCustomerByPhone(@PathVariable String phone) {
        return customerRepository.findByPhone(phone)
            .map(CustomerDTO::fromEntity)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<CustomerDTO> getCustomerByEmail(@PathVariable String email) {
        return customerRepository.findByEmail(email)
            .map(CustomerDTO::fromEntity)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCustomer(@PathVariable Long id, @RequestBody CustomerDTO dto) {
        return customerRepository.findById(id)
            .map(customer -> {
                if (dto.getFullName() != null) customer.setFullName(dto.getFullName());
                
                // Handle unique constraints and empty strings
                if (dto.getPhone() != null) {
                    String phone = dto.getPhone().trim();
                    if (phone.isEmpty()) {
                        customer.setPhone(null);
                    } else {
                        customer.setPhone(phone);
                    }
                }
                
                if (dto.getAvatarUrl() != null) customer.setAvatarUrl(dto.getAvatarUrl());
                if (dto.getGender() != null) customer.setGender(dto.getGender());
                
                customer.setUpdatedAt(java.time.LocalDateTime.now());
                try {
                    Customer saved = customerRepository.save(customer);
                    return ResponseEntity.ok(CustomerDTO.fromEntity(saved));
                } catch (Exception e) {
                    e.printStackTrace();
                    Map<String, String> errorResponse = new HashMap<>();
                    errorResponse.put("message", "Lỗi cập nhật thông tin: " + e.getMessage());
                    return ResponseEntity.status(409).body(errorResponse);
                }
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/avatar")
    public ResponseEntity<Map<String, String>> uploadAvatar(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "File is empty"));
        }

        return customerRepository.findById(id)
            .map(customer -> {
                try {
                    // Create uploads directory if not exists
                    String uploadDir = "./uploads/avatars";
                    Path uploadPath = Paths.get(uploadDir);
                    if (!Files.exists(uploadPath)) {
                        Files.createDirectories(uploadPath);
                    }

                    // Generate unique filename
                    String fileName = StringUtils.cleanPath(file.getOriginalFilename());
                    String uniqueFileName = UUID.randomUUID().toString() + "_" + fileName;
                    
                    try (InputStream inputStream = file.getInputStream()) {
                        Path filePath = uploadPath.resolve(uniqueFileName);
                        Files.copy(inputStream, filePath, StandardCopyOption.REPLACE_EXISTING);
                        
                        // Set avatar URL (assuming backend runs on localhost:8080)
                        String fileUrl = "http://localhost:8080/uploads/avatars/" + uniqueFileName;
                        
                        customer.setAvatarUrl(fileUrl);
                        customer.setUpdatedAt(java.time.LocalDateTime.now());
                        customerRepository.save(customer);
                        
                        return ResponseEntity.ok(Map.of("url", fileUrl));
                    }
                } catch (IOException e) {
                    return ResponseEntity.internalServerError().body(Map.of("error", "Failed to upload file: " + e.getMessage()));
                }
            })
            .orElse(ResponseEntity.notFound().build());
    }
}
