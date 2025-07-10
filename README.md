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
- Ollama API 연동
- 기본 엔드포인트: `http://34.71.147.202:3000/api/v1/chat/ollama`
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

### 🐳 Docker 배포 (권장)

#### 빠른 시작
```bash
# 환경 설정 파일 생성
cp .env.example .env

# 환경 변수 수정
nano .env

# Docker Compose로 실행
docker-compose up -d
```

#### 직접 Docker 명령어
```bash
# 이미지 빌드
docker build -t chatbot-ui .

# 컨테이너 실행
docker run -d \
  --name chatbot-ui \
  -p 3000:3000 \
  -e NEXT_PUBLIC_API_BASE_URL=http://YOUR_API_SERVER:3000 \
  --restart unless-stopped \
  chatbot-ui
```

## ⚙️ 환경 설정

### 필수 환경 변수

```env
# 환경 설정
NODE_ENV=production

# API 설정
NEXT_PUBLIC_API_BASE_URL=http://34.71.147.202:3000
NEXT_PUBLIC_API_ENDPOINT=/api/v1/chat/ollama
NEXT_PUBLIC_MODEL_NAME=gemma3:1b

# UI 설정
NEXT_PUBLIC_TYPING_SPEED=50
NEXT_PUBLIC_LOG_LEVEL=ERROR
```

### 커스터마이징 가능한 옵션

| 환경 변수 | 설명 | 기본값 |
|-----------|------|--------|
| `NEXT_PUBLIC_API_BASE_URL` | API 서버 URL | http://34.71.147.202:3000 |
| `NEXT_PUBLIC_API_ENDPOINT` | API 엔드포인트 | /api/v1/chat/ollama |
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
curl http://localhost:3000/api/health

# 로그 모니터링
docker-compose logs -f chatbot-ui

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
- **Styling**: Tailwind CSS 4
- **UI Components**: Lucide React (아이콘)
- **Code Highlighting**: Prism React Renderer
- **HTTP Client**: Fetch API
- **Auto-resize**: React Textarea Autosize
- **Container**: Docker, Docker Compose

## 🔐 보안 고려사항

- 운영 환경에서 에러 로그만 출력
- 보안 헤더 설정
- 민감정보 환경 변수 분리
- 포트 및 네트워크 보안 설정

## 🤝 기여

프로젝트 개선에 기여하고 싶으시다면:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

---

**운영 환경 버전**: 최적화된 성능과 보안을 위해 설계된 프로덕션 레디 챗봇 UI입니다. 
