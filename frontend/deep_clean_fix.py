#!/usr/bin/env python3
import os
import re
import json

def check_package_json():
    """Check if there are any problematic dependencies"""
    with open('package.json', 'r') as f:
        data = json.load(f)
    
    print("📦 Checking package.json dependencies...")
    deps = data.get('dependencies', {})
    dev_deps = data.get('devDependencies', {})
    
    # Check for any custom babel plugins that might transform imports
    if 'babel' in str(deps) or 'babel' in str(dev_deps):
        print("⚠️  Found babel dependencies - might affect imports")

def find_all_imports():
    """Find all imports of Html, Head, Main, NextScript"""
    print("\n🔍 Searching for all document-related imports...")
    
    problem_patterns = [
        r'import.*Html.*from',
        r'import.*Main.*from',
        r'import.*NextScript.*from',
        r'<Html[^>]*>',
        r'</Html>',
        r'<Main\s*/>',
        r'<NextScript\s*/>'
    ]
    
    for root, dirs, files in os.walk('src'):
        # Skip node_modules
        if 'node_modules' in root:
            continue
            
        for file in files:
            if file.endswith(('.js', '.jsx', '.ts', '.tsx')):
                file_path = os.path.join(root, file)
                
                # Skip _document files
                if '_document' in file:
                    continue
                
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    for pattern in problem_patterns:
                        if re.search(pattern, content, re.IGNORECASE):
                            print(f"⚠️  Found pattern '{pattern}' in: {file_path}")
                            # Show the matching lines
                            lines = content.split('\n')
                            for i, line in enumerate(lines):
                                if re.search(pattern, line, re.IGNORECASE):
                                    print(f"    Line {i+1}: {line.strip()}")
                except Exception as e:
                    print(f"Error reading {file_path}: {e}")

def check_babel_config():
    """Check for babel configuration that might transform imports"""
    babel_files = ['.babelrc', '.babelrc.js', '.babelrc.json', 'babel.config.js', 'babel.config.json']
    
    for babel_file in babel_files:
        if os.path.exists(babel_file):
            print(f"\n⚠️  Found babel config: {babel_file}")
            with open(babel_file, 'r') as f:
                print(f.read()[:500])

def check_webpack_config():
    """Check for custom webpack config in next.config.js"""
    if os.path.exists('next.config.js'):
        with open('next.config.js', 'r') as f:
            content = f.read()
        
        if 'webpack' in content:
            print("\n⚠️  Found custom webpack config in next.config.js")

def clean_all_caches():
    """Clean all possible caches"""
    print("\n🧹 Cleaning all caches...")
    cache_dirs = [
        '.next',
        'node_modules/.cache',
        '.turbo',
        '.swc',
        'coverage',
        '.nyc_output'
    ]
    
    for cache_dir in cache_dirs:
        if os.path.exists(cache_dir):
            os.system(f'rm -rf {cache_dir}')
            print(f"✅ Removed {cache_dir}")

def main():
    print("🔍 Deep Clean and Diagnosis for BOOM Card Html Import Issues")
    print("=" * 60)
    
    check_package_json()
    find_all_imports()
    check_babel_config()
    check_webpack_config()
    clean_all_caches()
    
    print("\n" + "=" * 60)
    print("✅ Deep clean complete!")
    print("\nNext steps:")
    print("1. Review any warnings above")
    print("2. Run 'npm run build' to test")
    print("3. If issues persist, check the specific files mentioned above")

if __name__ == "__main__":
    main()