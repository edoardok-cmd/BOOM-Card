#!/usr/bin/env python3
"""
Create social media images for BOOM Card PWA
"""

import os
from PIL import Image, ImageDraw, ImageFont

def create_social_image(width, height, output_path, title="BOOM Card", subtitle="Save More, Experience More"):
    """Create social media sharing image"""
    img = Image.new('RGB', (width, height), "#FF6B35")
    draw = ImageDraw.Draw(img)
    
    # Create gradient effect (simple approach)
    for y in range(height):
        alpha = int(255 * (1 - y / height * 0.3))
        color = (255, 107, 53, alpha)  # Orange with fade
        draw.rectangle([0, y, width, y + 1], fill=color[:3])
    
    # Add title
    try:
        title_font_size = width // 15
        subtitle_font_size = width // 25
        
        try:
            title_font = ImageFont.truetype("Arial", title_font_size)
            subtitle_font = ImageFont.truetype("Arial", subtitle_font_size)
        except:
            title_font = ImageFont.load_default()
            subtitle_font = ImageFont.load_default()
        
        # Title
        title_bbox = draw.textbbox((0, 0), title, font=title_font)
        title_width = title_bbox[2] - title_bbox[0]
        title_height = title_bbox[3] - title_bbox[1]
        title_x = (width - title_width) // 2
        title_y = height // 3
        
        draw.text((title_x, title_y), title, fill="white", font=title_font)
        
        # Subtitle
        subtitle_bbox = draw.textbbox((0, 0), subtitle, font=subtitle_font)
        subtitle_width = subtitle_bbox[2] - subtitle_bbox[0]
        subtitle_x = (width - subtitle_width) // 2
        subtitle_y = title_y + title_height + 20
        
        draw.text((subtitle_x, subtitle_y), subtitle, fill="white", font=subtitle_font)
        
    except Exception as e:
        print(f"Note: Font rendering error (using fallback): {e}")
        # Fallback: just draw a large logo circle
        center_x, center_y = width // 2, height // 2
        radius = min(width, height) // 6
        draw.ellipse(
            [center_x - radius, center_y - radius, center_x + radius, center_y + radius],
            fill="white"
        )
    
    img.save(output_path, "JPEG", quality=90)
    print(f"Created social image: {output_path}")

def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    public_dir = os.path.join(base_dir, "public")
    
    print("📱 Creating social media images for BOOM Card...")
    
    # Create Open Graph image (1200x630 recommended)
    create_social_image(1200, 630, os.path.join(public_dir, "og-image.jpg"))
    
    # Create Twitter image (1200x600 recommended)  
    create_social_image(1200, 600, os.path.join(public_dir, "twitter-image.jpg"))
    
    print("✅ Social media images created successfully!")

if __name__ == "__main__":
    main()