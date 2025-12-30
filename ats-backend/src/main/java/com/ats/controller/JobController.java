package com.ats.controller;

import com.ats.entity.Job;
import com.ats.service.JobService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/jobs")
@CrossOrigin(origins = "http://localhost:4200")
public class JobController {

    @Autowired
    private JobService jobService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RECRUITER', 'CLIENT')")
    public List<Job> getAllJobs() {
        return jobService.getAllJobs();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECRUITER', 'CLIENT')")
    public ResponseEntity<Job> getJobById(@PathVariable Long id) {
        return jobService.getJobById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/client/{clientId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECRUITER')")
    public List<Job> getJobsByClientId(@PathVariable Long clientId) {
        return jobService.getJobsByClientId(clientId);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RECRUITER')")
    public Job createJob(@RequestBody Job job) {
        return jobService.createJob(job);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECRUITER')")
    public ResponseEntity<Job> updateJob(@PathVariable Long id, @RequestBody Job job) {
        try {
            Job updated = jobService.updateJob(id, job);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @Autowired
    private com.ats.service.CandidateService candidateService;

    @Autowired
    private com.ats.service.MatchService matchService;

    @Autowired
    private com.ats.service.PipelineService pipelineService;

    @GetMapping("/{id}/recommendations")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECRUITER')")
    public List<com.ats.dto.RecommendationDTO> getRecommendedCandidates(@PathVariable Long id) {
        Job job = jobService.getJobById(id)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        List<com.ats.entity.Candidate> allCandidates = candidateService.getAllCandidates();
        var pipelineData = pipelineService.getJobPipeline(id);
        @SuppressWarnings("unchecked")
        List<com.ats.entity.CandidatePipeline> existingCandidates = (List<com.ats.entity.CandidatePipeline>) pipelineData
                .get("candidates");

        java.util.Set<Long> existingCandidateIds = existingCandidates.stream()
                .map(cp -> cp.getCandidate().getId())
                .collect(java.util.stream.Collectors.toSet());

        return allCandidates.stream()
                .filter(c -> !existingCandidateIds.contains(c.getId()))
                .map(c -> new com.ats.dto.RecommendationDTO(c, matchService.calculateMatchScore(job, c),
                        matchService.getMatchingSkills(job, c)))
                .filter(dto -> dto.getMatchScore() > 0)
                .sorted((a, b) -> Integer.compare(b.getMatchScore(), a.getMatchScore()))
                .limit(10)
                .collect(java.util.stream.Collectors.toList());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteJob(@PathVariable Long id) {
        jobService.deleteJob(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{jobId}/recruiters/{userId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECRUITER')")
    public ResponseEntity<Job> assignRecruiter(@PathVariable Long jobId, @PathVariable Long userId) {
        return ResponseEntity.ok(jobService.assignRecruiter(jobId, userId));
    }

    @DeleteMapping("/{jobId}/recruiters/{userId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECRUITER')")
    public ResponseEntity<Job> removeRecruiter(@PathVariable Long jobId, @PathVariable Long userId) {
        return ResponseEntity.ok(jobService.removeRecruiter(jobId, userId));
    }

    @PostMapping("/{jobId}/recruiters")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECRUITER')")
    public ResponseEntity<Job> assignRecruiters(@PathVariable Long jobId, @RequestBody List<Long> userIds) {
        return ResponseEntity.ok(jobService.assignRecruiters(jobId, userIds));
    }
}
