package com.ats.service;

import com.ats.entity.EmailTemplate;
import com.ats.entity.Candidate;
import com.ats.entity.Job;
import com.ats.repository.EmailTemplateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class EmailTemplateService {

    @Autowired
    private EmailTemplateRepository emailTemplateRepository;

    public List<EmailTemplate> getAllTemplates() {
        return emailTemplateRepository.findAll();
    }

    public List<EmailTemplate> getActiveTemplates() {
        return emailTemplateRepository.findByActiveTrue();
    }

    public List<EmailTemplate> getTemplatesByCategory(String category) {
        return emailTemplateRepository.findByCategoryAndActiveTrue(category);
    }

    public Optional<EmailTemplate> getTemplateById(Long id) {
        if (id == null)
            return Optional.empty();
        return emailTemplateRepository.findById(id);
    }

    public EmailTemplate createTemplate(EmailTemplate template) {
        if (template == null)
            throw new IllegalArgumentException("Template cannot be null");
        return emailTemplateRepository.save(template);
    }

    public EmailTemplate updateTemplate(Long id, EmailTemplate templateDetails) {
        if (id == null)
            throw new IllegalArgumentException("ID must not be null");
        EmailTemplate template = emailTemplateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Template not found with id: " + id));

        template.setName(templateDetails.getName());
        template.setSubject(templateDetails.getSubject());
        template.setBody(templateDetails.getBody());
        template.setCategory(templateDetails.getCategory());
        template.setActive(templateDetails.getActive());

        return emailTemplateRepository.save(template);
    }

    public void deleteTemplate(Long id) {
        if (id != null) {
            emailTemplateRepository.deleteById(id);
        }
    }

    /**
     * Process template by replacing variables with actual values
     * Variables format: {{variableName}}
     * Supported variables:
     * - {{candidateName}}, {{candidateFirstName}}, {{candidateLastName}},
     * {{candidateEmail}}
     * - {{jobTitle}}, {{jobLocation}}, {{companyName}}
     * - {{recruiterName}}
     */
    public String processTemplate(String template, Map<String, String> variables) {
        if (template == null || variables == null) {
            return template;
        }

        Pattern pattern = Pattern.compile("\\{\\{(\\w+)\\}\\}");
        Matcher matcher = pattern.matcher(template);

        StringBuilder result = new StringBuilder();
        while (matcher.find()) {
            String variableName = matcher.group(1);
            String replacement = variables.getOrDefault(variableName, matcher.group(0));
            if (replacement == null) {
                replacement = matcher.group(0);
            }
            matcher.appendReplacement(result, Matcher.quoteReplacement(replacement));
        }
        matcher.appendTail(result);

        return result.toString();
    }

    /**
     * Build variables map from candidate and job context
     */
    public Map<String, String> buildVariables(Candidate candidate, Job job, String recruiterName) {
        Map<String, String> vars = new java.util.HashMap<>();

        vars.put("candidateName",
                (candidate != null && candidate.getFirstName() != null && candidate.getLastName() != null
                        ? candidate.getFirstName() + " " + candidate.getLastName()
                        : ""));
        vars.put("candidateFirstName",
                (candidate != null && candidate.getFirstName() != null ? candidate.getFirstName() : ""));
        vars.put("candidateLastName",
                (candidate != null && candidate.getLastName() != null ? candidate.getLastName() : ""));
        vars.put("candidateEmail", (candidate != null && candidate.getEmail() != null ? candidate.getEmail() : ""));

        vars.put("jobTitle", (job != null && job.getTitle() != null ? job.getTitle() : ""));
        vars.put("jobLocation", (job != null && job.getLocation() != null ? job.getLocation() : ""));
        vars.put("companyName", (job != null && job.getClient() != null && job.getClient().getName() != null
                ? job.getClient().getName()
                : ""));
        vars.put("recruiterName", (recruiterName != null ? recruiterName : ""));

        return vars;
    }

    public String convertToHtml(String text) {
        if (text == null)
            return null;
        return text.replace("\n", "<br>")
                .replace("\t", "&nbsp;&nbsp;&nbsp;&nbsp;");
    }
}
