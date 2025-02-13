import requests
import time
import logging
from datetime import datetime, timedelta, timezone
from django.utils.timezone import make_aware, is_aware
from decouple import config
from ..models import StockData, StockRealTimeData
from django_q.tasks import async_task, schedule
import yfinance as yf

# Set up logging
logger = logging.getLogger(__name__)

# Your Alpha Vantage API key (stored in .env)
API_KEY = config("STOCK_API_KEY")

# Expanded stock list (FAANG + Tesla, Microsoft, Nvidia)
STOCK_TICKERS = ['META', 'AMZN', 'AAPL', 'NFLX', 'GOOGL', 'TSLA', 'MSFT', 'NVDA']
CRYPTO_TICKERS = ['BTC-USD', 'ETH-USD', 'DOGE-USD']

# Define the cutoff date (last 5 years from today)
#CUTOFF_DATE = make_aware(datetime.now() - timedelta(days=5 * 365))

def fetch_historical_stock_data():
    """
    Fetch and store the last 5 years of historical stock & cryptocurrency data using yfinance.
    """
    logger.info("Fetching historical stock & crypto data...")

    all_tickers = STOCK_TICKERS + CRYPTO_TICKERS  # ✅ Combine stock and crypto tickers

    for ticker in all_tickers:
        stock = yf.Ticker(ticker)

        # ✅ Fetch last 5 years of daily historical data
        data = stock.history(period="5y", interval="1d")

        if data.empty:
            logger.warning(f"No historical data available for {ticker}.")
            continue

        # ✅ Process and store each day's stock/crypto data
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


def fetch_realtime_stock_data():
    """
    Fetch and store the most recent stock & crypto prices using yfinance.
    Runs every 30 minutes and uses system time for timestamps.
    """
    logger.info("Fetching latest stock & crypto prices...")

    now = make_aware(datetime.now())  # Use system time for timestamp

    # Fetch stock prices
    for ticker in STOCK_TICKERS:
        stock = yf.Ticker(ticker)
        current_price = stock.info.get("currentPrice", None)

        if current_price is None:
            logger.warning(f"No current price data for {ticker}. Market may be closed.")
            continue

        StockRealTimeData.objects.update_or_create(
            ticker=ticker,
            timestamp=now,  # Use real system time
            defaults={
                'open_price': current_price,
                'high_price': current_price,
                'low_price': current_price,
                'close_price': current_price,
                'volume': stock.info.get("volume", 0),  # Handle missing volume
            }
        )

        logger.info(f"Saved real-time stock data for {ticker} at {now} - Price: {current_price}")

    # Fetch cryptocurrency prices
    for ticker in CRYPTO_TICKERS:
        crypto = yf.Ticker(ticker)
        data = crypto.history(period="1d", interval="1m")  # Get last 1-minute price

        if data.empty:
            logger.warning(f"No recent price data for {ticker}.")
            continue

        latest = data.iloc[-1]  # Get last available price

        StockRealTimeData.objects.update_or_create(
            ticker=ticker,
            timestamp=now,
            defaults={
                'open_price': latest["Open"],
                'high_price': latest["High"],
                'low_price': latest["Low"],
                'close_price': latest["Close"],
                'volume': latest["Volume"],
            }
        )

        logger.info(f"Saved real-time crypto data for {ticker} at {now} - Price: {current_price}")

    logger.info("Real-time stock & crypto data update complete.")

