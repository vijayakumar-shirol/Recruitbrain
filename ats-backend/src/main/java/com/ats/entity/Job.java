package com.ats.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "jobs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "job_recruiters", joinColumns = @JoinColumn(name = "job_id"), inverseJoinColumns = @JoinColumn(name = "user_id"))
    private java.util.Set<User> recruiters = new java.util.HashSet<>();

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String status; // OPEN, CLOSED, ON_HOLD

    private String location;

    @Column(name = "salary_range")
    private String salaryRange;

    @Column(name = "job_code")
    @JsonProperty("jobCode")
    private String jobCode;

    @Column(name = "employment_type")
    @JsonProperty("employmentType")
    private String employmentType; // FULL_TIME, PART_TIME, CONTRACT, INTERN

    private Integer headcount = 1;

    private String department;

    @Column(name = "target_date")
    @JsonProperty("targetDate")
    private java.time.LocalDate targetDate;

    @Column(name = "salary_min")
    @JsonProperty("salaryMin")
    private Double salaryMin;

    @Column(name = "salary_max")
    @JsonProperty("salaryMax")
    private Double salaryMax;

    private String currency = "USD";

    @Column(name = "experience_required")
    private String experienceRequired;

    @Column(columnDefinition = "TEXT")
    private String skills; // Comma separated skills: "Java, Spring, SQL"

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "pipeline_template_id")
    private Long pipelineTemplateId;

    @Column(name = "logo_url")
    @JsonProperty("logoUrl")
    @JsonAlias("logo_url")
    private String logoUrl;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "job_tags", joinColumns = @JoinColumn(name = "job_id"), inverseJoinColumns = @JoinColumn(name = "tag_id"))
    private java.util.Set<Tag> tags = new java.util.HashSet<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
