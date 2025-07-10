# 멀티 스테이지 빌드를 사용한 최적화된 Dockerfile

# 프록시 설정
ARG HTTP_PROXY=http://10.175.24.10:8123
ARG HTTPS_PROXY=http://10.175.24.10:8123

# 1단계: 의존성 설치
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# 프록시 환경 변수 설정
ENV HTTP_PROXY=${HTTP_PROXY}
ENV HTTPS_PROXY=${HTTPS_PROXY}
ENV http_proxy=${HTTP_PROXY}
ENV https_proxy=${HTTPS_PROXY}

# package.json과 package-lock.json 복사
COPY package*.json ./

# 의존성 설치 (내부망 환경 최적화)
RUN npm cache clean --force && \
    npm install --only=production --no-optional --registry=https://registry.npmjs.org/ || \
    npm install --only=production --no-optional

# 2단계: 빌드
FROM node:18-alpine AS builder
WORKDIR /app

# 프록시 환경 변수 설정
ENV HTTP_PROXY=${HTTP_PROXY}
ENV HTTPS_PROXY=${HTTPS_PROXY}
ENV http_proxy=${HTTP_PROXY}
ENV https_proxy=${HTTPS_PROXY}

# 의존성 복사
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 개발 의존성 설치 (빌드에 필요한 패키지들)
RUN npm install --only=development --no-optional || true

# 환경 변수 설정 (빌드 시점)
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production
ENV DISABLE_SWC=true

# 내부망 환경 대응 - 캐시 정리
RUN npm cache clean --force

# Next.js 애플리케이션 빌드
RUN npm run build

# 3단계: 런타임
FROM node:18-alpine AS runner
WORKDIR /app

# 보안을 위한 사용자 추가
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 필요한 파일들만 복사
COPY --from=builder /app/public ./public

# 빌드된 파일들 복사 (nextjs 사용자 권한으로)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# nextjs 사용자로 전환
USER nextjs

# 포트 설정
EXPOSE 3000

# 환경 변수 설정
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# 런타임에서는 프록시 설정 제거
ENV HTTP_PROXY=""
ENV HTTPS_PROXY=""
ENV http_proxy=""
ENV https_proxy=""

# 애플리케이션 실행
CMD ["node", "server.js"] 