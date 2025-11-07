package com.example.cafe.config;

import com.example.cafe.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import io.jsonwebtoken.Claims;
import org.slf4j.Logger; 
import org.slf4j.LoggerFactory; 
import java.io.IOException;
import java.util.Collections;
import java.util.List;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    // SỬA LỖI: Khai báo đối tượng Logger
    private static final Logger logger = LoggerFactory.getLogger(JwtAuthFilter.class);

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");
        String token = null;
        String username = null;
        Claims claims = null;

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
            try {
                // Lấy Claims từ Token
                claims = jwtUtil.extractAllClaims(token);
                username = claims.getSubject();
            } catch (Exception e) {
                // Token không hợp lệ hoặc hết hạn
                // SỬA LỖI: Gọi logger.warn an toàn
                logger.warn("JWT Token không hợp lệ hoặc hết hạn: {}", e.getMessage());
            }
        }

        // Nếu có username và chưa được xác thực trong ngữ cảnh
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            // 1. Giả định Token đã được xác thực thành công bởi JwtUtil (chữ ký hợp lệ)
            if (claims != null && jwtUtil.validateToken(token)) {

                // 2. Lấy Role từ Claims
                // Vai trò được lưu trữ trong JWT là 'role' (ví dụ: 'root_user', 'user')
                String role = claims.get("role", String.class);

                // Spring Security yêu cầu vai trò phải bắt đầu bằng 'ROLE_'
                List<GrantedAuthority> authorities = Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()));

                // 3. Tạo đối tượng xác thực (Authentication object)
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        username, // Principal: Tên người dùng
                        null,     // Credentials: Thường là null sau khi xác thực token
                        authorities
                );

                // 4. Thiết lập chi tiết xác thực (web details)
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // 5. Thiết lập vào Security Context
                // Sau bước này, yêu cầu được coi là đã xác thực và có quyền.
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        filterChain.doFilter(request, response);
    }
}