package com.ats.controller;

import com.ats.entity.Activity;
import com.ats.repository.ActivityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/activities")
@CrossOrigin(origins = "http://localhost:4200")
public class ActivityController {

    @Autowired
    private ActivityRepository activityRepository;

    @GetMapping
    public List<Activity> getActivities(
            @RequestParam String relatedType,
            @RequestParam Long relatedId) {
        return activityRepository.findByRelatedTypeAndRelatedIdOrderByCreatedAtDesc(relatedType, relatedId);
    }

    @PostMapping
    public Activity createActivity(@RequestBody Activity activity) {
        if (activity.getCreatedBy() == null) {
            activity.setCreatedBy("System");
        }
        return activityRepository.save(activity);
    }
}
