package com.ats.payload.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {
    private SummaryStats summary;
    private List<PipelineStageStat> pipelineDistribution;
    private List<RecruiterStat> recruiterPerformance;
    private List<TrendData> hiringTrend;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SummaryStats {
        private long totalJobs;
        private long openJobs;
        private long totalCandidates;
        private long newCandidatesLast7Days;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PipelineStageStat {
        private String stageName;
        private long count;
        private String color;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecruiterStat {
        private String name;
        private String profilePictureUrl;
        private long activeJobs;
        private long candidatesInPipeline;
        private double conversionRate;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TrendData {
        private String date; // Format: "MMM YYYY" or "YYYY-MM-DD"
        private long count;
    }
}
