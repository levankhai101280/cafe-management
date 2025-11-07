package com.example.cafe.service;

import com.example.cafe.dto.RegisterRequest;
import com.example.cafe.model.User;
import com.example.cafe.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public User registerUser(RegisterRequest request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new RuntimeException("Tên người dùng đã tồn tại");
        }

        User newUser = new User();
        newUser.setUsername(request.getUsername());
        newUser.setPassword(request.getPassword()); // PHẢI mã hóa trong thực tế!
        newUser.setRole("user"); // Vai trò mặc định là user

        return userRepository.save(newUser);
    }
    public void deleteUser(Long userId) { // Giả sử ID là Long, nếu là String thì đổi kiểu
        // Kiểm tra xem User có tồn tại không trước khi xóa
        User userToDelete = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với ID: " + userId));

        // (Tùy chọn) Thêm kiểm tra không cho xóa admin gốc
        if ("root_user".equalsIgnoreCase(userToDelete.getRole())) { // Hoặc role admin của bạn
             throw new RuntimeException("Không thể xóa tài khoản Admin gốc.");
        }

        userRepository.deleteById(userId);
    }
    public List<User> findAllUsers() {
        // Giả sử UserRepository có sẵn findAll() do kế thừa từ JpaRepository/MongoRepository
        return userRepository.findAll(); 
    }
}