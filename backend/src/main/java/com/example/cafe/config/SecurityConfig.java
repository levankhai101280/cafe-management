package com.example.cafe.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;

import java.util.Arrays;
import java.util.Collections;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthFilter jwtAuthFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        System.out.println("PasswordEncoder BEAN ĐÃ ĐƯỢC TẠO!"); // Thêm log
        return new BCryptPasswordEncoder();
    }

    // Bean này cần thiết cho quá trình xác thực (ví dụ: login)
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        System.out.println("AuthenticationManager BEAN ĐÃ ĐƯỢC TẠO!"); // Thêm log
        return authenticationConfiguration.getAuthenticationManager();
    }

    // Constructor để kiểm tra
    public SecurityConfig() {
        System.out.println("SecurityConfig CONSTRUCTOR ĐÃ CHẠY!"); // Thêm log
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(authorize -> authorize
                // TĂNG CƯỜNG BẢO VỆ: Đặt API đặt hàng lên đầu tiên để đảm bảo tính ưu tiên.
                .requestMatchers("/api/orders/place").authenticated()

                // =======================================================
                // 1. PUBLIC APIs (KHÔNG CẦN BẢO VỆ)
                // =======================================================
                .requestMatchers("/api/auth/**", "/api/products", "/api/products/search", "/api/products/{id}").permitAll()
                .requestMatchers("/api/user/tables/available").permitAll()

                // TĂNG CƯỜNG BẢO MẬT: Giữ lại chỉ các đường dẫn tĩnh cụ thể.
                .requestMatchers("/images/**", "/uploads/**").permitAll()
                // Loại bỏ "/*.png", "/*.jpg", v.v. vì /images/** là đủ nếu bạn phục vụ ảnh đúng cách.

                .requestMatchers("/h2-console/**").permitAll()

                // =======================================================
                // 2. PROTECTED APIs
                // =======================================================
                .requestMatchers("/api/admin/**", "/api/orders/report/daily", "/api/orders/{orderId}/pay").hasRole("ROOT_USER")

                // User APIs còn lại (API user khác ngoại trừ đặt bàn)
                .requestMatchers("/api/user/**").authenticated()

                // Mọi request còn lại đều cần xác thực
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        http.headers(headers -> headers.frameOptions(frameOptions -> frameOptions.sameOrigin()));

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // ======================= ĐÃ SỬA LỖI Ở ĐÂY =======================
        // Đổi từ "singletonList" (chỉ 1) thành "Arrays.asList" (nhiều)
        // Và thêm IP máy chủ của bạn vào
        configuration.setAllowedOrigins(Arrays.asList(
            "http://localhost:3000",
            "http://18.234.214.71",
            "http://18.234.214.71:3000" // <--- THÊM DÒNG NÀY
        ));
        // =================================================================

        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
