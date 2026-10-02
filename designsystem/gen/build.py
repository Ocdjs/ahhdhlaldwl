import os, sys, shutil
sys.path.insert(0,'gen')
import comps1, comps2, comps3, comps4, comps5, comps6, comps7
from comps1 import COMPS
root='project/components'
for c in COMPS:
    d=f"{root}/{c['name']}"; os.makedirs(d, exist_ok=True)
    attrs=f'group="{c["group"]}" height={c["height"]}'
    if c['width']: attrs+=f' width={c["width"]}'
    if c['subtitle']: attrs+=f' subtitle="{c["subtitle"]}"'
    body=c['html'].strip()
    if 'Nu.mountIcons' not in body:
        body+='\n<script>Nu.mountIcons();</script>'
    html=f'<!-- @dsCard {attrs} -->\n<!doctype html>\n<html lang="de">\n<head><meta charset="utf-8"><title>{c["name"]}</title></head>\n<body class="nu" style="margin:0;background:var(--grund)">\n{body}\n</body>\n</html>\n'
    assert '<iframe' not in html
    open(f"{d}/preview.html",'w').write(html)
    open(f"{d}/README.md",'w').write(c['readme'].strip()+"\n")
print(len(COMPS),'components')
# lokale Testseiten mit eingebundenen Werten
os.makedirs('gen/test', exist_ok=True)
tok=open('gen/tokens.css').read(); css=open(f'{root}/bundle.css').read(); js=open(f'{root}/bundle.js').read()
for c in COMPS:
    p=open(f"{root}/{c['name']}/preview.html").read()
    p=p.replace('<head>', '<head><style>'+tok+'</style><style>'+css+'</style><script>'+js+'</script>',1)
    open(f"gen/test/{c['name']}.html",'w').write(p)
