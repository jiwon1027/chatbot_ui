#!/bin/bash
# 폐쇄망에서 Docker 이미지 로드 및 실행 스크립트

set -e

echo "🚀 ChatBot UI 폐쇄망 배포 시작..."

# 변수 설정
IMAGE_NAME="chatbot-ui"
OFFLINE_DIR="./offline-images"
VERSION="1.0.0"  # package.json에서 가져온 버전과 동일하게 설정
TAR_FILE="${OFFLINE_DIR}/chatbot-ui-${VERSION}.tar.gz"

# 플랫폼 고정 설정 (폐쇄망 호환성을 위해 무조건 AMD64)
PLATFORM="linux/amd64"
echo "🔧 폐쇄망 호환성을 위해 AMD64로 고정: ${PLATFORM}"

# 이미지 파일 확인
if [ ! -f "${TAR_FILE}" ]; then
    echo "❌ 이미지 파일을 찾을 수 없습니다: ${TAR_FILE}"
    echo "📋 현재 디렉토리의 파일들:"
    ls -la ./offline-images/ 2>/dev/null || echo "offline-images 디렉토리가 없습니다."
    exit 1
fi

echo "📦 이미지 파일 확인: ${TAR_FILE}"

# 기존 컨테이너 정리
echo "🧹 기존 컨테이너 정리..."
docker compose -f docker-compose.offline.yml down 2>/dev/null || true

# 압축 해제
echo "🗜️ 이미지 압축 해제 중..."
gunzip -f "${TAR_FILE}"

# Docker 이미지 로드
echo "📥 Docker 이미지 로드 중..."
docker load -i "${OFFLINE_DIR}/chatbot-ui-${VERSION}.tar"

# 이미지 확인
echo "🔍 로드된 이미지 확인:"
docker images | grep -E "(chatbot-ui|node.*alpine)"

# 환경 변수 파일 확인
if [ ! -f ".env" ]; then
    echo "📝 환경 변수 파일 생성..."
    cp .env.example .env
    echo "⚠️  .env 파일을 확인하고 필요시 수정하세요."
else
    echo "✅ 환경 변수 파일 존재"
fi

# Docker Compose 파일의 플랫폼 설정은 이미 AMD64로 고정되어 있음
echo "✅ Docker Compose 플랫폼: ${PLATFORM}"

# Docker Compose로 실행
echo "🚀 애플리케이션 실행 중..."
docker compose -f docker-compose.offline.yml up -d

# 상태 확인
echo "⏳ 서비스 시작 대기 중..."
sleep 10

# Health Check
echo "🔍 서비스 상태 확인..."
if curl -f http://localhost:3003/api/health >/dev/null 2>&1; then
    echo "✅ 서비스 정상 실행 중!"
    echo "🌐 브라우저에서 접속: http://localhost:3003"
else
    echo "⚠️  서비스 상태 확인 실패. 로그를 확인하세요:"
    echo "   docker compose -f docker-compose.offline.yml logs"
fi

echo ""
echo "📋 유용한 명령어:"
echo "  - 로그 확인: docker compose -f docker-compose.offline.yml logs -f"
echo "  - 상태 확인: docker compose -f docker-compose.offline.yml ps"
echo "  - 중지: docker compose -f docker-compose.offline.yml down"
echo "  - 재시작: docker compose -f docker-compose.offline.yml restart"

echo ""
echo "✅ 폐쇄망 배포 완료!" 