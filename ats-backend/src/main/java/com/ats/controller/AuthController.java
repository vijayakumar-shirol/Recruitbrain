package com.ats.controller;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ats.entity.ERole;
import com.ats.entity.Role;
import com.ats.entity.User;
import com.ats.payload.request.LoginRequest;
import com.ats.payload.request.SignupRequest;
import com.ats.payload.response.JwtResponse;
import com.ats.payload.response.MessageResponse;
import com.ats.repository.RoleRepository;
import com.ats.repository.UserRepository;
import com.ats.security.jwt.JwtUtils;
import com.ats.security.services.UserDetailsImpl;
import com.ats.service.EmailService;

@CrossOrigin(origins = "http://localhost:4200", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    RoleRepository roleRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    @Autowired
    EmailService emailService;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());

        return ResponseEntity.ok(new JwtResponse(jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getEmail(),
                userDetails.getProfilePictureUrl(),
                roles));
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Username is already taken!"));
        }

        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Email is already in use!"));
        }

        // Create new user's account
        User user = new User();
        user.setUsername(signUpRequest.getUsername());
        user.setEmail(signUpRequest.getEmail());
        user.setPassword(encoder.encode(signUpRequest.getPassword()));

        Set<String> strRoles = signUpRequest.getRole();
        Set<Role> roles = new HashSet<>();

        if (strRoles == null) {
            Role userRole = roleRepository.findByName(ERole.ROLE_RECRUITER)
                    .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
            roles.add(userRole);
        } else {
            strRoles.forEach(role -> {
                switch (role) {
                    case "admin":
                        Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
                                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                        roles.add(adminRole);
                        break;
                    case "client":
                        Role modRole = roleRepository.findByName(ERole.ROLE_CLIENT)
                                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                        roles.add(modRole);
                        break;
                    default:
                        Role userRole = roleRepository.findByName(ERole.ROLE_RECRUITER)
                                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                        roles.add(userRole);
                }
            });
        }

        user.setRoles(roles);
        userRepository.save(user);

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
                    user.getUsername(),
                    user.getUsername(),
                    signUpRequest.getPassword(),
                    loginUrl,
                    loginUrl);

            emailService.sendHtmlEmail(user.getEmail(), "Welcome to RecruitBrain!", emailBody);
            statusMessage += " Welcome email sent.";
        } catch (Exception e) {
            // Log the error but don't fail the registration
            System.err.println("Failed to send welcome email: " + e.getMessage());
            statusMessage += " However, the welcome email could not be sent.";
        }

        return ResponseEntity.ok(new MessageResponse(statusMessage));
    }
}
