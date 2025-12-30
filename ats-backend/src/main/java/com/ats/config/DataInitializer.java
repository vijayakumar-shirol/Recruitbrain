package com.ats.config;

import com.ats.entity.ERole;
import com.ats.entity.Role;
import com.ats.entity.User;
import com.ats.repository.RoleRepository;
import com.ats.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Set;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Initialize roles
        seedRole(ERole.ROLE_ADMIN);
        seedRole(ERole.ROLE_RECRUITER);
        seedRole(ERole.ROLE_CLIENT);

        // Create default Admin if not exists
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@example.com");
            admin.setPassword(passwordEncoder.encode("admin123"));

            Set<Role> roles = new HashSet<>();
            roles.add(roleRepository.findByName(ERole.ROLE_ADMIN).get());
            admin.setRoles(roles);

            userRepository.save(admin);
            System.out.println("Default admin user created: admin / admin123");
        }
    }

    private void seedRole(ERole roleName) {
        if (roleRepository.findByName(roleName).isEmpty()) {
            Role role = new Role();
            role.setName(roleName);
            roleRepository.save(role);
        }
    }
}
