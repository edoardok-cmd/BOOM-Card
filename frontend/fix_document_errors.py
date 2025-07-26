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
                    
                    # Skip _document.js as it's allowed to have these imports
                    if file in ['_document.js', '_document.tsx']:
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

def fix_head_imports():
    """Replace next/document Head with next/head in regular pages"""
    pages_dir = 'src/pages'
    
    if os.path.exists(pages_dir):
        for root, dirs, files in os.walk(pages_dir):
            for file in files:
                if file.endswith(('.js', '.jsx', '.ts', '.tsx')):
                    file_path = os.path.join(root, file)
                    
                    # Skip _document.js as it's allowed to use next/document
                    if file in ['_document.js', '_document.tsx']:
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
    cache_dirs = ['.next', 'node_modules/.cache', '.turbo']
    
    for cache_dir in cache_dirs:
        if os.path.exists(cache_dir):
            shutil.rmtree(cache_dir)
            print(f"✅ Cleaned {cache_dir}")

def remove_typescript_files():
    """Remove any .tsx files that might be causing conflicts"""
    for root, dirs, files in os.walk('src'):
        for file in files:
            if file.endswith('.tsx') and file != 'ThemeContext.tsx':
                file_path = os.path.join(root, file)
                # Check if there's a .js equivalent
                js_path = file_path.replace('.tsx', '.js')
                if os.path.exists(js_path):
                    os.remove(file_path)
                    print(f"✅ Removed duplicate {file_path}")

def main():
    print("🔧 Fixing BOOM Card document import errors...")
    
    # Fix Next.js build errors
    print("\n📝 Fixing document imports...")
    fix_document_imports()
    fix_head_imports()
    
    print("\n🧹 Removing duplicate TypeScript files...")
    remove_typescript_files()
    
    # Clean build cache
    print("\n🧹 Cleaning build cache...")
    clean_build_cache()
    
    print("\n✨ Document import fixes complete!")

if __name__ == "__main__":
    main()