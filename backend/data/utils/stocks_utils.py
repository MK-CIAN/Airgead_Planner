import requests
import time
import logging
from datetime import datetime, timedelta
from django.utils.timezone import make_aware
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

# Define the cutoff date (last 5 years from today)
CUTOFF_DATE = make_aware(datetime.now() - timedelta(days=5 * 365))

def fetch_historical_stock_data():
    """
    Fetch and store the last 5 years of historical stock data using Alpha Vantage.
    """
    logger.info("Fetching historical stock data...")

    for ticker in STOCK_TICKERS:
        url = f"https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol={ticker}&outputsize=full&apikey={API_KEY}"
        response = requests.get(url)

        if response.status_code != 200:
            logger.error(f"API request failed for {ticker}: {response.status_code}")
            continue

        data = response.json()

        if "Time Series (Daily)" not in data:
            logger.error(f"No data available for {ticker}.")
            continue

        time_series = data["Time Series (Daily)"]
        for date, values in time_series.items():
            stock_date = make_aware(datetime.strptime(date, "%Y-%m-%d"))

            # ✅ Only store stock data from the last 5 years
            if stock_date >= CUTOFF_DATE:
                StockData.objects.update_or_create(
                    ticker=ticker,
                    date=stock_date,
                    defaults={
                        'open_price': float(values['1. open']),
                        'high_price': float(values['2. high']),
                        'low_price': float(values['3. low']),
                        'close_price': float(values['4. close']),
                        'adj_close_price': None,  # Handle missing field
                        'volume': int(values['5. volume']),
                    }
                )
        
        logger.info(f"Historical data fetched for {ticker}")
        time.sleep(12)  # Avoid hitting rate limits

    logger.info("Historical stock data update complete.")


def fetch_realtime_stock_data():
    """
    Fetch and store the most recent stock price using yfinance.
    Runs every 30 minutes and uses system time for timestamps.
    """
    logger.info("Fetching latest stock prices...")

    now = make_aware(datetime.now())  # Use system time for timestamp

    for ticker in STOCK_TICKERS:
        stock = yf.Ticker(ticker)
        current_price = stock.info.get("currentPrice", None)

        if current_price is None:
            logger.warning(f"No current price data for {ticker}. Market may be closed.")
            continue

        # ✅ Store the latest price with system time
        StockRealTimeData.objects.update_or_create(
            ticker=ticker,
            timestamp=now,  # Use real system time
            defaults={
                'open_price': current_price,  # Store the same price in open, high, low, close
                'high_price': current_price,
                'low_price': current_price,
                'close_price': current_price,
                'volume': stock.info.get("volume", 0),  # Handle missing volume
            }
        )

        logger.info(f"Saved real-time data for {ticker} at {now} - Price: {current_price}")

    logger.info("Real-time stock data update complete.")

