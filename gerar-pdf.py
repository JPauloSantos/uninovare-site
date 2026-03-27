import markdown
import sys
import os

sys.stdout.reconfigure(encoding='utf-8')

base = r'C:\Users\JPaulo Santos\Desktop\PROJETO SITE UNINOVARE'
md_file = os.path.join(base, 'DOCS.md')
html_file = os.path.join(base, 'UNINOVARE-Documentacao-Tecnica-v2.html')
pdf_note = os.path.join(base, 'UNINOVARE-Documentacao-Tecnica-v2.pdf')

with open(md_file, 'r', encoding='utf-8') as f:
    md_content = f.read()

html_body = markdown.markdown(md_content, extensions=['tables', 'fenced_code', 'toc'])

html_full = f"""<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>UNINOVARE - Documentacao Tecnica v2.0</title>
<style>
  @page {{ margin: 20mm; }}
  body {{
    font-family: 'Segoe UI', Arial, sans-serif;
    font-size: 11pt;
    line-height: 1.6;
    color: #1f2a2e;
    max-width: 210mm;
    margin: 0 auto;
    padding: 20px 30px;
  }}
  h1 {{
    color: #3A7D44;
    font-size: 22pt;
    border-bottom: 3px solid #3A7D44;
    padding-bottom: 8px;
    margin-top: 30px;
  }}
  h2 {{
    color: #3A7D44;
    font-size: 16pt;
    border-bottom: 2px solid #d4e8d7;
    padding-bottom: 6px;
    margin-top: 28px;
    page-break-after: avoid;
  }}
  h3 {{
    color: #2d6335;
    font-size: 13pt;
    margin-top: 20px;
  }}
  table {{
    border-collapse: collapse;
    width: 100%;
    margin: 12px 0;
    font-size: 10pt;
  }}
  th, td {{
    border: 1px solid #d0d0d0;
    padding: 8px 10px;
    text-align: left;
  }}
  th {{
    background: #3A7D44;
    color: white;
    font-weight: 600;
  }}
  tr:nth-child(even) {{
    background: #f7f5f0;
  }}
  code {{
    background: #f0ede6;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 10pt;
    font-family: 'Consolas', 'Courier New', monospace;
  }}
  pre {{
    background: #1f2a2e;
    color: #e8e6e0;
    padding: 14px 18px;
    border-radius: 8px;
    overflow-x: auto;
    font-size: 9.5pt;
    line-height: 1.5;
  }}
  pre code {{
    background: none;
    color: inherit;
    padding: 0;
  }}
  hr {{
    border: none;
    border-top: 2px solid #d4e8d7;
    margin: 24px 0;
  }}
  strong {{ color: #1f2a2e; }}
  a {{ color: #3A7D44; }}
  ul, ol {{ padding-left: 20px; }}
  li {{ margin-bottom: 4px; }}
  .header {{
    text-align: center;
    padding: 20px 0 10px;
    border-bottom: 3px solid #3A7D44;
    margin-bottom: 20px;
  }}
  .header h1 {{ border: none; margin: 0; font-size: 26pt; }}
  .header p {{ color: #666; margin: 4px 0 0; }}
  @media print {{
    body {{ padding: 0; }}
    pre {{ page-break-inside: avoid; }}
    h2, h3 {{ page-break-after: avoid; }}
    table {{ page-break-inside: avoid; }}
  }}
</style>
</head>
<body>
<div class="header">
  <h1>UNINOVARE</h1>
  <p>Documentacao Tecnica Completa &mdash; v2.0 &mdash; Marco 2026</p>
</div>
{html_body}
</body>
</html>"""

with open(html_file, 'w', encoding='utf-8') as f:
    f.write(html_full)

print(f'HTML gerado: {html_file}')
print(f'')
print(f'Para gerar PDF:')
print(f'  1. Abra o arquivo HTML no navegador')
print(f'  2. Ctrl+P > Salvar como PDF')
print(f'  3. Salve como: UNINOVARE-Documentacao-Tecnica-v2.pdf')
