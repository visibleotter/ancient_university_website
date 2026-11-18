# -*- coding: utf-8 -*-
"""Выгружает атлас для сайта: site/src/data/atlas.json (номер, раздел, название, ссылка, подпись, SVG, «как читать / сделать / в жизни»).
Запуск: cd tools/atlas && python export_site.py   (после правок figs.py / meta.py)."""
import json, os
import atlas, meta

out = []
for d in atlas.F:
    m = meta.META.get(d['n'])
    rec = dict(n=d['n'], sec=d['sec'], title=d['title'], ref=d['ref'], cap=d['cap'], svg=d['svg'])
    if m:
        rec.update(theme=m[0], ages=m[1], where=m[2], read=m[3], do=m[4], life=m[5])
    out.append(rec)
dst = os.path.join(os.path.dirname(__file__), '..', '..', 'site', 'src', 'data', 'atlas.json')
os.makedirs(os.path.dirname(dst), exist_ok=True)
with open(dst, 'w', encoding='utf-8') as f:
    json.dump(out, f, ensure_ascii=False, indent=1)
print(len(out), 'figures ->', os.path.normpath(dst))
