"""Import the BBS + aftermarket stock worksheet into the public stock catalog.

The source workbook is read only. Only rows with a positive recorded total are
published, grouped by the worksheet's embedded reference photo.
"""

from __future__ import annotations

import argparse
import json
import re
import zipfile
from datetime import datetime
from pathlib import Path
from xml.etree import ElementTree

from openpyxl import load_workbook

from stock_pricing import inventory_stock_price


SITE_ROOT = Path(__file__).resolve().parents[1]
SHEET_NAME = "BBS+改装"
IMAGE_ID = re.compile(r"ID_[A-Z0-9]+")
DRAWING_NS = "http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing"
OFFICE_NS = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
ART_NS = "http://schemas.openxmlformats.org/drawingml/2006/main"


def cell_text(value: object) -> str:
    return str(value).strip() if value is not None else ""


def quantity(value: object) -> int:
    try:
        number = float(value)
    except (TypeError, ValueError):
        return 0
    return int(number) if number > 0 and number.is_integer() else 0


def image_targets(archive: zipfile.ZipFile) -> dict[str, str]:
    images = ElementTree.fromstring(archive.read("xl/cellimages.xml"))
    relations = ElementTree.fromstring(archive.read("xl/_rels/cellimages.xml.rels"))
    targets = {relation.attrib["Id"]: relation.attrib["Target"] for relation in relations}
    mapped: dict[str, str] = {}
    for image in images:
        properties = image.find(f".//{{{DRAWING_NS}}}cNvPr")
        blip = image.find(f".//{{{ART_NS}}}blip")
        if properties is None or blip is None:
            continue
        relation_id = blip.attrib.get(f"{{{OFFICE_NS}}}embed", "")
        target = targets.get(relation_id)
        if target:
            mapped[properties.attrib["name"]] = f"xl/{target}"
    return mapped


def stock_groups(workbook_path: Path) -> list[dict]:
    workbook = load_workbook(workbook_path, read_only=True, data_only=True)
    try:
        sheet = workbook[SHEET_NAME]
        groups: list[dict] = []
        current: dict | None = None
        section = "bbs"
        for row_number, row in enumerate(sheet.iter_rows(min_row=3, values_only=True), start=3):
            first = cell_text(row[0])
            if first.startswith("改装款"):
                section = "aftermarket"
                current = None
                continue
            match = IMAGE_ID.search(first)
            if match:
                current = {"image_id": match.group(), "section": section, "rows": [], "start_row": row_number}
                groups.append(current)
            item_no = cell_text(row[1])
            recorded_quantity = quantity(row[14])
            if not item_no or not recorded_quantity:
                continue
            if current is None:
                raise ValueError(f"Stock row {row_number} has no preceding reference photo")
            current["rows"].append({
                "source_row": row_number,
                "item_no": item_no,
                "size": cell_text(row[2]),
                "pcd": cell_text(row[3]),
                "et": cell_text(row[4]),
                "cb": cell_text(row[5]),
                "color": cell_text(row[6]),
                "recorded_quantity": recorded_quantity,
                "load_rating": cell_text(row[15]),
            })
        return [group for group in groups if group["rows"]]
    finally:
        workbook.close()


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("workbook", type=Path)
    args = parser.parse_args()
    workbook_path = args.workbook.resolve()
    groups = stock_groups(workbook_path)
    if not groups:
        raise ValueError("No positive-stock BBS + aftermarket image groups were found")

    image_dir = SITE_ROOT / "assets" / "products" / "stock-inventory"
    image_dir.mkdir(parents=True, exist_ok=True)
    source_modified = datetime.fromtimestamp(workbook_path.stat().st_mtime).date().isoformat()
    products: list[dict] = []
    with zipfile.ZipFile(workbook_path) as archive:
        images = image_targets(archive)
        for index, group in enumerate(groups, start=1):
            image_id = group["image_id"]
            archive_path = images.get(image_id)
            if not archive_path:
                raise ValueError(f"Embedded image {image_id} is missing from the workbook")
            extension = Path(archive_path).suffix.lower()
            asset_name = f"{image_id[3:].lower()}{extension}"
            (image_dir / asset_name).write_bytes(archive.read(archive_path))
            image = f"products/stock-inventory/{asset_name}"
            rows = group["rows"]
            models = list(dict.fromkeys(row["item_no"] for row in rows))
            sizes = list(dict.fromkeys(row["size"] for row in rows if row["size"]))
            primary = models[0]
            if primary.upper() == "BBS":
                display_name = "BBS Section Stock Wheel"
                chinese_name = "BBS 分组现货轮毂"
            else:
                display_name = f"{primary} Stock Wheel"
                chinese_name = f"{primary} 现货轮毂"
            group_name = "BBS worksheet section" if group["section"] == "bbs" else "Aftermarket worksheet section"
            ratings = list(dict.fromkeys(row["load_rating"] for row in rows if row["load_rating"]))
            products.append({
                "id": f"cirui-inventory-{group['section']}-{image_id[3:].lower()}",
                "category": "Wheels",
                "brand": "CIRUI",
                "name": display_name,
                "catalog_display_name": display_name,
                "localized_names": {"en": display_name, "zh-CN": chinese_name},
                "meta": f"{group_name} · Model codes: {', '.join(models)}",
                "custom_size": False,
                "size_note": f"Recorded stock sizes: {', '.join(sizes)}. Confirm the selected specification and availability with CIRUI.",
                "price": inventory_stock_price(group["section"], rows),
                "price_mode": "fixed",
                "price_source": "catalog",
                "currency": "USD",
                "oldPrice": None,
                "finish": "Listed finishes",
                "image": image,
                "image_original": image,
                "image_cutout": False,
                "images": [{"id": "image-1", "url": image, "original_url": image, "alt": display_name, "cutout": False}],
                "badge": "Stock inventory",
                "deal": f"Inventory workbook last modified {source_modified}; confirm current availability before ordering",
                "color": "Listed finishes",
                "part": primary,
                "stock": sum(row["recorded_quantity"] for row in rows),
                "sort": 600 + index,
                "status": "published",
                "public_scope": True,
                "minimum_quantity": 4,
                "translation_profile": "catalog-item",
                "visualizer_enabled": False,
                "stock_collection": True,
                "stock_group": group["section"],
                "stock_inventory": True,
                "stock_snapshot_date": source_modified,
                "stock_variants": rows,
                "source_sheet": SHEET_NAME,
                "source_image_id": image_id,
                "construction": "unknown",
                "design_family": "stock-inventory",
                "spoke_style": "varied",
                "applications": ["street", "stock"],
                "classification_status": "needs-confirmation",
                "classification_note": "Construction and exact vehicle fitment are confirmed for the selected stock specification.",
                "load_rating_note": ratings[0] if len(ratings) == 1 else "Confirm for selected specification",
                "ddp_regions": ["Europe", "North America"],
                "ddp_quote_basis": "Destination country and postcode",
                "lead_time_note": "Confirm for selected inventory and delivery destination",
            })

    output_path = SITE_ROOT / "data" / "cerui-stock-inventory.seed.json"
    output_path.write_text(json.dumps({"products": products}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Imported {len(products)} pictured stock styles and {sum(len(product['stock_variants']) for product in products)} stocked specifications from {SHEET_NAME}.")
    print(f"BBS styles: {sum(product['stock_group'] == 'bbs' for product in products)}; aftermarket styles: {sum(product['stock_group'] == 'aftermarket' for product in products)}.")


if __name__ == "__main__":
    main()
