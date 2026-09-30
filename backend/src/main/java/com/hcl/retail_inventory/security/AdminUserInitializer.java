package com.hcl.retail_inventory.security;

import com.hcl.retail_inventory.entity.Role;
import com.hcl.retail_inventory.entity.User;
import com.hcl.retail_inventory.services.UserService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

// @Component - Disabled: Default demo admin auto-initialization removed as requested
public class AdminUserInitializer implements CommandLineRunner {

    private final UserService userService;

    public AdminUserInitializer(UserService userService) {
        this.userService = userService;
    }

    @Override
    public void run(String... args) {
        // Disabled demo admin auto-creation
    }
}
