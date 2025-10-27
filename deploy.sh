#!/bin/bash
# ===========================================
# 3D QR 플랫폼 배포 스크립트
# ===========================================
# 라즈베리파이에서 실행하세요
# chmod +x deploy.sh
# ./deploy.sh

set -e  # 에러 발생 시 중단

echo "🚀 3D QR 플랫폼 배포 시작..."

# ===========================================
# 1. 환경변수 확인
# ===========================================
echo "📋 환경변수 확인 중..."

if [ ! -f ".env.production" ]; then
    echo "❌ .env.production 파일이 없습니다!"
    echo "💡 .env.production.example을 복사하여 .env.production을 생성하세요:"
    echo "   cp .env.production.example .env.production"
    exit 1
fi

if [ ! -f "backend/.env" ]; then
    echo "❌ backend/.env 파일이 없습니다!"
    echo "💡 backend/.env.example을 복사하여 backend/.env를 생성하세요:"
    echo "   cp backend/.env.example backend/.env"
    exit 1
fi

# .env.production 로드
export $(cat .env.production | grep -v '^#' | xargs)

# ===========================================
# 2. Docker 설치 확인
# ===========================================
echo "🐳 Docker 설치 확인 중..."

if ! command -v docker &> /dev/null; then
    echo "❌ Docker가 설치되어 있지 않습니다!"
    echo "💡 Docker 설치:"
    echo "   curl -fsSL https://get.docker.com | sh"
    echo "   sudo usermod -aG docker $USER"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose가 설치되어 있지 않습니다!"
    echo "💡 Docker Compose는 보통 Docker와 함께 설치됩니다."
    exit 1
fi

# ===========================================
# 3. 기존 컨테이너 중지 및 제거
# ===========================================
echo "🛑 기존 컨테이너 중지 중..."
docker-compose down || true

# ===========================================
# 4. Docker 이미지 빌드
# ===========================================
echo "🔨 Docker 이미지 빌드 중..."
docker-compose build --no-cache

# ===========================================
# 5. 컨테이너 시작
# ===========================================
echo "▶️  컨테이너 시작 중..."
docker-compose up -d

# ===========================================
# 6. 헬스체크
# ===========================================
echo "🏥 헬스체크 대기 중..."
sleep 10

# Backend 헬스체크
if curl -f http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ Backend 정상 작동"
else
    echo "❌ Backend 헬스체크 실패"
    echo "📋 로그 확인:"
    docker-compose logs backend
    exit 1
fi

# Frontend 헬스체크
if curl -f http://localhost/health > /dev/null 2>&1; then
    echo "✅ Frontend 정상 작동"
else
    echo "❌ Frontend 헬스체크 실패"
    echo "📋 로그 확인:"
    docker-compose logs frontend
    exit 1
fi

# ===========================================
# 7. 배포 완료
# ===========================================
echo ""
echo "✅ 배포 완료!"
echo ""
echo "📊 서비스 상태:"
docker-compose ps
echo ""
echo "🌐 접속 주소:"
echo "   - 로컬: http://localhost"
echo "   - API: http://localhost:8000"
if [ ! -z "$CLOUDFLARE_TUNNEL_TOKEN" ]; then
    echo "   - Cloudflare Tunnel: 설정된 도메인으로 접속 가능"
fi
echo ""
echo "📋 로그 확인:"
echo "   docker-compose logs -f"
echo ""
echo "🛑 중지:"
echo "   docker-compose down"
echo ""
