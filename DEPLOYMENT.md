# ChatBot UI 배포 가이드

React + Vite 기반 ChatBot UI의 배포 가이드입니다.

## 📋 목차

1. [개발 환경 설정](#개발-환경-설정)
2. [로컬 배포](#로컬-배포)
3. [Docker 배포](#docker-배포)
4. [운영 환경 배포](#운영-환경-배포)
5. [모니터링 및 로그](#모니터링-및-로그)
6. [문제 해결](#문제-해결)

## 🛠️ 개발 환경 설정

### 시스템 요구사항

- **Node.js**: 18.0 이상
- **npm**: 9.0 이상
- **Docker**: 20.10 이상 (선택사항)
- **Docker Compose**: 2.0 이상 (선택사항)

### 환경 변수 설정

1. **환경 변수 파일 생성**
```bash
# .env 파일 생성
cat > .env << 'EOF'
# API 설정
VITE_API_BASE_URL=http://172.20.23.104:3000
VITE_API_ENDPOINT=/api/v1/chat/completions
VITE_MODEL_NAME=gemma3:1b

# UI 설정
VITE_TYPING_SPEED=50
VITE_LOG_LEVEL=DEBUG
EOF
```

2. **의존성 설치**
```bash
npm install
```

## 🚀 로컬 배포

### 개발 모드 실행

```bash
# 개발 서버 시작
npm run dev

# 브라우저에서 접속
# http://localhost:3003
```

### 프로덕션 빌드 테스트

```bash
# 프로덕션 빌드
npm run build

# 빌드 결과 미리보기
npm run preview

# 브라우저에서 접속
# http://localhost:4173
```

## 🐳 Docker 배포

### 1. 단일 컨테이너 배포

```bash
# Docker 이미지 빌드
docker build -t chatbot-ui .

# 컨테이너 실행
docker run -d \
  --name chatbot-ui \
  -p 3003:3003 \
  --restart unless-stopped \
  chatbot-ui

# 상태 확인
docker ps
docker logs chatbot-ui
```

### 2. Docker Compose 배포 (권장)

```bash
# 백그라운드에서 실행
docker compose up -d

# 로그 확인
docker compose logs -f

# 상태 확인
docker compose ps

# 중지
docker compose down
```

### 3. Docker Compose 파일 구성

```yaml
# docker-compose.yml
services:
  chatbot-ui:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3003:3003"
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3003"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

## 🏢 운영 환경 배포

### 1. 운영 환경 준비

**시스템 요구사항:**
- **CPU**: 최소 1 core (권장 2 cores)
- **메모리**: 최소 512MB (권장 1GB)
- **디스크**: 최소 1GB (로그 저장 공간 포함)
- **네트워크**: 챗봇 API 서버와 통신 가능

**소프트웨어 요구사항:**
```bash
# Docker 설치 확인
docker --version
docker compose version

# 필요 시 설치 (Ubuntu/Debian 예시)
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
```

### 2. 운영 환경 변수 설정

```bash
# 운영용 .env 파일 생성
cat > .env << 'EOF'
# API 설정 (운영 서버 주소로 변경)
VITE_API_BASE_URL=http://your-production-api-server:3000
VITE_API_ENDPOINT=/api/v1/chat/completions
VITE_MODEL_NAME=your-production-model

# UI 설정
VITE_TYPING_SPEED=30
VITE_LOG_LEVEL=WARN
EOF
```

### 3. 서비스 등록 (systemd)

```bash
# 서비스 파일 생성
sudo tee /etc/systemd/system/chatbot-ui.service > /dev/null << 'EOF'
[Unit]
Description=ChatBot UI Service
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=true
WorkingDirectory=/opt/chatbot-ui
ExecStart=/usr/bin/docker compose up -d
ExecStop=/usr/bin/docker compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

# 서비스 활성화
sudo systemctl daemon-reload
sudo systemctl enable chatbot-ui.service
sudo systemctl start chatbot-ui.service

# 상태 확인
sudo systemctl status chatbot-ui.service
```

### 4. 도메인 연결 (선택사항)

애플리케이션에 도메인을 연결하려면 DNS 설정을 통해 도메인을 서버 IP로 연결하세요:

```bash
# 도메인 연결 확인
nslookup your-domain.com

# 애플리케이션 접근
curl http://your-domain.com:3003
```

**참고**: 프로덕션 환경에서는 HTTPS 설정을 위해 SSL 인증서를 적용하는 것이 좋습니다.

## 📊 모니터링 및 로그

### 1. 애플리케이션 로그

```bash
# Docker Compose 로그 실시간 확인
docker compose logs -f

# 특정 시간대 로그 확인
docker compose logs --since="2h"

# 에러 로그만 필터링
docker compose logs 2>&1 | grep -i error
```

### 2. 파일 로그 시스템

ChatBot UI는 고급 파일 로깅 시스템을 포함합니다:

```bash
# 로그 디렉토리 구조
logs/
├── chatbot-2025-01-10.log    # 오늘 로그
├── chatbot-2025-01-09.log    # 어제 로그
└── ...

# 로그 확인 명령어
tail -f logs/chatbot-$(date +%Y-%m-%d).log  # 실시간 로그
grep -i error logs/chatbot-*.log             # 에러 로그 검색
grep -i api logs/chatbot-*.log               # API 호출 로그
```

### 3. 시스템 모니터링

```bash
# Docker 컨테이너 리소스 사용량
docker stats

# 시스템 리소스 확인
htop
df -h
free -h

# 네트워크 연결 상태
netstat -tulpn | grep :3003
```

### 4. Health Check

```bash
# 애플리케이션 상태 확인
curl -I http://localhost:3003

# Docker 컨테이너 상태 확인
docker compose ps

# Health check 로그 확인
docker inspect --format='{{json .State.Health}}' chatbot_ui-chatbot-ui-1
```

### 5. 로그 로테이션 설정

```bash
# logrotate 설정 파일 생성
sudo tee /etc/logrotate.d/chatbot-ui > /dev/null << 'EOF'
/opt/chatbot-ui/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 root root
}
EOF
```

## 🔧 성능 최적화

### 1. Docker 이미지 최적화

```dockerfile
# 단일 스테이지 빌드로 이미지 크기 최소화
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3003
CMD ["npm", "run", "preview"]
```

### 2. 빌드 최적화

```bash
# 프로덕션 빌드 시 최적화 옵션
NODE_ENV=production npm run build

# 번들 분석
npm install --save-dev rollup-plugin-analyzer
```

## 🚨 문제 해결

### 1. 일반적인 문제들

**문제: 애플리케이션이 시작되지 않음**
```bash
# 로그 확인
docker compose logs

# 포트 충돌 확인
sudo netstat -tulpn | grep :3003

# 컨테이너 재시작
docker compose restart
```

**문제: API 연결 오류**
```bash
# 네트워크 연결 테스트
curl -I http://172.20.23.104:3000/api/v1/chat/completions

# DNS 확인
nslookup 172.20.23.104

# 방화벽 확인
sudo ufw status
```

**문제: 정적 파일 로딩 실패**
```bash
# Vite 빌드 확인
npm run build

# 빌드 파일 확인
ls -la dist/

# 브라우저 캐시 클리어
# Ctrl + Shift + R (하드 리프레시)
```

### 2. 성능 문제

**문제: 느린 응답 시간**
```bash
# 리소스 사용량 확인
docker stats

# 로그에서 API 응답 시간 확인
grep -i "duration" logs/chatbot-$(date +%Y-%m-%d).log

# 네트워크 지연 테스트
ping 172.20.23.104
```

**문제: 메모리 부족**
```bash
# 메모리 사용량 확인
free -h

# Docker 메모리 제한 설정
docker run --memory="512m" chatbot-ui
```

### 3. 보안 문제

**HTTPS 설정**
```bash
# 로드 밸런서에서 HTTPS 설정
# 또는 Docker 컨테이너 앞에 SSL 터미네이션 설정

# 환경 변수로 보안 설정
export NODE_ENV=production
export VITE_LOG_LEVEL=WARN
```

**보안 모범 사례**
```bash
# 환경 변수 보안
chmod 600 .env

# 컨테이너 보안 스캔
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  -v $(pwd):/root/.cache/ aquasec/trivy:latest image chatbot-ui
```

## 📋 배포 체크리스트

### 배포 전 확인사항

- [ ] 환경 변수 설정 완료
- [ ] API 서버 연결 테스트 완료
- [ ] 로컬 빌드 테스트 성공
- [ ] Docker 이미지 빌드 성공
- [ ] Health check 정상 동작

### 배포 후 확인사항

- [ ] 애플리케이션 정상 로딩
- [ ] 챗봇 대화 기능 정상 동작
- [ ] 로그 파일 생성 확인
- [ ] 모니터링 대시보드 설정
- [ ] 백업 및 복구 절차 문서화

## 🔄 업데이트 절차

### 1. 롤링 업데이트

```bash
# 새 이미지 빌드
docker compose build

# 무중단 배포
docker compose up -d

# 이전 이미지 정리
docker image prune -f
```

### 2. 블루-그린 배포

```bash
# 새 버전 배포 (포트 3004)
docker run -d --name chatbot-ui-green -p 3004:3003 chatbot-ui:new

# 테스트 후 트래픽 전환
# 로드 밸런서 설정 변경 또는 DNS 전환

# 이전 버전 제거
docker stop chatbot-ui-blue
docker rm chatbot-ui-blue
```

---

이 가이드는 ChatBot UI의 안정적인 배포와 운영을 위한 포괄적인 지침을 제공합니다. 추가 질문이나 문제가 있으면 로그를 확인하고 문제 해결 섹션을 참조하세요. 