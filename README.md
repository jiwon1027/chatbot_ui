# 챗봇 UI - 운영 환경

AI 기반 채팅 인터페이스입니다. 깔끔한 UI로 제공되며, PC와 모바일 디바이스를 모두 지원합니다.

## 🚀 주요 기능

### 📱 반응형 디자인
- **PC 환경**: 우측 하단 고정 팝업 (320px × 384px)
- **모바일 환경**: 전체 화면 크기로 자동 조정
- 모던한 UI 디자인

### 💬 채팅 인터페이스
- 실시간 질의/답변 채팅
- 타이핑 효과 (속도 조정 가능)
- 메시지 자동 스크롤
- Enter 키로 빠른 전송 (Shift+Enter로 줄바꿈)

### 🔗 API 연동
- OpenAI 호환 API 연동
- 기본 엔드포인트: `http://172.20.23.104:3000/api/v1/chat/completions`
- 환경 변수를 통한 설정 가능
- 오류 처리 및 재시도 로직

### 💡 코드 강조
- 소스 코드 자동 감지 및 강조
- 인라인 코드 및 코드 블록 지원
- 다양한 프로그래밍 언어 지원

### 📊 피드백 시스템
- 👍 👎 피드백 버튼
- 마크다운 복사 기능
- 시간 표시 기능

## 🛠️ 설치 및 실행

### 🔧 개발 환경

#### 필요 조건
- Node.js 18.0 이상
- npm 또는 yarn

#### 설치
```bash
# 의존성 설치
npm install

# 환경 설정 파일 생성
cp .env.example .env

# 개발 서버 실행
npm run dev
```

#### 빌드 및 배포
```bash
# 프로덕션 빌드
npm run build:prod

# 빌드된 앱 실행
npm run start:prod
```

### 🐳 운영 환경 배포 (권장)

#### 인터넷망에서 이미지 빌드
```bash
# 환경 설정 파일 생성
cp .env.example .env

# 환경 변수 수정 (운영 환경에 맞게)
nano .env

# 오프라인 배포용 이미지 빌드 (기본 AMD64 플랫폼)
./build-for-offline.sh

# ARM64가 필요한 특별한 경우에만:
DOCKER_PLATFORM=linux/arm64 ./build-for-offline.sh
```

#### 폐쇄망에서 배포 실행
```bash
# 전송받은 파일들을 확인하고 배포
./deploy-offline.sh
```

#### 개발 환경에서 직접 실행
```bash
# 개발용 Docker 실행
docker build -t chatbot-ui .
docker run -p 3003:3000 chatbot-ui
```

## ⚙️ 환경 설정

### 필수 환경 변수

```env
# 환경 설정
NODE_ENV=production

# API 설정
NEXT_PUBLIC_API_BASE_URL=http://172.20.23.104:3000
NEXT_PUBLIC_API_ENDPOINT=/api/v1/chat/completions
NEXT_PUBLIC_MODEL_NAME=gemma3:1b

# UI 설정
NEXT_PUBLIC_TYPING_SPEED=50
NEXT_PUBLIC_LOG_LEVEL=ERROR
```

### 커스터마이징 가능한 옵션

| 환경 변수 | 설명 | 기본값 |
|-----------|------|--------|
| `NEXT_PUBLIC_API_BASE_URL` | API 서버 URL | http://172.20.23.104:3000 |
| `NEXT_PUBLIC_API_ENDPOINT` | API 엔드포인트 | /api/v1/chat/completions |
| `NEXT_PUBLIC_MODEL_NAME` | AI 모델명 | gemma3:1b |
| `NEXT_PUBLIC_TYPING_SPEED` | 타이핑 속도 (ms) | 50 |
| `NEXT_PUBLIC_LOG_LEVEL` | 로그 레벨 | ERROR |

## 📁 프로젝트 구조

```
src/
├── app/
│   ├── api/
│   │   ├── feedback/       # 피드백 API
│   │   └── health/         # 헬스체크 API
│   ├── globals.css         # 글로벌 CSS 스타일
│   ├── layout.tsx          # 앱 레이아웃
│   └── page.tsx            # 메인 페이지
├── components/
│   └── ChatBot.tsx         # 채팅봇 메인 컴포넌트
└── utils/
    ├── logger.ts           # 클라이언트 로거
    └── serverLogger.ts     # 서버 로거
```

## 🚀 운영 환경 배포

### 폐쇄망 환경 배포

자세한 설치 및 운영 가이드는 [DEPLOYMENT.md](./DEPLOYMENT.md)를 참고하세요.

### 모니터링

```bash
# 애플리케이션 상태 확인
curl http://localhost:3003/api/health

# 로그 모니터링
docker compose -f docker-compose.offline.yml logs -f

# 리소스 모니터링
docker stats
```

## 🔧 개발 스크립트

```bash
# 개발 서버 실행
npm run dev

# 타입 검사
npm run type-check

# 린트 검사
npm run lint

# 빌드
npm run build
npm run build:prod

# 정리
npm run clean
```

## 📱 사용법

1. **챗봇 열기**: 우측 하단의 메시지 아이콘 클릭
2. **질문 입력**: 텍스트 입력창에 질문 작성
3. **메시지 전송**: Enter 키 또는 전송 버튼 클릭
4. **피드백 제공**: 봇 답변에 대해 👍👎 피드백
5. **복사 기능**: 마크다운 복사 버튼 활용
6. **챗봇 닫기**: 우측 상단의 X 버튼 클릭

## 🔍 기술 스택

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 3.4.16
- **UI Components**: Lucide React (아이콘)
- **Code Highlighting**: Prism React Renderer
- **HTTP Client**: Fetch API
- **Auto-resize**: React Textarea Autosize
- **Container**: Docker, Docker Compose
- **Deployment**: 오프라인 배포 지원

## 🔐 보안 고려사항

- 운영 환경에서 에러 로그만 출력
- 보안 헤더 설정
- 민감정보 환경 변수 분리
- 포트 및 네트워크 보안 설정

## 🚨 문제해결

### 플랫폼 호환성 에러
```bash
# 에러 예시: "The requested image's platform does not match the detected host platform"

# 해결 방법: 기본적으로 AMD64로 빌드됨 (폐쇄망 호환성)
./build-for-offline.sh

# ARM64가 필요한 특별한 경우에만:
DOCKER_PLATFORM=linux/arm64 ./build-for-offline.sh

# 현재 시스템 아키텍처 확인
uname -m
# x86_64 = AMD64, aarch64/arm64 = ARM64
```

---

**운영 환경 버전**: 최적화된 성능과 보안을 위해 설계된 프로덕션 레디 챗봇 UI입니다. 
