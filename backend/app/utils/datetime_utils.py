from datetime import datetime, timezone, timedelta

# 한국 시간대 (KST = UTC+9)
KST = timezone(timedelta(hours=9))


def get_kst_now() -> datetime:
    """
    현재 한국 시간을 반환합니다 (timezone 정보 제거).

    SQLite는 naive datetime을 사용하므로 timezone 정보를 제거합니다.

    Returns:
        datetime: 현재 KST 시각 (timezone-naive)
    """
    return datetime.now(KST).replace(tzinfo=None)
