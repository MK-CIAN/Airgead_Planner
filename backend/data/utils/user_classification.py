from decimal import Decimal
import numpy as np
import pandas as pd
from sklearn.neighbors import KNeighborsClassifier
from django.db.models import Sum
from data.models import MonthlyBudget, MonthlyBudgetItem, UserProfile

def get_user_data(user):
    budgets = MonthlyBudget.objects.filter(user=user)
    
    data = []
    for budget in budgets:
        income = MonthlyBudgetItem.objects.filter(budget=budget, transaction_type="income").aggregate(Sum("amount"))["amount__sum"] or Decimal("1")
        savings = MonthlyBudgetItem.objects.filter(budget=budget, transaction_type="savings").aggregate(Sum("amount"))["amount__sum"] or Decimal("0")
        expenses = MonthlyBudgetItem.objects.filter(budget=budget, transaction_type="expense").aggregate(Sum("amount"))["amount__sum"] or Decimal("0")
        debt = MonthlyBudgetItem.objects.filter(budget=budget, transaction_type="debt").aggregate(Sum("amount"))["amount__sum"] or Decimal("0")

        # Convert Decimal to float
        savings_rate = float(savings) / float(income)
        spending_rate = float(expenses) / float(income)
        debt_ratio = float(debt) / float(income)

        print(f"DEBUG: Budget for {user.username} -> Income: {income}, Savings: {savings}, Expenses: {expenses}, Debt: {debt}")  # 🚀 Print financial data
        print(f"DEBUG: Computed Ratios -> Savings Rate: {savings_rate:.2f}, Spending Rate: {spending_rate:.2f}, Debt Ratio: {debt_ratio:.2f}")  # 🚀 Print ratios

        data.append([savings_rate, spending_rate, debt_ratio])

    if not data:
        print(f"DEBUG: No budget data found for {user.username}")  # 🚀 Catch empty budgets
    
    return np.mean(data, axis=0) if data else np.array([0.1, 0.5, 0.1])  # ✅ Ensure default is "Balanced"


def train_knn_model():
    # Expanded training data with more variation
    train_data = np.array([
        [0.8, 0.1, 0.1],  # Saver (very high savings, low spending)
        [0.1, 0.9, 0.2],  # Spender (very high spending, low savings)
        [0.3, 0.4, 0.3],  # Balanced
        [0.7, 0.2, 0.1],  # Saver (slightly lower savings but still high)
        [0.2, 0.5, 0.2],  # Balanced (near center)
        [0.1, 0.7, 0.3],  # Spender (high spending, some debt)
    ])
    labels = ["SAVER", "SPENDER", "BALANCED", "SAVER", "BALANCED", "SPENDER"]

    print(f"DEBUG: Training Data -> {train_data}")  # 🚀 Print training dataset
    print(f"DEBUG: Training Labels -> {labels}")  # 🚀 Print labels

    knn = KNeighborsClassifier(n_neighbors=3)  # ✅ Change from 3 to 1
    knn.fit(train_data, labels)

    return knn


def classify_user(user):
    knn = train_knn_model()
    user_data = np.array(get_user_data(user)).reshape(1, -1)

    # If user data is all zeros or close to zero, return "No Classification"
    if np.all(user_data == 0) or np.all(user_data < 0.05):  # Adjust threshold if needed
        return "No Classification"

    print(f"DEBUG: User Data for {user.username} -> {user_data}")  # 🚀 Print user data before prediction

    category = knn.predict(user_data)[0]

    print(f"DEBUG: Predicted Category -> {category}")  # 🚀 Print predicted category

    profile, created = UserProfile.objects.get_or_create(user=user)
    profile.category = category
    profile.save()

    return category


