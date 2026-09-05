from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.product import Product

def search_products(
    db: Session,
    query: Optional[str] = None,
    category: Optional[str] = None,
    max_price: Optional[float] = None,
    max_delivery_days: Optional[int] = None
) -> List[Dict[str, Any]]:
    """
    Search product catalog based on filter criteria.
    """
    q = db.query(Product)
    if category:
        q = q.filter(Product.category.ilike(f"%{category}%"))
    if max_price is not None:
        q = q.filter(Product.price <= max_price)
    if max_delivery_days is not None:
        q = q.filter(Product.delivery_days <= max_delivery_days)
    if query:
        q = q.filter(
            (Product.name.ilike(f"%{query}%")) | 
            (Product.description.ilike(f"%{query}%")) |
            (Product.category.ilike(f"%{query}%"))
        )

    products = q.all()
    results = []
    for p in products:
        results.append({
            "id": p.id,
            "merchant_id": p.merchant_id,
            "name": p.name,
            "description": p.description,
            "category": p.category,
            "price": p.price,
            "stock": p.stock,
            "rating": p.rating,
            "delivery_days": p.delivery_days,
            "specifications": p.specifications
        })
    return results

def get_product_details(db: Session, product_id: str) -> Optional[Dict[str, Any]]:
    p = db.query(Product).filter(Product.id == product_id).first()
    if not p:
        return None
    return {
        "id": p.id,
        "merchant_id": p.merchant_id,
        "name": p.name,
        "description": p.description,
        "category": p.category,
        "price": p.price,
        "stock": p.stock,
        "rating": p.rating,
        "delivery_days": p.delivery_days,
        "specifications": p.specifications
    }

def compare_products(db: Session, product_ids: List[str]) -> List[Dict[str, Any]]:
    products = db.query(Product).filter(Product.id.in_(product_ids)).all()
    comparison = []
    for p in products:
        comparison.append({
            "id": p.id,
            "name": p.name,
            "price": p.price,
            "rating": p.rating,
            "delivery_days": p.delivery_days,
            "stock": p.stock
        })
    # Sort by price ascending, rating descending
    comparison.sort(key=lambda x: (x["price"], -x["rating"]))
    return comparison
