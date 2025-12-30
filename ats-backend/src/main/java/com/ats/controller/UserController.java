package com.ats.controller;

import com.ats.entity.ERole;
import com.ats.entity.Role;
import com.ats.entity.User;
import com.ats.repository.UserRepository;
import com.ats.repository.RoleRepository;
import com.ats.service.EmailService;
import com.ats.payload.response.MessageResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createUser(@RequestBody User user) {
        if (userRepository.existsByUsername(user.getUsername())) {
            return ResponseEntity.badRequest().body("Error: Username is already taken!");
        }
        if (userRepository.existsByEmail(user.getEmail())) {
            return ResponseEntity.badRequest().body("Error: Email is already in use!");
        }

        if (user.getRoles() != null) {
            Set<Role> roles = new HashSet<>();
            user.getRoles().forEach(role -> {
                roleRepository.findByName(role.getName()).ifPresent(roles::add);
            });
            user.setRoles(roles);
        }

        String rawPassword = user.getPassword();
        user.setPassword(passwordEncoder.encode(rawPassword));
        User savedUser = userRepository.save(user);

        String statusMessage = "User registered successfully!";
        // Send Welcome Email
        try {
            String loginUrl = "http://localhost:4200/login";
            String emailBody = String.format(
                    "<html><body>" +
                            "<p>Hi %s,</p>" +
                            "<p>Welcome to <b>RecruitBrain</b>! We’re excited to have you on board.</p>" +
                            "<p>Your account has been created successfully. Here are your login details:</p>" +
                            "<p style='margin-left: 20px;'>" +
                            "<b>username:</b> %s<br>" +
                            "<b>Temporary Password:</b> %s" +
                            "</p>" +
                            "<p>Please log in and change your password as soon as possible.</p>" +
                            "<p><b>Login here:</b><br>" +
                            "<a href='%s'>%s</a></p>" +
                            "<p>If you did not request this account or need help, feel free to contact our support team.</p>"
                            +
                            "<p>Thank you,<br>" +
                            "<b>RecruitBrain Team</b></p>" +
                            "</body></html>",
                    savedUser.getUsername(),
                    savedUser.getUsername(),
                    rawPassword,
                    loginUrl,
                    loginUrl);

            emailService.sendHtmlEmail(savedUser.getEmail(), "Welcome to RecruitBrain!", emailBody);
            statusMessage += " Welcome email sent.";
        } catch (Exception e) {
            // Log the error but don't fail the registration
            System.err.println("Failed to send welcome email: " + e.getMessage());
            statusMessage += " However, the welcome email could not be sent.";
        }

        return ResponseEntity.ok(new MessageResponse(statusMessage));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User userDetails) {
        return userRepository.findById(id)
                .map(user -> {
                    user.setUsername(userDetails.getUsername());
                    user.setEmail(userDetails.getEmail());
                    if (userDetails.getPassword() != null && !userDetails.getPassword().isEmpty()) {
                        user.setPassword(passwordEncoder.encode(userDetails.getPassword()));
                    }
                    if (userDetails.getRoles() != null) {
                        Set<Role> roles = new HashSet<>();
                        userDetails.getRoles().forEach(role -> {
                            roleRepository.findByName(role.getName()).ifPresent(roles::add);
                        });
                        user.setRoles(roles);
                    }
                    user.setClient(userDetails.getClient());
                    return ResponseEntity.ok(userRepository.save(user));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('USER') or hasRole('RECRUITER') or hasRole('ADMIN')")
    public ResponseEntity<User> getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/me/profile")
    @PreAuthorize("hasRole('USER') or hasRole('RECRUITER') or hasRole('ADMIN')")
    public ResponseEntity<User> updateMyProfile(@RequestBody User profileDetails) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .map(user -> {
                    user.setEmail(profileDetails.getEmail());
                    user.setProfilePictureUrl(profileDetails.getProfilePictureUrl());
                    // We don't allow changing username here for simplicity/security in this demo
                    // But we could if we handle JWT token invalidation
                    return ResponseEntity.ok(userRepository.save(user));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/me/password")
    @PreAuthorize("hasRole('USER') or hasRole('RECRUITER') or hasRole('ADMIN')")
    public ResponseEntity<?> changeMyPassword(@RequestBody java.util.Map<String, String> passwordData) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        String newPassword = passwordData.get("newPassword");

        if (newPassword == null || newPassword.length() < 6) {
            return ResponseEntity.badRequest().body("Error: Password must be at least 6 characters long.");
        }

        return userRepository.findByUsername(username)
                .map(user -> {
                    user.setPassword(passwordEncoder.encode(newPassword));
                    userRepository.save(user);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/recruiters")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECRUITER')")
    public List<User> getAllRecruiters() {
        return userRepository.findByRolesName(ERole.ROLE_RECRUITER);
    }
}
