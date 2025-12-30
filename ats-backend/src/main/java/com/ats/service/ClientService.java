package com.ats.service;

import com.ats.entity.Client;
import com.ats.repository.ClientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class ClientService {

    @Autowired
    private ClientRepository clientRepository;

    public List<Client> getAllClients() {
        return clientRepository.findAll();
    }

    public Optional<Client> getClientById(Long id) {
        return clientRepository.findById(id);
    }

    public Client createClient(Client client) {
        return clientRepository.save(client);
    }

    public Client updateClient(Long id, Client clientDetails) {
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Client not found"));

        client.setName(clientDetails.getName());
        client.setIndustry(clientDetails.getIndustry());
        client.setContactPerson(clientDetails.getContactPerson());
        client.setEmail(clientDetails.getEmail());
        client.setPhone(clientDetails.getPhone());
        client.setStatus(clientDetails.getStatus());
        client.setLogoUrl(clientDetails.getLogoUrl());
        client.setTags(clientDetails.getTags());
        client.setWebsite(clientDetails.getWebsite());
        client.setAddress(clientDetails.getAddress());
        client.setCity(clientDetails.getCity());
        client.setCountry(clientDetails.getCountry());
        client.setLinkedinUrl(clientDetails.getLinkedinUrl());
        client.setOwner(clientDetails.getOwner());

        return clientRepository.save(client);
    }

    public void deleteClient(Long id) {
        clientRepository.deleteById(id);
    }

    public List<Client> getClientsByStatus(String status) {
        return clientRepository.findByStatus(status);
    }
}
