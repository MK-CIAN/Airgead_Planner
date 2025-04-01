from ..models import FinancialArticle, UserArticleInteraction, UserInterest, UserProfile
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

# Expanded MAIN_KEYWORDS with related financial terms
MAIN_KEYWORDS = {
    "credit": {"credit", "credit card", "card debt", "credit score"},
    "student": {"student", "student loans", "education debt"},
    "car": {"car", "auto loan", "vehicle finance", "loans"},
    "medical": {"medical", "medical debt", "healthcare costs"},
    "loans": {"loans", "borrowing", "lending", "personal loan", "mortgage"},
    "debt": {"debt", "liability", "financial obligation"},
    "emergency": {"emergency", "rainy day fund", "safety net"},
    "home": {"home", "real estate", "mortgage", "property"},
    "retirement": {"retirement", "pension", "401k", "superannuation"},
    "holiday": {"holiday", "vacation", "travel fund"},
    "investments": {"investments", "portfolio", "dividends", "stocks"},
    "savings": {"savings", "saving account", "budgeting"},
    "goal": {"goal", "financial planning", "wealth accumulation"},
    "bike": {"bike", "cycling", "bicycle finance", "bicycle"},
    "transit": {"transit", "public transport", "bus", "train", "metro"},
    "walk": {"walk", "walking", "pedestrian"},
    "rideshare": {"rideshare", "uber", "lyft", "carpool"},
    "stocks": {"stocks", "shares", "equities", "stock market"},
    "bonds": {"bonds", "fixed income", "treasury bonds"},
    "crypto": {"crypto", "cryptocurrency", "bitcoin", "ethereum"},
    "realestate": {"realestate", "real estate", "property investment"},
    "etfs": {"etfs", "exchange traded funds", "index funds"},
    "index": {"index", "market index", "s&p 500", "nasdaq"},
    "investment": {"investment", "capital allocation", "financial growth"},
    "finance": {"finance", "financial markets", "economic policy"},
    "market": {"market", "economic trends", "business cycle"},
    "money": {"money", "cash", "currency"},
    "taxes": {"taxes", "taxation", "income tax", "capital gains tax"},
    "economy": {"economy", "macroeconomics", "global finance", "trade", "tariff", "tariff"},
    "insurance": {"insurance", "coverage", "risk management"},
    "budget": {"budget", "financial planning", "expense tracking"},
    "wealth": {"wealth", "asset management", "net worth"},
    "income": {"income", "earnings", "salary", "passive income"},
}

CATEGORY_KEYWORDS = {
    "SAVER": "investment OR stocks OR bonds OR retirement",
    "SPENDER": "budgeting OR expenses OR debt OR finance",
    "BALANCED": "economy OR money OR finance OR wealth"
}

def fetch_and_store_financial_news():
    params = {
        "apikey": API_KEY,
        "q": KEYWORD_QUERY,
        "country": DEFAULT_COUNTRY,
        "category": DEFAULT_CATEGORY,
    }
    try:
        response = requests.get(BASE_URL, params=params)
        response.raise_for_status()
        data = response.json()
        if data.get("status") != "success":
            raise ValueError("Failed to fetch news articles.")
        # Storing fetched articles in the database
        articles = data.get("results", [])
        for article in articles:
            pub_date = article.get("pubDate")
            if pub_date:
                try:
                    pub_date = make_aware(datetime.strptime(pub_date, "%Y-%m-%d %H:%M:%S"))
                except ValueError:
                    pub_date = None  # Skip invalid dates
            title = (article.get("title") or "")[:500] 
            description = (article.get("description") or "")[:1000]
            source_name = (article.get("source_name") or "")[:255]
            keywords = extract_keywords(title, description)
            # Storing article in the database
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

def extract_keywords(title, description):
    # Extract keywords that matchh the predefined financial terms in MAIN_KEYWORDS.
    if not title and not description:
        return []

    combined_text = f"{title} {description}".lower()
    words = re.findall(r"\b\w+\b", combined_text)

    extracted_keywords = set()

    for main_key, subwords in MAIN_KEYWORDS.items():
        if any(word in subwords for word in words):
            extracted_keywords.add(main_key)

    return list(extracted_keywords)[:5]  

def expand_user_interests(user_interests):
    #Expanding user interests to include related financial terms.
    expanded_keywords = set()
    
    for interest in user_interests:
        if interest in MAIN_KEYWORDS:
            expanded_keywords.update(MAIN_KEYWORDS[interest])  
        expanded_keywords.add(interest)  

    return expanded_keywords

def recommend_articles(user):
    user_profile = UserProfile.objects.get(user=user)
    user_interests = UserInterest.objects.filter(user=user).first()
    if not user_interests:
        return []
    # Expanding user interests to include related financial terms
    user_keywords = expand_user_interests(set(user_interests.interests))
    articles = FinancialArticle.objects.all()
    recommendations = []

    print(f"\nDEBUG: Expanded User Interests for {user.username}: {user_keywords}\n")

    for article in articles:
        article_keywords = set(article.keywords or [])
        similarity = jaccard_similarity(user_keywords, article_keywords)

        # Applying category weighting
        category_weight = 0
        if user_profile.category == "SPENDER" and any(k in {"budget", "saving", "debt"} for k in article_keywords):
            category_weight = 0.3
        elif user_profile.category == "SAVER" and any(k in {"investment", "retirement", "wealth"} for k in article_keywords):
            category_weight = 0.3
        elif user_profile.category == "BALANCED":
            category_weight = 0.1

        # Final Score Calculation
        final_score = round(similarity * 0.5 + category_weight * 0.3, 3)

        recommendations.append({
            "article_id": article.id, 
            "score": final_score, 
            "keyword_count": len(article.keywords or []), 
            "has_keywords": len(article.keywords or []) > 0  
        })
    # Sorting by highest score first, then by keyword count
    recommendations.sort(key=lambda x: (x["score"], x["keyword_count"]), reverse=True)

    # Only returning articles with scores > 0 first
    filtered_articles = [rec for rec in recommendations if rec["score"] > 0]

    # If at least 5 high-scoring articles exist, return them
    if len(filtered_articles) >= 5:
        return [rec["article_id"] for rec in filtered_articles[:5]]
    
    keyword_ranked_articles = sorted(
        [rec for rec in recommendations if rec["has_keywords"] and rec not in filtered_articles],  
        key=lambda rec: rec["keyword_count"], 
        reverse=True
    )
    # Filling up to 5 articles, prioritizing scores first, then adding keyword-rich ones
    combined_recommendations = filtered_articles + keyword_ranked_articles[:(5 - len(filtered_articles))]
    return [rec["article_id"] for rec in combined_recommendations]


def jaccard_similarity(set1, set2):
    if not set1 or not set2:
        return 0  

    intersection = len(set1 & set2)
    union = len(set1 | set2)

    if intersection > 0:
        return round((intersection / union) + (0.1 * intersection), 3)
    return 0
