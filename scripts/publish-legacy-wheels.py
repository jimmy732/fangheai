"""Publish the six legacy wheel references at the approved tenfold prices."""

from __future__ import annotations

import json
from pathlib import Path


SITE_ROOT = Path(__file__).resolve().parents[1]
SEED = SITE_ROOT / "data" / "fbox-store.seed.json"
PRICES = {
    "fbox-axis-19": (2700, 3000),
    "fbox-velocity-18": (2300, 2500),
    "fbox-forge-20": (3000, 3400),
    "fbox-drift-18": (2160, 2400),
    "fbox-lumen-19": (2600, None),
    "fbox-track-17": (1980, None),
}


def main() -> None:
    data = json.loads(SEED.read_text(encoding="utf-8"))
    found = set()
    for product in data["products"]:
        product_id = product.get("id")
        if product_id not in PRICES:
            continue
        price, old_price = PRICES[product_id]
        product.update({
            "brand": "CIRUI",
            "price": price,
            "oldPrice": old_price,
            "price_mode": "fixed",
            "price_source": "catalog",
            "currency": "USD",
            "public_scope": True,
            "legacy_wheel": True,
            "custom_size": False,
            "size_note": "Listed size is a reference. Confirm exact fitment and availability in the inquiry.",
            "stock": 0,
            "deal": "Exact material, fitment and availability confirmed in the inquiry",
            "storefront_note": "Public performance wheel reference; construction and final specification are stated separately.",
        })
        found.add(product_id)
    if found != set(PRICES):
        raise ValueError(f"Missing legacy wheel records: {sorted(set(PRICES) - found)}")
    SEED.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Published {len(found)} legacy wheel references")


if __name__ == "__main__":
    main()
