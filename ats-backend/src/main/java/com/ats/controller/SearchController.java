package com.ats.controller;

import com.ats.payload.response.GlobalSearchResponse;
import com.ats.service.SearchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:4200", maxAge = 3600)
@RestController
@RequestMapping("/api/search")
public class SearchController {

    @Autowired
    private SearchService searchService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECRUITER') or hasRole('CLIENT')")
    public ResponseEntity<List<GlobalSearchResponse>> search(@RequestParam String query) {
        return ResponseEntity.ok(searchService.globalSearch(query));
    }
}
