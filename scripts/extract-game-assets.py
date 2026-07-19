#!/usr/bin/env python3
"""Extract normalized game sprites from the ChatGPT concept sheets.

The city source image is a labeled layout sheet, not a uniform tileset.
This script crops the usable regions into named files so Phaser can render
deliberate sprites instead of repeating arbitrary strips from the sheet.
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
CITY_SOURCE = ROOT / "ChatGPT-cyberpunk-city-tileset-layout.png"
PLAYER_SOURCE = ROOT / "ChatGPT-pixel-art-developer.png"
OUT = ROOT / "public" / "assets" / "game"


@dataclass(frozen=True)
class Crop:
    name: str
    box: tuple[int, int, int, int]
    category: str


CITY_CROPS: tuple[Crop, ...] = (
    # Buildings. Boxes intentionally exclude the neon labels above each asset.
    Crop("server-farm", (18, 76, 312, 361), "buildings"),
    Crop("studio", (338, 75, 590, 361), "buildings"),
    Crop("lab", (600, 72, 875, 361), "buildings"),
    Crop("newspaper-hq", (910, 76, 1214, 361), "buildings"),
    Crop("office-tower", (45, 418, 279, 768), "buildings"),
    Crop("exchange", (331, 454, 590, 769), "buildings"),
    # Terrain and path material.
    Crop("grass-plain", (20, 840, 80, 900), "terrain"),
    Crop("grass-detail", (92, 840, 152, 900), "terrain"),
    Crop("grass-flower", (164, 840, 224, 900), "terrain"),
    Crop("road-vertical", (634, 430, 709, 636), "terrain"),
    Crop("road-vertical-alt", (720, 430, 797, 636), "terrain"),
    Crop("road-intersection", (808, 430, 958, 638), "terrain"),
    Crop("road-horizontal", (970, 430, 1115, 524), "terrain"),
    Crop("road-corner", (1118, 430, 1218, 638), "terrain"),
    Crop("sidewalk-plain", (306, 840, 366, 900), "terrain"),
    Crop("sidewalk-detail", (377, 840, 437, 900), "terrain"),
    Crop("sidewalk-corner", (448, 840, 608, 900), "terrain"),
    # Props.
    Crop("tree-small", (20, 914, 80, 974), "props"),
    Crop("tree-round", (92, 914, 152, 974), "props"),
    Crop("tree-pine", (164, 914, 224, 974), "props"),
    Crop("lamp", (492, 1044, 520, 1114), "props"),
    Crop("sign", (582, 1044, 620, 1114), "props"),
)


PLAYER_FRAME_BOXES: tuple[tuple[int, int, int, int], ...] = (
    # Row 0: down.
    (96, 128, 288, 390),
    (310, 128, 502, 390),
    (524, 128, 716, 390),
    (738, 128, 930, 390),
    # Row 1: up.
    (96, 520, 288, 742),
    (310, 520, 502, 742),
    (524, 520, 716, 742),
    (738, 520, 930, 742),
    # Row 2: left.
    (96, 872, 288, 1094),
    (310, 872, 502, 1094),
    (524, 872, 716, 1094),
    (738, 872, 930, 1094),
    # Row 3: right.
    (96, 1238, 288, 1458),
    (310, 1238, 502, 1458),
    (524, 1238, 716, 1458),
    (738, 1238, 930, 1458),
)


def ensure_dirs() -> None:
    for category in ("buildings", "terrain", "props", "player"):
        (OUT / category).mkdir(parents=True, exist_ok=True)


def crop_city_assets() -> None:
    source = Image.open(CITY_SOURCE).convert("RGBA")
    for crop in CITY_CROPS:
        asset = source.crop(crop.box)
        asset.save(OUT / crop.category / f"{crop.name}.png")


def build_player_sheet() -> None:
    source = Image.open(PLAYER_SOURCE).convert("RGBA")
    frame_width = 96
    frame_height = 144
    sheet = Image.new("RGBA", (frame_width * 4, frame_height * 4), (0, 0, 0, 0))

    for index, box in enumerate(PLAYER_FRAME_BOXES):
        frame = source.crop(box)
        frame.thumbnail((frame_width, frame_height), Image.Resampling.LANCZOS)
        x = (index % 4) * frame_width + (frame_width - frame.width) // 2
        y = (index // 4) * frame_height + (frame_height - frame.height)
        sheet.alpha_composite(frame, (x, y))

    sheet.save(OUT / "player" / "developer-sheet.png")


def main() -> None:
    ensure_dirs()
    crop_city_assets()
    build_player_sheet()
    print(f"Extracted game assets to {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
