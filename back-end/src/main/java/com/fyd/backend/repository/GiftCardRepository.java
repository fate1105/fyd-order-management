package com.fyd.backend.repository;

import com.fyd.backend.entity.GiftCard;
import com.fyd.backend.entity.GiftCard.GiftCardStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GiftCardRepository extends JpaRepository<GiftCard, Long> {

    Optional<GiftCard> findByCode(String code);

    List<GiftCard> findByPurchaserId(Long purchaserId);

    List<GiftCard> findByRecipientEmail(String email);

    Page<GiftCard> findByStatus(GiftCardStatus status, Pageable pageable);

    @Query("SELECT g FROM GiftCard g WHERE g.code LIKE %:search% OR g.recipientEmail LIKE %:search% OR g.recipientName LIKE %:search%")
    Page<GiftCard> searchGiftCards(String search, Pageable pageable);

    @Query("SELECT COUNT(g) FROM GiftCard g WHERE g.status = :status")
    long countByStatus(GiftCardStatus status);
}
