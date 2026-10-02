# bundle.js = Kopfzeile + Symbole + Kernfunktionen
hdr='/* @ds-bundle: {"format":4,"namespace":"Nu","components":[]} */\n'
open('project/components/bundle.js','w').write(hdr+open('gen/icons.js').read()+'\n'+open('gen/nu-core.js').read())
