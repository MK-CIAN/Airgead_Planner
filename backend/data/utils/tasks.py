from celery import shared_task

@shared_task
def update_historical_stock_data():
    """Celery task to update historical stock data"""
    from data.utils.stocks_utils import fetch_historical_stock_data
    fetch_historical_stock_data()
    
@shared_task
def update_daily_close_prices():
    """Celery task to update daily closing stock prices"""
    from data.utils.stocks_utils import fetch_daily_close_prices
    fetch_daily_close_prices()

@shared_task
def update_realtime_stock_data():
    """Celery task to update real-time stock data"""
    from data.utils.stocks_utils import fetch_realtime_stock_data
    fetch_realtime_stock_data()

@shared_task
def update_financial_news():
    """Celery task to update financial news articles"""
    from data.utils.news_utils import fetch_and_store_financial_news
    fetch_and_store_financial_news()