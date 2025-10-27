# 배포 가이드

라즈베리파이에서 Docker를 사용하여 3D QR 플랫폼을 배포하는 방법입니다.

## 📋 사전 준비

### 1. 라즈베리파이 요구사항

- **모델**: Raspberry Pi 4 이상 (2GB+ RAM 권장)
- **OS**: Raspberry Pi OS (64-bit) 또는 Ubuntu Server
- **저장공간**: 최소 8GB 여유 공간

### 2. Docker 설치

```bash
# Docker 설치
curl -fsSL https://get.docker.com | sh

# 현재 사용자를 docker 그룹에 추가
sudo usermod -aG docker $USER

# 재로그인 또는
newgrp docker

# Docker Compose 확인 (최신 Docker는 포함됨)
docker compose version
```

---

## 🚀 빠른 시작

### 1단계: 저장소 클론

```bash
git clone <repository-url>
cd 3D_QR_생성
```

### 2단계: 환경변수 설정

#### Backend 환경변수

```bash
cp backend/.env.example backend/.env
nano backend/.env
```

필수 설정:
- `CLERK_JWKS_URL`: Clerk Authentication JWKS URL
- `TELEGRAM_BOT_TOKEN`: 텔레그램 봇 토큰
- `TELEGRAM_CHAT_ID`: 텔레그램 채팅 ID
- `ADMIN_EMAILS`: 관리자 이메일

#### Frontend 환경변수

```bash
cp .env.production.example .env.production
nano .env.production
```

필수 설정:
- `VITE_CLERK_PUBLISHABLE_KEY`: Clerk 퍼블릭 키
- `VITE_API_BASE_URL`: API 엔드포인트 (로컬: `http://localhost:8000`)

### 3단계: 배포 실행

```bash
chmod +x deploy.sh
./deploy.sh
```

배포 스크립트가 자동으로:
1. 환경변수 확인
2. Docker 이미지 빌드
3. 컨테이너 시작
4. 헬스체크 수행

### 4단계: 접속 확인

- **Frontend**: http://localhost
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

---

## 🌐 인터넷 노출 (Cloudflare Tunnel)

공인 IP 없이 인터넷에 노출하려면 Cloudflare Tunnel을 사용하세요.

자세한 가이드: [CLOUDFLARE_TUNNEL.md](./CLOUDFLARE_TUNNEL.md)

### 빠른 설정

1. **Cloudflared 설치**
```bash
curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64.deb
sudo dpkg -i cloudflared.deb
```

2. **터널 토큰 발급**
   - https://one.dash.cloudflare.com/ 접속
   - Access → Tunnels → Create a tunnel
   - 토큰 복사

3. **환경변수 설정**
```bash
# .env.production에 추가
CLOUDFLARE_TUNNEL_TOKEN=your_token_here
```

4. **docker-compose.yml 수정**
```yaml
# cloudflared 섹션 주석 해제
cloudflared:
  image: cloudflare/cloudflared:latest
  # ...
```

5. **재배포**
```bash
./deploy.sh
```

---

## 🛠️ 관리 명령어

### 컨테이너 관리

```bash
# 전체 로그 확인
docker compose logs -f

# 특정 서비스 로그
docker compose logs -f backend
docker compose logs -f frontend

# 컨테이너 상태 확인
docker compose ps

# 컨테이너 재시작
docker compose restart

# 컨테이너 중지
docker compose down

# 컨테이너 완전 제거 (볼륨 포함)
docker compose down -v
```

### 데이터베이스 백업

```bash
# SQLite 데이터베이스 백업
cp backend/data/qr_platform.db backend/data/qr_platform.db.backup

# 주문 파일 백업
tar -czf storage-backup-$(date +%Y%m%d).tar.gz backend/storage/
```

### 업데이트

```bash
# 코드 업데이트
git pull

# 재배포 (이미지 재빌드)
./deploy.sh
```

---

## 📊 모니터링

### 리소스 사용량 확인

```bash
# 실시간 리소스 사용량
docker stats

# 디스크 사용량
docker system df
```

### 로그 관리

```bash
# 로그 크기 제한 설정 (docker-compose.yml에 추가)
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

---

## 🔧 문제 해결

### 포트 충돌

다른 서비스가 포트 80 또는 8000을 사용 중인 경우:

```bash
# 사용 중인 포트 확인
sudo lsof -i :80
sudo lsof -i :8000

# docker-compose.yml에서 포트 변경
# ports:
#   - "8080:80"  # 80 대신 8080 사용
```

### 메모리 부족

```bash
# 스왑 메모리 추가 (라즈베리파이)
sudo dphys-swapfile swapoff
sudo nano /etc/dphys-swapfile
# CONF_SWAPSIZE=1024 (1GB)
sudo dphys-swapfile setup
sudo dphys-swapfile swapon
```

### 빌드 실패

```bash
# 캐시 없이 재빌드
docker compose build --no-cache

# 미사용 이미지 정리
docker system prune -a
```

### Frontend 빌드 환경변수 문제

Vite는 빌드 타임에 환경변수를 주입합니다. 변경 시 재빌드 필요:

```bash
# 환경변수 수정 후
docker compose build frontend --no-cache
docker compose up -d frontend
```

---

## 🔒 보안 설정

### 1. 방화벽 설정

```bash
# UFW 방화벽 활성화 (Ubuntu)
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

### 2. 자동 보안 업데이트

```bash
# Unattended upgrades 설치
sudo apt install unattended-upgrades
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

### 3. SSL 인증서 (Cloudflare Tunnel 사용 시 불필요)

Cloudflare Tunnel을 사용하지 않는 경우 Let's Encrypt 사용:

```bash
sudo apt install certbot
sudo certbot certonly --standalone -d yourdomain.com
```

---

## 📁 파일 구조

```
.
├── backend/
│   ├── Dockerfile           # Backend 이미지 정의
│   ├── .env                 # Backend 환경변수
│   ├── data/                # SQLite DB (볼륨 마운트)
│   ├── storage/             # 주문 파일 (볼륨 마운트)
│   └── static/              # 정적 파일 (볼륨 마운트)
├── frontend/
│   ├── Dockerfile           # Frontend 이미지 정의
│   ├── nginx.conf           # Nginx 설정
│   └── dist/                # 빌드 출력 (컨테이너 내부)
├── docker-compose.yml       # 전체 스택 구성
├── .env.production          # 프로덕션 환경변수
├── deploy.sh                # 배포 스크립트
└── CLOUDFLARE_TUNNEL.md     # Cloudflare 설정 가이드
```

---

## 🆘 지원

문제가 발생하면:

1. **로그 확인**: `docker compose logs -f`
2. **헬스체크**: `curl http://localhost/health`
3. **이슈 생성**: GitHub Issues
