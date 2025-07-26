#!/usr/bin/env python3
import os
import re
import shutil

def fix_document_imports():
    """Remove any incorrect document imports from page files"""
    pages_dir = 'src/pages'
    
    if os.path.exists(pages_dir):
        for root, dirs, files in os.walk(pages_dir):
            for file in files:
                if file.endswith(('.js', '.jsx', '.ts', '.tsx')):
                    file_path = os.path.join(root, file)
                    
                    # Skip _document files
                    if '_document' in file:
                        continue
                    
                    with open(file_path, 'r') as f:
                        content = f.read()
                    
                    # Remove any document-related imports from regular pages
                    original_content = content
                    content = re.sub(r'import\s+.*from\s+[\'"]next/document[\'"].*\n?', '', content)
                    
                    if content != original_content:
                        with open(file_path, 'w') as f:
                            f.write(content)
                        print(f"✅ Fixed document imports in {file_path}")

def fix_head_imports():
    """Replace next/document Head with next/head in regular pages"""
    pages_dir = 'src/pages'
    
    if os.path.exists(pages_dir):
        for root, dirs, files in os.walk(pages_dir):
            for file in files:
                if file.endswith(('.js', '.jsx', '.ts', '.tsx')):
                    file_path = os.path.join(root, file)
                    
                    # Skip _document files
                    if '_document' in file:
                        continue
                    
                    with open(file_path, 'r') as f:
                        content = f.read()
                    
                    original_content = content
                    
                    # Check if file incorrectly imports from next/document
                    if 'from \'next/document\'' in content or 'from "next/document"' in content:
                        # Remove the incorrect import
                        content = re.sub(r'import\s+\{[^}]*\}\s+from\s+[\'"]next/document[\'"].*\n?', '', content)
                        
                        # Add proper Head import if needed and not present
                        if '<Head' in content and 'from \'next/head\'' not in content and 'from "next/head"' not in content:
                            lines = content.split('\n')
                            import_line = "import Head from 'next/head'"
                            
                            # Find where to insert
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
            shutil.rmtree(cache_dir)
            print(f"✅ Cleaned {cache_dir}")

def main():
    print("🔧 Fixing BOOM Card build errors...")
    
    # Fix Next.js build errors
    print("\n📝 Checking for incorrect imports...")
    fix_document_imports()
    fix_head_imports()
    
    # Clean build cache
    print("\n🧹 Cleaning build cache...")
    clean_build_cache()
    
    print("\n✨ Build fixes complete!")
    print("\nNext steps:")
    print("1. Run 'npm ci --legacy-peer-deps' to reinstall dependencies")
    print("2. Run 'npm run build' to test the build")
    print("3. If successful, commit and push changes")

if __name__ == "__main__":
    main()