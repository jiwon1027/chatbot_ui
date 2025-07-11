# ChatBot UI

React + Vite 기반의 모던 챗봇 사용자 인터페이스입니다.

## 🚀 주요 기능

- **직관적인 UI**: 모던하고 사용자 친화적인 인터페이스
- **실시간 타이핑 효과**: 자연스러운 대화 경험
- **코드 하이라이팅**: Prism.js 기반 구문 강조
- **응답형 디자인**: 모든 디바이스에서 최적화된 경험
- **피드백 시스템**: 사용자 만족도 수집
- **고급 로깅**: 파일 기반 로그 저장 및 일일 롤오버
- **에러 처리**: 강력한 에러 복구 및 사용자 알림

## 🛠️ 기술 스택

- **Frontend**: React 19, TypeScript
- **Build Tool**: Vite 5.2.0
- **Styling**: Tailwind CSS
- **Code Highlighting**: Prism React Renderer
- **UI Components**: Lucide React Icons
- **Deployment**: Docker

## 📦 설치 및 실행

### 로컬 개발 환경

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

개발 서버는 http://localhost:3003에서 실행됩니다.

### Docker를 이용한 배포

```bash
# Docker 이미지 빌드 및 실행
docker compose up -d

# 로그 확인
docker compose logs -f

# 중지
docker compose down
```

애플리케이션은 http://localhost:3003에서 접근 가능합니다.

## ⚙️ 환경 변수

`.env` 파일을 생성하여 다음 환경 변수를 설정하세요:

```env
# API 설정
VITE_API_BASE_URL=http://172.20.23.104:3000
VITE_API_ENDPOINT=/api/v1/chat/completions
VITE_MODEL_NAME=gemma3:1b

# UI 설정
VITE_TYPING_SPEED=50
VITE_LOG_LEVEL=DEBUG
```

### 환경 변수 설명

| 변수명 | 설명 | 기본값 |
|--------|------|--------|
| `VITE_API_BASE_URL` | 챗봇 API 서버 주소 | `http://172.20.23.104:3000` |
| `VITE_API_ENDPOINT` | API 엔드포인트 경로 | `/api/v1/chat/completions` |
| `VITE_MODEL_NAME` | 사용할 AI 모델명 | `gemma3:1b` |
| `VITE_TYPING_SPEED` | 타이핑 효과 속도 (ms) | `50` |
| `VITE_LOG_LEVEL` | 로그 레벨 | `DEBUG` |

## 📊 로깅 시스템

### 클라이언트 로깅
- **파일 기반**: 로그를 파일로 저장
- **일일 롤오버**: 매일 자동으로 로그 파일 생성
- **로컬스토리지 백업**: 네트워크 오류 시 임시 저장
- **성능 모니터링**: API 응답 시간 및 성능 메트릭 수집

### 로그 카테고리
- `CONFIG`: 환경 설정 관련
- `API`: API 호출 및 응답
- `USER`: 사용자 액션
- `PERFORMANCE`: 성능 메트릭
- `VALIDATION`: 유효성 검사

### 로그 파일 위치
```
logs/
├── chatbot-2025-01-10.log
├── chatbot-2025-01-09.log
└── ...
```

## 🏗️ 프로젝트 구조

```
chatbot_ui/
├── src/
│   ├── components/
│   │   └── ChatBot.tsx      # 메인 챗봇 컴포넌트
│   ├── utils/
│   │   ├── logger.ts        # 기본 로거
│   │   └── fileLogger.ts    # 파일 로거 (고급 기능)
│   ├── App.tsx              # 루트 컴포넌트
│   ├── main.tsx             # 앱 엔트리 포인트
│   ├── globals.css          # 전역 스타일
│   └── vite-env.d.ts        # Vite 타입 정의
├── public/
│   └── ico_chat.gif         # 챗봇 아이콘
├── docker-compose.yml       # Docker Compose 설정
├── Dockerfile               # Docker 빌드 설정
├── vite.config.ts          # Vite 설정
└── package.json            # 프로젝트 의존성
```

## 🔧 빌드 및 배포

### 프로덕션 빌드

```bash
# 타입 체크 및 빌드
npm run build

# 빌드된 파일 미리보기
npm run preview
```

빌드된 파일은 `dist/` 디렉토리에 생성됩니다.

### Docker 멀티스테이지 빌드

```dockerfile
# Node.js에서 React 앱 빌드 및 실행
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3003
CMD ["npm", "run", "preview"]
```

## 🧪 개발 도구

### 코드 품질
```bash
# TypeScript 타입 체크
npm run type-check

# ESLint 실행
npm run lint
```

### 디버깅
- 브라우저 개발자 도구에서 로그 확인
- `fileLogger` 객체를 통한 실시간 로그 모니터링
- 성능 메트릭 및 API 응답 시간 추적

## 🔒 보안 고려사항

- **환경 변수**: 민감한 정보는 환경 변수로 관리
- **CORS**: API 서버에서 적절한 CORS 설정 필요
- **Content Security Policy**: 프로덕션 환경에서 CSP 헤더 설정 권장
- **HTTPS**: 프로덕션 환경에서 HTTPS 사용 권장

## 🚨 문제 해결

### 일반적인 문제들

**1. API 연결 오류**
```bash
# 환경 변수 확인
echo $VITE_API_BASE_URL

# 네트워크 연결 테스트
curl -I http://172.20.23.104:3000/api/v1/chat/completions
```

**2. Docker 빌드 실패**
```bash
# Docker 로그 확인
docker compose logs chatbot-ui

# 이미지 재빌드
docker compose build --no-cache
```

**3. 포트 충돌**
```bash
# 포트 사용 확인
lsof -i :3003

# 다른 포트로 실행
VITE_PORT=3004 npm run dev
```

### 로그 분석
```bash
# 오늘 로그 확인
tail -f logs/chatbot-$(date +%Y-%m-%d).log

# 에러 로그만 필터링
grep -i error logs/chatbot-$(date +%Y-%m-%d).log

# API 호출 로그 확인
grep -i "api" logs/chatbot-$(date +%Y-%m-%d).log
```

## 📈 성능 최적화

- **코드 분할**: Vite의 동적 import 활용
- **이미지 최적화**: WebP 형식 사용 권장
- **브라우저 캐싱**: 정적 자산 캐싱 설정
- **번들 크기 최적화**: Tree shaking 및 압축

## 🤝 기여하기

1. Fork this repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다.

## 🔗 관련 문서

- [배포 가이드](DEPLOYMENT.md)
- [Vite 공식 문서](https://vitejs.dev/)
- [React 공식 문서](https://react.dev/)
- [Tailwind CSS 문서](https://tailwindcss.com/) 
