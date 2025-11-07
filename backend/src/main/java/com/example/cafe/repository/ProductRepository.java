package com.example.cafe.repository;

import com.example.cafe.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {


    @Query("SELECT p FROM Product p JOIN FETCH p.category")
    List<Product> findAllWithCategory();
    @Query("SELECT p FROM Product p JOIN FETCH p.category WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Product> searchByName(@Param("keyword") String keyword);
}