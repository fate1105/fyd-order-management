package com.fyd.backend.repository;

import com.fyd.backend.entity.Customer;
import com.fyd.backend.entity.NightMarketOffer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NightMarketOfferRepository extends JpaRepository<NightMarketOffer, Long> {
    List<NightMarketOffer> findByCustomer(Customer customer);
    void deleteByCustomer(Customer customer);
}
