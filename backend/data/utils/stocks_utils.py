import yfinance as yf
from datetime import datetime, timedelta
from ..models import StockData

FAANG_TICKERS = ['META', 'AMZN', 'AAPL', 'NFLX', 'GOOGL']

def fetch_initial_stock_data():
    """Fetch 5 years of data for each FAANG stock and store it."""
    end_date = datetime.now()
    start_date = end_date - timedelta(days=5 * 365)  # 5 years

    for ticker in FAANG_TICKERS:
        stock_data = yf.download(ticker, start=start_date, end=end_date)

        for date, row in stock_data.iterrows():
            # Convert each row's data to float to ensure compatibility with Django DecimalField
            StockData.objects.update_or_create(
                ticker=ticker,
                date=date,
                defaults={
                    'open_price': float(row['Open'].iloc[0]) if row['Open'] is not None else None,
                    'high_price': float(row['High'].iloc[0]) if row['High'] is not None else None,
                    'low_price': float(row['Low'].iloc[0]) if row['Low'] is not None else None,
                    'close_price': float(row['Close'].iloc[0]) if row['Close'] is not None else None,
                    'adj_close_price': float(row['Adj Close'].iloc[0]) if row['Adj Close'] is not None else None,
                    'volume': int(row['Volume'].iloc[0]) if row['Volume'] is not None else None,
                }
            )
