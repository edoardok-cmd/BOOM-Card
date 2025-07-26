#!/usr/bin/env python3
import os
import re

# List of pages that should remain static (no getServerSideProps)
STATIC_PAGES = [
    'src/pages/404.js',
    'src/pages/500.js',
    'src/pages/_error.js',
]

def remove_ssr_from_pages():
    """Remove getServerSideProps from specific pages"""
    
    for page_path in STATIC_PAGES:
        if os.path.exists(page_path):
            with open(page_path, 'r') as f:
                content = f.read()
            
            # Remove getServerSideProps
            content = re.sub(
                r'\n\n?// Force server-side rendering\nexport async function getServerSideProps\(\) \{\s*return \{\s*props: \{\},?\s*\}\s*\}',
                '', 
                content
            )
            
            with open(page_path, 'w') as f:
                f.write(content)
            
            print(f"✅ Removed getServerSideProps from {page_path}")

def main():
    print("🔧 Removing SSR from error pages...")
    remove_ssr_from_pages()
    print("\n✨ Done!")

if __name__ == "__main__":
    main()