#!/usr/bin/env python3
import os
import re

# Script to restore visual quality of BOOM Card while fixing Next.js build errors

def fix_document_imports():
    """Remove any incorrect document imports from page files"""
    pages_dir = 'src/pages'
    
    if os.path.exists(pages_dir):
        for root, dirs, files in os.walk(pages_dir):
            for file in files:
                if file.endswith('.js') or file.endswith('.jsx'):
                    file_path = os.path.join(root, file)
                    
                    # Skip _document.js as it's allowed to have these imports
                    if file == '_document.js':
                        continue
                    
                    with open(file_path, 'r') as f:
                        content = f.read()
                    
                    # Remove any document-related imports from regular pages
                    original_content = content
                    content = re.sub(r'import\s+.*from\s+[\'"]next/document[\'"].*\n?', '', content)
                    content = re.sub(r'import\s+\{[^}]*Document[^}]*\}\s+from\s+[\'"]next/document[\'"].*\n?', '', content)
                    content = re.sub(r'import\s+\{[^}]*Html[^}]*\}\s+from\s+[\'"]next/document[\'"].*\n?', '', content)
                    content = re.sub(r'import\s+\{[^}]*Head[^}]*\}\s+from\s+[\'"]next/document[\'"].*\n?', '', content)
                    content = re.sub(r'import\s+\{[^}]*Main[^}]*\}\s+from\s+[\'"]next/document[\'"].*\n?', '', content)
                    content = re.sub(r'import\s+\{[^}]*NextScript[^}]*\}\s+from\s+[\'"]next/document[\'"].*\n?', '', content)
                    
                    if content != original_content:
                        with open(file_path, 'w') as f:
                            f.write(content)
                        print(f"✅ Fixed document imports in {file_path}")

def update_video_component():
    """Update VideoBackground component for better quality"""
    video_bg_path = 'src/components/VideoBackground.js'
    
    if os.path.exists(video_bg_path):
        with open(video_bg_path, 'r') as f:
            content = f.read()
        
        # Add higher quality video sources
        content = re.sub(
            r'(sources:\s*\[)[^\]]*\]',
            '''sources: [
      'https://cdn.pixabay.com/vimeo/328940142/sunset-24354.mp4?width=1920&hash=premium',
      'https://cdn.coverr.co/videos/coverr-aerial-view-of-city-at-night-1080p.mp4',
      '/videos/premium-bg.mp4'
    ]''',
            content,
            flags=re.DOTALL
        )
        
        with open(video_bg_path, 'w') as f:
            f.write(content)
        print(f"✅ Updated {video_bg_path}")

def enhance_css_animations():
    """Add premium animations to globals.css"""
    css_path = 'src/styles/globals.css'
    
    additional_css = '''
/* Premium animations */
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

@keyframes shimmer {
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}

.shimmer {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 1000px 100%;
  animation: shimmer 2s infinite;
}

/* Premium card effects */
.premium-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
}

.premium-card::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    45deg,
    transparent 30%,
    rgba(255, 255, 255, 0.1) 50%,
    transparent 70%
  );
  transform: rotate(45deg);
  transition: all 0.6s;
}

.premium-card:hover::before {
  animation: shimmer 0.6s;
}

/* Smooth scroll behavior */
html {
  scroll-behavior: smooth;
}

/* Enhanced focus states */
button:focus-visible,
a:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Premium gradient backgrounds */
.gradient-radial {
  background: radial-gradient(circle at center, #3b82f6 0%, #1e40af 100%);
}

.gradient-conic {
  background: conic-gradient(from 180deg at 50% 50%, #3b82f6 0deg, #8b5cf6 90deg, #ec4899 180deg, #f59e0b 270deg, #3b82f6 360deg);
}
'''
    
    if os.path.exists(css_path):
        with open(css_path, 'a') as f:
            f.write(additional_css)
        print(f"✅ Enhanced {css_path}")

def update_homepage_quality():
    """Enhance homepage visual elements"""
    index_path = 'src/pages/index.js'
    
    if os.path.exists(index_path):
        with open(index_path, 'r') as f:
            content = f.read()
        
        # Add animate-float to hero badges
        content = content.replace(
            'inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-gold-500/20',
            'animate-float inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-gold-500/20'
        )
        
        # Enhance button hover effects
        content = content.replace(
            'hover:scale-105 hover:shadow-2xl',
            'hover:scale-105 hover:shadow-2xl hover:shadow-gold-500/25'
        )
        
        # Add premium card class to category cards
        content = content.replace(
            'group bg-orange-50 rounded-3xl',
            'group premium-card bg-orange-50 rounded-3xl'
        )
        
        with open(index_path, 'w') as f:
            f.write(content)
        print(f"✅ Enhanced {index_path}")

def create_proper_document():
    """Create proper _document.js file"""
    doc_path = 'src/pages/_document.js'
    
    doc_content = '''import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
'''
    
    # Only create if it doesn't exist or if it needs fixing
    if not os.path.exists(doc_path):
        os.makedirs(os.path.dirname(doc_path), exist_ok=True)
        with open(doc_path, 'w') as f:
            f.write(doc_content)
        print(f"✅ Created {doc_path} with Inter font")
    else:
        print(f"📝 {doc_path} already exists, skipping creation")

def fix_head_imports():
    """Replace next/document Head with next/head in regular pages"""
    pages_dir = 'src/pages'
    
    if os.path.exists(pages_dir):
        for root, dirs, files in os.walk(pages_dir):
            for file in files:
                if file.endswith('.js') or file.endswith('.jsx'):
                    file_path = os.path.join(root, file)
                    
                    # Skip _document.js as it's allowed to use next/document
                    if file == '_document.js':
                        continue
                    
                    with open(file_path, 'r') as f:
                        content = f.read()
                    
                    original_content = content
                    
                    # If the file uses Head from next/document, replace with next/head
                    if 'from \'next/document\'' in content or 'from "next/document"' in content:
                        # Remove document import
                        content = re.sub(r'import\s+\{[^}]*Head[^}]*\}\s+from\s+[\'"]next/document[\'"].*\n?', '', content)
                        
                        # Add proper Head import if not already present
                        if 'from \'next/head\'' not in content and 'from "next/head"' not in content:
                            # Add Head import from next/head at the top
                            lines = content.split('\n')
                            import_line = "import Head from 'next/head'"
                            
                            # Find the best place to insert the import
                            insert_index = 0
                            for i, line in enumerate(lines):
                                if line.strip().startswith('import'):
                                    insert_index = i + 1
                            
                            lines.insert(insert_index, import_line)
                            content = '\n'.join(lines)
                    
                    if content != original_content:
                        with open(file_path, 'w') as f:
                            f.write(content)
                        print(f"✅ Fixed Head imports in {file_path}")

def clean_build_cache():
    """Clean Next.js build cache"""
    cache_dirs = ['.next', 'node_modules/.cache']
    
    for cache_dir in cache_dirs:
        if os.path.exists(cache_dir):
            import shutil
            shutil.rmtree(cache_dir)
            print(f"✅ Cleaned {cache_dir}")

def main():
    print("🎨 Fixing BOOM Card build errors and restoring visual quality...")
    
    # Change to frontend directory
    frontend_path = '/Users/administrator/ai-automation-platform/user_projects/25b7e956-816a-410c-b1b5-3c798a9d586c/BOOM Card_20250722_085243/frontend'
    
    if os.path.exists(frontend_path):
        os.chdir(frontend_path)
    else:
        print(f"❌ Frontend directory not found: {frontend_path}")
        print("Please run this script from the correct directory")
        return
    
    # Fix Next.js build errors first
    print("\n🔧 Fixing Next.js build errors...")
    fix_document_imports()
    fix_head_imports()
    create_proper_document()
    
    # Apply visual enhancements
    print("\n🎨 Applying visual enhancements...")
    update_video_component()
    enhance_css_animations()
    update_homepage_quality()
    
    # Clean build cache
    print("\n🧹 Cleaning build cache...")
    clean_build_cache()
    
    print("\n✨ Build fixes and visual quality restoration complete!")
    print("\nNext steps:")
    print("1. Run 'npm run build' to test the build")
    print("2. If successful, deploy to Netlify")
    print("3. The app should now build successfully with premium visuals")

if __name__ == "__main__":
    main()