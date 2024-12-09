from django.core.management.base import BaseCommand
from data.utils.stocks_utils import fetch_initial_stock_data

class Command(BaseCommand):
    help = "Fetch historical stock data for FAANG stocks and store it in the database."

    def handle(self, *args, **options):
        try:
            # Call the stock data fetching utility
            fetch_initial_stock_data()
            self.stdout.write(self.style.SUCCESS("Successfully updated stock data."))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"An error occurred while updating stock data: {str(e)}"))
