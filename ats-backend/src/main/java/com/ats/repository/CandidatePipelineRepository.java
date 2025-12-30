package com.ats.repository;

import com.ats.entity.CandidatePipeline;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CandidatePipelineRepository extends JpaRepository<CandidatePipeline, Long> {
    List<CandidatePipeline> findByJobId(Long jobId);

    List<CandidatePipeline> findByJobIdAndStageId(Long jobId, Long stageId);

    Optional<CandidatePipeline> findByJobIdAndCandidateId(Long jobId, Long candidateId);

    List<CandidatePipeline> findByStageStageType(com.ats.entity.StageType stageType);

    List<CandidatePipeline> findByCandidateId(Long candidateId);
}
