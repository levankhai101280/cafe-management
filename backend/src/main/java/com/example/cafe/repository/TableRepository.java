package com.example.cafe.repository;

import com.example.cafe.model.TableEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TableRepository extends JpaRepository<TableEntity, Long> {
    List<TableEntity> findByStatus(String status);
}