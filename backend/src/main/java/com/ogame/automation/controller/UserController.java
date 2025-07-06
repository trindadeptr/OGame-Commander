package com.ogame.automation.controller;

import com.ogame.automation.entity.UserAccount;
import com.ogame.automation.repository.UserAccountRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@Tag(name = "User Management", description = "Operations for managing application users")
@SecurityRequirement(name = "Bearer Authentication")
public class UserController {

    @Autowired
    private UserAccountRepository userAccountRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all users", description = "Retrieve a list of all users (Admin only)")
    public ResponseEntity<List<UserAccount>> getAllUsers() {
        List<UserAccount> users = userAccountRepository.findAll();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get user by ID", description = "Retrieve a specific user by its ID (Admin only)")
    public ResponseEntity<UserAccount> getUserById(@PathVariable Long id) {
        Optional<UserAccount> user = userAccountRepository.findById(id);
        return user.map(ResponseEntity::ok)
                   .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create new user", description = "Create a new user account (Admin only)")
    public ResponseEntity<UserAccount> createUser(@Valid @RequestBody CreateUserRequest request) {
        if (userAccountRepository.existsByUsername(request.getUsername())) {
            return ResponseEntity.badRequest().build();
        }
        
        UserAccount user = new UserAccount();
        user.setUsername(request.getUsername());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(UserAccount.Role.valueOf(request.getRole()));

        UserAccount savedUser = userAccountRepository.save(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedUser);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update user", description = "Update an existing user account (Admin only)")
    public ResponseEntity<UserAccount> updateUser(@PathVariable Long id, @Valid @RequestBody UpdateUserRequest request) {
        Optional<UserAccount> optionalUser = userAccountRepository.findById(id);
        
        if (optionalUser.isPresent()) {
            UserAccount user = optionalUser.get();
            
            if (request.getPassword() != null) {
                user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
            }
            
            if (request.getRole() != null) {
                user.setRole(UserAccount.Role.valueOf(request.getRole()));
            }
            
            UserAccount updatedUser = userAccountRepository.save(user);
            return ResponseEntity.ok(updatedUser);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete user", description = "Delete a user account (Admin only)")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        if (userAccountRepository.existsById(id)) {
            userAccountRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Request DTOs
    public static class CreateUserRequest {
        private String username;
        private String password;
        private String role;

        // Getters and Setters
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }

        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }

        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
    }

    public static class UpdateUserRequest {
        private String password;
        private String role;

        // Getters and Setters
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }

        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
    }
}

