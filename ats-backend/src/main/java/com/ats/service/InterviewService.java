package com.ats.service;

import com.ats.entity.Interview;
import com.ats.entity.CandidatePipeline;
import com.ats.entity.User;
import com.ats.repository.InterviewRepository;
import com.ats.repository.CandidatePipelineRepository;
import com.ats.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.HashSet;

@Service
public class InterviewService {

    @Autowired
    private InterviewRepository interviewRepository;

    @Autowired
    private CandidatePipelineRepository candidatePipelineRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Interview> getAllInterviews() {
        return interviewRepository.findAll();
    }

    public Optional<Interview> getInterviewById(Long id) {
        if (id == null)
            return Optional.empty();
        return interviewRepository.findById(id);
    }

    public List<Interview> getInterviewsByJobId(Long jobId) {
        return interviewRepository.findByJobId(jobId);
    }

    public List<Interview> getInterviewsByCandidateId(Long candidateId) {
        return interviewRepository.findByCandidateId(candidateId);
    }

    public List<Interview> getInterviewsByInterviewer(Long userId) {
        return interviewRepository.findByInterviewerAndDateAfter(userId, LocalDateTime.now());
    }

    public List<Interview> getInterviewsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return interviewRepository.findByDateRange(startDate, endDate);
    }

    public List<Interview> getUpcomingInterviews() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime endOfWeek = now.plusDays(7);
        return interviewRepository.findByDateRange(now, endOfWeek);
    }

    public Interview scheduleInterview(Long candidatePipelineId, LocalDateTime scheduledAt,
            Integer durationMinutes, String interviewType,
            String location, String notes, Set<Long> interviewerIds) {

        if (candidatePipelineId == null) {
            throw new RuntimeException("Candidate pipeline ID cannot be null");
        }
        CandidatePipeline candidatePipeline = candidatePipelineRepository.findById(candidatePipelineId)
                .orElseThrow(
                        () -> new RuntimeException("Candidate pipeline not found with id: " + candidatePipelineId));

        Interview interview = new Interview();
        interview.setCandidatePipeline(candidatePipeline);
        interview.setScheduledAt(scheduledAt);
        interview.setDurationMinutes(durationMinutes != null ? durationMinutes : 60);
        interview.setInterviewType(interviewType);
        interview.setLocation(location);
        interview.setNotes(notes);
        interview.setStatus("SCHEDULED");

        if (interviewerIds != null && !interviewerIds.isEmpty()) {
            Set<User> interviewers = new HashSet<>(userRepository.findAllById(interviewerIds));
            interview.setInterviewers(interviewers);
        }

        return interviewRepository.save(interview);
    }

    public Interview updateInterview(Long id, Interview interviewDetails) {
        if (id == null)
            throw new RuntimeException("Interview ID cannot be null");
        if (interviewDetails == null)
            throw new RuntimeException("Interview details cannot be null");
        Interview interview = interviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Interview not found with id: " + id));

        if (interviewDetails.getScheduledAt() != null) {
            interview.setScheduledAt(interviewDetails.getScheduledAt());
        }
        if (interviewDetails.getDurationMinutes() != null) {
            interview.setDurationMinutes(interviewDetails.getDurationMinutes());
        }
        if (interviewDetails.getInterviewType() != null) {
            interview.setInterviewType(interviewDetails.getInterviewType());
        }
        if (interviewDetails.getLocation() != null) {
            interview.setLocation(interviewDetails.getLocation());
        }
        if (interviewDetails.getNotes() != null) {
            interview.setNotes(interviewDetails.getNotes());
        }
        if (interviewDetails.getStatus() != null) {
            interview.setStatus(interviewDetails.getStatus());
        }
        if (interviewDetails.getFeedback() != null) {
            interview.setFeedback(interviewDetails.getFeedback());
        }
        if (interviewDetails.getRating() != null) {
            interview.setRating(interviewDetails.getRating());
        }

        Interview result = interviewRepository.save(interview);
        if (result == null)
            throw new RuntimeException("Failed to save interview");
        return result;
    }

    public Interview addFeedback(Long id, String feedback, Integer rating) {
        if (id == null)
            throw new RuntimeException("Interview ID cannot be null");
        Interview interview = interviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Interview not found with id: " + id));

        interview.setFeedback(feedback);
        interview.setRating(rating);
        interview.setStatus("COMPLETED");

        return interviewRepository.save(interview);
    }

    public Interview cancelInterview(Long id) {
        if (id == null)
            throw new RuntimeException("Interview ID cannot be null");
        Interview interview = interviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Interview not found with id: " + id));

        interview.setStatus("CANCELLED");
        return interviewRepository.save(interview);
    }

    public void deleteInterview(Long id) {
        if (id != null) {
            interviewRepository.deleteById(id);
        }
    }
}
