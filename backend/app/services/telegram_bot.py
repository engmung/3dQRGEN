"""텔레그램 봇 서버 - 콜백 쿼리 처리"""
import asyncio
import logging
from telegram import Update
from telegram.ext import Application, CallbackQueryHandler, ContextTypes
from app.config import settings
from app.database import SessionLocal
from app.models.order import Order

logger = logging.getLogger(__name__)


async def handle_callback_query(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """
    인라인 키보드 버튼 클릭 처리

    callback_data 형식: "{status}:{order_uuid}"
    예: "paid:12345-67890", "failed:12345-67890"
    """
    query = update.callback_query
    await query.answer()

    logger.info(f"Received callback query: {query.data}")

    # callback_data 파싱
    try:
        status, order_uuid = query.data.split(":", 1)
    except ValueError:
        logger.error(f"Invalid callback data format: {query.data}")
        await query.edit_message_text(text="❌ 잘못된 요청입니다.")
        return

    # 유효한 상태 확인 (paid, failed만 허용)
    valid_statuses = ["paid", "failed"]
    if status not in valid_statuses:
        logger.warning(f"Invalid status: {status}")
        await query.edit_message_text(text="❌ 잘못된 상태 값입니다.")
        return

    # DB 세션 생성
    db = SessionLocal()

    try:
        # 주문 조회
        order = db.query(Order).filter(Order.order_uuid == order_uuid).first()
        if not order:
            logger.error(f"Order not found: {order_uuid}")
            await query.edit_message_text(text=f"❌ 주문을 찾을 수 없습니다.\n주문번호: {order_uuid}")
            return

        # 상태 업데이트
        old_status = order.status
        order.status = status
        db.commit()
        logger.info(f"Order {order_uuid} status updated from {old_status} to {status}")

        # 상태 텍스트
        status_text = {
            "pending": "입금 대기",
            "paid": "입금 완료",
            "completed": "제작 완료",
            "failed": "취소됨"
        }

        # 메시지 업데이트
        updated_message = f"""
✅ <b>상태가 변경되었습니다</b>

📦 <b>주문번호:</b> <code>{order_uuid}</code>

🔄 <b>상태 변경</b>
• 이전: {status_text.get(old_status, old_status)}
• 현재: {status_text.get(status, status)}

👤 <b>고객 정보</b>
• 이름: {order.customer_name}
• 전화번호: {order.customer_phone}
• 우편번호: {order.customer_postal_code}
• 주소: {order.customer_address}

🛒 <b>주문 내용</b>
• 거치대: {order.stand_name}
• QR URL: {order.qr_url}
• 금액: {order.price:,.0f}원
"""

        await query.edit_message_text(
            text=updated_message,
            parse_mode='HTML'
        )

    except Exception as e:
        logger.error(f"Failed to update order status: {e}", exc_info=True)
        await query.edit_message_text(text=f"❌ 상태 업데이트 실패: {str(e)}")

    finally:
        db.close()


async def start_bot():
    """봇 시작 (폴링 방식)"""
    if not settings.telegram_bot_token:
        logger.warning("Telegram bot token not configured. Bot server not started.")
        return

    logger.info("Starting Telegram bot server...")

    try:
        # Application 생성
        application = Application.builder().token(settings.telegram_bot_token).build()

        # 콜백 쿼리 핸들러 등록
        application.add_handler(CallbackQueryHandler(handle_callback_query))

        # 봇 시작 (폴링 방식)
        await application.initialize()
        await application.start()
        await application.updater.start_polling()

        logger.info("Telegram bot is now running and listening for updates")

        # 봇이 계속 실행되도록 대기
        while True:
            await asyncio.sleep(1)

    except Exception as e:
        logger.error(f"Telegram bot error: {e}", exc_info=True)
        raise


def run_bot():
    """동기 함수에서 봇 실행"""
    asyncio.run(start_bot())
