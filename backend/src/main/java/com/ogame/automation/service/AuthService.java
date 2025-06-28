package com.ogame.automation.service;

import com.ogame.automation.auth.JwtUtil;
import com.ogame.automation.entity.UserAccount;
import com.ogame.automation.repository.UserAccountRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@Transactional
public class AuthService {

    @Autowired
    private UserAccountRepository userAccountRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    public Optional<String> authenticate(String username, String password) {
        Optional<UserAccount> userOpt = userAccountRepository.findByUsername(username);
        
        if (userOpt.isPresent()) {
            UserAccount user = userOpt.get();
            
            if (!user.getDisabled() && passwordEncoder.matches(password, user.getPasswordHash())) {
                // Update last access
                userAccountRepository.updateLastAccessAt(user.getId(), LocalDateTime.now());
                
                // Generate JWT token
                String token = jwtUtil.generateToken(user.getUsername(), user.getRole().name(), user.getId());
                return Optional.of(token);
            }
        }
        
        return Optional.empty();
    }

    public UserAccount createUser(String username, String password, UserAccount.Role role) {
        if (userAccountRepository.existsByUsername(username)) {
            throw new RuntimeException("Username already exists");
        }

        UserAccount user = new UserAccount();
        user.setUsername(username);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setRole(role);
        user.setDisabled(false);

        return userAccountRepository.save(user);
    }
}
