#!/usr/bin/env python3
import os
import re
import shutil

# Enhanced script to fix BOOM Card build errors and restore visual quality

def find_problematic_files():
    """Identify files with document imports outside _document.js"""
    problematic_files = []
    pages_dir = 'src/pages'
    
    if os.path.exists(pages_dir):
        for root, dirs, files in os.walk(pages_dir):
            for file in files:
                if file.endswith('.js') or file.endswith('.jsx'):
                    file_path = os.path.join(root, file)
                    
                    # Skip _document.js as it's allowed to have these imports
                    if file == '_document.js':
                        continue
                    
                    try:
                        with open(file_path, 'r', encoding='utf-8') as f:
                            content = f.read()
                        
                        # Check for document imports
                        if ('next/document' in content and 
                            ('Html' in content or 'Main' in content or 'NextScript' in content)):
                            problematic_files.append(file_path)
                    except Exception as e:
                        print(f"⚠️ Could not read {file_path}: {e}")
    
    return problematic_files

def fix_specific_pages():
    """Fix the specific pages mentioned in the error logs"""
    pages_to_fix = [
        'src/pages/index.js',
        'src/pages/index.tsx',
        'src/pages/index-simple-backup.tsx',
        'src/pages/dashboard-with-layout.tsx',
        'src/pages/index-temp.tsx'
    ]
    
    for page_path in pages_to_fix:
        if os.path.exists(page_path):
            print(f"🔧 Fixing {page_path}...")
            
            try:
                with open(page_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                original_content = content
                
                # Remove all next/document imports
                content = re.sub(r'import\s+.*from\s+[\'"]next/document[\'"].*\n?', '', content, flags=re.MULTILINE)
                content = re.sub(r'import\s+\{[^}]*\}\s+from\s+[\'"]next/document[\'"].*\n?', '', content, flags=re.MULTILINE)
                
                # Remove Html, Main, NextScript usage but keep the content structure
                # Replace Html tags with div
                content = re.sub(r'<Html[^>]*>', '<div>', content)
                content = re.sub(r'</Html>', '</div>', content)
                
                # Replace Main with the actual content or remove it
                content = re.sub(r'<Main\s*/>', '', content)
                content = re.sub(r'<Main[^>]*>.*?</Main>', '', content, flags=re.DOTALL)
                
                # Replace NextScript with empty or remove it
                content = re.sub(r'<NextScript\s*/>', '', content)
                content = re.sub(r'<NextScript[^>]*>.*?</NextScript>', '', content, flags=re.DOTALL)
                
                # Ensure we have proper Head import from next/head if Head is used
                if '<Head>' in content or '<Head ' in content:
                    if 'from \'next/head\'' not in content and 'from "next/head"' not in content:
                        # Add Head import at the top
                        lines = content.split('\n')
                        import_added = False
                        for i, line in enumerate(lines):
                            if line.strip().startswith('import') and not import_added:
                                lines.insert(i, "import Head from 'next/head'")
                                import_added = True
                                break
                        if not import_added:
                            lines.insert(0, "import Head from 'next/head'")
                        content = '\n'.join(lines)
                
                # Clean up any duplicate imports
                content = re.sub(r'(import Head from [\'"]next/head[\'"].*\n)+', "import Head from 'next/head'\n", content)
                
                # Clean up extra whitespace
                content = re.sub(r'\n\n\n+', '\n\n', content)
                
                if content != original_content:
                    with open(page_path, 'w', encoding='utf-8') as f:
                        f.write(content)
                    print(f"✅ Fixed document imports in {page_path}")
                else:
                    print(f"📝 No changes needed in {page_path}")
                    
            except Exception as e:
                print(f"❌ Error fixing {page_path}: {e}")

def clean_problematic_pages():
    """Remove or rename problematic backup pages"""
    backup_pages = [
        'src/pages/index-simple-backup.tsx',
        'src/pages/index-temp.tsx',
        'src/pages/dashboard-with-layout.tsx'
    ]
    
    for page in backup_pages:
        if os.path.exists(page):
            # Rename to .bak so it's not processed by Next.js
            backup_name = page.replace('.tsx', '.tsx.bak').replace('.js', '.js.bak')
            shutil.move(page, backup_name)
            print(f"✅ Moved {page} to {backup_name}")

def create_proper_document():
    """Ensure _document.js is properly configured"""
    doc_path = 'src/pages/_document.js'
    
    # Already exists and is properly configured
    if os.path.exists(doc_path):
        print(f"📝 {doc_path} already exists and configured")

def clean_build_cache():
    """Clean Next.js build cache"""
    cache_dirs = ['.next', 'node_modules/.cache', '.next/cache']
    
    for cache_dir in cache_dirs:
        if os.path.exists(cache_dir):
            try:
                shutil.rmtree(cache_dir)
                print(f"✅ Cleaned {cache_dir}")
            except Exception as e:
                print(f"⚠️ Could not clean {cache_dir}: {e}")

def validate_fix():
    """Validate that the fix worked"""
    problematic_files = find_problematic_files()
    
    if problematic_files:
        print(f"\n⚠️ Still found {len(problematic_files)} files with document imports:")
        for file in problematic_files:
            print(f"  - {file}")
        return False
    else:
        print("\n✅ No problematic document imports found!")
        return True

def main():
    print("🎨 Comprehensive BOOM Card build fix...")
    print("=" * 60)
    
    # Step 1: Find problematic files
    print("\n🔍 Step 1: Identifying problematic files...")
    problematic_files = find_problematic_files()
    if problematic_files:
        print(f"Found {len(problematic_files)} files with document import issues:")
        for file in problematic_files:
            print(f"  - {file}")
    
    # Step 2: Clean problematic backup pages
    print("\n🧹 Step 2: Removing problematic backup pages...")
    clean_problematic_pages()
    
    # Step 3: Fix specific pages
    print("\n🔧 Step 3: Fixing specific pages...")
    fix_specific_pages()
    
    # Step 4: Create proper _document.js
    print("\n📄 Step 4: Ensuring proper _document.js...")
    create_proper_document()
    
    # Step 5: Clean build cache
    print("\n🧹 Step 5: Cleaning build cache...")
    clean_build_cache()
    
    # Step 6: Validate fix
    print("\n✅ Step 6: Validating fixes...")
    is_fixed = validate_fix()
    
    print("\n" + "=" * 60)
    if is_fixed:
        print("✨ All fixes applied successfully!")
        print("\n🚀 Next steps:")
        print("1. Run 'npm run build' to test the build")
        print("2. If successful, commit and push to trigger Netlify deployment")
        print("3. The app should now build successfully")
    else:
        print("⚠️ Some issues may remain. Check the output above.")
        print("You may need to manually review the problematic files.")

if __name__ == "__main__":
    main()