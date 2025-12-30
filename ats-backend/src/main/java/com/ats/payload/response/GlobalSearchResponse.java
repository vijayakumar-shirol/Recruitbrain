package com.ats.payload.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GlobalSearchResponse {
    private Long id;
    private String type; // CANDIDATE, JOB, CLIENT
    private String title;
    private String subtitle;
    private String imageUrl;
}
