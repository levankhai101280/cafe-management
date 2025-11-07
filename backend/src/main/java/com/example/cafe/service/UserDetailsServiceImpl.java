package com.example.cafe.service; // Đặt đúng package

import com.example.cafe.model.User; // ⭐️ Đảm bảo import đúng model User của bạn
import com.example.cafe.repository.UserRepository; // ⭐️ Đảm bảo import đúng repo User của bạn
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService; // ⭐️ Implement interface này
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service; // ⭐️ Bắt buộc phải có @Service

import java.util.Collections;
import java.util.List; // Sửa import này nếu cần Set

@Service 
public class UserDetailsServiceImpl implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // --- Bắt đầu từ đây ---
        // 1. Tìm user trong DB bằng username (KHAI BÁO biến 'user')
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy người dùng với tên đăng nhập: " + username));

        // 2. Lấy vai trò (role) từ đối tượng 'user' (DÙNG biến 'user')
        String roleFromDB = user.getRole();

        // 3. Tạo chuỗi quyền hạn với prefix ROLE_
        String authorityString = "ROLE_" + roleFromDB.toUpperCase();

        // 4. Tạo danh sách quyền hạn
        List<GrantedAuthority> authorities = Collections.singletonList(new SimpleGrantedAuthority(authorityString));

        // 5. Trả về đối tượng UserDetails (DÙNG biến 'user')
        return new org.springframework.security.core.userdetails.User(
                user.getUsername(), // <-- Dùng user.getUsername()
                user.getPassword(), // <-- Dùng user.getPassword()
                authorities
        );
    }
}