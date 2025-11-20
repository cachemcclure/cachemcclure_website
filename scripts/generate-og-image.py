#!/usr/bin/env python3
"""
Generate default Open Graph image for Cache McClure website.
Creates a 1200x630px image with site branding.
"""

from PIL import Image, ImageDraw, ImageFont
import os

# Image dimensions (Open Graph standard)
WIDTH = 1200
HEIGHT = 630

# Color scheme (matching the website's sci-fi aesthetic)
BACKGROUND_COLOR = (15, 23, 42)  # Dark slate (tailwind slate-900)
PRIMARY_COLOR = (148, 163, 184)  # Light slate (tailwind slate-400)
ACCENT_COLOR = (99, 102, 241)  # Indigo (tailwind indigo-500)
TEXT_COLOR = (241, 245, 249)  # Very light slate (tailwind slate-100)

def create_og_image():
    """Create the Open Graph image."""
    # Create image with dark background
    img = Image.new('RGB', (WIDTH, HEIGHT), BACKGROUND_COLOR)
    draw = ImageDraw.Draw(img)

    # Try to use system fonts, fall back to default
    try:
        # Try to find a modern sans-serif font
        font_paths = [
            '/System/Library/Fonts/Supplemental/Arial Bold.ttf',  # macOS
            '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',  # Linux
            'C:\\Windows\\Fonts\\arialbd.ttf',  # Windows
        ]

        title_font = None
        subtitle_font = None

        for font_path in font_paths:
            if os.path.exists(font_path):
                title_font = ImageFont.truetype(font_path, 80)
                subtitle_font = ImageFont.truetype(font_path, 40)
                break

        if not title_font:
            # Fallback to default font
            title_font = ImageFont.load_default()
            subtitle_font = ImageFont.load_default()

    except Exception:
        # If all else fails, use default
        title_font = ImageFont.load_default()
        subtitle_font = ImageFont.load_default()

    # Add decorative elements (sci-fi aesthetic)
    # Draw accent lines
    line_y = HEIGHT // 2 - 120
    draw.rectangle([100, line_y, 1100, line_y + 4], fill=ACCENT_COLOR)

    line_y = HEIGHT // 2 + 120
    draw.rectangle([100, line_y, 1100, line_y + 4], fill=ACCENT_COLOR)

    # Add corner accents
    corner_size = 40
    corner_thickness = 4

    # Top-left corner
    draw.rectangle([80, 80, 80 + corner_size, 80 + corner_thickness], fill=ACCENT_COLOR)
    draw.rectangle([80, 80, 80 + corner_thickness, 80 + corner_size], fill=ACCENT_COLOR)

    # Top-right corner
    draw.rectangle([WIDTH - 80 - corner_size, 80, WIDTH - 80, 80 + corner_thickness], fill=ACCENT_COLOR)
    draw.rectangle([WIDTH - 80 - corner_thickness, 80, WIDTH - 80, 80 + corner_size], fill=ACCENT_COLOR)

    # Bottom-left corner
    draw.rectangle([80, HEIGHT - 80 - corner_thickness, 80 + corner_size, HEIGHT - 80], fill=ACCENT_COLOR)
    draw.rectangle([80, HEIGHT - 80 - corner_size, 80 + corner_thickness, HEIGHT - 80], fill=ACCENT_COLOR)

    # Bottom-right corner
    draw.rectangle([WIDTH - 80 - corner_size, HEIGHT - 80 - corner_thickness, WIDTH - 80, HEIGHT - 80], fill=ACCENT_COLOR)
    draw.rectangle([WIDTH - 80 - corner_thickness, HEIGHT - 80 - corner_size, WIDTH - 80, HEIGHT - 80], fill=ACCENT_COLOR)

    # Add text
    title = "CACHE McCLURE"
    subtitle = "Science Fiction Author"

    # Calculate text positions (centered)
    title_bbox = draw.textbbox((0, 0), title, font=title_font)
    title_width = title_bbox[2] - title_bbox[0]
    title_x = (WIDTH - title_width) // 2
    title_y = HEIGHT // 2 - 50

    subtitle_bbox = draw.textbbox((0, 0), subtitle, font=subtitle_font)
    subtitle_width = subtitle_bbox[2] - subtitle_bbox[0]
    subtitle_x = (WIDTH - subtitle_width) // 2
    subtitle_y = HEIGHT // 2 + 20

    # Draw text
    draw.text((title_x, title_y), title, font=title_font, fill=TEXT_COLOR)
    draw.text((subtitle_x, subtitle_y), subtitle, font=subtitle_font, fill=PRIMARY_COLOR)

    # Save image
    output_path = os.path.join(
        os.path.dirname(os.path.dirname(__file__)),
        'public',
        'cache-mcclure-og.jpg'
    )

    # Save as high-quality JPEG
    img.save(output_path, 'JPEG', quality=90, optimize=True)

    print(f"✓ Created Open Graph image: {output_path}")
    print(f"  Dimensions: {WIDTH}x{HEIGHT}px")

    # Check file size
    file_size = os.path.getsize(output_path)
    file_size_kb = file_size / 1024
    print(f"  File size: {file_size_kb:.1f}KB")

    if file_size_kb > 300:
        print(f"  ⚠ Warning: File size exceeds recommended 300KB")
    else:
        print(f"  ✓ File size is within recommended limits")

if __name__ == '__main__':
    try:
        create_og_image()
    except ImportError:
        print("Error: PIL/Pillow is not installed.")
        print("Install it with: pip3 install Pillow")
        exit(1)
    except Exception as e:
        print(f"Error creating Open Graph image: {e}")
        exit(1)
