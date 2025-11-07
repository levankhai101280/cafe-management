package com.example.cafe.service;

import com.example.cafe.model.TableEntity;
import com.example.cafe.repository.TableRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TableService {

    @Autowired
    private TableRepository tableRepository;

    public List<TableEntity> getAllTables() {
        return tableRepository.findAll();
    }

    public TableEntity updateTableStatus(Long tableId, String newStatus) {
        TableEntity table = tableRepository.findById(tableId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bàn"));

        table.setStatus(newStatus);
        return tableRepository.save(table);
    }

    public TableEntity createTable(TableEntity table) {
        return tableRepository.save(table);
    }
}