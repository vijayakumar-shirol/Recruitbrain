package com.ats.service;

import com.ats.entity.Job;
import com.ats.entity.PipelineStage;
import com.ats.entity.PipelineTemplate;
import com.ats.entity.PipelineTemplateStage;
import com.ats.repository.JobRepository;
import com.ats.repository.PipelineStageRepository;
import com.ats.repository.UserRepository;
import com.ats.repository.PipelineTemplateRepository;
import com.ats.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class JobService {

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private PipelineStageRepository stageRepository;

    @Autowired
    private PipelineTemplateRepository templateRepository;

    @Autowired
    private UserRepository userRepository;

    public Job assignRecruiter(Long jobId, Long userId) {
        if (jobId == null || userId == null) {
            throw new IllegalArgumentException("Job ID and User ID must not be null");
        }
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        job.getRecruiters().add(user);
        return jobRepository.save(job);
    }

    public Job removeRecruiter(Long jobId, Long userId) {
        if (jobId == null || userId == null) {
            throw new IllegalArgumentException("Job ID and User ID must not be null");
        }
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        job.getRecruiters().remove(user);
        return jobRepository.save(job);
    }

    public Job assignRecruiters(Long jobId, List<Long> userIds) {
        if (jobId == null || userIds == null) {
            throw new IllegalArgumentException("Job ID and User IDs must not be null");
        }
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        List<User> users = userRepository.findAllById(userIds);
        job.setRecruiters(new java.util.HashSet<>(users));

        return jobRepository.save(job);
    }

    public List<Job> getAllJobs() {
        return jobRepository.findAll();
    }

    public Optional<Job> getJobById(Long id) {
        return jobRepository.findById(id);
    }

    @Transactional
    public Job createJob(Job job) {
        Job savedJob = jobRepository.save(job);

        // Create pipeline stages from template or defaults
        Long templateId = job.getPipelineTemplateId();
        if (templateId != null) {
            createPipelineStagesFromTemplate(savedJob, templateId);
        } else {
            createDefaultPipelineStages(savedJob);
        }

        return savedJob;
    }

    public Job updateJob(Long id, Job jobDetails) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        job.setTitle(jobDetails.getTitle());
        job.setDescription(jobDetails.getDescription());
        job.setStatus(jobDetails.getStatus());
        job.setLocation(jobDetails.getLocation());
        job.setSalaryRange(jobDetails.getSalaryRange());
        job.setExperienceRequired(jobDetails.getExperienceRequired());
        job.setLogoUrl(jobDetails.getLogoUrl());
        job.setTags(jobDetails.getTags());
        job.setJobCode(jobDetails.getJobCode());
        job.setEmploymentType(jobDetails.getEmploymentType());
        job.setHeadcount(jobDetails.getHeadcount());
        job.setDepartment(jobDetails.getDepartment());
        job.setTargetDate(jobDetails.getTargetDate());
        job.setSalaryMin(jobDetails.getSalaryMin());
        job.setSalaryMax(jobDetails.getSalaryMax());
        job.setCurrency(jobDetails.getCurrency());
        job.setSkills(jobDetails.getSkills());

        return jobRepository.save(job);
    }

    public void deleteJob(Long id) {
        jobRepository.deleteById(id);
    }

    public List<Job> getJobsByClientId(Long clientId) {
        return jobRepository.findByClientId(clientId);
    }

    private void createPipelineStagesFromTemplate(Job job, Long templateId) {
        PipelineTemplate template = templateRepository.findById(templateId)
                .orElseThrow(() -> new RuntimeException("Pipeline Template not found"));

        if (template.getStages() != null) {
            for (PipelineTemplateStage templateStage : template.getStages()) {
                PipelineStage stage = new PipelineStage();
                stage.setJob(job);
                stage.setName(templateStage.getName());
                stage.setColor(templateStage.getColor());
                stage.setPosition(templateStage.getPosition());
                stageRepository.save(stage);
            }
        }
    }

    private void createDefaultPipelineStages(Job job) {
        String[][] defaultStages = {
                { "New Applications", "#3b82f6" },
                { "Screening", "#8b5cf6" },
                { "Phone Interview", "#ec4899" },
                { "Technical Interview", "#f59e0b" },
                { "Final Interview", "#10b981" },
                { "Offer", "#06b6d4" },
                { "Hired", "#22c55e" },
                { "Rejected", "#ef4444" }
        };

        for (int i = 0; i < defaultStages.length; i++) {
            PipelineStage stage = new PipelineStage();
            stage.setJob(job);
            stage.setName(defaultStages[i][0]);
            stage.setColor(defaultStages[i][1]);
            stage.setPosition(i);
            stageRepository.save(stage);
        }
    }
}
