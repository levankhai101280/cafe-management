package com.example.cafe.controller;

import com.example.cafe.dto.LoginRequest;
import com.example.cafe.dto.LoginResponse; 
import com.example.cafe.dto.RegisterRequest;
import com.example.cafe.model.User;
import com.example.cafe.service.UserService;
import com.example.cafe.util.JwtUtil; 
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus; 
import org.springframework.security.access.prepost.PreAuthorize;
import java.util.List;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:3000", "http://18.234.214.71"})
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        // Giả lập logic đăng nhập cơ bản (KHÔNG có Spring Security chi tiết)
        Optional<User> userOptional = userService.findByUsername(request.getUsername());

        if (userOptional.isPresent() && userOptional.get().getPassword().equals(request.getPassword())) {
            User user = userOptional.get();

            // 1. TẠO JWT TOKEN
            String token = jwtUtil.generateToken(user);

            // 2. TRẢ VỀ JSON RESPONSE CHUẨN (thay vì chuỗi)
            LoginResponse response = new LoginResponse(
                    token,
                    user.getUsername(),
                    user.getRole(),
                    user.getId()
            );

            // Trả về đối tượng JSON response
            return ResponseEntity.ok(response);
        }

        // Trả về 401 Unauthorized
        return ResponseEntity.status(401).body("Tên đăng nhập hoặc mật khẩu không đúng.");
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            User newUser = userService.registerUser(request);
            return ResponseEntity.ok("Đăng ký thành công cho user: " + newUser.getUsername() + ", Role: " + newUser.getRole());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/users/{id}") 
    @PreAuthorize("hasRole('ROOT_USER')") // Chỉ Admin (ROOT_USER) được phép xóa
    public ResponseEntity<?> deleteUser(@PathVariable Long id) { // Giả sử ID là Long
        try {
            userService.deleteUser(id);
            return ResponseEntity.ok("Xóa người dùng thành công (ID: " + id + ")");
        } catch (RuntimeException e) {
            // Ví dụ: User không tồn tại, hoặc không được phép xóa admin
            return ResponseEntity.badRequest().body(e.getMessage()); 
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi hệ thống khi xóa người dùng.");
        }
    }
    @GetMapping("/users")
    @PreAuthorize("hasRole('ROOT_USER')") 
    public ResponseEntity<List<User>> getAllUsers() {
        // Gọi service để lấy tất cả người dùng
        List<User> users = userService.findAllUsers();

        // LƯU Ý BẢO MẬT: Không được trả về mật khẩu!
        // Nếu model User của bạn không có @JsonIgnore trên trường password,
        // bạn cần chuyển đổi sang DTO trước khi trả về.

        return ResponseEntity.ok(users);
    }
}