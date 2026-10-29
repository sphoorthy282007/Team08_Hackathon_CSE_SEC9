package com.teamfair.user.util;

import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Component
public class JwtUtil {

    private static final String SECRET_KEY = "TeamFair_Secure_JWT_Secret_Key_Hackathon_2026_KLH_CSE_T08";
    private static final long EXPIRATION_TIME_MS = 24 * 60 * 60 * 1000; // 24 hours

    public String generateToken(String email, String role, String name, Long userId) {
        try {
            long now = System.currentTimeMillis();
            long exp = now + EXPIRATION_TIME_MS;

            String header = "{\"alg\":\"HS256\",\"typ\":\"JWT\"}";
            String payload = String.format(
                "{\"sub\":\"%s\",\"role\":\"%s\",\"name\":\"%s\",\"userId\":%d,\"iss\":\"TeamFair-AuthService\",\"iat\":%d,\"exp\":%d}",
                escapeJson(email),
                escapeJson(role),
                escapeJson(name),
                userId != null ? userId : 0L,
                now / 1000,
                exp / 1000
            );

            String encodedHeader = Base64.getUrlEncoder().withoutPadding().encodeToString(header.getBytes(StandardCharsets.UTF_8));
            String encodedPayload = Base64.getUrlEncoder().withoutPadding().encodeToString(payload.getBytes(StandardCharsets.UTF_8));

            String contentToSign = encodedHeader + "." + encodedPayload;
            String signature = sign(contentToSign, SECRET_KEY);

            return contentToSign + "." + signature;
        } catch (Exception e) {
            throw new RuntimeException("Error generating JWT token", e);
        }
    }

    public boolean validateToken(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length != 3) {
                return false;
            }
            String contentToSign = parts[0] + "." + parts[1];
            String expectedSignature = sign(contentToSign, SECRET_KEY);
            if (!expectedSignature.equals(parts[2])) {
                return false;
            }

            // Check expiration
            String payloadJson = new String(Base64.getUrlDecoder().decode(parts[1]), StandardCharsets.UTF_8);
            long expSeconds = extractJsonNumber(payloadJson, "exp");
            if (expSeconds > 0 && (System.currentTimeMillis() / 1000) > expSeconds) {
                return false; // Token expired
            }

            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public String extractRole(String token) {
        return extractClaim(token, "role");
    }

    public String extractEmail(String token) {
        return extractClaim(token, "sub");
    }

    public String extractName(String token) {
        return extractClaim(token, "name");
    }

    private String extractClaim(String token, String claimKey) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length < 2) return null;
            String payloadJson = new String(Base64.getUrlDecoder().decode(parts[1]), StandardCharsets.UTF_8);
            return extractJsonString(payloadJson, claimKey);
        } catch (Exception e) {
            return null;
        }
    }

    private String sign(String data, String secret) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKeySpec = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        mac.init(secretKeySpec);
        byte[] rawHmac = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        return Base64.getUrlEncoder().withoutPadding().encodeToString(rawHmac);
    }

    private String escapeJson(String input) {
        if (input == null) return "";
        return input.replace("\\", "\\\\").replace("\"", "\\\"");
    }

    private String extractJsonString(String json, String key) {
        String pattern = "\"" + key + "\":\"";
        int start = json.indexOf(pattern);
        if (start == -1) return null;
        start += pattern.length();
        int end = json.indexOf("\"", start);
        if (end == -1) return null;
        return json.substring(start, end);
    }

    private long extractJsonNumber(String json, String key) {
        String pattern = "\"" + key + "\":";
        int start = json.indexOf(pattern);
        if (start == -1) return -1;
        start += pattern.length();
        int end = start;
        while (end < json.length() && (Character.isDigit(json.charAt(end)) || json.charAt(end) == '-')) {
            end++;
        }
        try {
            return Long.parseLong(json.substring(start, end));
        } catch (Exception e) {
            return -1;
        }
    }
}

