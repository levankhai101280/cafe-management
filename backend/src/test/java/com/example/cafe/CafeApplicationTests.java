package com.example.cafe;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(classes = CafeApplication.class) // ⭐️ SỬA LỖI Ở ĐÂY ⭐️
class CafeApplicationTests {

    @Test
    void contextLoads() {
        // Hàm này sẽ kiểm tra xem ngữ cảnh Spring có load thành công không
    }

}