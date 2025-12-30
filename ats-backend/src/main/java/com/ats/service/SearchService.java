package com.ats.service;

import com.ats.entity.Candidate;
import com.ats.entity.Client;
import com.ats.entity.Job;
import com.ats.payload.response.GlobalSearchResponse;
import com.ats.repository.CandidateRepository;
import com.ats.repository.ClientRepository;
import com.ats.repository.JobRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SearchService {

        @Autowired
        private CandidateRepository candidateRepository;

        @Autowired
        private JobRepository jobRepository;

        @Autowired
        private ClientRepository clientRepository;

        public List<GlobalSearchResponse> globalSearch(String query) {
                if (query == null || query.trim().isEmpty()) {
                        return new ArrayList<>();
                }

                String searchPattern = query.trim();
                List<GlobalSearchResponse> results = new ArrayList<>();

                // Search Candidates
                List<Candidate> candidates = candidateRepository
                                .findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCaseOrEmailContainingIgnoreCaseOrSkillsContainingIgnoreCase(
                                                searchPattern, searchPattern, searchPattern, searchPattern);

                candidates.stream().limit(5).forEach(c -> {
                        results.add(new GlobalSearchResponse(
                                        c.getId(),
                                        "CANDIDATE",
                                        (c.getFirstName() != null ? c.getFirstName() : "") + " "
                                                        + (c.getLastName() != null ? c.getLastName() : ""),
                                        c.getCurrentPosition() != null ? c.getCurrentPosition() : "Candidate",
                                        c.getProfilePictureUrl()));
                });

                // Search Jobs
                List<Job> jobs = jobRepository.findByTitleContainingIgnoreCaseOrLocationContainingIgnoreCase(
                                searchPattern, searchPattern);

                jobs.stream().limit(5).forEach(j -> {
                        results.add(new GlobalSearchResponse(
                                        j.getId(),
                                        "JOB",
                                        j.getTitle() != null ? j.getTitle() : "Untitled Job",
                                        j.getClient() != null ? j.getClient().getName() : "Job",
                                        j.getLogoUrl()));
                });

                // Search Clients
                List<Client> clients = clientRepository.findByNameContainingIgnoreCaseOrIndustryContainingIgnoreCase(
                                searchPattern, searchPattern);

                clients.stream().limit(5).forEach(c -> {
                        results.add(new GlobalSearchResponse(
                                        c.getId(),
                                        "CLIENT",
                                        c.getName() != null ? c.getName() : "Unnamed Client",
                                        c.getIndustry() != null ? c.getIndustry() : "Client",
                                        c.getLogoUrl()));
                });

                return results;
        }
}
