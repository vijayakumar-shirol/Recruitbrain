package com.ats.controller;

import com.ats.entity.CandidatePipeline;
import com.ats.entity.PipelineStage;
import com.ats.service.PipelineService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/pipeline")
@CrossOrigin(origins = "http://localhost:4200")
public class PipelineController {

    @Autowired
    private PipelineService pipelineService;

    @GetMapping("/job/{jobId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECRUITER', 'CLIENT')")
    public Map<String, Object> getJobPipeline(@PathVariable Long jobId) {
        return pipelineService.getJobPipeline(jobId);
    }

    @GetMapping("/job/{jobId}/stages")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECRUITER', 'CLIENT')")
    public List<PipelineStage> getStagesByJobId(@PathVariable Long jobId) {
        return pipelineService.getStagesByJobId(jobId);
    }

    @PostMapping("/job/{jobId}/stages")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECRUITER')")
    public PipelineStage createStage(@PathVariable Long jobId, @RequestBody PipelineStage stage) {
        return pipelineService.createStage(jobId, stage);
    }

    @PostMapping("/job/{jobId}/candidate/{candidateId}/stage/{stageId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECRUITER')")
    public CandidatePipeline addCandidateToJob(
            @PathVariable Long jobId,
            @PathVariable Long candidateId,
            @PathVariable Long stageId) {
        return pipelineService.addCandidateToJob(jobId, candidateId, stageId);
    }

    @PostMapping("/job/{jobId}/candidate/{candidateId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECRUITER')")
    public CandidatePipeline addCandidateToJob(
            @PathVariable Long jobId,
            @PathVariable Long candidateId) {
        return pipelineService.addCandidateToJob(jobId, candidateId);
    }

    @PutMapping("/candidate/{candidateId}/job/{jobId}/move/{stageId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECRUITER')")
    public CandidatePipeline moveCandidateToStage(
            @PathVariable Long candidateId,
            @PathVariable Long jobId,
            @PathVariable Long stageId) {
        return pipelineService.moveCandidateToStage(candidateId, jobId, stageId);
    }

    @GetMapping("/candidate/{candidateId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECRUITER')")
    public List<CandidatePipeline> getPipelinesByCandidateId(@PathVariable Long candidateId) {
        return pipelineService.getPipelinesByCandidateId(candidateId);
    }

    @DeleteMapping("/job/{jobId}/candidate/{candidateId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECRUITER')")
    public void removeCandidate(@PathVariable Long jobId, @PathVariable Long candidateId) {
        pipelineService.deleteCandidateFromJob(jobId, candidateId);
    }
}
