pipeline {
    // Chạy trên Jenkins Agent có Docker và Maven/Node
    agent any

    environment {
        // Thay thế bằng ID tài khoản AWS và Region của bạn
        AWS_ACCOUNT_ID = 'YOUR_AWS_ACCOUNT_ID' 
        AWS_REGION = 'us-east-1' 
        ECR_REPO = "cafe-management-repo" // Tên Repository trong ECR
        ECR_URI = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO}"
        
        // Thông tin Server AWS EC2/Target Deploy
        TARGET_USER = 'ec2-user' 
        TARGET_HOST = '18.234.214.71' // IP Server Deploy của bạn
        SSH_CREDENTIALS_ID = 'aws-ssh-key' // ID Credentials SSH trong Jenkins
    }

    stages {
        stage('Checkout') {
            steps {
                echo "1. 💾 Cloning source code..."
                // Sửa lại URL GitHub của bạn nếu cần
                git branch: 'main', url: 'https://github.com/levankhai101280/cafe-management.git'
            }
        }

        stage('Build & Package') {
            steps {
                echo "2. ⚙️ Building Backend (Maven) and Frontend (NPM)..."
                
                // 1. Cấp quyền và Build Backend
                sh 'chmod +x backend/mvnw' 
                sh 'cd backend && ./mvnw clean install -DskipTests' 
                
                // ⭐️ 2. SỬ DỤNG DOCKER IMAGE NODE ĐỂ BUILD FRONTEND ⭐️
                // Thay vì chạy npm trực tiếp trên Jenkins Agent, chạy trong Container Node
                docker.image('node:18-alpine').inside { // <-- Node 18 có sẵn NPM
                    sh 'cd frontend && npm install'
                    sh 'cd frontend && npm run build'
                }
            }
        }

        stage('Login to AWS ECR') {
            steps {
                echo "3. 🔑 Logging into AWS ECR..."
                // SỬ DỤNG CREDENTIALS JENKINS để đăng nhập Docker vào ECR
                withAWS(credentials: 'jenkins-aws-credentials', region: env.AWS_REGION) {
                    sh "aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_URI}"
                }
            }
        }

        stage('Docker Build, Tag & Push') {
            steps {
                echo "4. 📦 Building and pushing images..."
                
                // Build Backend Image (Sử dụng JAR mới nhất)
                sh "docker build -t ${ECR_REPO}/backend:latest ./backend"
                // Build Frontend Image (Sử dụng Nginx/files build)
                sh "docker build -t ${ECR_REPO}/frontend:latest ./frontend"
                
                // Tag Images
                sh "docker tag ${ECR_REPO}/backend:latest ${ECR_URI}/backend:latest"
                sh "docker tag ${ECR_REPO}/frontend:latest ${ECR_URI}/frontend:latest"

                // Push Images lên AWS ECR
                sh "docker push ${ECR_URI}/backend:latest"
                sh "docker push ${ECR_URI}/frontend:latest"
                echo "Push completed successfully to ECR."
            }
        }

        stage('Deploy via SSH to AWS Server') {
            agent { 
                // Yêu cầu Jenkins Agent có khả năng SSH
                label 'docker' // Hoặc tên agent của bạn
            }
            steps {
                // SỬ DỤNG SSH Agent để kết nối Server (Termius SSH script)
                withCredentials([sshUserPrivateKey(credentialsId: env.SSH_CREDENTIALS_ID, keyFileVariable: 'SSH_KEY')]) {
                    echo "5. 🚀 Deploying and restarting services on ${TARGET_HOST}..."
                    
                    // Sử dụng SH script để kết nối và chạy lệnh từ xa
                    sh """
                        ssh -i ${SSH_KEY} ${TARGET_USER}@${TARGET_HOST} "
                            # 1. Login Docker vào ECR trên server từ xa
                            aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_URI}
                            
                            # 2. Kéo image mới nhất (Sẽ tải từ ECR)
                            docker pull ${ECR_URI}/backend:latest
                            docker pull ${ECR_URI}/frontend:latest

                            # 3. Chạy lại Docker Compose (SỬ DỤNG FILE DOCKER-COMPOSE TẠI SERVER)
                            cd /home/${TARGET_USER}/app/cafe-management-project/ 
                            docker compose -f docker-compose.yml down
                            docker compose -f docker-compose.yml up -d
                        "
                    """
                }
            }
        }

        stage('Verify Deployment') {
            steps {
                echo "6. 🔍 Checking running containers on target server..."
                // Kiểm tra trạng thái của ứng dụng trên server EC2 từ xa
                sh "ssh -i \$(eval echo \${SSH_KEY}) ${TARGET_USER}@${TARGET_HOST} 'docker ps'"
            }
        }
    }

    post {
        success {
            echo "✅ CI/CD Pipeline to ${TARGET_HOST} completed successfully!"
        }
        failure {
            echo "❌ Pipeline failed! Deployment rollback may be needed."
        }
    }
}