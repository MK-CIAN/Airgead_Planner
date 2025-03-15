from celery import shared_task

@shared_task
def update_historical_stock_data():
    """Celery task to update historical stock data"""
    from data.utils.stocks_utils import fetch_historical_stock_data
    fetch_historical_stock_data()

@shared_task
def update_realtime_stock_data():
    """Celery task to update real-time stock data"""
    from data.utils.stocks_utils import fetch_realtime_stock_data
    fetch_realtime_stock_data()
