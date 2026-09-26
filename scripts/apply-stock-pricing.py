"""Apply the reviewed local stock-wheel price tiers to both catalog seeds."""

from __future__ import annotations

import json
from pathlib import Path

from stock_pricing import VEHICLE_STOCK_PRICES, inventory_stock_price


SITE_ROOT = Path(__file__).resolve().parents[1]


def update_seed(path: Path, price_for_product) -> list[dict]:
    data = json.loads(path.read_text(encoding="utf-8"))
    products = data["products"]
    for product in products:
        product["price"] = price_for_product(product)
        product["price_mode"] = "fixed"
        product["price_source"] = "catalog"
        product["currency"] = "USD"
        product["oldPrice"] = None
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return products


def main() -> None:
    vehicle_path = SITE_ROOT / "data" / "cerui-stock-products.seed.json"
    inventory_path = SITE_ROOT / "data" / "cerui-stock-inventory.seed.json"
    vehicle_products = update_seed(vehicle_path, lambda product: VEHICLE_STOCK_PRICES[product["part"]])
    if {product["part"] for product in vehicle_products} != set(VEHICLE_STOCK_PRICES):
        raise ValueError("Vehicle stock price table does not match the seed catalog")
    inventory_products = update_seed(inventory_path, lambda product: inventory_stock_price(product["stock_group"], product["stock_variants"]))
    print(f"Priced {len(vehicle_products)} vehicle collections and {len(inventory_products)} inventory styles")


if __name__ == "__main__":
    main()
