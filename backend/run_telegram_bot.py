"""
텔레그램 봇 실행 스크립트

사용법:
    python run_telegram_bot.py

또는 백그라운드 실행:
    nohup python run_telegram_bot.py &

종료:
    Ctrl+C 또는 프로세스 종료
"""
import sys
import os

# 현재 디렉토리를 Python 경로에 추가
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.services.telegram_bot import run_bot

if __name__ == "__main__":
    print("=" * 50)
    print("텔레그램 봇 서버 시작")
    print("=" * 50)
    print()
    print("이 봇은 주문 상태를 텔레그램에서 변경할 수 있게 합니다.")
    print("종료하려면 Ctrl+C를 누르세요.")
    print()

    try:
        run_bot()
    except KeyboardInterrupt:
        print("\n\n봇 서버가 종료되었습니다.")
    except Exception as e:
        print(f"\n\n오류 발생: {e}")
        import traceback
        traceback.print_exc()
