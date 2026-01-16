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

import java.util.HashMap;
import java.util.List;
import java.util.Map;
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
        return customerRepository.findById(id)
            .map(CustomerDTO::fromEntity)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
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
}
