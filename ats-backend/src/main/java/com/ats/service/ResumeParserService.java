package com.ats.service;

import com.ats.entity.Candidate;
import org.apache.tika.Tika;
import org.apache.tika.exception.TikaException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class ResumeParserService {

    private final Tika tika = new Tika();

    public Candidate parseResume(MultipartFile file) throws IOException, TikaException {
        String content = tika.parseToString(file.getInputStream());

        Candidate candidate = new Candidate();
        candidate.setExperienceYears(0); // Default

        // Extract Email
        extractEmail(content, candidate);

        // Extract Phone
        extractPhone(content, candidate);

        // Extract Name (Heuristic)
        extractName(content, candidate);

        // Extract Skills (Simple keyword matching)
        extractSkills(content, candidate);

        return candidate;
    }

    private void extractEmail(String content, Candidate candidate) {
        // Regex for email
        Pattern pattern = Pattern.compile("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,6}");
        Matcher matcher = pattern.matcher(content);
        if (matcher.find()) {
            candidate.setEmail(matcher.group());
        }
    }

    private void extractPhone(String content, Candidate candidate) {
        // Simple regex for phone (supports various formats)
        // This is basic and might need refinement for international numbers
        Pattern pattern = Pattern.compile("(\\+\\d{1,3}[- ]?)?\\d{10}");
        Matcher matcher = pattern.matcher(content);
        if (matcher.find()) {
            candidate.setPhone(matcher.group());
        }
    }

    private void extractName(String content, Candidate candidate) {
        // Very basic heuristic: Assume name is in the first few lines
        // Splitting by new lines and taking the first non-empty line that isn't too
        // long
        String[] lines = content.split("\\r?\\n");
        for (String line : lines) {
            line = line.trim();
            if (!line.isEmpty() && line.length() < 50 && !line.contains("@") && !line.matches(".*\\d.*")) {
                // Heuristic: If it looks like a name (no numbers, no @, short enough)
                String[] parts = line.split("\\s+");
                if (parts.length >= 2) {
                    candidate.setFirstName(parts[0]);
                    // Combine rest as last name
                    StringBuilder lastName = new StringBuilder();
                    for (int i = 1; i < parts.length; i++) {
                        lastName.append(parts[i]).append(" ");
                    }
                    candidate.setLastName(lastName.toString().trim());
                    break;
                }
            }
        }
    }

    private void extractSkills(String content, Candidate candidate) {
        // Basic list of common tech skills to check for
        String[] commonSkills = {
                "Java", "Python", "JavaScript", "TypeScript", "React", "Angular", "Vue",
                "Spring", "Hibernate", "SQL", "NoSQL", "AWS", "Azure", "Docker", "Kubernetes",
                "Git", "CI/CD", "Node.js", "HTML", "CSS"
        };

        StringBuilder foundSkills = new StringBuilder();
        String lowerContent = content.toLowerCase();

        for (String skill : commonSkills) {
            if (lowerContent.contains(skill.toLowerCase())) {
                if (foundSkills.length() > 0) {
                    foundSkills.append(", ");
                }
                foundSkills.append(skill);
            }
        }
        candidate.setSkills(foundSkills.toString());
    }
}
