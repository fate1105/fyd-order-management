package com.fyd.backend.controller;

import com.fyd.backend.entity.Order;
import com.fyd.backend.entity.PaymentTransaction;
import com.fyd.backend.repository.OrderRepository;
import com.fyd.backend.repository.PaymentTransactionRepository;
import com.fyd.backend.service.VNPayService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PaymentController {

    @Autowired
    private VNPayService vnpayService;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private PaymentTransactionRepository paymentTransactionRepository;

    @GetMapping("/vnpay/ipn")
    public String vnpayIpn(@RequestParam Map<String, String> allParams) {
        if (vnpayService.validateCallback(allParams)) {
            String orderCode = allParams.get("vnp_TxnRef");
            String vnp_ResponseCode = allParams.get("vnp_ResponseCode");
            String vnp_TransactionNo = allParams.get("vnp_TransactionNo");

            orderRepository.findByOrderCode(orderCode).ifPresent(order -> {
                PaymentTransaction transaction = paymentTransactionRepository.findByOrderId(order.getId())
                        .orElse(new PaymentTransaction());
                
                transaction.setOrder(order);
                transaction.setProvider("VNPAY");
                transaction.setTransactionId(vnp_TransactionNo);
                transaction.setResponseCode(vnp_ResponseCode);
                transaction.setRawResponse(allParams.toString());
                transaction.setUpdatedAt(LocalDateTime.now());

                if ("00".equals(vnp_ResponseCode)) {
                    transaction.setStatus("SUCCESS");
                    order.setPaymentStatus("PAID");
                    order.setPaidAt(LocalDateTime.now());
                    order.setStatus("PROCESSING"); // Auto move to processing after payment
                } else {
                    transaction.setStatus("FAILED");
                    order.setPaymentStatus("FAILED");
                }
                
                paymentTransactionRepository.save(transaction);
                orderRepository.save(order);
            });

            return "{\"RspCode\":\"00\",\"Message\":\"Confirm Success\"}";
        } else {
            return "{\"RspCode\":\"97\",\"Message\":\"Invalid Checksum\"}";
        }
    }

    // This is optional if frontend handles the redirect validation, but usually backend should verify
    @GetMapping("/vnpay/callback")
    public ResponseEntity<?> vnpayCallback(@RequestParam Map<String, String> allParams) {
        boolean isValid = vnpayService.validateCallback(allParams);
        String orderCode = allParams.get("vnp_TxnRef");
        String responseCode = allParams.get("vnp_ResponseCode");

        Map<String, Object> result = Map.of(
            "valid", isValid,
            "orderCode", orderCode != null ? orderCode : "",
            "success", "00".equals(responseCode),
            "status", responseCode
        );

        return ResponseEntity.ok(result);
    }
}
