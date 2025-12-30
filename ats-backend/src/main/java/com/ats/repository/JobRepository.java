package com.ats.repository;

import com.ats.entity.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface JobRepository extends JpaRepository<Job, Long> {
    List<Job> findByClientId(Long clientId);

    List<Job> findByStatus(String status);

    List<Job> findByTitleContainingIgnoreCaseOrLocationContainingIgnoreCase(String title, String location);
}
