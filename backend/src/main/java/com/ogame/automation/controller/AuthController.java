package com.ogame.automation.controller;

import com.ogame.automation.entity.UserAccount;
import com.ogame.automation.repository.UserAccountRepository;
import com.ogame.automation.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Authentication endpoints")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserAccountRepository userAccountRepository;

    @PostMapping("/login")
    @Operation(summary = "Login user", description = "Authenticate user and return JWT token")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        Optional<String> tokenOpt = authService.authenticate(request.getUsername(), request.getPassword());
        
        if (tokenOpt.isPresent()) {
            Optional<UserAccount> userOpt = userAccountRepository.findByUsername(request.getUsername());
            if (userOpt.isPresent()) {
                UserAccount user = userOpt.get();
                LoginResponse response = new LoginResponse(
                    user.getId(),
                    user.getUsername(),
                    user.getRole().name(),
                    tokenOpt.get()
                );
                return ResponseEntity.ok(response);
            }
        }
        
        return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials"));
    }

    // Request/Response classes
    public static class LoginRequest {
        private String username;
        private String password;

        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class LoginResponse {
        private Long id;
        private String username;
        private String role;
        private String token;

        public LoginResponse(Long id, String username, String role, String token) {
            this.id = id;
            this.username = username;
            this.role = role;
            this.token = token;
        }

        public Long getId() { return id; }
        public String getUsername() { return username; }
        public String getRole() { return role; }
        public String getToken() { return token; }
    }
}
