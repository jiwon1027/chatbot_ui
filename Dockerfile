# React + Vite 애플리케이션을 위한 간단한 Dockerfile

FROM node:18-alpine
WORKDIR /app

# 의존성 파일 복사 및 설치
COPY package*.json ./
RUN npm install

# 소스 코드 복사 및 빌드
COPY . .
RUN npm run build

# 포트 설정
EXPOSE 3003

# Vite preview 서버 실행
CMD ["npm", "run", "preview"] 