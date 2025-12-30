package com.ats.repository;

import com.ats.entity.Attachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AttachmentRepository extends JpaRepository<Attachment, Long> {
    List<Attachment> findByRelatedTypeAndRelatedIdOrderByUploadedAtDesc(String relatedType, Long relatedId);
}
