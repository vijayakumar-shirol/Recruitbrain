package com.ats.service;

import com.ats.entity.*;
import com.ats.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class PipelineService {

    @Autowired
    private CandidatePipelineRepository candidatePipelineRepository;

    @Autowired
    private PipelineStageRepository stageRepository;

    @Autowired
    private CandidateRepository candidateRepository;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private MatchService matchService;

    @Autowired
    private ActivityRepository activityRepository;

    public List<PipelineStage> getStagesByJobId(Long jobId) {
        return stageRepository.findByJobIdOrderByPositionAsc(jobId);
    }

    public Map<String, Object> getJobPipeline(Long jobId) {
        List<PipelineStage> stages = stageRepository.findByJobIdOrderByPositionAsc(jobId);
        List<CandidatePipeline> candidates = candidatePipelineRepository.findByJobId(jobId);

        // Calculate match scores
        candidates.forEach(cp -> {
            int score = matchService.calculateMatchScore(cp.getJob(), cp.getCandidate());
            cp.setMatchScore(score);
        });

        Map<String, Object> pipeline = new HashMap<>();
        pipeline.put("stages", stages);
        pipeline.put("candidates", candidates);

        return pipeline;
    }

    @Transactional
    public CandidatePipeline addCandidateToJob(Long jobId, Long candidateId, Long stageId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));
        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new RuntimeException("Candidate not found"));
        PipelineStage stage = stageRepository.findById(stageId)
                .orElseThrow(() -> new RuntimeException("Stage not found"));

        // Check if already assigned
        Optional<CandidatePipeline> existing = candidatePipelineRepository.findByJobIdAndCandidateId(jobId,
                candidateId);
        if (existing.isPresent()) {
            return existing.get();
        }

        CandidatePipeline pipeline = new CandidatePipeline();
        pipeline.setJob(job);
        pipeline.setCandidate(candidate);
        pipeline.setStage(stage);

        CandidatePipeline saved = candidatePipelineRepository.save(pipeline);

        // Calculate score for return
        saved.setMatchScore(matchService.calculateMatchScore(job, candidate));

        // Log activity
        logActivity("JOB", jobId, "STATUS_CHANGE",
                "Candidate " + candidate.getFirstName() + " added to stage " + stage.getName());

        return saved;
    }

    @Transactional
    public CandidatePipeline addCandidateToJob(Long jobId, Long candidateId) {
        List<PipelineStage> stages = stageRepository.findByJobIdOrderByPositionAsc(jobId);
        if (stages.isEmpty()) {
            throw new RuntimeException("Job has no pipeline stages defined");
        }
        PipelineStage firstStage = stages.get(0);
        return addCandidateToJob(jobId, candidateId, firstStage.getId());
    }

    @Transactional
    public CandidatePipeline moveCandidateToStage(Long candidateId, Long jobId, Long newStageId) {
        CandidatePipeline pipeline = candidatePipelineRepository
                .findByJobIdAndCandidateId(jobId, candidateId)
                .orElseThrow(() -> new RuntimeException("Candidate not in this job pipeline"));

        PipelineStage newStage = stageRepository.findById(newStageId)
                .orElseThrow(() -> new RuntimeException("Stage not found"));

        PipelineStage oldStage = pipeline.getStage();
        pipeline.setStage(newStage);

        CandidatePipeline saved = candidatePipelineRepository.save(pipeline);

        // Calculate score
        saved.setMatchScore(matchService.calculateMatchScore(pipeline.getJob(), pipeline.getCandidate()));

        // Log activity
        logActivity("JOB", jobId, "STATUS_CHANGE",
                "Candidate " + pipeline.getCandidate().getFirstName() + " moved from " + oldStage.getName() + " to "
                        + newStage.getName());

        return saved;
    }

    public PipelineStage createStage(Long jobId, PipelineStage stage) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        stage.setJob(job);
        return stageRepository.save(stage);
    }

    public List<CandidatePipeline> getPipelinesByCandidateId(Long candidateId) {
        List<CandidatePipeline> pipelines = candidatePipelineRepository.findByCandidateId(candidateId);
        pipelines.forEach(cp -> {
            cp.setMatchScore(matchService.calculateMatchScore(cp.getJob(), cp.getCandidate()));
        });
        return pipelines;
    }

    @Transactional
    public void deleteCandidateFromJob(Long jobId, Long candidateId) {
        CandidatePipeline pipeline = candidatePipelineRepository
                .findByJobIdAndCandidateId(jobId, candidateId)
                .orElseThrow(() -> new RuntimeException("Candidate not in this job pipeline"));

        candidatePipelineRepository.delete(pipeline);

        // Log activity
        logActivity("JOB", jobId, "STATUS_CHANGE",
                "Candidate " + pipeline.getCandidate().getFirstName() + " removed from job");
        logActivity("CANDIDATE", candidateId, "STATUS_CHANGE",
                "Removed from job: " + pipeline.getJob().getTitle());
    }

    private void logActivity(String relatedType, Long relatedId, String type, String content) {
        Activity activity = new Activity();
        activity.setRelatedType(relatedType);
        activity.setRelatedId(relatedId);
        activity.setType(type);
        activity.setContent(content);
        activity.setCreatedBy("System");
        activityRepository.save(activity);
    }
}
