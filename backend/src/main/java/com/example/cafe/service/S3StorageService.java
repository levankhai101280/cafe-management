package com.example.cafe.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.ObjectCannedACL;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.net.URL;
import java.util.UUID;

@Service
public class S3StorageService {

    @Autowired
    private S3Client s3Client;

    @Value("${aws.s3.bucketName}")
    private String bucketName;

    /**
     * Upload file lên S3 và trả về URL public của file đó
     */
    public String uploadFile(MultipartFile file) {
        try {
            // Tạo tên file duy nhất
            String fileKey = UUID.randomUUID() + "_" + file.getOriginalFilename();

            // Chuẩn bị request để upload
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(fileKey)
                    .acl(ObjectCannedACL.PUBLIC_READ) // Set quyền public-read cho file
                    .contentType(file.getContentType())
                    .build();

            // Upload file
            s3Client.putObject(putObjectRequest, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

            // Lấy URL public của file vừa upload
            URL s3Url = s3Client.utilities().getUrl(builder -> builder.bucket(bucketName).key(fileKey));

            return s3Url.toString();

        } catch (IOException e) {
            throw new RuntimeException("Lỗi khi upload file lên S3: " + e.getMessage());
        }
    }

    /**
     * Xóa file khỏi S3
     */
    public void deleteFile(String fileUrl) {
        try {
            // Từ URL, chúng ta cần trích xuất ra fileKey (tên file trên S3)
            String fileKey = fileUrl.substring(fileUrl.lastIndexOf("/") + 1);

            DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(fileKey)
                    .build();

            s3Client.deleteObject(deleteObjectRequest);
        } catch (Exception e) {
            // Log lỗi nhưng không ném exception để tránh làm hỏng giao dịch xóa product
            System.err.println("Lỗi khi xóa file trên S3: " + e.getMessage());
        }
    }
}