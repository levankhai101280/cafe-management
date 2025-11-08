pipeline {
    // Chạy trên Jenkins Agent có Docker và Maven/Node
    agent any

    environment {
        // ⭐️ THÔNG TIN AWS THỰC TẾ (LẤY TỪ TÀI KHOẢN CỦA BẠN) ⭐️
        AWS_ACCOUNT_ID = '620629391230' 
        AWS_REGION = 'us-east-1'       
        
        // Tên Repository trên ECR
        BACKEND_REPO_NAME = "cafe-backend"
        FRONTEND_REPO_NAME = "cafe-frontend"
        
        // Host ECR (620629391230.dkr.ecr.us-east-1.amazonaws.com)
        ECR_HOST = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
        
        // Thông tin Server AWS EC2/Target Deploy
        TARGET_USER = 'ec2-user' 
        TARGET_HOST = '18.234.214.71' 
        SSH_CREDENTIALS_ID = 'aws-ssh-key' // ID Credentials SSH trong Jenkins
    }

    stages {
        stage('Checkout') {
            steps {
                echo "1. 💾 Cloning source code..."
                git branch: 'main', url: 'https://github.com/levankhai101280/cafe-management.git'
            }
        }

        stage('Build & Package') {
            steps {
                echo "2. ⚙️ Building Backend (Maven) and Frontend (NPM)..."
                
                // 1. Build backend (Maven)
                sh 'chmod +x backend/mvnw' 
                sh 'cd backend && ./mvnw clean install -DskipTests' 
                
                echo "2A. Building Frontend using Node container..."

                // ✅ Dùng script block để gọi docker.image()
                script {
                    docker.image('node:18-alpine').inside('-u root') {
                        sh 'cd frontend && npm install'
                        sh 'cd frontend && npm run build'
                    }
                }
            }
        }

        stage('Login to AWS ECR') {
            steps {
                echo "3. 🔑 Logging into AWS ECR (${ECR_HOST})..."
                // Sử dụng plugin AWS CLI để đăng nhập Docker
                withAWS(credentials: 'jenkins-aws-credentials', region: env.AWS_REGION) {
                    sh "aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_HOST}"
                }
            }
        }
        
        stage('Docker Build, Tag & Push') {
            steps {
                echo "4. 📦 Building and pushing images..."
                
                // 1. Build Images (Backend sử dụng file JAR vừa tạo)
                sh "docker build -t ${BACKEND_REPO_NAME}:latest ./backend"
                sh "docker build -t ${FRONTEND_REPO_NAME}:latest ./frontend"
                
                // 2. Tag Images (Sử dụng ECR_HOST để tạo URI hoàn chỉnh)
                sh "docker tag ${BACKEND_REPO_NAME}:latest ${ECR_HOST}/${BACKEND_REPO_NAME}:latest"
                sh "docker tag ${FRONTEND_REPO_NAME}:latest ${ECR_HOST}/${FRONTEND_REPO_NAME}:latest"

                // 3. Push Images lên AWS ECR
                sh "docker push ${ECR_HOST}/${BACKEND_REPO_NAME}:latest"
                sh "docker push ${ECR_HOST}/${FRONTEND_REPO_NAME}:latest"
                echo "Push completed successfully to ECR."
            }
        }

        stage('Deploy via SSH to AWS Server') {
            // Yêu cầu Agent có khả năng SSH và Docker
            steps {
                withCredentials([sshUserPrivateKey(credentialsId: env.SSH_CREDENTIALS_ID, keyFileVariable: 'SSH_KEY')]) {
                    echo "5. 🚀 Deploying and restarting services on ${TARGET_HOST}..."
                    
                    // Sử dụng SH script để kết nối và chạy lệnh từ xa
                    sh """
                        ssh -i ${SSH_KEY} ${TARGET_USER}@${TARGET_HOST} "
                            # 1. Login Docker vào ECR trên server từ xa
                            aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_HOST}
                            
                            # 2. Kéo image mới nhất
                            docker pull ${ECR_HOST}/${BACKEND_REPO_NAME}:latest
                            docker pull ${ECR_HOST}/${FRONTEND_REPO_NAME}:latest

                            # 3. Chạy lại Docker Compose
                            cd /path/to/your/app/on/ec2/ 
                            docker-compose down
                            docker-compose up -d
                        "
                    """
                }
            }
        }

        stage('Verify Deployment') {
            steps {
                echo "6. 🔍 Checking running containers on target server..."
                sh "ssh -i \$(eval echo \${SSH_KEY}) ${TARGET_USER}@${TARGET_HOST} 'docker ps'"
            }
        }
    }

    post {
        success {
            echo "✅ CI/CD Pipeline to ${TARGET_HOST} completed successfully! App is live at http://${TARGET_HOST}:3000/"
        }
        failure {
            echo "❌ Pipeline failed! Deployment rollback may be needed."
        }
    }
}