package com.ats.repository;

import com.ats.entity.EmailTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EmailTemplateRepository extends JpaRepository<EmailTemplate, Long> {

    List<EmailTemplate> findByActiveTrue();

    List<EmailTemplate> findByCategory(String category);

    List<EmailTemplate> findByCategoryAndActiveTrue(String category);

    List<EmailTemplate> findByNameContainingIgnoreCase(String name);
}
