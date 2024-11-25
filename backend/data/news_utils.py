from .models import FinancialArticle
from decouple import config
import requests
import re
from datetime import datetime
from django.utils.timezone import make_aware

API_KEY = config("API_KEY")
BASE_URL = config("BASE_URL")
DEFAULT_COUNTRY = config("DEFAULT_COUNTRY")
DEFAULT_CATEGORY = config("DEFAULT_CATEGORY")
KEYWORD_QUERY = config("KEYWORD_QUERY")

MAIN_KEYWORDS = {"stock", "market", "investment", "finance", "economy", "health", "money", "insurance", "taxes", "credit"}

def fetch_and_store_financial_news():
    """
    Fetch financial news articles from the API and store them in the database.
    """
    # Parameters for the API request
    params = {
        "apikey": API_KEY,
        "q": KEYWORD_QUERY,
        "country": DEFAULT_COUNTRY,
        "category": DEFAULT_CATEGORY,
    }
 
    # Fetch news articles from the API
    try:
        response = requests.get(BASE_URL, params=params)
        response.raise_for_status()
        data = response.json()

        if data.get("status") != "success":
            raise ValueError("Failed to fetch news articles.")

        articles = data.get("results", [])
        for article in articles:
            pub_date = article.get("pubDate")
            if pub_date:
                try:
                    # Convert to timezone-aware datetime
                    pub_date = make_aware(datetime.strptime(pub_date, "%Y-%m-%d %H:%M:%S"))
                except ValueError:
                    pub_date = None  # Handle invalid date format gracefully

            # Limiting the length of the title, description, and source name
            title = (article.get("title") or "")[:500] 
            description = (article.get("description") or "")[:1000]
            source_name = (article.get("source_name") or "")[:255]

            # Extract keywords from title and description
            keywords = extract_keywords(title, description)
            # Store the article in the database
            FinancialArticle.objects.update_or_create(
                article_id=article.get("article_id"),
                defaults={
                    "title": title,
                    "link": article.get("link"),
                    "description": description,
                    "source_name": source_name,
                    "pub_date": pub_date,
                    "image_url": article.get("image_url"),
                    "keywords": keywords,
                },
            )
        return {"status": "success", "message": f"Successfully fetched and stored {len(articles)} articles."}

    except requests.exceptions.RequestException as e:
       return {"status": "error", "message": f"Error fetching news articles: {str(e)}"}


# Helper function to extract and prioritize keywords from the article title and description
def extract_keywords(title, description):
    """
    Extract and prioritize keywords from the article title and description using regex.
    """
    if not title and not description:
        return []

    # Combine title and description for keyword extraction
    combined_text = f"{title} {description}"

    # Tokenize and clean the combined text
    words = re.findall(r"\b\w+\b", combined_text.lower())
    stopwords = {"the", "is", "was", "for", "and", "to", "a", "of", "in", "on", "at", "with", "by", "as"}
    keywords = [word for word in words if word not in stopwords and len(word) > 3]

    # Splitting keywords into main and other keywords
    main_keywords = [word for word in keywords if word in MAIN_KEYWORDS]
    other_keywords = [word for word in keywords if word not in MAIN_KEYWORDS]

    # Prioritize main keywords and add up to 5 other keywords
    prioritized_keywords = main_keywords + other_keywords
    # Limit to top 5 keywords
    return prioritized_keywords[:5]  
