import requests
import time
import logging
import random
from datetime import datetime, timedelta, timezone
from django.utils.timezone import make_aware, is_aware
from django.core.cache import cache
from decouple import config
from ..models import StockData, StockRealTimeData
from django_q.tasks import async_task, schedule

# Set up logging
logger = logging.getLogger(__name__)

def get_yfinance():
    import yfinance as yf  # Import only when needed
    return yf


# Expanded stock list (FAANG + Tesla, Microsoft, Nvidia)
STOCK_TICKERS = ['META', 'AMZN', 'AAPL', 'NFLX', 'GOOGL', 'TSLA', 'MSFT', 'NVDA']
CRYPTO_TICKERS = ['BTC-USD', 'ETH-USD', 'DOGE-USD']
BATCH_SIZE = 5

# Fetch and store the last 5 years of historical stock & cryptocurrency data
def fetch_historical_stock_data():
    # Fetch and store the last 5 years of historical stock & cryptocurrency data using yfinance.
    yf = get_yfinance()
    logger.info("Fetching historical stock & crypto data...")
    all_tickers = STOCK_TICKERS + CRYPTO_TICKERS 

    for ticker in all_tickers:
        stock = yf.Ticker(ticker)
        # Fetching last 5 years of daily historical data
        data = stock.history(period="5y", interval="1d")
        if data.empty:
            logger.warning(f"No historical data available for {ticker}.")
            continue
        
        # Processing and storing each day's stock/crypto data
        for date, row in data.iterrows():
            stock_date = date.to_pydatetime()

            if is_aware(stock_date):
                stock_date = stock_date.astimezone(timezone.utc).replace(tzinfo=None)
                
            StockData.objects.update_or_create(
                ticker=ticker,
                date=stock_date,
                defaults={                        
                    'open_price': float(row['Open']),
                    'high_price': float(row['High']),
                    'low_price': float(row['Low']),
                    'close_price': float(row['Close']),
                    'adj_close_price': float(row.get('Adj Close', row['Close'])),  # Use Adj Close if available
                    'volume': int(row['Volume']),
                }
            )
        logger.info(f"Historical data fetched for {ticker}")
    logger.info("Historical stock & crypto data update complete.")

# Fetch daily close prices for stocks and cryptocurrencies
def fetch_daily_close_prices():
    yf = get_yfinance()
    logger.info("Fetching daily closing stock & crypto prices...")
    all_tickers = STOCK_TICKERS + CRYPTO_TICKERS
    today = datetime.utcnow().date()

    for ticker in all_tickers:
        try:
            stock = yf.Ticker(ticker)
            data = stock.history(period="2d", interval="1d")  # fetch last 2 days just in case
            if data.empty or 'Close' not in data.columns:
                logger.warning(f"No daily close data available for {ticker}")
                continue
            
            latest_date, row = data.iloc[-1].name.to_pydatetime(), data.iloc[-1]
            stock_date = latest_date.replace(tzinfo=None) if is_aware(latest_date) else latest_date

            # Only save today's data
            if stock_date.date() == today:
                StockData.objects.update_or_create(
                    ticker=ticker,
                    date=stock_date,
                    defaults={                        
                        'open_price': float(row['Open']),
                        'high_price': float(row['High']),
                        'low_price': float(row['Low']),
                        'close_price': float(row['Close']),
                        'adj_close_price': float(row.get('Adj Close', row['Close'])),
                        'volume': int(row['Volume']),
                    }
                )
                logger.info(f"Stored daily close for {ticker} at {stock_date}")
        except Exception as e:
            logger.error(f"Failed to fetch/store daily close price for {ticker}: {e}")
            time.sleep(5)  # small delay before next try

    logger.info("Daily close price update complete.")



def fetch_realtime_stock_data():
    yf = get_yfinance()
    logger.info("Fetching latest stock & crypto prices...")
    now = make_aware(datetime.now())

    # Fetching stock prices in batches
    for i in range(0, len(STOCK_TICKERS), BATCH_SIZE):
        batch_tickers = STOCK_TICKERS[i:i + BATCH_SIZE]
        # Skipping request if all batch tickers are cached
        if all(cache.get(f"stock_price_{ticker}") for ticker in batch_tickers):
            logger.info(f"Using cached data for batch: {batch_tickers}")
            continue  
        try:
            for ticker in batch_tickers:
                cache_key = f"stock_price_{ticker}"
                cached_price = cache.get(cache_key)
                if cached_price:
                    logger.info(f"Using cached data for {ticker}: {cached_price}")
                    continue  # Skip API call if data exists in cache

                stock = yf.Ticker(ticker)
                current_price = stock.info.get("currentPrice", None)
                if current_price is None:
                    logger.warning(f"No current price data for {ticker}. Market may be closed.")
                    continue
                # Store in database
                StockRealTimeData.objects.update_or_create(
                    ticker=ticker,
                    timestamp=now,
                    defaults={
                        'open_price': current_price,
                        'high_price': current_price,
                        'low_price': current_price,
                        'close_price': current_price,
                        'volume': stock.info.get("volume", 0),
                    }
                )
                # Cache stock price for 30 minutes
                cache.set(cache_key, current_price, timeout=1800)
                logger.info(f"Saved real-time stock data for {ticker} at {now} - Price: {current_price}")
                # Introducing a small random delay between requests
                time.sleep(random.uniform(2, 5))
        except Exception as e:
            logger.error(f"Error fetching stock data: {e}")
            time.sleep(10)  # Short wait before retrying the next batch

    # Fetching cryptocurrency prices
    for ticker in CRYPTO_TICKERS:
        cache_key = f"crypto_price_{ticker}"
        cached_price = cache.get(cache_key)

        if cached_price:
            logger.info(f"Using cached data for {ticker}: {cached_price}")
            continue  # Skip API call if data exists in cache

        try:
            crypto = yf.Ticker(ticker)
            data = crypto.history(period="1d", interval="1m")  # Get last 1-minute price

            if data.empty:
                logger.warning(f"No recent price data for {ticker}.")
                continue

            latest = data.iloc[-1]  # Get last available price
            current_price = float(latest["Close"])

            StockRealTimeData.objects.update_or_create(
                ticker=ticker,
                timestamp=now,
                defaults={
                    'open_price': float(latest["Open"]),
                    'high_price': float(latest["High"]),
                    'low_price': float(latest["Low"]),
                    'close_price': current_price,
                    'volume': int(latest["Volume"]),
                }
            )

            # Cache crypto price for 30 minutes
            cache.set(cache_key, current_price, timeout=1800)

            logger.info(f"Saved real-time crypto data for {ticker} at {now} - Price: {current_price}")

            # Introduce a small delay to prevent API bursts
            time.sleep(random.uniform(2, 5))

        except Exception as e:
            logger.error(f"Error fetching crypto data for {ticker}: {e}")
            time.sleep(10)  # Short wait before retrying

    logger.info("Real-time stock & crypto data update complete.")

