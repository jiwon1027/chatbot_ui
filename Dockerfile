# React + Vite 애플리케이션을 위한 간단한 Dockerfile

# 1단계: 빌드
FROM node:18-alpine AS build
WORKDIR /app

# 의존성 파일 복사 및 설치
COPY package*.json ./
RUN npm install

# 소스 코드 복사 및 빌드
COPY . .
RUN npm run build

# 2단계: 서버 실행
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

# 커스텀 nginx 설정 (SPA를 위한 fallback 설정)
RUN echo 'server { \
    listen 3000; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

# 포트 설정
EXPOSE 3000

# nginx 실행
CMD ["nginx", "-g", "daemon off;"] 