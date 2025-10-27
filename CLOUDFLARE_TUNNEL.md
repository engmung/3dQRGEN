# Cloudflare Tunnel 설정 가이드

Cloudflare Tunnel을 사용하면 **공인 IP 없이도** 라즈베리파이에서 실행되는 앱을 인터넷에 노출할 수 있습니다.

## 장점

- ✅ **무료 HTTPS** - SSL 인증서 자동 관리
- ✅ **도메인 불필요** - `*.trycloudflare.com` 무료 도메인 제공
- ✅ **포트포워딩 불필요** - NAT 뒤에서도 작동
- ✅ **DDoS 방어** - Cloudflare의 보안 기능 활용

## 방법 1: Quick Tunnel (빠른 테스트용)

가장 간단한 방법. 매번 랜덤 도메인 생성.

### 1단계: Cloudflared 설치

```bash
# 라즈베리파이에서 실행
curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64.deb
sudo dpkg -i cloudflared.deb
```

### 2단계: 터널 실행

```bash
# Frontend (포트 80)를 인터넷에 노출
cloudflared tunnel --url http://localhost:80
```

출력 예시:
```
Your quick Tunnel has been created! Visit it at (it may take some time to be reachable):
https://random-name-1234.trycloudflare.com
```

이 URL을 브라우저에서 열면 앱에 접속 가능!

### 단점
- 터널을 종료하면 URL이 사라짐
- 매번 새로운 랜덤 도메인 생성

---

## 방법 2: Named Tunnel (프로덕션 추천)

영구적인 터널. 고정 도메인 사용 가능.

### 1단계: Cloudflare 계정 생성

https://dash.cloudflare.com/ 에서 무료 계정 생성

### 2단계: Cloudflared 로그인

```bash
cloudflared tunnel login
```

브라우저가 열리면 Cloudflare에 로그인

### 3단계: 터널 생성

```bash
# 터널 이름: 3d-qr-platform
cloudflared tunnel create 3d-qr-platform
```

출력에서 **Tunnel ID**를 복사하세요 (예: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)

### 4단계: 설정 파일 생성

`~/.cloudflared/config.yml` 파일 생성:

```yaml
tunnel: a1b2c3d4-e5f6-7890-abcd-ef1234567890
credentials-file: /home/pi/.cloudflared/a1b2c3d4-e5f6-7890-abcd-ef1234567890.json

ingress:
  # 모든 요청을 localhost:80 (Nginx)로 전달
  - service: http://localhost:80
```

### 5단계: DNS 라우팅 설정

```bash
# 무료 Cloudflare 도메인 사용 (예: qr.example.com)
cloudflared tunnel route dns 3d-qr-platform qr.example.com
```

또는 Cloudflare Dashboard에서 직접 설정 가능.

### 6단계: 터널 실행

```bash
# 터널 시작
cloudflared tunnel run 3d-qr-platform

# 또는 백그라운드 서비스로 실행
sudo cloudflared service install
sudo systemctl start cloudflared
sudo systemctl enable cloudflared
```

---

## 방법 3: Docker Compose 통합 (최고 추천!)

가장 관리하기 쉬운 방법. 전체 스택을 한 번에 실행.

### 1단계: Named Tunnel 생성 (위의 방법 2 참고)

### 2단계: Tunnel Token 가져오기

Cloudflare Zero Trust Dashboard → Access → Tunnels → 터널 선택 → Configure

**또는** CLI로:

```bash
# 터널 토큰 생성
cloudflared tunnel token 3d-qr-platform
```

출력 예시:
```
eyJhIjoiYTFiMmMzZDQtZTVmNi03ODkwLWFiY2QtZWYxMjM0NTY3ODkwIiwidCI6ImExYjJjM2Q0LWU1ZjYtNzg5MC1hYmNkLWVmMTIzNDU2Nzg5MCIsInMiOiJabTVmYlhsemRHVnlhVzkxYzE5MGIydGxibDkyWlhKNWMyVmpjbVYwIn0=
```

### 3단계: 환경변수 설정

`.env.production` 파일에 추가:

```bash
CLOUDFLARE_TUNNEL_TOKEN=eyJhIjoiYTFiMmMzZDQtZTVmNi03ODkwLWFiY2QtZWYxMjM0NTY3ODkwIiwidCI6ImExYjJjM2Q0LWU1ZjYtNzg5MC1hYmNkLWVmMTIzNDU2Nzg5MCIsInMiOiJabTVmYlhsemRHVnlhVzkxYzE5MGIydGxibDkyWlhKNWMyVmpjbVYwIn0=
```

### 4단계: docker-compose.yml 수정

`docker-compose.yml`에서 cloudflared 섹션 주석 해제:

```yaml
  cloudflared:
    image: cloudflare/cloudflared:latest
    container_name: qr-platform-tunnel
    restart: unless-stopped
    command: tunnel --no-autoupdate run
    environment:
      - TUNNEL_TOKEN=${CLOUDFLARE_TUNNEL_TOKEN}
    depends_on:
      - frontend
      - backend
    networks:
      - qr-platform
```

### 5단계: 배포

```bash
./deploy.sh
```

끝! 이제 Cloudflare Dashboard에서 설정한 도메인으로 접속 가능합니다.

---

## 도메인 설정

### 무료 Cloudflare 도메인
- `*.trycloudflare.com` (Quick Tunnel)
- Cloudflare에서 제공하는 무료 서브도메인

### 커스텀 도메인 사용
1. Cloudflare에 도메인 추가 (무료)
2. 네임서버를 Cloudflare로 변경
3. Tunnel DNS 라우팅 설정

---

## 보안 설정 (선택사항)

Cloudflare Zero Trust에서 추가 보안 설정 가능:

- **Access Policies**: 특정 이메일만 접근 허용
- **WAF Rules**: SQL Injection, XSS 차단
- **Rate Limiting**: DDoS 방어

---

## 문제 해결

### 터널이 연결되지 않아요
```bash
# 로그 확인
docker-compose logs cloudflared

# 또는
cloudflared tunnel info 3d-qr-platform
```

### 도메인에 접속이 안 돼요
- DNS 전파 대기 (최대 5분)
- Cloudflare Dashboard에서 터널 상태 확인
- `cloudflared tunnel route ip list`로 라우팅 확인

### 인증서 오류
- Cloudflare는 자동으로 SSL 인증서 관리
- 브라우저 캐시 삭제 후 재시도

---

## 추가 자료

- [Cloudflare Tunnel 공식 문서](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)
- [Zero Trust Dashboard](https://one.dash.cloudflare.com/)
