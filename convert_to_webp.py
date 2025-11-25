#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Convert images to WebP format with compression
"""
from PIL import Image
import os
import sys
from pathlib import Path

# Fix Windows console encoding
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

# Paths
base_dir = Path(__file__).parent / "frontend" / "public" / "images"

# Image conversion settings
conversions = [
    # Gallery images - 80% quality
    {"path": base_dir / "landing" / "gallery-1.jpg", "quality": 80},
    {"path": base_dir / "landing" / "gallery-2.jpg", "quality": 80},

    # Tutorial images - 85% quality (needs clarity)
    {"path": base_dir / "tutorial" / "step1-design.png", "quality": 85},
    {"path": base_dir / "tutorial" / "step2-blender.png", "quality": 85},
    {"path": base_dir / "tutorial" / "step3-export.png", "quality": 85},
    {"path": base_dir / "tutorial" / "step4-slicer.png", "quality": 85},

    # Preset images - 70% quality + compression
    {"path": base_dir / "wifi.png", "quality": 70},
    {"path": base_dir / "insta.png", "quality": 70},
]

def convert_to_webp(input_path: Path, quality: int):
    """Convert image to WebP format"""
    if not input_path.exists():
        print(f"❌ File not found: {input_path}")
        return

    # Output path
    output_path = input_path.with_suffix('.webp')

    # Open and convert
    try:
        img = Image.open(input_path)

        # Convert RGBA to RGB if needed
        if img.mode == 'RGBA':
            # Create white background
            background = Image.new('RGB', img.size, (255, 255, 255))
            background.paste(img, mask=img.split()[3])  # Use alpha channel as mask
            img = background
        elif img.mode not in ['RGB', 'L']:
            img = img.convert('RGB')

        # Save as WebP
        img.save(output_path, 'WEBP', quality=quality, method=6)

        # Get file sizes
        original_size = input_path.stat().st_size / 1024
        new_size = output_path.stat().st_size / 1024
        reduction = (1 - new_size / original_size) * 100

        print(f"✅ {input_path.name} → {output_path.name}")
        print(f"   {original_size:.1f}KB → {new_size:.1f}KB ({reduction:.1f}% reduction)")

    except Exception as e:
        print(f"❌ Error converting {input_path.name}: {e}")

def main():
    print("Converting images to WebP format...\n")

    for item in conversions:
        convert_to_webp(item["path"], item["quality"])
        print()

    print("✅ Conversion complete!")

if __name__ == "__main__":
    main()
