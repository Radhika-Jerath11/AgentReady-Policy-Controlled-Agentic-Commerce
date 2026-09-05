from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.tools.product_tools import search_products, get_product_details

router = APIRouter(prefix="/products", tags=["Products"])

@router.get("")
def list_products(
    category: Optional[str] = None,
    max_price: Optional[float] = None,
    query: Optional[str] = None,
    db: Session = Depends(get_db)
):
    return search_products(db, query=query, category=category, max_price=max_price)

@router.get("/{product_id}")
def get_product(product_id: str, db: Session = Depends(get_db)):
    product = get_product_details(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product
