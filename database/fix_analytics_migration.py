#!/usr/bin/env python3
"""
Fix the analytics migration file by converting inline INDEX to CREATE INDEX statements
"""

import re

# Read the migration file
with open('migrations/002_add_analytics.sql', 'r') as f:
    content = f.read()

# Find all inline INDEX definitions and their table context
table_pattern = r'CREATE TABLE (\w+) \((.*?)\);'
index_pattern = r'^\s*INDEX (idx_\w+) \(([^)]+)\),?$'

# Replace inline indexes with placeholders and collect them
indexes_to_create = []
current_table = None

lines = content.split('\n')
new_lines = []
inside_table = False
table_name = None

for i, line in enumerate(lines):
    # Check if we're starting a CREATE TABLE statement
    if 'CREATE TABLE' in line and '(' in line:
        inside_table = True
        # Extract table name
        match = re.search(r'CREATE TABLE (\w+)', line)
        if match:
            table_name = match.group(1)
    
    # Check if this is an inline INDEX
    if inside_table and re.match(index_pattern, line):
        match = re.match(index_pattern, line)
        if match and table_name:
            index_name = match.group(1)
            columns = match.group(2)
            indexes_to_create.append(f"CREATE INDEX {index_name} ON {table_name} ({columns});")
            # Skip this line (don't add to new_lines)
            continue
    
    # Check if we're ending a CREATE TABLE statement
    if inside_table and ');' in line:
        inside_table = False
        table_name = None
    
    new_lines.append(line)

# Remove trailing commas before closing parentheses
final_lines = []
for i, line in enumerate(new_lines):
    if i + 1 < len(new_lines) and ');' in new_lines[i + 1] and line.rstrip().endswith(','):
        final_lines.append(line.rstrip()[:-1])  # Remove trailing comma
    else:
        final_lines.append(line)

# Add CREATE INDEX statements after the table definitions
# Find a good place to insert them (after all CREATE TABLE statements)
insert_position = -1
for i, line in enumerate(final_lines):
    if '-- Create update trigger for updated_at columns' in line:
        insert_position = i
        break

if insert_position > 0:
    # Insert the CREATE INDEX statements
    final_lines.insert(insert_position, '\n-- Create indexes for analytics tables')
    for idx, index_stmt in enumerate(indexes_to_create):
        final_lines.insert(insert_position + 1 + idx, index_stmt)
    final_lines.insert(insert_position + 1 + len(indexes_to_create), '')

# Write the fixed content
with open('migrations/002_add_analytics.sql', 'w') as f:
    f.write('\n'.join(final_lines))

print(f"Fixed {len(indexes_to_create)} inline INDEX definitions")
print("Converted to CREATE INDEX statements")