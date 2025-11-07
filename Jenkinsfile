pipeline {
    agent any

    environment {
        PROJECT_NAME = "cafe-system"
        COMPOSE_PATH = "./docker-compose.yml"
        
        // Tên services trong file docker-compose.yml của bạn
        // Sửa lại nếu tên không đúng
        BACKEND_SERVICE = "backend-app"
        FRONTEND_SERVICE = "frontend-app"
    }

    stages {
        stage('Checkout') {
            steps {
                echo "🔄 Cloning source code..."
                git branch: 'main', url: 'https://github.com/levankhai101280/cafe-management.git'
            }
        }

        /* * ĐÃ SỬA: Chia 'docker compose build' thành 2 bước riêng biệt
         * để build tuần tự, tránh bị hết RAM (Out of Memory) trên t3.micro
         */
        stage('Build Docker Images') {
            steps {
                echo "⚙️ Building Docker images..."
                
                echo "1/2 - Building Backend Service (${BACKEND_SERVICE})..."
                sh "docker compose -f ${COMPOSE_PATH} build ${BACKEND_SERVICE}"
                
                echo "2/2 - Building Frontend Service (${FRONTEND_SERVICE})..."
                sh "docker compose -f ${COMPOSE_PATH} build ${FRONTEND_SERVICE}"
            }
        }

        stage('Stop Old Containers') {
            steps {
                echo "🧹 Stopping old containers..."
                // Dùng --ignore-orphans để tránh lỗi nếu service không tồn tại
                sh "docker compose -f ${COMPOSE_PATH} down "
            }
        }

        stage('Start New Containers') {
            steps {
                echo "🚀 Starting new containers..."
                // Chỉ 'up' các service đã được build để tiết kiệm thời gian
                sh "docker compose -f ${COMPOSE_PATH} up -d ${BACKEND_SERVICE} ${FRONTEND_SERVICE}"
            }
        }

        stage('Verify Deployment') {
            steps {
                echo "🔍 Checking running containers..."
                sh 'docker ps'
            }
        }
    }

    post {
        success {
            echo '✅ CI/CD pipeline completed successfully!'
        }
        failure {
            echo '❌ Pipeline failed! Check logs in Jenkins.'
        }
    }
}