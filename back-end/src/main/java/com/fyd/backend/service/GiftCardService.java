package com.fyd.backend.service;

import com.fyd.backend.dto.GiftCardDTO;
import com.fyd.backend.entity.GiftCard;
import com.fyd.backend.entity.GiftCard.GiftCardStatus;
import com.fyd.backend.entity.GiftCardTransaction;
import com.fyd.backend.entity.GiftCardTransaction.TransactionType;
import com.fyd.backend.repository.GiftCardRepository;
import com.fyd.backend.repository.GiftCardTransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class GiftCardService {

    private static final String CHARACTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final int CODE_LENGTH = 16;
    private final SecureRandom random = new SecureRandom();

    @Autowired
    private GiftCardRepository giftCardRepository;

    @Autowired
    private GiftCardTransactionRepository transactionRepository;

    @Transactional
    public GiftCard createGiftCard(GiftCardDTO dto) {
        GiftCard giftCard = new GiftCard();
        giftCard.setCode(generateUniqueCode());
        giftCard.setInitialBalance(dto.getInitialBalance());
        giftCard.setCurrentBalance(dto.getInitialBalance());
        giftCard.setPurchaserId(dto.getPurchaserId());
        giftCard.setRecipientEmail(dto.getRecipientEmail());
        giftCard.setRecipientName(dto.getRecipientName());
        giftCard.setMessage(dto.getMessage());
        giftCard.setStatus(GiftCardStatus.ACTIVE);
        giftCard.setExpiresAt(LocalDateTime.now().plusDays(dto.getValidityDays()));

        GiftCard saved = giftCardRepository.save(giftCard);

        // Record purchase transaction
        GiftCardTransaction transaction = new GiftCardTransaction();
        transaction.setGiftCard(saved);
        transaction.setAmount(dto.getInitialBalance());
        transaction.setBalanceAfter(dto.getInitialBalance());
        transaction.setTransactionType(TransactionType.PURCHASE);
        transactionRepository.save(transaction);

        return saved;
    }

    public Optional<GiftCard> getByCode(String code) {
        return giftCardRepository.findByCode(code.toUpperCase().replace("-", ""));
    }

    public GiftCardDTO checkBalance(String code) {
        GiftCard giftCard = getByCode(code)
                .orElseThrow(() -> new RuntimeException("Gift card not found"));

        GiftCardDTO dto = new GiftCardDTO();
        dto.setCode(formatCode(giftCard.getCode()));
        dto.setCurrentBalance(giftCard.getCurrentBalance());
        dto.setStatus(giftCard.getStatus().name());
        dto.setExpiresAt(giftCard.getExpiresAt());
        return dto;
    }

    @Transactional
    public BigDecimal redeemGiftCard(String code, BigDecimal amount, Long orderId) {
        GiftCard giftCard = getByCode(code)
                .orElseThrow(() -> new RuntimeException("Gift card not found"));

        if (!giftCard.isValid()) {
            throw new RuntimeException("Gift card is not valid");
        }

        BigDecimal redeemAmount = amount.min(giftCard.getCurrentBalance());
        BigDecimal newBalance = giftCard.getCurrentBalance().subtract(redeemAmount);

        giftCard.setCurrentBalance(newBalance);
        if (newBalance.compareTo(BigDecimal.ZERO) == 0) {
            giftCard.setStatus(GiftCardStatus.USED);
        }
        giftCardRepository.save(giftCard);

        // Record redemption transaction
        GiftCardTransaction transaction = new GiftCardTransaction();
        transaction.setGiftCard(giftCard);
        transaction.setOrderId(orderId);
        transaction.setAmount(redeemAmount.negate());
        transaction.setBalanceAfter(newBalance);
        transaction.setTransactionType(TransactionType.REDEMPTION);
        transactionRepository.save(transaction);

        return redeemAmount;
    }

    public Page<GiftCard> getAllGiftCards(Pageable pageable) {
        return giftCardRepository.findAll(pageable);
    }

    public Page<GiftCard> searchGiftCards(String search, Pageable pageable) {
        return giftCardRepository.searchGiftCards(search, pageable);
    }

    @Transactional
    public void cancelGiftCard(Long id) {
        GiftCard giftCard = giftCardRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Gift card not found"));
        giftCard.setStatus(GiftCardStatus.CANCELLED);
        giftCardRepository.save(giftCard);
    }

    private String generateUniqueCode() {
        String code;
        do {
            code = generateCode();
        } while (giftCardRepository.findByCode(code).isPresent());
        return code;
    }

    private String generateCode() {
        StringBuilder sb = new StringBuilder(CODE_LENGTH);
        for (int i = 0; i < CODE_LENGTH; i++) {
            sb.append(CHARACTERS.charAt(random.nextInt(CHARACTERS.length())));
        }
        return sb.toString();
    }

    private String formatCode(String code) {
        // Format as XXXX-XXXX-XXXX-XXXX
        if (code.length() == 16) {
            return code.substring(0, 4) + "-" + code.substring(4, 8) + "-" +
                   code.substring(8, 12) + "-" + code.substring(12, 16);
        }
        return code;
    }

    public GiftCardDTO toDTO(GiftCard giftCard) {
        GiftCardDTO dto = new GiftCardDTO();
        dto.setId(giftCard.getId());
        dto.setCode(formatCode(giftCard.getCode()));
        dto.setInitialBalance(giftCard.getInitialBalance());
        dto.setCurrentBalance(giftCard.getCurrentBalance());
        dto.setPurchaserId(giftCard.getPurchaserId());
        dto.setRecipientEmail(giftCard.getRecipientEmail());
        dto.setRecipientName(giftCard.getRecipientName());
        dto.setMessage(giftCard.getMessage());
        dto.setStatus(giftCard.getStatus().name());
        dto.setExpiresAt(giftCard.getExpiresAt());
        dto.setCreatedAt(giftCard.getCreatedAt());
        return dto;
    }
}
