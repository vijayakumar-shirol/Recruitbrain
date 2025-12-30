package com.ats.controller;

import com.ats.entity.EmailTemplate;
import com.ats.service.EmailTemplateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/email-templates")
@CrossOrigin(origins = "http://localhost:4200")
public class EmailTemplateController {

    @Autowired
    private EmailTemplateService emailTemplateService;

    @GetMapping
    public List<EmailTemplate> getAllTemplates() {
        return emailTemplateService.getAllTemplates();
    }

    @GetMapping("/active")
    public List<EmailTemplate> getActiveTemplates() {
        return emailTemplateService.getActiveTemplates();
    }

    @GetMapping("/category/{category}")
    public List<EmailTemplate> getTemplatesByCategory(@PathVariable String category) {
        return emailTemplateService.getTemplatesByCategory(category);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmailTemplate> getTemplateById(@PathVariable Long id) {
        return emailTemplateService.getTemplateById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public EmailTemplate createTemplate(@RequestBody EmailTemplate template) {
        return emailTemplateService.createTemplate(template);
    }

    @PutMapping("/{id}")
    public ResponseEntity<EmailTemplate> updateTemplate(@PathVariable Long id, @RequestBody EmailTemplate template) {
        try {
            EmailTemplate updated = emailTemplateService.updateTemplate(id, template);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTemplate(@PathVariable Long id) {
        emailTemplateService.deleteTemplate(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/preview")
    public ResponseEntity<Map<String, String>> previewTemplate(@RequestBody Map<String, Object> request) {
        String subject = (String) request.get("subject");
        String body = (String) request.get("body");
        @SuppressWarnings("unchecked")
        Map<String, String> variables = (Map<String, String>) request.get("variables");

        String processedSubject = emailTemplateService.processTemplate(subject, variables);
        String processedBody = emailTemplateService
                .convertToHtml(emailTemplateService.processTemplate(body, variables));

        Map<String, String> response = new java.util.HashMap<>();
        response.put("subject", processedSubject != null ? processedSubject : "");
        response.put("body", processedBody != null ? processedBody : "");

        return ResponseEntity.ok(response);
    }
}
