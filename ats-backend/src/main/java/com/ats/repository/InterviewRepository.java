package com.ats.repository;

import com.ats.entity.Interview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface InterviewRepository extends JpaRepository<Interview, Long> {

        List<Interview> findByCandidatePipelineId(Long candidatePipelineId);

        @Query("SELECT i FROM Interview i WHERE i.candidatePipeline.job.id = :jobId ORDER BY i.scheduledAt")
        List<Interview> findByJobId(@Param("jobId") Long jobId);

        @Query("SELECT i FROM Interview i JOIN i.interviewers u WHERE u.id = :userId AND i.scheduledAt >= :startDate ORDER BY i.scheduledAt")
        List<Interview> findByInterviewerAndDateAfter(@Param("userId") Long userId,
                        @Param("startDate") LocalDateTime startDate);

        @Query("SELECT i FROM Interview i WHERE i.scheduledAt BETWEEN :startDate AND :endDate ORDER BY i.scheduledAt")
        List<Interview> findByDateRange(@Param("startDate") LocalDateTime startDate,
                        @Param("endDate") LocalDateTime endDate);

        List<Interview> findByStatus(String status);

        @Query("SELECT i FROM Interview i WHERE i.candidatePipeline.candidate.id = :candidateId ORDER BY i.scheduledAt DESC")
        List<Interview> findByCandidateId(@Param("candidateId") Long candidateId);
}
