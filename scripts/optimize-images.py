#!/usr/bin/env python3
"""
Optimize images by compressing and removing EXIF data.
"""

from PIL import Image
import os
import sys

def optimize_png(input_path, output_path=None, quality=85):
    """
    Optimize a PNG file by compressing and removing EXIF data.

    Args:
        input_path: Path to input PNG file
        output_path: Path to output file (if None, overwrites input)
        quality: Compression quality (0-100)
    """
    if output_path is None:
        output_path = input_path

    print(f"Optimizing {input_path}...")

    # Get original size
    original_size = os.path.getsize(input_path)

    # Open image
    img = Image.open(input_path)

    # Remove EXIF data by creating a new image with just the pixel data
    data = list(img.getdata())
    image_without_exif = Image.new(img.mode, img.size)
    image_without_exif.putdata(data)

    # Save with optimization
    image_without_exif.save(
        output_path,
        format='PNG',
        optimize=True,
        compress_level=9
    )

    # Get new size
    new_size = os.path.getsize(output_path)
    savings = original_size - new_size
    savings_percent = (savings / original_size) * 100

    print(f"  Original: {original_size:,} bytes")
    print(f"  Optimized: {new_size:,} bytes")
    print(f"  Saved: {savings:,} bytes ({savings_percent:.1f}%)")

    return new_size

def optimize_jpg(input_path, output_path=None, quality=85):
    """
    Optimize a JPG file by compressing and removing EXIF data.

    Args:
        input_path: Path to input JPG file
        output_path: Path to output file (if None, overwrites input)
        quality: JPEG quality (0-100)
    """
    if output_path is None:
        output_path = input_path

    print(f"Optimizing {input_path}...")

    # Get original size
    original_size = os.path.getsize(input_path)

    # Open image
    img = Image.open(input_path)

    # Convert RGBA to RGB if necessary (JPEG doesn't support transparency)
    if img.mode in ('RGBA', 'LA', 'P'):
        rgb_img = Image.new('RGB', img.size, (255, 255, 255))
        if img.mode == 'P':
            img = img.convert('RGBA')
        rgb_img.paste(img, mask=img.split()[-1] if img.mode in ('RGBA', 'LA') else None)
        img = rgb_img

    # Remove EXIF data by creating a new image with just the pixel data
    data = list(img.getdata())
    image_without_exif = Image.new(img.mode, img.size)
    image_without_exif.putdata(data)

    # Save with optimization
    image_without_exif.save(
        output_path,
        format='JPEG',
        quality=quality,
        optimize=True,
        progressive=True
    )

    # Get new size
    new_size = os.path.getsize(output_path)
    savings = original_size - new_size
    savings_percent = (savings / original_size) * 100

    print(f"  Original: {original_size:,} bytes")
    print(f"  Optimized: {new_size:,} bytes")
    print(f"  Saved: {savings:,} bytes ({savings_percent:.1f}%)")

    return new_size

def optimize_webp(input_path, output_path=None, quality=85):
    """
    Optimize a WebP file by recompressing and removing EXIF data.

    Args:
        input_path: Path to input WebP file
        output_path: Path to output file (if None, overwrites input)
        quality: WebP quality (0-100)
    """
    if output_path is None:
        output_path = input_path

    print(f"Optimizing {input_path}...")

    # Get original size
    original_size = os.path.getsize(input_path)

    # Open image
    img = Image.open(input_path)

    # Remove EXIF data by creating a new image with just the pixel data
    data = list(img.getdata())
    image_without_exif = Image.new(img.mode, img.size)
    image_without_exif.putdata(data)

    # Save with optimization
    image_without_exif.save(
        output_path,
        format='WEBP',
        quality=quality,
        method=6  # Slowest but best compression
    )

    # Get new size
    new_size = os.path.getsize(output_path)
    savings = original_size - new_size
    savings_percent = (savings / original_size) * 100

    print(f"  Original: {original_size:,} bytes")
    print(f"  Optimized: {new_size:,} bytes")
    print(f"  Saved: {savings:,} bytes ({savings_percent:.1f}%)")

    return new_size

def main():
    """Optimize all images in the project."""

    images_to_optimize = [
        ('src/assets/covers/fracture-engine.png', 'png'),
        ('public/covers/fracture-engine.png', 'png'),
        ('src/assets/covers/fracture-engine.webp', 'webp'),
        ('public/covers/fracture-engine.webp', 'webp'),
        ('public/cache-mcclure-og.jpg', 'jpg'),
    ]

    total_saved = 0

    for image_path, format_type in images_to_optimize:
        if not os.path.exists(image_path):
            print(f"Skipping {image_path} (not found)")
            continue

        original_size = os.path.getsize(image_path)

        if format_type == 'png':
            new_size = optimize_png(image_path)
        elif format_type == 'jpg':
            new_size = optimize_jpg(image_path, quality=90)
        elif format_type == 'webp':
            new_size = optimize_webp(image_path, quality=90)

        total_saved += (original_size - new_size)
        print()

    print(f"Total space saved: {total_saved:,} bytes ({total_saved / 1024:.1f} KB)")
    print("All images optimized successfully!")

if __name__ == '__main__':
    main()
