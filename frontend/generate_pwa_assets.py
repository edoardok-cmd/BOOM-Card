#!/usr/bin/env python3
"""
Generate PWA (Progressive Web App) assets for BOOM Card
Creates all the icons and screenshots referenced in manifest.json
"""

import os
from PIL import Image, ImageDraw, ImageFont
import json

def create_icon(size, output_path, color="#FF6B35", text="B"):
    """Create a simple icon with the BOOM Card brand color"""
    # Create a new image with transparent background
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Draw a rounded rectangle background
    margin = size // 8
    draw.rounded_rectangle(
        [margin, margin, size - margin, size - margin],
        radius=size // 6,
        fill=color
    )
    
    # Try to add text (fallback if font not available)
    try:
        font_size = size // 2
        try:
            font = ImageFont.truetype("Arial", font_size)
        except:
            font = ImageFont.load_default()
        
        # Calculate text position to center it
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        x = (size - text_width) // 2
        y = (size - text_height) // 2
        
        draw.text((x, y), text, fill="white", font=font)
    except:
        # Fallback: just draw a circle
        center = size // 2
        radius = size // 4
        draw.ellipse(
            [center - radius, center - radius, center + radius, center + radius],
            fill="white"
        )
    
    # Save the image
    img.save(output_path, "PNG")
    print(f"Created icon: {output_path}")

def create_screenshot(width, height, output_path, title="BOOM Card"):
    """Create a simple screenshot placeholder"""
    img = Image.new('RGB', (width, height), "#f8f9fa")
    draw = ImageDraw.Draw(img)
    
    # Draw header
    header_height = height // 10
    draw.rectangle([0, 0, width, header_height], fill="#FF6B35")
    
    # Add title text
    try:
        font_size = header_height // 3
        try:
            font = ImageFont.truetype("Arial", font_size)
        except:
            font = ImageFont.load_default()
        
        bbox = draw.textbbox((0, 0), title, font=font)
        text_width = bbox[2] - bbox[0]
        x = (width - text_width) // 2
        y = (header_height - (bbox[3] - bbox[1])) // 2
        
        draw.text((x, y), title, fill="white", font=font)
    except:
        pass
    
    # Draw some content placeholders
    content_y = header_height + 40
    for i in range(3):
        card_height = height // 8
        card_margin = 20
        draw.rectangle(
            [card_margin, content_y + i * (card_height + 20), 
             width - card_margin, content_y + i * (card_height + 20) + card_height],
            fill="#ffffff",
            outline="#e9ecef",
            width=2
        )
    
    img.save(output_path, "PNG")
    print(f"Created screenshot: {output_path}")

def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    public_dir = os.path.join(base_dir, "public")
    icons_dir = os.path.join(public_dir, "icons")
    shortcuts_dir = os.path.join(icons_dir, "shortcuts") 
    screenshots_dir = os.path.join(public_dir, "screenshots")
    
    # Ensure directories exist
    os.makedirs(icons_dir, exist_ok=True)
    os.makedirs(shortcuts_dir, exist_ok=True)
    os.makedirs(screenshots_dir, exist_ok=True)
    
    print("🎨 Generating PWA assets for BOOM Card...")
    
    # Create main app icons
    icon_sizes = [72, 96, 128, 144, 152, 192, 384, 512]
    for size in icon_sizes:
        create_icon(size, os.path.join(icons_dir, f"icon-{size}x{size}.png"))
    
    # Create shortcut icons
    shortcuts = [
        ("restaurants", "🍽️", "#FF6B35"),
        ("hotels", "🏨", "#28a745"), 
        ("entertainment", "🎭", "#6f42c1"),
        ("card", "💳", "#007bff")
    ]
    
    for name, emoji, color in shortcuts:
        create_icon(96, os.path.join(shortcuts_dir, f"{name}-96x96.png"), color, emoji)
    
    # Create screenshots
    screenshots = [
        ("home-mobile.png", 1080, 1920, "BOOM Card - Home"),
        ("partners-mobile.png", 1080, 1920, "BOOM Card - Partners"),
        ("discount-mobile.png", 1080, 1920, "BOOM Card - Discounts"),
        ("home-desktop.png", 1920, 1080, "BOOM Card - Home"),
        ("partners-desktop.png", 1920, 1080, "BOOM Card - Partners")
    ]
    
    for filename, width, height, title in screenshots:
        create_screenshot(width, height, os.path.join(screenshots_dir, filename), title)
    
    print("✅ All PWA assets generated successfully!")
    print("\n📋 Generated:")
    print(f"   • {len(icon_sizes)} main app icons")
    print(f"   • {len(shortcuts)} shortcut icons")
    print(f"   • {len(screenshots)} screenshots")
    
    print("\n🚀 Your PWA is now ready with all required assets!")

if __name__ == "__main__":
    main()