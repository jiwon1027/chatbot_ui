# 챗봇 UI 운영 환경 배포 가이드

## 📋 목차
1. [시스템 요구사항](#시스템-요구사항)
2. [배포 방식 개요](#배포-방식-개요)
3. [인터넷망에서 빌드](#인터넷망에서-빌드)
4. [폐쇄망 환경 배포](#폐쇄망-환경-배포)
5. [환경 설정](#환경-설정)
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
- **인터넷망**: Docker 20.10 이상, Docker Compose 1.29 이상, Node.js 18 이상
- **폐쇄망**: Docker 20.10 이상, Docker Compose 1.29 이상

## 🔄 배포 방식 개요

본 프로젝트는 **오프라인 배포**를 지원합니다:

1. **인터넷망**: 소스코드 빌드 → Docker 이미지 생성 → tar 파일로 압축
2. **전송**: 압축된 이미지 파일을 폐쇄망으로 전송
3. **폐쇄망**: 이미지 로드 → 컨테이너 실행

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   인터넷망      │    │     전송        │    │    폐쇄망       │
│                 │    │                 │    │                 │
│ 1. 소스코드     │    │ 4. 압축된 이미지 │    │ 5. 이미지 로드  │
│ 2. 이미지 빌드  │───▶│    파일 전송     │───▶│ 6. 컨테이너 실행│
│ 3. 이미지 저장  │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🏗️ 인터넷망에서 빌드

### 1. 소스코드 준비
```bash
# 프로젝트 클론
git clone <repository-url>
cd chatbot_ui

# 의존성 설치
npm install
```

### 2. 환경 변수 설정
```bash
# .env 파일 생성
cp .env.example .env

# 환경 변수 수정 (운영 환경에 맞게)
nano .env
```

### 3. 이미지 빌드 및 저장
```bash
# 빌드 스크립트 실행 권한 부여
chmod +x build-for-offline.sh

# 이미지 빌드 및 저장 (기본: AMD64)
./build-for-offline.sh

# 특정 플랫폼으로 빌드하려면:
# AMD64 플랫폼 (Intel/AMD 프로세서)
DOCKER_PLATFORM=linux/amd64 ./build-for-offline.sh

# ARM64 플랫폼 (Apple M1/M2, ARM 서버)
DOCKER_PLATFORM=linux/arm64 ./build-for-offline.sh
```

**빌드 스크립트는 다음 작업을 수행합니다:**
- Docker 이미지 빌드 (플랫폼 명시)
- 필요한 기본 이미지 다운로드
- 이미지들을 tar 파일로 저장
- 압축하여 전송 준비

### 4. 전송 파일 확인
빌드 완료 후 다음 파일들이 생성됩니다:
```
offline-images/
  └── chatbot-ui-1.0.0.tar.gz  # 압축된 Docker 이미지
docker-compose.offline.yml     # 폐쇄망용 Docker Compose
deploy-offline.sh              # 폐쇄망 배포 스크립트
.env.example                   # 환경 변수 예시
```

## 🚀 폐쇄망 환경 배포

### 1. 파일 전송
다음 파일들을 폐쇄망 서버로 전송합니다:
- `offline-images/chatbot-ui-1.0.0.tar.gz`
- `docker-compose.offline.yml`
- `deploy-offline.sh`
- `.env.example`

### 2. 배포 스크립트 실행
```bash
# 파일 전송 확인
ls -la offline-images/

# 배포 스크립트 실행 권한 부여
chmod +x deploy-offline.sh

# 배포 실행
./deploy-offline.sh
```

**배포 스크립트는 다음 작업을 수행합니다:**
- Docker 이미지 로드
- 환경 변수 설정 확인
- 컨테이너 실행
- 헬스 체크
- 상태 확인

### 3. 수동 배포 (옵션)
스크립트를 사용하지 않고 수동으로 배포할 수도 있습니다:

```bash
# 1. 이미지 압축 해제
gunzip offline-images/chatbot-ui-1.0.0.tar.gz

# 2. 이미지 로드
docker load -i offline-images/chatbot-ui-1.0.0.tar

# 3. 환경 변수 설정
cp .env.example .env
nano .env

# 4. 컨테이너 실행
docker-compose -f docker-compose.offline.yml up -d
```

## ⚙️ 환경 설정

### 필수 환경 변수

| 변수명 | 설명 | 기본값 | 예시 |
|--------|------|--------|------|
| `NODE_ENV` | 실행 환경 | production | production |
| `NEXT_PUBLIC_API_BASE_URL` | API 서버 URL | http://172.20.23.104:3000 | http://172.20.23.104:3000 |
| `NEXT_PUBLIC_API_ENDPOINT` | API 엔드포인트 | /api/v1/chat/completions | /api/v1/chat/completions |
| `NEXT_PUBLIC_MODEL_NAME` | AI 모델명 | gemma3:1b | gemma3:1b |

### 선택적 환경 변수

| 변수명 | 설명 | 기본값 |
|--------|------|--------|
| `NEXT_PUBLIC_TYPING_SPEED` | 타이핑 속도 (ms) | 50 |
| `NEXT_PUBLIC_LOG_LEVEL` | 로그 레벨 | ERROR |

### .env 파일 예시
```env
NODE_ENV=production
NEXT_PUBLIC_API_BASE_URL=http://172.20.23.104:3000
NEXT_PUBLIC_API_ENDPOINT=/api/v1/chat/completions
NEXT_PUBLIC_MODEL_NAME=gemma3:1b
NEXT_PUBLIC_TYPING_SPEED=50
NEXT_PUBLIC_LOG_LEVEL=ERROR
```

## 📊 모니터링 및 관리

### 서비스 상태 확인
```bash
# Health Check
curl http://localhost:3003/api/health

# 웹 브라우저에서 확인
http://localhost:3003

# 컨테이너 상태 확인
docker-compose -f docker-compose.offline.yml ps
```

### 로그 모니터링
```bash
# 실시간 로그 확인
docker-compose -f docker-compose.offline.yml logs -f

# 특정 시간 로그 확인
docker-compose -f docker-compose.offline.yml logs --since="2024-01-01T00:00:00Z"
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

### 서비스 관리
```bash
# 서비스 중지
docker-compose -f docker-compose.offline.yml down

# 서비스 재시작
docker-compose -f docker-compose.offline.yml restart

# 서비스 시작
docker-compose -f docker-compose.offline.yml up -d
```

## 🔧 문제해결

### 일반적인 문제

**1. 이미지 로드 실패**
```bash
# 이미지 파일 확인
ls -la offline-images/
file offline-images/chatbot-ui-1.0.0.tar.gz

# 압축 해제 후 로드
gunzip offline-images/chatbot-ui-1.0.0.tar.gz
docker load -i offline-images/chatbot-ui-1.0.0.tar
```

**2. 컨테이너 실행 실패**
```bash
# 로그 확인
docker-compose -f docker-compose.offline.yml logs

# 포트 충돌 확인
netstat -tlnp | grep :3003
```

**3. API 연결 실패**
```bash
# 환경 변수 확인
docker-compose -f docker-compose.offline.yml exec chatbot-ui env | grep NEXT_PUBLIC

# 네트워크 연결 확인
docker-compose -f docker-compose.offline.yml exec chatbot-ui ping 172.20.23.104
```

**4. 플랫폼 호환성 에러**
```bash
# 에러 메시지 예시:
# "The requested image's platform (linux/arm64) does not match the detected host platform (linux/amd64)"

# 해결 방법: 올바른 플랫폼으로 다시 빌드
DOCKER_PLATFORM=linux/amd64 ./build-for-offline.sh  # AMD64 환경
DOCKER_PLATFORM=linux/arm64 ./build-for-offline.sh  # ARM64 환경

# 현재 시스템 아키텍처 확인
uname -m
# x86_64 = AMD64
# aarch64 = ARM64
```

### 디버깅 명령어
```bash
# 컨테이너 내부 접속
docker-compose -f docker-compose.offline.yml exec chatbot-ui sh

# 이미지 확인
docker images | grep chatbot-ui

# 컨테이너 상세 정보
docker inspect chatbot-ui_chatbot-ui_1
```

## 🔄 업데이트 절차

### 1. 새 버전 빌드 (인터넷망)
```bash
# 소스코드 업데이트
git pull

# 새 이미지 빌드
./build-for-offline.sh
```

### 2. 폐쇄망 업데이트
```bash
# 기존 서비스 중지
docker-compose -f docker-compose.offline.yml down

# 새 이미지 파일 전송 및 로드
# (위의 배포 절차와 동일)

# 서비스 재시작
./deploy-offline.sh
```

## 📞 지원 및 문의

문제 발생 시 다음 정보를 포함하여 문의해 주세요:
- 운영체제 정보
- Docker 버전
- 에러 로그
- 환경 변수 설정

---

**주의사항:**
- 폐쇄망 환경에서는 인터넷 연결이 불가능하므로 모든 의존성이 이미지에 포함되어 있어야 합니다.
- 보안상 중요한 환경 변수는 `.env` 파일에 설정하고 적절한 권한을 설정하세요.
- 정기적인 백업과 모니터링을 통해 안정적인 운영을 유지하세요. 