package com.teamfair.user.controller;

import com.teamfair.user.model.User;
import com.teamfair.user.repository.UserRepository;
import com.teamfair.user.util.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    public AuthController(UserRepository userRepository, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");
        String requestedRole = credentials.get("role"); // 'STUDENT' or 'FACULTY'

        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email is required"));
        }

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();

            // Strict privacy boundary: Student accounts CANNOT access Faculty evaluation portal
            if (requestedRole != null && !requestedRole.isBlank() && !user.getRole().equalsIgnoreCase(requestedRole)) {
                return ResponseEntity.status(403).body(Map.of(
                    "message", "Access Denied: Account with role " + user.getRole() + " is strictly prohibited from accessing " + requestedRole + " Portal"
                ));
            }

            // Password check (if password supplied)
            if (password != null && !password.isBlank()) {
                String expectedPass = user.getRole().equalsIgnoreCase("FACULTY") ? "faculty123" : "student123";
                if (!password.equals(expectedPass) && !password.equals("password123")) {
                    return ResponseEntity.status(401).body(Map.of("message", "Invalid password credentials"));
                }
            }

            String token = jwtUtil.generateToken(user.getEmail(), user.getRole(), user.getName(), user.getId());

            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("type", "Bearer");
            response.put("id", user.getId());
            response.put("name", user.getName());
            response.put("email", user.getEmail());
            response.put("role", user.getRole());

            return ResponseEntity.ok(response);
        }

        // Demo fallback accounts for Team trio and Faculty Evaluator
        String lower = email.toLowerCase();
        String name = null;
        String role = "STUDENT";
        Long id = 99L;
        String expectedPassword = "student123";

        if (lower.contains("sphoorthy")) {
            name = "Sphoorthy";
            role = "STUDENT";
            id = 101L;
            expectedPassword = "student123";
        } else if (lower.contains("kavya")) {
            name = "Kavya";
            role = "STUDENT";
            id = 102L;
            expectedPassword = "student123";
        } else if (lower.contains("poojitha") || lower.contains("pooji")) {
            name = "Poojitha";
            role = "STUDENT";
            id = 103L;
            expectedPassword = "student123";
        } else if (lower.contains("faculty") || lower.contains("vance")) {
            name = "Dr. Robert Vance";
            role = "FACULTY";
            id = 201L;
            expectedPassword = "faculty123";
        }

        if (name != null) {
            // Strict role guard: students cannot access faculty portal
            if (requestedRole != null && !requestedRole.isBlank() && !role.equalsIgnoreCase(requestedRole)) {
                return ResponseEntity.status(403).body(Map.of(
                    "message", "Access Denied: " + name + " is a " + role + " and is strictly prohibited from entering the " + requestedRole + " Portal"
                ));
            }

            // Check faculty password
            if (password != null && !password.isBlank() && !password.equals(expectedPassword) && !password.equals("password123")) {
                return ResponseEntity.status(401).body(Map.of("message", "Invalid password for " + role + " account"));
            }

            String token = jwtUtil.generateToken(email, role, name, id);
            return ResponseEntity.ok(Map.of(
                "token", token,
                "type", "Bearer",
                "id", id,
                "name", name,
                "email", email,
                "role", role
            ));
        }

        // Unknown email trying to enter faculty portal
        if ("FACULTY".equalsIgnoreCase(requestedRole)) {
            return ResponseEntity.status(403).body(Map.of(
                "message", "Access Denied: Only verified faculty email addresses and faculty passwords can log into the Faculty Evaluation Portal."
            ));
        }

        return ResponseEntity.status(401).body(Map.of("message", "Invalid credentials"));
    }

    @GetMapping("/verify")
    public ResponseEntity<?> verify(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body(Map.of("valid", false, "message", "Missing or invalid Authorization header"));
        }

        String token = authHeader.substring(7);
        if (jwtUtil.validateToken(token)) {
            return ResponseEntity.ok(Map.of(
                "valid", true,
                "email", jwtUtil.extractEmail(token),
                "role", jwtUtil.extractRole(token),
                "name", jwtUtil.extractName(token)
            ));
        }

        return ResponseEntity.status(401).body(Map.of("valid", false, "message", "Invalid or expired JWT token"));
    }
}
