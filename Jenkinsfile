pipeline {
    agent any

    environment {
        PROJECT_NAME = "cafe-system"
        COMPOSE_PATH = "./docker-compose.yml"
    }

    stages {
        stage('Checkout') {
            steps {
                echo "🔄 Cloning source code..."
                git branch: 'main', url: 'https://github.com/levankhai101280/cafe-management.git'
            }
        }

        stage('Build Docker Images') {
            steps {
                echo "⚙️ Building Docker images..."
                sh 'docker-compose -f $COMPOSE_PATH build'
            }
        }

        stage('Stop Old Containers') {
            steps {
                echo "🧹 Stopping old containers..."
                sh 'docker-compose -f $COMPOSE_PATH down'
            }
        }

        stage('Start New Containers') {
            steps {
                echo "🚀 Starting new containers..."
                sh 'docker-compose -f $COMPOSE_PATH up -d'
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
