@echo off
REM 로컬 네트워크에서도 접근 가능하도록 백엔드 실행
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
