package com.ats.dto;

import com.ats.entity.Job;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JobRecommendationDTO {
    private Job job;
    private int matchScore;
    private List<String> matchingSkills;
}
