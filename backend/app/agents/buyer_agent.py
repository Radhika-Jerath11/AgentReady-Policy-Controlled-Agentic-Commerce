import re
import httpx
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.config import settings
from app.tools.product_tools import search_products, compare_products

class BuyerAgent:
    """
    Buyer Agent: Understands natural language request, extracts shopping parameters,
    searches catalog, and compares products.
    """
    def __init__(self, db: Session):
        self.db = db

    def extract_intent(self, prompt: str) -> Dict[str, Any]:
        prompt_lower = prompt.lower()

        # Check for budget matching ₹ or numbers
        max_price = None
        price_match = re.search(r'(?:under|below|less than|max|budget)?\s*₹?\s*(\d{1,3}(?:,\d{3})*|\d+)', prompt_lower)
        if price_match:
            try:
                val = price_match.group(1).replace(",", "")
                max_price = float(val)
                if max_price < 500: # avoid small numbers like delivery days
                    max_price = None
            except ValueError:
                pass

        # Delivery requirement matching
        delivery_days = None
        del_match = re.search(r'within\s*(\d+)\s*days?', prompt_lower)
        if del_match:
            try:
                delivery_days = int(del_match.group(1))
            except ValueError:
                pass

        # Category extraction
        category = "Running shoes"
        if "training" in prompt_lower or "gym" in prompt_lower:
            category = "Training shoes"
        elif "accessory" in prompt_lower or "accessories" in prompt_lower or "band" in prompt_lower or "rope" in prompt_lower:
            category = "Fitness accessories"

        return {
            "query": prompt,
            "category": category,
            "max_price": max_price if max_price else 5000.0,
            "max_delivery_days": delivery_days if delivery_days else 3,
            "purpose": "Daily running" if "daily" in prompt_lower or "running" in prompt_lower else "General fitness"
        }

    def search_and_compare(self, intent: Dict[str, Any]) -> Dict[str, Any]:
        products = search_products(
            db=self.db,
            category=intent.get("category"),
            max_price=intent.get("max_price"),
            max_delivery_days=intent.get("max_delivery_days")
        )

        if not products:
            # Fallback search without strict price limit
            products = search_products(db=self.db, category=intent.get("category"))

        product_ids = [p["id"] for p in products]
        compared = compare_products(db=self.db, product_ids=product_ids)

        selected_product = compared[0] if compared else None
        
        # Add reasoning explanation for selected product
        if selected_product:
            selected_product["recommendation_reason"] = (
                f"Selected {selected_product['name']} because it meets your {intent.get('category')} requirement "
                f"under ₹{intent.get('max_price', 5000):,.0f} with {selected_product['delivery_days']}-day delivery "
                f"and top rating ({selected_product['rating']}★)."
            )

        return {
            "intent": intent,
            "matching_products": compared,
            "selected_product": selected_product
        }
