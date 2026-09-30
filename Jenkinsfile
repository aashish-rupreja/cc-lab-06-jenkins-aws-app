pipeline {
    agent any
    environment {
        APP_DIR = '/opt/webapp'
        APP_PORT = '3000'
    }
    options {
        timeout(time: 15, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }
    triggers {
        // Ask GitHub for new commits roughly every 2 minutes
        pollSCM('H/2 * * * *')
    }
    stages {
        stage('Checkout') {
            steps {
                // Jenkins already cloned the repo; show what we got
                sh 'git log -1 --oneline'
                sh 'ls -la'
            }
        }
        stage('Install Dependencies') {
            steps {
                sh 'node -v && npm -v'
                sh 'npm install'
            }
        }
        stage('Test') {
            steps {
                sh 'npm test'
            }
        }
        stage('Package') {
            steps {
                sh "tar -czf webapp-${BUILD_NUMBER}.tar.gz --exclude='webapp-*.tar.gz' --exclude='node_modules' ."
                archiveArtifacts artifacts: 'webapp-*.tar.gz', fingerprint: true
            }
        }

        stage('Deploy') {
            steps {
                withCredentials([
                        sshUserPrivateKey(credentialsId: 'app-server-ssh', keyFileVariable: 'SSH_KEY', usernameVariable: 'DEPLOY_USER'),
                        string(credentialsId: 'app-server-host', variable: 'DEPLOY_HOST')
                    ])
                    {
                    sh '''
                        TARGET="${DEPLOY_USER}@${DEPLOY_HOST}"

                        scp -i "$SSH_KEY" \
                            -o StrictHostKeyChecking=no \
                            webapp-${BUILD_NUMBER}.tar.gz \
                            "$TARGET:/tmp/webapp.tar.gz"

                        ssh -i "$SSH_KEY" \
                            -o StrictHostKeyChecking=no \
                            "$TARGET" "
                                tar -xzf /tmp/webapp.tar.gz -C ${APP_DIR} &&
                                cd ${APP_DIR} &&
                                npm install --omit=dev &&
                                npm start
                            "
                    '''
                }
            }
        }

        stage('Verify') {
            steps {
                sh '''
                    URL=http://${DEPLOY_HOST}:${APP_PORT}/health
                    curl --fail --silent --retry 5 --retry-delay 2 --retry-connrefused $URL
                '''
            }
        }
    }

    post {
        success {
            echo "SUCCESS: build #${env.BUILD_NUMBER} deployed"
        }
        failure {
            echo 'FAILED: read the error in the failed stage above'
        }
    }
}
