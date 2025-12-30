package com.ats.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.ats.entity.StageType;

@Entity
@Table(name = "pipeline_stages")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PipelineStage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "job_id", nullable = false)
    private Job job;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private Integer position; // Order of the stage in the pipeline

    private String color; // Hex color for visual representation

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "stage_type")
    private StageType stageType;
}
