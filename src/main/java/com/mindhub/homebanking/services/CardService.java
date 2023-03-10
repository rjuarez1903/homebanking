package com.mindhub.homebanking.services;

import com.mindhub.homebanking.models.Card;
import com.mindhub.homebanking.repositories.CardRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CardService {

    @Autowired
    CardRepository cardRepository;

    @Scheduled(fixedRate = 86400000)
    public void updateIfExpired() {
        List<Card> activeCards = cardRepository.findAllByExpired(false);
        activeCards.forEach(card -> {
            if (LocalDateTime.now().isAfter(card.getThruDate())){
                card.setExpired(true);
                cardRepository.save(card);
            }
        });
    }
}
