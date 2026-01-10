import os
import re

def convert_flask_to_static(html_content):
    """Convert Flask template syntax to static paths"""
    # Convert url_for('static', filename='...') to /static/...
    html_content = re.sub(
        r'\{\{\s*url_for\([\'"]static[\'"],\s*filename=[\'"]([^\'"]+)[\'"]\)\s*\}\}',
        r'/static/\1',
        html_content
    )
    
    # Convert other url_for calls
    html_content = re.sub(
        r'\{\{\s*url_for\([\'"]([^\'"]+)[\'"]\)\s*\}\}',
        r'/\1',
        html_content
    )
    
    return html_content

def process_templates():
    """Convert all templates to static HTML"""
    # Read your template
    with open('templates/index.html', 'r') as f:
        content = f.read()
    
    # Convert to static
    static_content = convert_flask_to_static(content)
    
    # Write to public directory
    os.makedirs('public', exist_ok=True)
    with open('public/index.html', 'w') as f:
        f.write(static_content)
    
    print("✅ Template converted to public/index.html")

if __name__ == '__main__':
    process_templates()