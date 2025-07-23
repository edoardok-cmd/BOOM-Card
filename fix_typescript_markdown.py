#!/usr/bin/env python3
"""
Remove markdown code blocks from TypeScript files
"""

import os
import re

def fix_typescript_file(filepath):
    """Remove markdown code blocks from a TypeScript file"""
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Count occurrences before fixing
    count = len(re.findall(r'^```.*$', content, re.MULTILINE))
    
    if count == 0:
        return False
    
    # Remove markdown code blocks
    # Pattern to match ```typescript or ``` at the beginning of a line
    content = re.sub(r'^```typescript\s*$', '', content, flags=re.MULTILINE)
    content = re.sub(r'^```\s*$', '', content, flags=re.MULTILINE)
    
    # Also remove any text like "I'll generate Part X..." that appears before code blocks
    content = re.sub(r'^I\'ll generate.*?:?\s*$', '', content, flags=re.MULTILINE)
    content = re.sub(r'^I\'ll create.*?:?\s*$', '', content, flags=re.MULTILINE)
    content = re.sub(r'^Let me.*?:?\s*$', '', content, flags=re.MULTILINE)
    content = re.sub(r'^Here\'s.*?:?\s*$', '', content, flags=re.MULTILINE)
    
    # Remove multiple consecutive empty lines
    content = re.sub(r'\n\n\n+', '\n\n', content)
    
    # Write the fixed content back
    with open(filepath, 'w') as f:
        f.write(content)
    
    print(f"Fixed {filepath} - removed {count} markdown markers")
    return True

def main():
    # Fix backend TypeScript files
    backend_dir = "backend/src"
    fixed_count = 0
    
    for root, dirs, files in os.walk(backend_dir):
        for file in files:
            if file.endswith('.ts'):
                filepath = os.path.join(root, file)
                if fix_typescript_file(filepath):
                    fixed_count += 1
    
    # Also fix frontend TypeScript files if they have the same issue
    frontend_dir = "frontend/src"
    if os.path.exists(frontend_dir):
        for root, dirs, files in os.walk(frontend_dir):
            for file in files:
                if file.endswith('.ts') or file.endswith('.tsx'):
                    filepath = os.path.join(root, file)
                    if fix_typescript_file(filepath):
                        fixed_count += 1
    
    print(f"\nTotal files fixed: {fixed_count}")

if __name__ == "__main__":
    main()