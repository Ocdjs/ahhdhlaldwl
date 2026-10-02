# Baut notuebernachtung-prototyp.html aus Designsystem-Dateien und app.js/app.css
import re
ds='../designsystem/'
tok=open(ds+'gen/tokens.css').read()
css=re.sub(r'^@import url\("[^"]*"\);\s*','',open(ds+'project/components/bundle.css').read())
bjs=open(ds+'project/components/bundle.js').read()
appcss=open('app.css').read(); js=open('app.js').read()
html=f'''<title>Notübernachtung Prototyp</title>
<meta name="description" content="Klickbarer Tablet-Prototyp der Notübernachtungs-App ohne Nextcloud">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible+Mono:wght@400;600&family=Atkinson+Hyperlegible+Next:wght@400;600;700&family=Noto+Sans:wght@400;600&family=Noto+Sans+Arabic:wght@400;600&display=swap">
<style>
/* Layout: Tablet-App im Querformat, Leiste links, Kopfzeile oben, Inhalt scrollt; Werte aus dem Designsystem „Notübernachtung“. */
{tok}
</style>
<style>
{css}
</style>
<style>
{appcss}
</style>
<div id="app"></div>
<script>
{bjs}
</script>
<script>
{js}
</script>
'''
open('notuebernachtung-prototyp.html','w').write(html)
open('preview.html','w').write('<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>[hidden]{display:none!important}</style></head><body>'+html+'</body></html>')
print(len(html))
