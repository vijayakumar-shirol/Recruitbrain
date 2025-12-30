package com.ats.repository;

import com.ats.entity.PipelineTemplateStage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PipelineTemplateStageRepository extends JpaRepository<PipelineTemplateStage, Long> {
}
