package com.ats.dto;

import com.ats.entity.Candidate;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecommendationDTO {
    private Candidate candidate;
    private int matchScore;
    private java.util.List<String> matchingSkills;
}
