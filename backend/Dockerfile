# Giai đoạn 1: Build ứng dụng
# ⭐️ SỬA LỖI: Dùng image 'maven:3-openjdk-17'
# Image này có cài đặt sẵn cả 'mvn' và 'jdk-17'
FROM maven:3-openjdk-17 AS build
WORKDIR /app

# Copy file pom.xml và tải dependency
COPY pom.xml .
RUN mvn dependency:go-offline

# Copy toàn bộ source code và build
COPY src ./src
RUN mvn clean package -DskipTests

# Giai đoạn 2: Chạy ứng dụng
# Giai đoạn này dùng 'openjdk:17-slim' là ĐÚNG
# vì nó chỉ cần chạy file .jar đã build
FROM openjdk:17-slim 
WORKDIR /app
ARG JAR_FILE=target/*.jar
COPY --from=build /app/${JAR_FILE} app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]