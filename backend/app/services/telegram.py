"""텔레그램 알림 서비스"""
import logging
from telegram import Bot, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.error import TelegramError
from app.config import settings

logger = logging.getLogger(__name__)


async def send_order_notification(
    order_uuid: str,
    customer_name: str,
    customer_phone: str,
    customer_address: str,
    customer_postal_code: str,
    stand_name: str,
    qr_url: str,
    price: float
):
    """
    주문 생성 시 텔레그램으로 알림 전송

    Args:
        order_uuid: 주문 고유 번호
        customer_name: 고객 이름
        customer_phone: 고객 전화번호
        customer_address: 배송 주소
        customer_postal_code: 우편번호
        stand_name: 거치대 이름
        qr_url: QR 코드 URL
        price: 주문 금액
    """
    if not settings.telegram_bot_token or not settings.telegram_chat_id:
        logger.warning("Telegram bot token or chat ID not configured. Skipping notification.")
        return

    try:
        logger.info(f"Sending Telegram notification for order {order_uuid}")
        bot = Bot(token=settings.telegram_bot_token)

        # 메시지 포맷
        message = f"""
🔔 <b>새 주문 알림</b>

📦 <b>주문번호:</b> <code>{order_uuid}</code>

👤 <b>고객 정보</b>
• 이름: {customer_name}
• 전화번호: {customer_phone}
• 우편번호: {customer_postal_code}
• 주소: {customer_address}

🛒 <b>주문 내용</b>
• 거치대: {stand_name}
• QR URL: {qr_url}
• 금액: {price:,.0f}원

⚠️ 입금 확인 후 상태를 변경해주세요.
"""

        # 인라인 키보드 버튼 생성 (입금 확인, 취소만)
        keyboard = [
            [
                InlineKeyboardButton("💰 입금 확인", callback_data=f"paid:{order_uuid}"),
                InlineKeyboardButton("❌ 취소", callback_data=f"failed:{order_uuid}"),
            ]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)

        await bot.send_message(
            chat_id=settings.telegram_chat_id,
            text=message,
            parse_mode='HTML',
            reply_markup=reply_markup
        )
        logger.info(f"Telegram notification sent successfully for order {order_uuid}")

    except TelegramError as e:
        logger.error(f"Failed to send Telegram notification: {e}")
    except Exception as e:
        logger.error(f"Unexpected error sending Telegram notification: {e}", exc_info=True)


