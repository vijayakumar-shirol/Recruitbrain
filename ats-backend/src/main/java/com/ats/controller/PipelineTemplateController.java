package com.ats.controller;

import com.ats.entity.PipelineTemplate;
import com.ats.service.PipelineTemplateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/pipeline-templates")
public class PipelineTemplateController {
    @Autowired
    private PipelineTemplateService templateService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECRUITER')")
    public List<PipelineTemplate> getAllTemplates() {
        return templateService.getAllTemplates();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECRUITER')")
    public ResponseEntity<PipelineTemplate> getTemplateById(@PathVariable Long id) {
        return ResponseEntity.ok(templateService.getTemplateById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public PipelineTemplate createTemplate(@RequestBody PipelineTemplate template) {
        return templateService.createTemplate(template);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PipelineTemplate> updateTemplate(@PathVariable Long id,
            @RequestBody PipelineTemplate template) {
        return ResponseEntity.ok(templateService.updateTemplate(id, template));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteTemplate(@PathVariable Long id) {
        templateService.deleteTemplate(id);
        return ResponseEntity.ok().build();
    }
}
