package com.ats.service;

import com.ats.entity.Candidate;
import com.ats.entity.Job;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class MatchService {

    public int calculateMatchScore(Job job, Candidate candidate) {
        if (job.getSkills() == null || job.getSkills().isEmpty() ||
                candidate.getSkills() == null || candidate.getSkills().isEmpty()) {
            return 0; // No score possible if skills are missing
        }

        // Normalize and tokenize job skills
        Set<String> jobSkills = Arrays.stream(job.getSkills().split(","))
                .map(String::trim)
                .map(String::toLowerCase)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toSet());

        // Normalize and tokenize candidate skills
        Set<String> candidateSkills = Arrays.stream(candidate.getSkills().split(","))
                .map(String::trim)
                .map(String::toLowerCase)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toSet());

        if (jobSkills.isEmpty())
            return 0;

        // Calculate intersection (matching skills)
        Set<String> intersection = new HashSet<>(jobSkills);
        intersection.retainAll(candidateSkills);

        // Calculate percentage match
        double matchPercentage = (double) intersection.size() / jobSkills.size() * 100;

        return (int) Math.round(matchPercentage);
    }

    public java.util.List<String> getMatchingSkills(Job job, Candidate candidate) {
        if (job.getSkills() == null || candidate.getSkills() == null)
            return java.util.Collections.emptyList();

        Set<String> jobSkills = Arrays.stream(job.getSkills().split(","))
                .map(String::trim)
                .map(String::toLowerCase)
                .collect(Collectors.toSet());

        Set<String> candidateSkills = Arrays.stream(candidate.getSkills().split(","))
                .map(String::trim)
                .map(String::toLowerCase)
                .collect(Collectors.toSet());

        return jobSkills.stream()
                .filter(candidateSkills::contains)
                .collect(Collectors.toList());
    }
}
