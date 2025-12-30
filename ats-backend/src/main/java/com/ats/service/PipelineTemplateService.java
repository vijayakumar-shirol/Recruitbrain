package com.ats.service;

import com.ats.entity.PipelineTemplate;
import com.ats.entity.PipelineTemplateStage;
import com.ats.repository.PipelineTemplateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PipelineTemplateService {
    @Autowired
    private PipelineTemplateRepository templateRepository;

    public List<PipelineTemplate> getAllTemplates() {
        return templateRepository.findAll();
    }

    public PipelineTemplate getTemplateById(Long id) {
        return templateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Template not found"));
    }

    @Transactional
    public PipelineTemplate createTemplate(PipelineTemplate template) {
        // Ensure stages link back to template
        if (template.getStages() != null) {
            for (PipelineTemplateStage stage : template.getStages()) {
                stage.setTemplate(template);
            }
        }
        return templateRepository.save(template);
    }

    @Transactional
    public PipelineTemplate updateTemplate(Long id, PipelineTemplate templateDetails) {
        PipelineTemplate template = getTemplateById(id);
        template.setName(templateDetails.getName());

        // Clear existing stages and add new ones
        template.getStages().clear();
        if (templateDetails.getStages() != null) {
            for (PipelineTemplateStage stage : templateDetails.getStages()) {
                stage.setTemplate(template);
                template.getStages().add(stage);
            }
        }

        return templateRepository.save(template);
    }

    public void deleteTemplate(Long id) {
        templateRepository.deleteById(id);
    }
}
