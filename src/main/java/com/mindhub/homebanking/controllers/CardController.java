package com.mindhub.homebanking.controllers;

import com.mindhub.homebanking.dtos.CardDTO;
import com.mindhub.homebanking.models.Card;
import com.mindhub.homebanking.models.CardColor;
import com.mindhub.homebanking.models.CardType;
import com.mindhub.homebanking.models.Client;
import com.mindhub.homebanking.repositories.CardRepository;
import com.mindhub.homebanking.repositories.ClientRepository;
import com.mindhub.homebanking.utils.CardUtilities;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class CardController {

    @Autowired
    ClientRepository clientRepository;
    @Autowired
    CardRepository cardRepository;

    @GetMapping("/clients/current/cards")
        public List<CardDTO> getCurrentCards(Authentication authentication) {
            return clientRepository.findByEmail(authentication.getName()).getCards().stream().map(CardDTO::new).collect(Collectors.toList());
        }

    @PostMapping("/clients/current/cards")
    public ResponseEntity<Object> createCard(Authentication authentication, @RequestParam CardColor color, @RequestParam CardType type) {
        Client client = clientRepository.findByEmail(authentication.getName());

        if (client != null) {

            Set<Card> activeClientCards = client.getCards().stream().filter(card -> !card.isExpired()).collect(Collectors.toSet());

            if (activeClientCards.stream().filter(card -> card.getType() == type).count() > 2) {
                return new ResponseEntity<>("Can't generate more than 3 " + type.toString().toLowerCase() + " cards per client.", HttpStatus.FORBIDDEN);
            } else if (cardRepository.findByCardholderAndTypeAndColorAndExpired(client.getFullName(), type, color, false) != null) {
                return new ResponseEntity<>("Can't generate more than 1 card of the same type and color.", HttpStatus.FORBIDDEN);
            } else {
                Integer cvv = CardUtilities.getCvvNumber();
                String number;
                do {
                    number = CardUtilities.getRandomCardNumbers();
                } while (cardRepository.findByNumber(number) != null);
                Card card = new Card(type, color, number, cvv.toString(), LocalDateTime.now(), LocalDateTime.now().plusYears(5), client);
                client.addCard(card);
                cardRepository.save(card);
                return new ResponseEntity<>(HttpStatus.CREATED);
            }
        } else {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
    }

    @PatchMapping("/clients/current/cards/{id}")
        public ResponseEntity<Object> deleteCard(Authentication authentication, @PathVariable Long id) {
        Client client = clientRepository.findByEmail(authentication.getName());

        if (client != null) {
            Set<Card> activeClientCards = client.getCards().stream().filter(card -> !card.isExpired()).collect(Collectors.toSet());
            Set<Card> inactiveClientCards = client.getCards().stream().filter(card -> card.isExpired()).collect(Collectors.toSet());
            Card selectedCard = cardRepository.findById(id).orElse(null);

            if (selectedCard != null) {
                if (activeClientCards.contains(selectedCard)) {
                    selectedCard.setActive(false);
                    cardRepository.save(selectedCard);
                    return new ResponseEntity<>("Card deleted", HttpStatus.OK);
                } else if (inactiveClientCards.contains(selectedCard)){
                    return new ResponseEntity<>("Can't delete expired card", HttpStatus.BAD_REQUEST);
                } else {
                    return new ResponseEntity<>("Card doesn't belong to client", HttpStatus.FORBIDDEN);
                }
            } else {
                return new ResponseEntity<>("Card not found", HttpStatus.BAD_REQUEST);
            }

        } else {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
    }
}
