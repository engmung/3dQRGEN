# Frontend Dockerfile - React Build + Nginx
FROM node:20-alpine AS builder

# 작업 디렉토리 설정
WORKDIR /app

# package.json과 package-lock.json 복사
COPY package*.json ./

# 의존성 설치
RUN npm ci

# 빌드 타임 환경변수 선언
ARG VITE_CLERK_PUBLISHABLE_KEY
ARG VITE_API_BASE_URL
ARG VITE_DEV_MODE=false

# 환경변수를 빌드 프로세스에 전달
ENV VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_DEV_MODE=$VITE_DEV_MODE

# 소스 코드 복사
COPY . .

# 프로덕션 빌드
RUN npm run build

# Nginx를 사용한 프로덕션 스테이지
FROM nginx:alpine

# 빌드된 파일을 Nginx html 디렉토리로 복사
COPY --from=builder /app/dist /usr/share/nginx/html

# Nginx 설정 파일 복사
COPY nginx.conf /etc/nginx/nginx.conf

# 포트 노출
EXPOSE 80

# Nginx 실행
CMD ["nginx", "-g", "daemon off;"]
