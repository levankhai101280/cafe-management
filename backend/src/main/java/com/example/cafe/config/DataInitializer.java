package com.example.cafe.config;

import com.example.cafe.model.TableEntity;
import com.example.cafe.model.User;

import com.example.cafe.repository.TableRepository;
import com.example.cafe.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer {

    private final UserRepository userRepository;
    private final TableRepository tableRepository;

    public DataInitializer(UserRepository userRepository, TableRepository tableRepository) {
        this.userRepository = userRepository;
        this.tableRepository = tableRepository;
    }

    @PostConstruct
    public void init() {
        // Tạo 2 User mặc định
        if (userRepository.count() == 0) {
            User root = new User();
            root.setUsername("root");
            root.setPassword("123456");
            root.setRole("root_user");
            userRepository.save(root);

            User guest = new User();
            guest.setUsername("guest");
            guest.setPassword("123456");
            guest.setRole("user");
            userRepository.save(guest);
        }

        // Tạo 3 bàn trống mặc định
        if (tableRepository.count() == 0) {
            TableEntity t1 = new TableEntity();
            t1.setTableNumber(1);
            t1.setCapacity(4);
            t1.setStatus("TRỐNG");
            tableRepository.save(t1);

            TableEntity t2 = new TableEntity();
            t2.setTableNumber(2);
            t2.setCapacity(2);
            t2.setStatus("TRỐNG");
            tableRepository.save(t2);

            TableEntity t3 = new TableEntity();
            t3.setTableNumber(3);
            t3.setCapacity(6);
            t3.setStatus("TRỐNG");
            tableRepository.save(t3);
        }
    }
}
