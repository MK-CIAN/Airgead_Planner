from django.core.management.base import BaseCommand
from data.news_utils import fetch_and_store_financial_news

# Command to fetch financial news articles and store them in the database
class Command(BaseCommand):
    help = "Fetch financial news articles and store them in the database."

    def handle(self, *args, **options):
        result = fetch_and_store_financial_news()
        if result:  # Check if the result is not None
            if result['status'] == "success":
                self.stdout.write(self.style.SUCCESS(f"Status: {result['status']} - {result['message']}"))
            else:
                self.stdout.write(self.style.ERROR(f"Status: {result['status']} - {result['message']}"))
        else:
            self.stdout.write(self.style.ERROR("Unknown error occurred during fetching news."))
