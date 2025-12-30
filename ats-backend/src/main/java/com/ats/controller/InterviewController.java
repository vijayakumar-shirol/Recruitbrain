package com.ats.controller;

import com.ats.entity.Interview;
import com.ats.service.InterviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/interviews")
@CrossOrigin(origins = "http://localhost:4200")
public class InterviewController {

    @Autowired
    private InterviewService interviewService;

    @GetMapping
    public List<Interview> getAllInterviews() {
        return interviewService.getAllInterviews();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Interview> getInterviewById(@PathVariable Long id) {
        return interviewService.getInterviewById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/job/{jobId}")
    public List<Interview> getInterviewsByJob(@PathVariable Long jobId) {
        return interviewService.getInterviewsByJobId(jobId);
    }

    @GetMapping("/candidate/{candidateId}")
    public List<Interview> getInterviewsByCandidate(@PathVariable Long candidateId) {
        return interviewService.getInterviewsByCandidateId(candidateId);
    }

    @GetMapping("/interviewer/{userId}")
    public List<Interview> getInterviewsByInterviewer(@PathVariable Long userId) {
        return interviewService.getInterviewsByInterviewer(userId);
    }

    @GetMapping("/upcoming")
    public List<Interview> getUpcomingInterviews() {
        return interviewService.getUpcomingInterviews();
    }

    @GetMapping("/range")
    public List<Interview> getInterviewsByDateRange(
            @RequestParam String startDate,
            @RequestParam String endDate) {
        LocalDateTime start = LocalDateTime.parse(startDate);
        LocalDateTime end = LocalDateTime.parse(endDate);
        return interviewService.getInterviewsByDateRange(start, end);
    }

    @PostMapping
    public ResponseEntity<Interview> scheduleInterview(@RequestBody Map<String, Object> request) {
        try {
            Long candidatePipelineId = Long.valueOf(request.get("candidatePipelineId").toString());
            LocalDateTime scheduledAt = LocalDateTime.parse(request.get("scheduledAt").toString());
            Integer durationMinutes = request.get("durationMinutes") != null
                    ? Integer.valueOf(request.get("durationMinutes").toString())
                    : 60;
            String interviewType = (String) request.get("interviewType");
            String location = (String) request.get("location");
            String notes = (String) request.get("notes");

            @SuppressWarnings("unchecked")
            List<Number> interviewerIdsList = (List<Number>) request.get("interviewerIds");
            Set<Long> interviewerIds = interviewerIdsList != null
                    ? interviewerIdsList.stream().map(Number::longValue).collect(Collectors.toSet())
                    : null;

            Interview interview = interviewService.scheduleInterview(
                    candidatePipelineId, scheduledAt, durationMinutes,
                    interviewType, location, notes, interviewerIds);

            return ResponseEntity.ok(interview);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Interview> updateInterview(@PathVariable Long id, @RequestBody Interview interview) {
        try {
            Interview updated = interviewService.updateInterview(id, interview);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}/feedback")
    public ResponseEntity<Interview> addFeedback(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        try {
            String feedback = (String) request.get("feedback");
            Integer rating = request.get("rating") != null
                    ? Integer.valueOf(request.get("rating").toString())
                    : null;

            Interview updated = interviewService.addFeedback(id, feedback, rating);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<Interview> cancelInterview(@PathVariable Long id) {
        try {
            Interview cancelled = interviewService.cancelInterview(id);
            return ResponseEntity.ok(cancelled);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInterview(@PathVariable Long id) {
        interviewService.deleteInterview(id);
        return ResponseEntity.noContent().build();
    }
}
