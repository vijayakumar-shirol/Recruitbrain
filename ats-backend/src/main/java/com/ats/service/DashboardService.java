package com.ats.service;

import com.ats.entity.*;
import com.ats.payload.response.DashboardStatsResponse;
import com.ats.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final JobRepository jobRepository;
    private final CandidateRepository candidateRepository;
    private final CandidatePipelineRepository pipelineRepository;
    private final UserRepository userRepository;

    public DashboardStatsResponse getStats() {
        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);

        // 1. Summary Stats
        DashboardStatsResponse.SummaryStats summary = DashboardStatsResponse.SummaryStats.builder()
                .totalJobs(jobRepository.count())
                .openJobs(jobRepository.findAll().stream().filter(j -> "OPEN".equals(j.getStatus())).count())
                .totalCandidates(candidateRepository.count())
                .newCandidatesLast7Days(candidateRepository.findAll().stream()
                        .filter(c -> c.getCreatedAt() != null && c.getCreatedAt().isAfter(sevenDaysAgo))
                        .count())
                .build();

        // 2. Pipeline Distribution
        // We'll group by stage name and count candidates.
        // Note: This logic assumes we want a global view of all candidates across all
        // jobs.
        List<CandidatePipeline> allPipelineItems = pipelineRepository.findAll();
        Map<String, Long> pipelineCounts = allPipelineItems.stream()
                .filter(p -> p.getStage() != null)
                .collect(Collectors.groupingBy(p -> p.getStage().getName(), Collectors.counting()));

        // Get all unique stages from the DB to ensure we show even empty ones if
        // needed,
        // but for now, we'll just use the active ones in the pipeline.
        List<DashboardStatsResponse.PipelineStageStat> pipelineDistribution = pipelineCounts.entrySet().stream()
                .map(entry -> DashboardStatsResponse.PipelineStageStat.builder()
                        .stageName(entry.getKey())
                        .count(entry.getValue())
                        .color(getColorForStage(entry.getKey()))
                        .build())
                .sorted(Comparator.comparingLong(DashboardStatsResponse.PipelineStageStat::getCount).reversed())
                .collect(Collectors.toList());

        // 3. Recruiter Performance
        List<User> recruiters = userRepository.findByRolesName(ERole.ROLE_RECRUITER);
        List<DashboardStatsResponse.RecruiterStat> recruiterPerformance = recruiters.stream()
                .map(r -> {
                    long activeJobs = jobRepository.findAll().stream()
                            .filter(j -> "OPEN".equals(j.getStatus()) && j.getRecruiters().contains(r))
                            .count();

                    // Candidates this recruiter is currently "handling" (part of their jobs)
                    long candidates = allPipelineItems.stream()
                            .filter(p -> p.getJob().getRecruiters().contains(r))
                            .count();

                    return DashboardStatsResponse.RecruiterStat.builder()
                            .name(r.getUsername())
                            .activeJobs(activeJobs)
                            .candidatesInPipeline(candidates)
                            .conversionRate(activeJobs > 0 ? (double) candidates / activeJobs : 0) // Mock logic for
                                                                                                   // demo
                            .build();
                })
                .sorted(Comparator.comparingLong(DashboardStatsResponse.RecruiterStat::getCandidatesInPipeline)
                        .reversed())
                .collect(Collectors.toList());

        // 4. Hiring Trend (Last 6 Months - Mocked for now as we don't have "hire date"
        // field yet, using created_at)
        List<DashboardStatsResponse.TrendData> hiringTrend = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM YYYY");
        for (int i = 5; i >= 0; i--) {
            LocalDateTime month = LocalDateTime.now().minusMonths(i);
            String monthName = month.format(formatter);
            // Mocking some data for the trend
            hiringTrend.add(new DashboardStatsResponse.TrendData(monthName, (long) (Math.random() * 10 + i * 2)));
        }

        return DashboardStatsResponse.builder()
                .summary(summary)
                .pipelineDistribution(pipelineDistribution)
                .recruiterPerformance(recruiterPerformance)
                .hiringTrend(hiringTrend)
                .build();
    }

    private String getColorForStage(String name) {
        String lower = name.toLowerCase();
        if (lower.contains("new") || lower.contains("apply"))
            return "#3b82f6"; // Blue
        if (lower.contains("screen"))
            return "#8b5cf6"; // Purple
        if (lower.contains("phone") || lower.contains("interview"))
            return "#ec4899"; // Pink
        if (lower.contains("tech"))
            return "#f59e0b"; // Amber
        if (lower.contains("final"))
            return "#10b981"; // Green
        if (lower.contains("offer") || lower.contains("cyan"))
            return "#06b6d4"; // Cyan
        if (lower.contains("hire"))
            return "#22c55e"; // Green
        if (lower.contains("reject"))
            return "#ef4444"; // Red
        return "#6b7280"; // Gray
    }
}
