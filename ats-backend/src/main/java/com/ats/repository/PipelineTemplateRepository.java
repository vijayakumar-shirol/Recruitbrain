package com.ats.repository;

import com.ats.entity.PipelineTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PipelineTemplateRepository extends JpaRepository<PipelineTemplate, Long> {
}
