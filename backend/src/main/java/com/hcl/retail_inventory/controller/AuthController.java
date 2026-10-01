package com.hcl.retail_inventory.controller;

import com.hcl.retail_inventory.entity.Role;
import com.hcl.retail_inventory.entity.User;
import com.hcl.retail_inventory.security.JwtService;
import com.hcl.retail_inventory.services.UserService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthController(UserService userService, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        if (userService.existsByEmail(request.getEmail())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Email already registered"));
        }

        User newUser = new User();
        newUser.setName(request.getName());
        newUser.setEmail(request.getEmail());
        newUser.setPassword(request.getPassword());
        User savedUser;
        if (userService.countUsers() == 0) {
            savedUser = userService.createAdmin(newUser);
        } else {
            savedUser = userService.createUser(newUser);
        }

        String token = jwtService.generateToken(savedUser.getEmail());

        LoginResponse response = new LoginResponse(
                token,
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getEmail(),
                savedUser.getRole().name(),
                savedUser.isEnabled(),
                savedUser.getCreatedAt()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        Optional<User> userOptional = userService.getUserByEmail(request.getEmail());

        if (userOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid email or password"));
        }

        User user = userOptional.get();

        if (!user.isEnabled()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "User account is disabled"));
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid email or password"));
        }

        String token = jwtService.generateToken(user.getEmail());

        LoginResponse response = new LoginResponse(
                token,
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().name()
        );

        return ResponseEntity.ok(response);
    }

    // Static helper request and response models
    public static class RegisterRequest {
        @NotBlank(message = "Name is required")
        private String name;

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        @NotBlank(message = "Password is required")
        private String password;

        public RegisterRequest() {}

        public RegisterRequest(String name, String email, String password) {
            this.name = name;
            this.email = email;
            this.password = password;
        }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class LoginRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        @NotBlank(message = "Password is required")
        private String password;

        public LoginRequest() {}

        public LoginRequest(String email, String password) {
            this.email = email;
            this.password = password;
        }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class LoginResponse {
        private String token;
        private Long id;
        private String name;
        private String email;
        private String role;
        private boolean enabled = true;
        private LocalDateTime createdAt;

        public LoginResponse(String token, Long id, String name, String email, String role) {
            this(token, id, name, email, role, true, LocalDateTime.now());
        }

        public LoginResponse(String token, Long id, String name, String email, String role, boolean enabled, LocalDateTime createdAt) {
            this.token = token;
            this.id = id;
            this.name = name;
            this.email = email;
            this.role = role;
            this.enabled = enabled;
            this.createdAt = createdAt;
        }

        public String getToken() { return token; }
        public Long getId() { return id; }
        public String getName() { return name; }
        public String setEmail() { return email; }
        public String getRole() { return role; }
        public boolean isEnabled() { return enabled; }
        public LocalDateTime getCreatedAt() { return createdAt; }
    }

    public static class UserResponse {
        private Long id;
        private String name;
        private String email;
        private String role;
        private boolean enabled;
        private LocalDateTime createdAt;

        public UserResponse(Long id, String name, String email, String role, boolean enabled, LocalDateTime createdAt) {
            this.id = id;
            this.name = name;
            this.email = email;
            this.role = role;
            this.enabled = enabled;
            this.createdAt = createdAt;
        }

        public Long getId() { return id; }
        public String getName() { return name; }
        public String setEmail() { return email; }
        public String getRole() { return role; }
        public boolean isEnabled() { return enabled; }
        public LocalDateTime getCreatedAt() { return createdAt; }
    }
}
