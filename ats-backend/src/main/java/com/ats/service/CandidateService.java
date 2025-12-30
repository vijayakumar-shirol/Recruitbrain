package com.ats.service;

import com.ats.entity.Candidate;
import com.ats.repository.CandidateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import com.ats.repository.UserRepository;
import com.ats.entity.User;
import java.util.List;
import java.util.Optional;

@Service
public class CandidateService {

    @Autowired
    private CandidateRepository candidateRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Candidate> getAllCandidates() {
        return candidateRepository.findAll();
    }

    public Optional<Candidate> getCandidateById(Long id) {
        return candidateRepository.findById(id);
    }

    public Candidate createCandidate(Candidate candidate) {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String username;
        if (principal instanceof UserDetails) {
            username = ((UserDetails) principal).getUsername();
        } else {
            username = principal.toString();
        }

        userRepository.findByUsername(username).ifPresent(candidate::setCreatedBy);

        return candidateRepository.save(candidate);
    }

    public Candidate updateCandidate(Long id, Candidate candidateDetails) {
        Candidate candidate = candidateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Candidate not found"));

        candidate.setFirstName(candidateDetails.getFirstName());
        candidate.setLastName(candidateDetails.getLastName());
        candidate.setEmail(candidateDetails.getEmail());
        candidate.setPhone(candidateDetails.getPhone());
        candidate.setLinkedinUrl(candidateDetails.getLinkedinUrl());
        candidate.setExperienceYears(candidateDetails.getExperienceYears());
        candidate.setCurrentCompany(candidateDetails.getCurrentCompany());
        candidate.setCurrentPosition(candidateDetails.getCurrentPosition());
        candidate.setSkills(candidateDetails.getSkills());
        candidate.setNotes(candidateDetails.getNotes());
        candidate.setProfilePictureUrl(candidateDetails.getProfilePictureUrl());
        candidate.setTags(candidateDetails.getTags());

        // New Manatal Fields
        candidate.setSource(candidateDetails.getSource());
        candidate.setRating(candidateDetails.getRating());
        candidate.setSalaryExpectations(candidateDetails.getSalaryExpectations());
        candidate.setAvailableFrom(candidateDetails.getAvailableFrom());
        candidate.setDoNotContact(candidateDetails.getDoNotContact());

        return candidateRepository.save(candidate);
    }

    public void deleteCandidate(Long id) {
        candidateRepository.deleteById(id);
    }
}
