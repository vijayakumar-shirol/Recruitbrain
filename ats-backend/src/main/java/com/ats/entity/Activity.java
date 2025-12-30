package com.ats.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "activities")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Activity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "related_type", nullable = false)
    private String relatedType; // CLIENT, JOB, CANDIDATE

    @Column(name = "related_id", nullable = false)
    private Long relatedId;

    @Column(nullable = false)
    private String type; // NOTE, EMAIL, CALL, MEETING, STATUS_CHANGE

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
