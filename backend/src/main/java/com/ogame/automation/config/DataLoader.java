package com.ogame.automation.config;

import com.ogame.automation.entity.UserAccount;
import com.ogame.automation.repository.UserAccountRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataLoader implements CommandLineRunner {

    @Autowired
    private UserAccountRepository userAccountRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private static final String DEFAULT_PWD = "changeme";

    @Override
    public void run(String... args) {
        // Create default admin user if it doesn't exist
        if (!userAccountRepository.existsByUsername("admin")) {
            UserAccount admin = new UserAccount();
            admin.setUsername("admin");
            admin.setPasswordHash(passwordEncoder.encode(DEFAULT_PWD));
            admin.setRole(UserAccount.Role.ADMIN);
            admin.setDisabled(false);
            
            userAccountRepository.save(admin);
            System.out.println("Default admin user created: admin / " + DEFAULT_PWD);
        }
    }
}
