package com.ats.controller;

import com.ats.entity.Candidate;
import com.ats.service.CandidateService;
import com.ats.service.ResumeParserService;
import com.ats.service.EmailService;
import com.ats.service.EmailTemplateService;
import com.ats.entity.EmailTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/candidates")
@CrossOrigin(origins = "http://localhost:4200")
public class CandidateController {

    @Autowired
    private CandidateService candidateService;

    @Autowired
    private ResumeParserService resumeParserService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private EmailTemplateService emailTemplateService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECRUITER')")
    public List<Candidate> getAllCandidates() {
        return candidateService.getAllCandidates();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECRUITER')")
    public ResponseEntity<Candidate> getCandidateById(@PathVariable Long id) {
        return candidateService.getCandidateById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECRUITER')")
    public Candidate createCandidate(@RequestBody Candidate candidate) {
        return candidateService.createCandidate(candidate);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECRUITER')")
    public ResponseEntity<Candidate> updateCandidate(@PathVariable Long id, @RequestBody Candidate candidate) {
        try {
            Candidate updated = candidateService.updateCandidate(id, candidate);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCandidate(@PathVariable Long id) {
        candidateService.deleteCandidate(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/parse-resume")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECRUITER')")
    public ResponseEntity<Candidate> parseResume(
            @RequestParam("file") MultipartFile file) {
        try {
            Candidate candidate = resumeParserService.parseResume(file);
            return ResponseEntity.ok(candidate);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @Autowired
    private com.ats.service.JobService jobService;

    @Autowired
    private com.ats.service.MatchService matchService;

    @Autowired
    private com.ats.service.PipelineService pipelineService;

    @GetMapping("/{id}/recommendations")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECRUITER')")
    public List<com.ats.dto.JobRecommendationDTO> getRecommendedJobs(@PathVariable Long id) {
        com.ats.entity.Candidate candidate = candidateService.getCandidateById(id)
                .orElseThrow(() -> new RuntimeException("Candidate not found"));

        List<com.ats.entity.Job> allJobs = jobService.getAllJobs();
        List<com.ats.entity.CandidatePipeline> existingPipelines = pipelineService.getPipelinesByCandidateId(id);

        java.util.Set<Long> assignedJobIds = existingPipelines.stream()
                .map(cp -> cp.getJob().getId())
                .collect(java.util.stream.Collectors.toSet());

        return allJobs.stream()
                .filter(job -> !assignedJobIds.contains(job.getId()) && "OPEN".equals(job.getStatus()))
                .map(job -> new com.ats.dto.JobRecommendationDTO(job, matchService.calculateMatchScore(job, candidate),
                        matchService.getMatchingSkills(job, candidate)))
                .filter(dto -> dto.getMatchScore() > 0)
                .sorted((a, b) -> Integer.compare(b.getMatchScore(), a.getMatchScore()))
                .limit(10)
                .collect(java.util.stream.Collectors.toList());
    }

    @PostMapping("/{id}/send-email")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECRUITER')")
    public ResponseEntity<?> sendEmailToCandidate(@PathVariable Long id,
            @RequestBody java.util.Map<String, Object> request) {
        Candidate candidate = candidateService.getCandidateById(id)
                .orElseThrow(() -> new RuntimeException("Candidate not found"));

        Long templateId = Long.valueOf(request.get("templateId").toString());
        EmailTemplate template = emailTemplateService.getTemplateById(templateId)
                .orElseThrow(() -> new RuntimeException("Template not found"));

        // Build variables for placeholder replacement
        // Note: For now, we don't have job context in this simple send-email call
        java.util.Map<String, String> variables = emailTemplateService.buildVariables(candidate, null, "Recruiter");

        String processedBody = "<html><body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>"
                + emailTemplateService
                        .convertToHtml(emailTemplateService.processTemplate(template.getBody(), variables))
                + "</body></html>";
        String processedSubject = emailTemplateService.processTemplate(template.getSubject(), variables);

        try {
            emailService.sendHtmlEmail(candidate.getEmail(), processedSubject, processedBody);
            return ResponseEntity.ok(new com.ats.payload.response.MessageResponse("Email sent successfully!"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(new com.ats.payload.response.MessageResponse("Error sending email: " + e.getMessage()));
        }
    }
}
