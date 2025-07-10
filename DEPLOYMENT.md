# 챗봇 UI 운영 환경 배포 가이드

## 📋 목차
1. [시스템 요구사항](#시스템-요구사항)
2. [폐쇄망 환경 준비](#폐쇄망-환경-준비)
3. [설치 방법](#설치-방법)
4. [환경 설정](#환경-설정)
5. [배포 및 실행](#배포-및-실행)
6. [모니터링 및 관리](#모니터링-및-관리)
7. [문제해결](#문제해결)

## 🖥️ 시스템 요구사항

### 최소 요구사항
- **CPU**: 2 Core 이상
- **메모리**: 4GB RAM 이상
- **스토리지**: 10GB 이상
- **운영체제**: Linux (Ubuntu 20.04 LTS 권장)

### 권장 요구사항
- **CPU**: 4 Core 이상
- **메모리**: 8GB RAM 이상
- **스토리지**: 20GB 이상 (SSD 권장)

### 필수 소프트웨어
- Docker 20.10 이상
- Docker Compose 1.29 이상

## 🔒 폐쇄망 환경 준비

### 1. 오프라인 이미지 준비
```bash
# 인터넷이 연결된 환경에서 이미지 다운로드
docker pull node:18-alpine
docker save node:18-alpine > node-18-alpine.tar

# 폐쇄망 환경으로 tar 파일 전송 후 로드
docker load < node-18-alpine.tar
```

### 2. 소스코드 패키징
```bash
# 프로젝트 압축 (인터넷 연결 환경)
tar -czf chatbot-ui.tar.gz chatbot_ui/

# 폐쇄망 환경에서 압축 해제
tar -xzf chatbot-ui.tar.gz
cd chatbot_ui
```

## 🚀 설치 방법

### 방법 1: Docker Compose 사용 (권장)

1. **환경 설정 파일 생성**
```bash
cp .env.example .env
```

2. **환경 변수 수정**
```bash
nano .env
```

3. **애플리케이션 빌드 및 실행**
```bash
docker-compose up -d
```

### 방법 2: Docker 직접 사용

1. **이미지 빌드**
```bash
docker build -t chatbot-ui .
```

2. **컨테이너 실행**
```bash
docker run -d \
  --name chatbot-ui \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e NEXT_PUBLIC_API_BASE_URL=http://YOUR_API_SERVER:3000 \
  -e NEXT_PUBLIC_MODEL_NAME=gemma3:1b \
  --restart unless-stopped \
  chatbot-ui
```

### 방법 3: 직접 설치 (Node.js)

1. **Node.js 18 설치** (폐쇄망에서는 미리 설치 필요)

2. **의존성 설치**
```bash
npm ci --only=production
```

3. **애플리케이션 빌드**
```bash
npm run build:prod
```

4. **애플리케이션 실행**
```bash
npm run start:prod
```

## ⚙️ 환경 설정

### 필수 환경 변수

| 변수명 | 설명 | 기본값 | 예시 |
|--------|------|--------|------|
| `NODE_ENV` | 실행 환경 | production | production |
| `NEXT_PUBLIC_API_BASE_URL` | API 서버 URL | http://34.71.147.202:3000 | http://10.0.0.100:3000 |
| `NEXT_PUBLIC_API_ENDPOINT` | API 엔드포인트 | /api/v1/chat/ollama | /api/v1/chat/ollama |
| `NEXT_PUBLIC_MODEL_NAME` | AI 모델명 | gemma3:1b | gemma3:1b |

### 선택적 환경 변수

| 변수명 | 설명 | 기본값 |
|--------|------|--------|
| `NEXT_PUBLIC_TYPING_SPEED` | 타이핑 속도 (ms) | 50 |
| `NEXT_PUBLIC_LOG_LEVEL` | 로그 레벨 | ERROR |
| `FEEDBACK_API_URL` | 피드백 API URL | - |
| `API_TOKEN` | API 인증 토큰 | - |

### .env 파일 예시
```env
NODE_ENV=production
NEXT_PUBLIC_API_BASE_URL=http://10.0.0.100:3000
NEXT_PUBLIC_API_ENDPOINT=/api/v1/chat/ollama
NEXT_PUBLIC_MODEL_NAME=gemma3:1b
NEXT_PUBLIC_TYPING_SPEED=50
NEXT_PUBLIC_LOG_LEVEL=ERROR
```

## 🚀 배포 및 실행

### Docker Compose로 배포
```bash
# 백그라운드에서 실행
docker-compose up -d

# 로그 확인
docker-compose logs -f

# 상태 확인
docker-compose ps

# 중지
docker-compose down
```

### 서비스 상태 확인
```bash
# Health Check
curl http://localhost:3000/api/health

# 웹 브라우저에서 확인
http://localhost:3000
```

## 📊 모니터링 및 관리

### 로그 모니터링
```bash
# 실시간 로그 확인
docker-compose logs -f chatbot-ui

# 특정 시간 로그 확인
docker-compose logs --since="2024-01-01T00:00:00Z" chatbot-ui
```

### 리소스 모니터링
```bash
# 컨테이너 리소스 사용량
docker stats

# 디스크 사용량
df -h

# 메모리 사용량
free -h
```

### 업데이트 및 재시작
```bash
# 애플리케이션 재시작
docker-compose restart chatbot-ui

# 새 버전 배포
docker-compose down
docker-compose pull  # 또는 새 이미지 빌드
docker-compose up -d
```

## 🔧 문제해결

### 일반적인 문제

#### 1. 컨테이너가 시작되지 않음
```bash
# 로그 확인
docker-compose logs chatbot-ui

# 환경 변수 확인
docker-compose config
```

#### 2. API 연결 실패
- `NEXT_PUBLIC_API_BASE_URL` 설정 확인
- 네트워크 연결 상태 확인
- 방화벽 설정 확인

#### 3. 성능 문제
- 메모리 사용량 확인
- CPU 사용률 확인
- 로그 레벨을 ERROR로 설정

#### 4. 포트 충돌
```bash
# 포트 사용 확인
netstat -tulpn | grep :3000

# 다른 포트로 실행
docker-compose -f docker-compose.yml -p 8080:3000 up -d
```

### 로그 파일 위치
- **Container 내부**: `/app/.next/trace`
- **Host 시스템**: `./logs/` (마운트된 경우)

### 백업 및 복구
```bash
# 설정 백업
cp .env .env.backup
cp docker-compose.yml docker-compose.yml.backup

# 전체 프로젝트 백업
tar -czf chatbot-ui-backup-$(date +%Y%m%d).tar.gz .
```

## 📞 지원 및 연락처

문제 발생 시 다음 정보를 함께 제공해 주세요:
- 운영체제 버전
- Docker 버전
- 에러 로그
- 환경 설정 정보 (.env 파일, 민감정보 제외)

---

**⚠️ 보안 주의사항**
- 운영 환경에서는 기본 포트(3000) 변경 권장
- API 토큰 등 민감정보는 별도 보안 저장소 사용
- 정기적인 보안 업데이트 적용
- 방화벽 설정으로 불필요한 포트 차단 