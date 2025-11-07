package com.example.cafe.util;

import com.example.cafe.model.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;
import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtUtil {

    // SECRET KEY: PHẢI DÀI HƠN VÀ ĐƯỢC LƯU TRONG application.properties TRONG THỰC TẾ
    private final String SECRET = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";

    // 10 giờ
    private final long EXPIRATION_TIME = 1000 * 60 * 60 * 10;

    private Key getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(SECRET);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", user.getRole());
        claims.put("userId", user.getId());

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(user.getUsername())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }
    // Phương thức mới: Lấy Claims (payload) từ token
    public Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // Phương thức mới: Kiểm tra Token có hợp lệ không (chữ ký và ngày hết hạn)
    public boolean validateToken(String token) {
        try {
            Jws<Claims> claimsJws = Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token);
            // Kiểm tra Token chưa hết hạn
            return !claimsJws.getBody().getExpiration().before(new Date());
        } catch (Exception e) {
            // Token không hợp lệ
            return false;
        }
    }
}