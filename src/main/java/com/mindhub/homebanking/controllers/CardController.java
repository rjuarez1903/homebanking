package com.mindhub.homebanking.controllers;

import com.mindhub.homebanking.dtos.CardDTO;
import com.mindhub.homebanking.models.Card;
import com.mindhub.homebanking.models.CardColor;
import com.mindhub.homebanking.models.CardType;
import com.mindhub.homebanking.models.Client;
import com.mindhub.homebanking.repositories.CardRepository;
import com.mindhub.homebanking.repositories.ClientRepository;
import com.mindhub.homebanking.utils.Utilities;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashSet;
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

    @RequestMapping("/clients/current/cards")
        public List<CardDTO> getCurrentCards(Authentication authentication) {
            return clientRepository.findByEmail(authentication.getName()).getCards().stream().map(CardDTO::new).collect(Collectors.toList());
        }

    @RequestMapping(path = "/clients/current/cards", method = RequestMethod.POST)
    public ResponseEntity<Object> createCard(Authentication authentication, @RequestParam CardColor color, @RequestParam CardType type) {
        Client client = clientRepository.findByEmail(authentication.getName());

        if (client != null) {

            Set<Card> activeClientCards = client.getCards().stream().filter(card -> !card.isExpired()).collect(Collectors.toSet());

            if (activeClientCards.stream().filter(card -> card.getType() == type).count() > 2) {
                return new ResponseEntity<>("Can't generate more than 3 " + type.toString().toLowerCase() + " cards per client.", HttpStatus.FORBIDDEN);
            } else if (cardRepository.findByCardholderAndTypeAndColorAndExpired(client.getFullName(), type, color, false) != null) {
                return new ResponseEntity<>("Can't generate more than 1 card of the same type and color.", HttpStatus.FORBIDDEN);
            } else {
                Integer cvv = Utilities.getCvvNumber();
                String number;
                do {
                    number = Utilities.getRandomCardNumbers();
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
}
