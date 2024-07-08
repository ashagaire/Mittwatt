from datetime import datetime, timedelta


def truncate_to_midnight(dt: datetime) -> datetime:
    dt = dt + timedelta(hours=1)
    return dt.replace(minute=0, second=0, microsecond=0)