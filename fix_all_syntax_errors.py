#!/usr/bin/env python3
"""
Fix all remaining syntax errors in the BOOM Card project
"""

import os
import re
import glob

def fix_extra_braces(content):
    """Fix extra closing braces in interfaces"""
    # Pattern to find interface with extra closing brace
    pattern = r'(interface\s+\w+\s*(?:extends\s+\w+\s*)?{[^}]*})\s*}'
    
    # Replace with single closing brace
    fixed = re.sub(pattern, r'\1', content, flags=re.DOTALL)
    
    # Also fix patterns like "}\n}"
    fixed = re.sub(r'}\s*\n\s*}', '}', fixed)
    
    return fixed

def fix_duplicate_declarations(content):
    """Fix duplicate const/let/var declarations"""
    lines = content.split('\n')
    seen_declarations = set()
    fixed_lines = []
    
    for line in lines:
        # Check for const/let/var declarations
        match = re.match(r'^\s*(const|let|var)\s+(\w+)\s*=', line)
        if match:
            var_type = match.group(1)
            var_name = match.group(2)
            declaration = f"{var_type} {var_name}"
            
            if declaration in seen_declarations:
                # Skip duplicate declaration
                print(f"  Skipping duplicate: {declaration}")
                continue
            else:
                seen_declarations.add(declaration)
        
        fixed_lines.append(line)
    
    return '\n'.join(fixed_lines)

def fix_unclosed_blocks(content):
    """Fix unclosed try blocks and other block issues"""
    # Count opening and closing braces
    open_braces = content.count('{')
    close_braces = content.count('}')
    
    if open_braces > close_braces:
        # Add missing closing braces at the end
        missing = open_braces - close_braces
        content += '\n' + '}\n' * missing
        print(f"  Added {missing} missing closing braces")
    
    return content

def process_file(filepath):
    """Process a single file to fix syntax errors"""
    print(f"Processing: {filepath}")
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Apply fixes
        content = fix_extra_braces(content)
        content = fix_duplicate_declarations(content)
        content = fix_unclosed_blocks(content)
        
        # Only write if changed
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"  ✓ Fixed {filepath}")
            return True
        else:
            print(f"  - No changes needed")
            return False
            
    except Exception as e:
        print(f"  ✗ Error: {e}")
        return False

def main():
    """Fix syntax errors in all TypeScript and JavaScript files"""
    print("Fixing syntax errors in BOOM Card project...")
    print("=" * 60)
    
    # Find all TypeScript and JavaScript files
    patterns = ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx']
    all_files = []
    
    for pattern in patterns:
        files = glob.glob(pattern, recursive=True)
        all_files.extend(files)
    
    # Exclude node_modules and other directories
    excluded_dirs = ['node_modules', '.next', 'dist', 'build', '.git']
    filtered_files = []
    
    for file in all_files:
        if not any(excluded in file for excluded in excluded_dirs):
            filtered_files.append(file)
    
    print(f"Found {len(filtered_files)} files to check")
    print()
    
    fixed_count = 0
    for file in filtered_files:
        if process_file(file):
            fixed_count += 1
    
    print()
    print("=" * 60)
    print(f"Fixed {fixed_count} files")

if __name__ == "__main__":
    main()