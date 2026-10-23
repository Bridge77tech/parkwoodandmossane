#!/usr/bin/env python3
"""Generate the web images in public/assets from the full-size originals in assets-src.

Each image is written as AVIF and WebP at the widths the site needs, and the
three large backgrounds also get a "mobile" crop: exactly the region the mobile
design shows (plus a small margin), at the original's full resolution.

Run from the project root:  python3 scripts/optimize_images.py
"""

import json
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets-src"
OUT = ROOT / "public" / "assets"

MANIFEST = ROOT / "src" / "images.generated.json"

AVIF_QUALITY = 72
WEBP_QUALITY = 86

# image name → the widths actually written (for srcset), saved for the site code.
manifest: dict[str, list[int]] = {}


def save(image: Image.Image, dest: Path) -> None:
    """Write `dest`.avif and `dest`.webp, keeping transparency only if it's used."""
    if image.mode == "RGBA" and image.getchannel("A").getextrema() == (255, 255):
        image = image.convert("RGB")
    dest.parent.mkdir(parents=True, exist_ok=True)
    image.save(dest.with_suffix(".avif"), quality=AVIF_QUALITY, speed=4)
    image.save(dest.with_suffix(".webp"), quality=WEBP_QUALITY, method=6)


def widths(src: str, dest: str, sizes: list[int]) -> None:
    """Save `src` resized to each width in `sizes` (never upscaled), as dest-<width>."""
    image = Image.open(SRC / src)
    written = sorted({min(width, image.width) for width in sizes})
    for width in written:
        height = round(image.height * width / image.width)
        resized = image if width == image.width else image.resize((width, height), Image.LANCZOS)
        save(resized, OUT / f"{dest}-{width}")
    manifest[dest] = written


def crop(src: str, dest: str, box: tuple[int, int, int, int]) -> None:
    """Save the region `box` (left, top, right, bottom, in source pixels) at full resolution."""
    save(Image.open(SRC / src).crop(box), OUT / dest)


# Hero sky: shown 2000 CSS px wide at every desktop size. On phones only a slice
# shows; the crop matches the mobile .hero__sky rules in styles.css.
widths("hero/hero-sky.png", "hero/hero-sky", [2000])
crop("hero/hero-sky.png", "hero/hero-sky-mobile", (254, 0, 1094, 1100))

# Statue (transparent): ~352 CSS px wide, up to ~2.5× on large screens.
widths("hero/scales-of-justice.png", "hero/scales-of-justice", [700, 1333])

# Service card photos: 150–200 CSS px cards. service-1 is also the Practice
# background, ~1366 CSS px wide on desktop, with its own mobile crop.
for n in range(1, 8):
    widths(f"services/service-{n}.png", f"services/service-{n}", [400, 800, 1400])
crop("services/service-1.png", "services/practice-mobile", (552, 625, 1400, 1793))

# Screen 3 clouds: full-width background on desktop; on phones only a slice shows.
widths("international/clouds-bg.jpg", "international/clouds", [1400, 2000, 2731])
crop("international/clouds-bg.jpg", "international/clouds-mobile", (1191, 1607, 2205, 3017))

# Flags: ~23 CSS px circles showing about half the source image.
for flag in sorted((SRC / "flags").glob("*.png")):
    widths(f"flags/{flag.name}", f"flags/{flag.stem}", [256])

MANIFEST.write_text(json.dumps(manifest, indent=2) + "\n")

total = sum(f.stat().st_size for f in OUT.rglob("*") if f.suffix in {".avif", ".webp"})
print(f"Wrote {len(list(OUT.rglob('*.avif')))} AVIF + {len(list(OUT.rglob('*.webp')))} WebP files, {total / 1e6:.1f} MB total")
