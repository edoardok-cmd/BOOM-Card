#!/usr/bin/env python3
"""
Cleanup script to remove markdown code fences from source files
"""
import os
import re
from pathlib import Path

def clean_file(filepath):
    """Remove markdown code fences from the beginning and end of a file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check if file starts with a code fence
        if content.startswith('```'):
            # Find the end of the first line (the fence line)
            first_newline = content.find('\n')
            if first_newline != -1:
                # Remove the opening fence line
                content = content[first_newline + 1:]
                
                # Remove closing fence if present
                if content.rstrip().endswith('```'):
                    last_fence_index = content.rstrip().rfind('```')
                    content = content[:last_fence_index].rstrip() + '\n'
                
                # Write cleaned content back
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                
                return True
    except Exception as e:
        print(f"Error processing {filepath}: {e}")
        return False
    
    return False

def cleanup_project():
    """Clean all TypeScript, JavaScript, and other source files"""
    cleaned_count = 0
    error_count = 0
    
    extensions = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs']
    
    for root, dirs, files in os.walk('.'):
        # Skip node_modules and other build directories
        if 'node_modules' in root or '.next' in root or 'dist' in root:
            continue
            
        for file in files:
            if any(file.endswith(ext) for ext in extensions):
                filepath = os.path.join(root, file)
                if clean_file(filepath):
                    cleaned_count += 1
                    print(f"✓ Cleaned: {filepath}")
                else:
                    # Check if it actually needed cleaning
                    try:
                        with open(filepath, 'r') as f:
                            if f.read().startswith('```'):
                                error_count += 1
                                print(f"✗ Failed to clean: {filepath}")
                    except:
                        pass
    
    print(f"\n🧹 Cleanup Summary:")
    print(f"   Files cleaned: {cleaned_count}")
    print(f"   Errors: {error_count}")
    print(f"   Total processed: {cleaned_count + error_count}")
    
    # Create a cleanup report
    with open('CLEANUP_REPORT.md', 'w') as f:
        f.write(f"# BOOM Card Project Cleanup Report\n\n")
        f.write(f"## Summary\n")
        f.write(f"- Files cleaned: {cleaned_count}\n")
        f.write(f"- Errors encountered: {error_count}\n")
        f.write(f"- Cleanup performed on: {Path.cwd()}\n\n")
        f.write(f"## Action Taken\n")
        f.write(f"Removed markdown code fences from source files that were incorrectly ")
        f.write(f"included during AI generation.\n")

if __name__ == "__main__":
    print("🚀 Starting BOOM Card project cleanup...")
    cleanup_project()
    print("\n✅ Cleanup complete!")