package com.teamfair.user;

import com.teamfair.user.util.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class JwtUtilTest {

    private JwtUtil jwtUtil;

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil();
    }

    @Test
    void testGenerateAndValidateStudentToken() {
        String token = jwtUtil.generateToken("sphoorthy@teamfair.edu", "STUDENT", "Sphoorthy", 101L);
        assertNotNull(token);
        assertTrue(token.split("\\.").length == 3);

        assertTrue(jwtUtil.validateToken(token));
        assertEquals("STUDENT", jwtUtil.extractRole(token));
        assertEquals("sphoorthy@teamfair.edu", jwtUtil.extractEmail(token));
        assertEquals("Sphoorthy", jwtUtil.extractName(token));
    }

    @Test
    void testGenerateAndValidateFacultyToken() {
        String token = jwtUtil.generateToken("faculty@teamfair.edu", "FACULTY", "Dr. Robert Vance", 201L);
        assertNotNull(token);
        assertTrue(jwtUtil.validateToken(token));
        assertEquals("FACULTY", jwtUtil.extractRole(token));
        assertEquals("faculty@teamfair.edu", jwtUtil.extractEmail(token));
        assertEquals("Dr. Robert Vance", jwtUtil.extractName(token));
    }

    @Test
    void testInvalidToken() {
        assertFalse(jwtUtil.validateToken("invalid.token.string"));
    }
}

