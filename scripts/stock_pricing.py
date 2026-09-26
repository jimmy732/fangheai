"""Catalog prices for CIRUI's local stock-wheel collection, in USD.

These are product-level prices. Exact inventory, fitment, shipping, and final
payment are still confirmed in the product inquiry.
"""

from __future__ import annotations

import re


VEHICLE_STOCK_PRICES = {
    "CR-STOCK-001": 2200,  # Audi
    "CR-STOCK-002": 2200,  # BMW
    "CR-STOCK-003": 2100,  # BMW 5x120
    "CR-STOCK-004": 2300,  # BMW 5x112
    "CR-STOCK-005": 2500,  # Porsche
    "CR-STOCK-006": 2500,  # Porsche 718
    "CR-STOCK-007": 2500,  # Porsche 911
    "CR-STOCK-008": 2500,  # Porsche Cayenne
    "CR-STOCK-009": 2500,  # Porsche Panamera
    "CR-STOCK-010": 2500,  # Porsche Macan
    "CR-STOCK-011": 2500,  # Mercedes-Benz
    "CR-STOCK-012": 2500,  # Mercedes-Benz G-Class
    "CR-STOCK-013": 2500,  # Mercedes-Benz A/B/C/S-Class
    "CR-STOCK-014": 1600,  # Buick
    "CR-STOCK-015": 2900,  # Bentley
    "CR-STOCK-016": 1500,  # GAC Trumpchi
    "CR-STOCK-017": 1600,  # Volkswagen
    "CR-STOCK-018": 1600,  # Toyota
    "CR-STOCK-019": 1900,  # Land Cruiser Prado
    "CR-STOCK-020": 1900,  # Alphard
    "CR-STOCK-021": 1500,  # Hiace
    "CR-STOCK-022": 1900,  # Custom designs
    "CR-STOCK-023": 2000,  # Hongqi
    "CR-STOCK-024": 1800,  # Zeekr
    "CR-STOCK-025": 2300,  # Jaguar
    "CR-STOCK-026": 2100,  # Cadillac
    "CR-STOCK-027": 2900,  # Rolls-Royce
    "CR-STOCK-028": 2100,  # Lexus
    "CR-STOCK-029": 1800,  # Li Auto
    "CR-STOCK-030": 2000,  # Lincoln
    "CR-STOCK-031": 2300,  # Land Rover
    "CR-STOCK-032": 2200,  # Evoque / Discovery / Velar
    "CR-STOCK-033": 2500,  # Range Rover / Defender
    "CR-STOCK-034": 2600,  # New Range Rover
    "CR-STOCK-035": 2200,  # Alfa Romeo
    "CR-STOCK-036": 2500,  # Maserati
    "CR-STOCK-037": 1800,  # Tank
    "CR-STOCK-038": 1900,  # Tesla
    "CR-STOCK-039": 1900,  # Nissan Patrol
    "CR-STOCK-040": 1800,  # NIO
    "CR-STOCK-041": 1700,  # AITO
    "CR-STOCK-042": 1700,  # Xiaomi
    "CR-STOCK-043": 2300,  # BBS style collection
}

PREMIUM_FINISH_TERMS = (
    "brushed", "polish", "chrome", "machined", "拉丝", "抛", "车边", "镂空"
)


def inventory_stock_price(group: str, variants: list[dict]) -> int:
    """Set one displayed price per photographed stock style."""
    diameters = []
    for variant in variants:
        match = re.match(r"\s*(\d{2})", str(variant.get("size") or ""))
        if match:
            diameters.append(int(match.group(1)))
    if not diameters:
        raise ValueError("A stock style has no readable diameter")
    diameter = max(diameters)
    finish = " ".join(str(variant.get("color") or "") for variant in variants).lower()
    premium_finish = any(term in finish for term in PREMIUM_FINISH_TERMS)

    if group == "bbs":
        base = 1900 if diameter <= 18 else 2100 if diameter == 19 else 2300 if diameter == 20 else 2500
        return min(2500, base + (100 if premium_finish else 0))
    if group == "aftermarket":
        base = 1500 if diameter <= 17 else 1600 if diameter == 18 else 1800 if diameter == 19 else 2000 if diameter == 20 else 2200 if diameter == 21 else 2400 if diameter == 22 else 2500
        return min(2500, base + (100 if premium_finish else 0))
    raise ValueError(f"Unknown stock inventory group: {group}")
