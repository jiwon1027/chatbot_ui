#!/bin/bash
# 인터넷망에서 Docker 이미지 빌드 및 저장 스크립트

set -e

echo "🚀 ChatBot UI 인터넷망 빌드 시작..."

# 변수 설정
IMAGE_NAME="chatbot-ui"
VERSION=$(grep '"version"' package.json | cut -d'"' -f4)
OUTPUT_DIR="./offline-images"
TAR_FILE="${OUTPUT_DIR}/chatbot-ui-${VERSION}.tar"

# 플랫폼 강제 설정 (폐쇄망 호환성을 위해 무조건 AMD64)
if [ -z "$DOCKER_PLATFORM" ]; then
    PLATFORM="linux/amd64"
    echo "🔧 폐쇄망 호환성을 위해 AMD64로 강제 설정: ${PLATFORM}"
else
    PLATFORM=${DOCKER_PLATFORM}
    echo "🏗️  수동 지정된 플랫폼: ${PLATFORM}"
fi

echo "📦 버전: ${VERSION}"

# 출력 디렉토리 생성
mkdir -p "${OUTPUT_DIR}"

# 이전 빌드 정리
echo "🧹 이전 빌드 정리..."
docker image prune -f

# Docker 이미지 빌드
echo "🔨 Docker 이미지 빌드 중..."
docker build --platform "${PLATFORM}" -t "${IMAGE_NAME}:${VERSION}" -t "${IMAGE_NAME}:latest" .

# 의존성 이미지들도 저장 (런타임에 필요한 기본 이미지)
echo "📥 기본 이미지 다운로드..."
docker pull --platform "${PLATFORM}" node:18-alpine

# 이미지를 tar 파일로 저장
echo "💾 이미지를 tar 파일로 저장 중..."
docker save \
  "${IMAGE_NAME}:${VERSION}" \
  "${IMAGE_NAME}:latest" \
  node:18-alpine \
  -o "${TAR_FILE}"

# 압축
echo "🗜️ 이미지 압축 중..."
gzip "${TAR_FILE}"

# 파일 크기 출력
echo "📊 생성된 파일:"
ls -lh "${OUTPUT_DIR}/"

echo "✅ 빌드 완료!"
echo ""
echo "📋 폐쇄망 전송 파일:"
echo "  - ${TAR_FILE}.gz"
echo "  - docker-compose.offline.yml"
echo "  - deploy-offline.sh"
echo ""
echo "🔧 기본적으로 AMD64 플랫폼으로 빌드됩니다 (폐쇄망 호환성)"
echo "💡 다른 플랫폼이 필요한 경우:"
echo "  - DOCKER_PLATFORM=linux/arm64 ./build-for-offline.sh"
echo ""
echo "🚚 이 파일들을 폐쇄망으로 전송하고 deploy-offline.sh를 실행하세요." 