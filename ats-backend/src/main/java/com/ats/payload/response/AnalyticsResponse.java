package com.ats.payload.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnalyticsResponse {
    private Double averageTimeToHire; // in days
    private Double offerAcceptanceRate; // percentage
    private Map<String, Integer> candidatesBySource;
    private List<StageConversion> pipelineConversion;
    private List<RecruiterPerformance> recruiterPerformance;
    private HiringTrend hiringTrend;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StageConversion {
        private String stageName;
        private Integer candidateCount;
        private Double conversionRate; // rate from previous stage
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecruiterPerformance {
        private String recruiterName;
        private Integer candidatesAdded;
        private Integer interviewsConducted;
        private Integer placements;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HiringTrend {
        private List<String> labels; // Months
        private List<Integer> hires;
        private List<Integer> applications;
    }
}
