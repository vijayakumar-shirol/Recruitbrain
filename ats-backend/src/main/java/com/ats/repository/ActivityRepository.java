package com.ats.repository;

import com.ats.entity.Activity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ActivityRepository extends JpaRepository<Activity, Long> {
    List<Activity> findByRelatedTypeAndRelatedIdOrderByCreatedAtDesc(String relatedType, Long relatedId);
}
