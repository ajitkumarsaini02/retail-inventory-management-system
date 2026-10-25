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

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.client.RestTemplate;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Value("${google.client.id:}")
    private String googleClientId;

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

    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@Valid @RequestBody GoogleAuthRequest request) {
        String idToken = request.getIdToken();
        if (idToken == null || idToken.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "ID token is required"));
        }

        String email;
        String name;

        // Support mock/demo token for local testing without external Google OAuth credentials
        if (idToken.startsWith("mock_google_") || idToken.startsWith("demo_google_")) {
            String payloadStr = idToken.replace("mock_google_", "").replace("demo_google_", "").trim();
            if (payloadStr.contains(":::")) {
                String[] parts = payloadStr.split(":::", 2);
                name = parts[0].trim();
                email = parts[1].trim();
            } else {
                email = payloadStr;
                if (!email.contains("@")) {
                    email = "ajit.kumar@gmail.com";
                }
                String rawName = email.split("@")[0].replace(".", " ");
                String[] words = rawName.split(" ");
                StringBuilder sb = new StringBuilder();
                for (String w : words) {
                    if (!w.isEmpty()) {
                        sb.append(Character.toUpperCase(w.charAt(0))).append(w.substring(1)).append(" ");
                    }
                }
                name = sb.toString().trim();
            }
        } else {
            try {
                RestTemplate restTemplate = new RestTemplate();
                String url = "https://oauth2.googleapis.com/tokeninfo?id_token=" + idToken;
                @SuppressWarnings("unchecked")
                Map<String, Object> payload = restTemplate.getForObject(url, Map.class);

                if (payload == null || !payload.containsKey("email")) {
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                            .body(Map.of("message", "Invalid Google ID token"));
                }

                // Verify client ID if configured
                if (googleClientId != null && !googleClientId.isBlank()) {
                    String aud = (String) payload.get("aud");
                    if (!googleClientId.equals(aud)) {
                        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                .body(Map.of("message", "Google Client ID mismatch"));
                    }
                }

                Object emailVerified = payload.get("email_verified");
                boolean isEmailVerified = false;
                if (emailVerified instanceof Boolean b) {
                    isEmailVerified = b;
                } else if (emailVerified instanceof String s) {
                    isEmailVerified = Boolean.parseBoolean(s);
                }

                if (!isEmailVerified) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body(Map.of("message", "Google email is not verified"));
                }

                email = (String) payload.get("email");
                name = (String) payload.get("name");
                if (name == null || name.isBlank()) {
                    name = email.split("@")[0];
                }
            } catch (Exception e) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Failed to verify Google token: " + e.getMessage()));
            }
        }

        if (email == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Unable to retrieve email from Google token"));
        }

        Optional<User> existingUserOpt = userService.getUserByEmail(email);
        User user;
        if (existingUserOpt.isPresent()) {
            user = existingUserOpt.get();
            if (!user.isEnabled()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message", "User account is disabled"));
            }
        } else {
            // Auto-register new Google user
            User newUser = new User();
            newUser.setName(name);
            newUser.setEmail(email);
            newUser.setPassword(UUID.randomUUID().toString());
            if (userService.countUsers() == 0) {
                user = userService.createAdmin(newUser);
            } else {
                user = userService.createUser(newUser);
            }
        }

        String token = jwtService.generateToken(user.getEmail());
        LoginResponse response = new LoginResponse(
                token,
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().name(),
                user.isEnabled(),
                user.getCreatedAt()
        );

        return ResponseEntity.ok(response);
    }

    // Static helper request and response models
    public static class GoogleAuthRequest {
        @NotBlank(message = "Google ID token is required")
        private String idToken;

        public GoogleAuthRequest() {}
        public GoogleAuthRequest(String idToken) { this.idToken = idToken; }

        public String getIdToken() { return idToken; }
        public void setIdToken(String idToken) { this.idToken = idToken; }
    }

    public static class RegisterRequest {
        @NotBlank(message = "Name is required")
        private String name;

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        @NotBlank(message = "Password is required")
        @jakarta.validation.constraints.Size(min = 6, message = "Password must be at least 6 characters")
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
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
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
