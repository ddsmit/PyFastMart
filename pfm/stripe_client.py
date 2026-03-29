from typing import Optional, Any
import stripe
import stripe.checkout
from dataclasses import dataclass


@dataclass
class Product:
    id: str
    name: str
    description: str
    price: int
    currency: str
    image: Optional[str]
    active: bool

    @classmethod
    def from_stripe(cls, item: Any, price: Any) -> "Product":
        return cls(
            id=item.id,
            name=item.name,
            description=item.description or "",
            price=price.unit_amount or 0,
            currency=price.currency,
            image=item.images[0] if item.images else None,
            active=item.active,
        )


class StripeClient:
    def __init__(self, api_key: str):
        stripe.api_key = api_key

    def get_products(self) -> list[Product]:
        products = []
        for price in stripe.Price.list(limit=100, active=True):
            if price.type == "one_time":
                try:
                    product = stripe.Product.retrieve(price.product)
                    if product.active:
                        products.append(Product.from_stripe(product, price))
                except stripe.error.InvalidRequestError:
                    continue
        return products

    def get_product(self, product_id: str) -> Optional[Product]:
        try:
            price = stripe.Price.list(product=product_id, limit=1, active=True).data[0]
            product = stripe.Product.retrieve(product_id)
            return Product.from_stripe(product, price)
        except (stripe.error.InvalidRequestError, IndexError):
            return None

    def create_checkout_session(
        self,
        line_items: list[dict],
        success_url: str,
        cancel_url: str,
        metadata: Optional[dict] = None,
    ) -> Any:
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=line_items,
            mode="payment",
            success_url=success_url,
            cancel_url=cancel_url,
            metadata=metadata or {},
        )
        return session
