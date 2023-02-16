package com.mindhub.homebanking.controllers;

import com.mindhub.homebanking.models.Card;
import com.mindhub.homebanking.models.CardColor;
import com.mindhub.homebanking.models.CardType;
import com.mindhub.homebanking.models.Client;
import com.mindhub.homebanking.repositories.CardRepository;
import com.mindhub.homebanking.repositories.ClientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.concurrent.ThreadLocalRandom;

@RestController
@RequestMapping("/api")
public class CardController {

    @Autowired
    ClientRepository clientRepository;
    @Autowired
    CardRepository cardRepository;

    @RequestMapping(path = "/clients/current/cards", method = RequestMethod.POST)
        public ResponseEntity<Object> createCard(Authentication authentication, @RequestParam CardColor color, @RequestParam CardType type) {
        Client client = clientRepository.findByEmail(authentication.getName());
        if (client.getCards().stream().filter(card -> card.getType() == type).count() < 3) {
            Integer cvv = ThreadLocalRandom.current().nextInt(100, 998 + 1);
            String number = "";
            for (byte i = 0; i < 4; i++) {
                number += ThreadLocalRandom.current().nextInt(1000, 9998 + 1);
            }
            Card card =  new Card(type, color, number, cvv.toString(), LocalDateTime.now(), LocalDateTime.now().plusYears(5), client);
            client.addCard(card);
            cardRepository.save(card);
            return new ResponseEntity<>(HttpStatus.CREATED);
        } else {
            return new ResponseEntity<>("Can't generate more than 3 " + type + " cards per client.", HttpStatus.FORBIDDEN);
        }
    }
}
