package com.ats.service;

import com.ats.entity.*;
import com.ats.payload.response.AnalyticsResponse;
import com.ats.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    @Autowired
    private CandidateRepository candidateRepository;

    @Autowired
    private CandidatePipelineRepository pipelineRepository;

    public AnalyticsResponse getAdvancedAnalytics() {
        List<Candidate> allCandidates = candidateRepository.findAll();
        List<CandidatePipeline> allPipelineEntries = pipelineRepository.findAll();

        return AnalyticsResponse.builder()
                .averageTimeToHire(calculateAverageTimeToHire(allPipelineEntries))
                .offerAcceptanceRate(calculateOfferAcceptanceRate(allPipelineEntries))
                .candidatesBySource(calculateCandidatesBySource(allCandidates))
                .pipelineConversion(calculatePipelineConversion(allPipelineEntries))
                .recruiterPerformance(calculateRecruiterPerformance(allCandidates, allPipelineEntries))
                .hiringTrend(calculateHiringTrend(allPipelineEntries))
                .build();
    }

    private Double calculateAverageTimeToHire(List<CandidatePipeline> entries) {
        List<CandidatePipeline> hiredEntries = entries.stream()
                .filter(e -> e.getStage() != null && e.getStage().getStageType() == StageType.HIRED)
                .filter(e -> e.getAddedAt() != null && e.getUpdatedAt() != null)
                .collect(Collectors.toList());

        if (hiredEntries.isEmpty())
            return 0.0;

        long totalDays = hiredEntries.stream()
                .mapToLong(e -> Duration.between(e.getAddedAt(), e.getUpdatedAt()).toDays())
                .sum();

        return (double) totalDays / hiredEntries.size();
    }

    private Double calculateOfferAcceptanceRate(List<CandidatePipeline> entries) {
        long offersIssued = entries.stream()
                .filter(e -> e.getStage() != null && e.getStage().getStageType() == StageType.OFFER)
                .count();
        long offersAccepted = entries.stream()
                .filter(e -> e.getStage() != null && e.getStage().getStageType() == StageType.HIRED)
                .count();

        if (offersIssued == 0)
            return 0.0;
        return (double) offersAccepted / offersIssued * 100;
    }

    private Map<String, Integer> calculateCandidatesBySource(List<Candidate> candidates) {
        Map<String, Integer> sourceMap = new HashMap<>();
        for (Candidate c : candidates) {
            String source = c.getSource() != null ? c.getSource() : "Unknown";
            sourceMap.put(source, sourceMap.getOrDefault(source, 0) + 1);
        }
        return sourceMap;
    }

    private List<AnalyticsResponse.StageConversion> calculatePipelineConversion(List<CandidatePipeline> entries) {
        // Group by stage type and count, filtering out null stage types
        Map<StageType, Long> counts = entries.stream()
                .filter(e -> e.getStage() != null && e.getStage().getStageType() != null)
                .collect(Collectors.groupingBy(e -> e.getStage().getStageType(), Collectors.counting()));

        List<AnalyticsResponse.StageConversion> conversions = new ArrayList<>();
        StageType[] sequence = { StageType.INITIAL, StageType.SCREENING, StageType.INTERVIEW, StageType.OFFER,
                StageType.HIRED };

        long previousCount = entries.size(); // Total candidates started

        for (StageType type : sequence) {
            long currentCount = counts.getOrDefault(type, 0L);
            double rate = previousCount == 0 ? 0 : (double) currentCount / previousCount * 100;
            conversions.add(new AnalyticsResponse.StageConversion(type.name(), (int) currentCount, rate));
            previousCount = currentCount;
        }

        return conversions;
    }

    private List<AnalyticsResponse.RecruiterPerformance> calculateRecruiterPerformance(List<Candidate> candidates,
            List<CandidatePipeline> entries) {
        Map<User, Integer> sourcedCount = new HashMap<>();
        for (Candidate c : candidates) {
            if (c.getCreatedBy() != null) {
                sourcedCount.put(c.getCreatedBy(), sourcedCount.getOrDefault(c.getCreatedBy(), 0) + 1);
            }
        }

        Map<User, Integer> hireCount = new HashMap<>();
        for (CandidatePipeline entry : entries) {
            if (entry.getStage() != null && entry.getStage().getStageType() == StageType.HIRED) {
                User sourcer = entry.getCandidate().getCreatedBy();
                if (sourcer != null) {
                    hireCount.put(sourcer, hireCount.getOrDefault(sourcer, 0) + 1);
                }
            }
        }

        List<AnalyticsResponse.RecruiterPerformance> performance = new ArrayList<>();
        Set<User> allRecruiters = new HashSet<>(sourcedCount.keySet());
        allRecruiters.addAll(hireCount.keySet());

        for (User u : allRecruiters) {
            performance.add(new AnalyticsResponse.RecruiterPerformance(
                    u.getUsername(),
                    sourcedCount.getOrDefault(u, 0),
                    0, // Interviews conducted (could be trackable via pipeline entries if we have
                       // timestamps)
                    hireCount.getOrDefault(u, 0)));
        }

        return performance;
    }

    private AnalyticsResponse.HiringTrend calculateHiringTrend(List<CandidatePipeline> entries) {
        // Last 6 months labels
        List<String> labels = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM");
        LocalDateTime now = LocalDateTime.now();

        for (int i = 5; i >= 0; i--) {
            labels.add(now.minusMonths(i).format(formatter));
        }

        List<Integer> hires = new ArrayList<>(Collections.nCopies(6, 0));
        List<Integer> applications = new ArrayList<>(Collections.nCopies(6, 0));

        // Note: Applications should come from allCandidates.createdAt
        // But entries contains candidates in pipeline.
        // Let's use all candidates for applications.

        // I need access to allCandidates here, let's refactor slightly or fetch inside.
        // For efficiency, I'll pass allCandidates or just use entries for hires.

        // Refactoring the method signature or fetching here as it's a small dataset
        // usually.
        List<Candidate> allCandidates = candidateRepository.findAll();

        for (Candidate c : allCandidates) {
            if (c.getCreatedAt() != null) {
                long monthsBack = ChronoUnit.MONTHS.between(
                        c.getCreatedAt().withDayOfMonth(1).toLocalDate(),
                        now.withDayOfMonth(1).toLocalDate());
                if (monthsBack >= 0 && monthsBack < 6) {
                    int index = 5 - (int) monthsBack;
                    applications.set(index, applications.get(index) + 1);
                }
            }
        }

        for (CandidatePipeline entry : entries) {
            if (entry.getStage() != null && entry.getStage().getStageType() == StageType.HIRED
                    && entry.getUpdatedAt() != null) {
                long monthsBack = ChronoUnit.MONTHS.between(
                        entry.getUpdatedAt().withDayOfMonth(1).toLocalDate(),
                        now.withDayOfMonth(1).toLocalDate());
                if (monthsBack >= 0 && monthsBack < 6) {
                    int index = 5 - (int) monthsBack;
                    hires.set(index, hires.get(index) + 1);
                }
            }
        }

        return new AnalyticsResponse.HiringTrend(labels, hires, applications);
    }
}
