package com.hcl.retail_inventory;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hcl.retail_inventory.controller.AuthController.LoginRequest;
import com.hcl.retail_inventory.controller.AuthController.RegisterRequest;
import com.hcl.retail_inventory.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@ActiveProfiles("test")
class AuthAndSecurityIntegrationTest {

    @Autowired
    private WebApplicationContext context;

    private final ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule())
            .disable(com.fasterxml.jackson.databind.SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

    @Autowired
    private UserRepository userRepository;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();
        userRepository.deleteAll();
    }

    @Test
    @DisplayName("Health endpoint is public and returns 200")
    void testPublicHealthEndpoint() throws Exception {
        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"));

        mockMvc.perform(get("/"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"));
    }

    @Test
    @DisplayName("Registration: First user becomes ADMIN, second becomes USER")
    void testRegistrationRoleAssignment() throws Exception {
        RegisterRequest adminReq = new RegisterRequest("Admin User", "admin@example.com", "Password123!");
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(adminReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").isString())
                .andExpect(jsonPath("$.role").value("ADMIN"))
                .andExpect(jsonPath("$.email").value("admin@example.com"));

        RegisterRequest userReq = new RegisterRequest("Normal User", "user@example.com", "Password123!");
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(userReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").isString())
                .andExpect(jsonPath("$.role").value("USER"))
                .andExpect(jsonPath("$.email").value("user@example.com"));
    }

    @Test
    @DisplayName("Registration: Duplicate email is rejected with 400")
    void testDuplicateEmailRejected() throws Exception {
        RegisterRequest user1 = new RegisterRequest("User One", "duplicate@example.com", "Password123!");
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(user1)))
                .andExpect(status().isCreated());

        RegisterRequest user2 = new RegisterRequest("User Two", "duplicate@example.com", "Password456!");
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(user2)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Email already registered"));
    }

    @Test
    @DisplayName("Security: Short password (<6 chars) is rejected with 400 validation error")
    void testWeakPasswordRejected() throws Exception {
        RegisterRequest weakReq = new RegisterRequest("Weak User", "weak@example.com", "123");
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(weakReq)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.errors.password").exists());
    }

    @Test
    @DisplayName("Login: Valid credentials return JWT; Invalid credentials return 401")
    void testLoginFlow() throws Exception {
        RegisterRequest regReq = new RegisterRequest("Test User", "testlogin@example.com", "StrongPass123");
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(regReq)))
                .andExpect(status().isCreated());

        LoginRequest validLogin = new LoginRequest("testlogin@example.com", "StrongPass123");
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validLogin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty());

        LoginRequest badPassLogin = new LoginRequest("testlogin@example.com", "WrongPassword");
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(badPassLogin)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Invalid email or password"));

        LoginRequest nonexistentLogin = new LoginRequest("nobody@example.com", "Password123");
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(nonexistentLogin)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Security: Unauthenticated request to protected endpoint returns 401")
    void testUnauthenticatedAccessRejected() throws Exception {
        mockMvc.perform(get("/api/products"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/customers"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Vertical Privilege Escalation: Regular USER calling admin endpoint /api/suppliers returns 403")
    void testVerticalAccessControlOnAdminModules() throws Exception {
        // Register admin (1st user)
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new RegisterRequest("Admin", "admin@store.com", "AdminPass123"))))
                .andExpect(status().isCreated());

        // Register regular user (2nd user)
        MvcResult userResult = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new RegisterRequest("Operator", "operator@store.com", "OperatorPass123"))))
                .andExpect(status().isCreated())
                .andReturn();

        String userResponse = userResult.getResponse().getContentAsString();
        String userToken = objectMapper.readTree(userResponse).get("token").asText();

        // Regular user attempts to access admin-only suppliers endpoint -> 403 FORBIDDEN
        mockMvc.perform(get("/api/suppliers")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isForbidden());

        // Regular user attempts to delete a product -> 403 FORBIDDEN
        mockMvc.perform(delete("/api/products/1")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isForbidden());

        // Regular user can access /api/users/me
        mockMvc.perform(get("/api/users/me")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("operator@store.com"));
    }

    @Test
    @DisplayName("Self-Protection: Admin cannot deactivate their own administrator account")
    void testAdminSelfLockoutPrevention() throws Exception {
        MvcResult adminResult = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new RegisterRequest("Super Admin", "superadmin@store.com", "AdminPass123"))))
                .andExpect(status().isCreated())
                .andReturn();

        String adminResponse = adminResult.getResponse().getContentAsString();
        String adminToken = objectMapper.readTree(adminResponse).get("token").asText();
        Long adminId = objectMapper.readTree(adminResponse).get("id").asLong();

        // Admin attempts to toggle their own status
        mockMvc.perform(patch("/api/users/" + adminId + "/toggle-status")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Cannot deactivate your own administrator account"));
    }

    @Test
    @DisplayName("Error Handling: Malformed JSON request body returns clean 400 without stack trace")
    void testMalformedJsonHandling() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{ broken json: true,"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Malformed JSON request body"))
                .andExpect(jsonPath("$.status").value(400));
    }
}
