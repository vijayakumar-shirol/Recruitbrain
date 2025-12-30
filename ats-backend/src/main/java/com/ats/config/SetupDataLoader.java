package com.ats.config;

import com.ats.entity.ERole;
import com.ats.entity.Role;
import com.ats.entity.User;
import com.ats.repository.RoleRepository;
import com.ats.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationListener;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.HashSet;
import java.util.Optional;

@Component
public class SetupDataLoader implements ApplicationListener<ContextRefreshedEvent> {

    boolean alreadySetup = false;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void onApplicationEvent(@org.springframework.lang.NonNull ContextRefreshedEvent event) {
        if (alreadySetup)
            return;

        // Create Roles
        createRoleIfNotFound(ERole.ROLE_ADMIN);
        createRoleIfNotFound(ERole.ROLE_RECRUITER);
        createRoleIfNotFound(ERole.ROLE_CLIENT);

        // Create Admin User
        if (!userRepository.existsByUsername("admin")) {
            User user = new User();
            user.setUsername("admin");
            user.setPassword(passwordEncoder.encode("admin123"));
            user.setEmail("admin@test.com");

            Set<Role> roles = new HashSet<>();
            Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN).get();
            roles.add(adminRole);

            user.setRoles(roles);
            userRepository.save(user);
        }

        alreadySetup = true;
    }

    @Transactional
    Role createRoleIfNotFound(ERole name) {
        Optional<Role> role = roleRepository.findByName(name);
        if (role.isEmpty()) {
            Role newRole = new Role();
            newRole.setName(name);
            return roleRepository.save(newRole);
        }
        return role.get();
    }
}
