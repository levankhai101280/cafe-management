package com.example.cafe.controller;

import com.example.cafe.model.TableEntity;
import com.example.cafe.service.TableService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    @Autowired
    private TableService tableService;

    // Yêu cầu chức năng: khách có thể nhìn thấy tất cả các bàn của quán
    @GetMapping("/tables/available")
    public List<TableEntity> getAvailableTables() {
        // Khách chỉ thấy bàn Trống hoặc Đã đặt (nếu cho phép đặt trước)
        return tableService.getAllTables().stream()
                .filter(t -> t.getStatus().equals("TRỐNG")) // Lọc các bàn TRỐNG
                .collect(Collectors.toList());
    }


    @PostMapping("/tables/{id}/book")
    public TableEntity bookTable(@PathVariable Long id) {
        // Logic đặt bàn (ví dụ: chuyển trạng thái sang ĐÃ ĐẶT)
        return tableService.updateTableStatus(id, "ĐÃ ĐẶT");
    }

    // Yêu cầu chức năng: Khách chọn các món trong menu của quán (cần thêm ProductController cho Khách sau)
}