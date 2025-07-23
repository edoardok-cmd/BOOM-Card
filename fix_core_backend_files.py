#!/usr/bin/env python3
"""
Fix Core Backend Files - Critical for Backend Startup
Fixes syntax errors in the main files needed to start the backend service
"""

import os
import re
from pathlib import Path
from typing import List, Dict

class CoreBackendFixer:
    def __init__(self, project_root: str):
        self.project_root = Path(project_root)
        self.fixes_applied = []
        
    def fix_core_files(self):
        """Fix the core files needed for backend startup"""
        # Priority order - most critical files first
        core_files = [
            "backend/src/server.ts",
            "backend/src/config/index.ts", 
            "backend/src/config/database.ts",
            "backend/src/config/redis.ts"
        ]
        
        for file_path in core_files:
            full_path = self.project_root / file_path
            if full_path.exists():
                print(f"Fixing {file_path}...")
                self.fix_typescript_file(full_path)
            else:
                print(f"File not found: {file_path}")
    
    def fix_typescript_file(self, file_path: Path):
        """Fix a TypeScript file"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                
            original_content = content
            
            # Apply fixes in order of priority
            content = self.fix_syntax_errors(content, str(file_path))
            
            if content != original_content:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"  ✅ Fixed {file_path}")
            else:
                print(f"  ℹ️  No fixes needed for {file_path}")
                
        except Exception as e:
            print(f"  ❌ Error fixing {file_path}: {e}")
    
    def fix_syntax_errors(self, content: str, file_path: str) -> str:
        """Fix common TypeScript syntax errors"""
        fixes_made = []
        
        # 1. Fix standalone semicolons that cause "Declaration or statement expected"
        lines = content.split('\n')
        fixed_lines = []
        
        for i, line in enumerate(lines):
            stripped = line.strip()
            
            # Remove standalone semicolons
            if stripped == ';':
                fixes_made.append(f"Removed standalone semicolon at line {i+1}")
                continue
                
            # Fix lines with only whitespace and semicolon
            if stripped and all(c in ' \t;' for c in stripped) and ';' in stripped:
                fixes_made.append(f"Removed whitespace+semicolon line at line {i+1}")
                continue
            
            fixed_lines.append(line)
        
        content = '\n'.join(fixed_lines)
        
        # 2. Fix extra semicolons after object properties
        # Pattern: }, ; -> },
        content = re.sub(r'},\s*;', '},', content)
        if re.search(r'},\s*;', content):
            fixes_made.append("Fixed extra semicolons after object properties")
        
        # 3. Fix missing quotes around object keys
        # Look for unquoted keys that might be causing issues
        # Pattern: word: value -> "word": value (only when it looks problematic)
        problematic_patterns = [
            (r'(\s+)([A-Za-z][A-Za-z0-9_]*)\s*:\s*([^,}\n]+)([,}])', r'\1"\2": \3\4'),
        ]
        
        for pattern, replacement in problematic_patterns:
            if re.search(pattern, content):
                content = re.sub(pattern, replacement, content)
                fixes_made.append("Fixed unquoted object keys")
        
        # 4. Fix interface/type declarations with syntax issues
        # Remove extra closing braces after interfaces
        content = re.sub(r'(interface\s+\w+[^}]*})\s*}', r'\1', content, flags=re.DOTALL)
        if re.search(r'(interface\s+\w+[^}]*})\s*}', content, flags=re.DOTALL):
            fixes_made.append("Fixed extra closing braces after interfaces")
        
        # 5. Fix incomplete function declarations
        # Pattern: async functionName(): ReturnType -> async functionName(): ReturnType {
        incomplete_functions = re.findall(r'(async\s+\w+\s*\([^)]*\)\s*:\s*\w+[^{;]*$)', content, re.MULTILINE)
        for func in incomplete_functions:
            if not func.strip().endswith('{') and not func.strip().endswith(';'):
                content = content.replace(func, func + ' {')
                fixes_made.append(f"Added opening brace to incomplete function: {func[:30]}...")
        
        # 6. Fix object/array balance issues
        open_braces = content.count('{')
        close_braces = content.count('}')
        if open_braces > close_braces:
            diff = open_braces - close_braces
            content += '\n' + '}\n' * diff
            fixes_made.append(f"Added {diff} missing closing braces")
        
        # 7. Fix import statement issues
        # Ensure imports end with semicolons
        import_lines = re.findall(r'^import\s+.*[^;]$', content, re.MULTILINE)
        for imp in import_lines:
            if not imp.strip().endswith(';'):
                content = content.replace(imp, imp + ';')
                fixes_made.append(f"Added semicolon to import: {imp[:30]}...")
        
        # 8. Fix export statement issues
        export_lines = re.findall(r'^export\s+.*[^;]$', content, re.MULTILINE)
        for exp in export_lines:
            if not exp.strip().endswith(';') and 'export default' not in exp:
                content = content.replace(exp, exp + ';')
                fixes_made.append(f"Added semicolon to export: {exp[:30]}...")
        
        # 9. Fix TypeScript specific syntax issues
        # Fix arrow function syntax issues
        content = re.sub(r'=>\s*{([^}]*)}\s*;', r'=> {\1}', content)
        
        # 10. Fix common TypeScript patterns that cause issues
        # Fix ternary operator in object context
        content = re.sub(r'(\w+:\s*[^?]*\?[^:]*:\s*[^,}]+)\s*}', r'\1', content)
        
        if fixes_made:
            self.fixes_applied.extend([f"{file_path}: {fix}" for fix in fixes_made])
            
        return content
    
    def generate_report(self):
        """Generate a report of fixes applied"""
        print(f"\n📊 Core Backend Fix Report:")
        print(f"   Total fixes applied: {len(self.fixes_applied)}")
        
        if self.fixes_applied:
            print(f"\n✅ Fixes Applied:")
            for fix in self.fixes_applied:
                print(f"   - {fix}")
        else:
            print(f"\n   No fixes were needed.")

def main():
    """Main execution function"""
    project_root = "/Users/administrator/ai-automation-platform/user_projects/25b7e956-816a-410c-b1b5-3c798a9d586c/BOOM Card_20250722_085243"
    
    print("🔧 Starting Core Backend File Fixes")
    print("="*50)
    
    fixer = CoreBackendFixer(project_root)
    fixer.fix_core_files()
    fixer.generate_report()
    
    print("\n🎉 Core backend fixes completed!")
    print("   Attempting backend startup...")

if __name__ == "__main__":
    main()