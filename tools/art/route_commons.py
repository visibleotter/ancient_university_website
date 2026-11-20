# -*- coding: utf-8 -*-
"""Иллюстрации с Wikimedia Commons для карточек маршрута: поиск, проверка лицензии, запись art/ru/<card>-pic-NN.md
и добавление id в поле art: карточки. Спецификация — JSON-файл:
  { "card-id": [ {"q": "поисковый запрос", "title": "...", "artist": "...", "date": "...", "museum": "...",
                  "period": "ancient|later|science", "kind": "painting|...", "file": "точное имя (необязательно)", "note": "текст"} ] }

    python -I tools/art/route_commons.py tools/art/specs/pythagoras.json
"""
import os, re, sys, json, time, subprocess, urllib.parse
sys.stdout.reconfigure(encoding='utf-8')
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SITE = os.path.join(ROOT, 'site', 'src', 'content')
UA = 'AncientUniversitySiteBuilder/0.1 (educational static site)'

def api(params):
    url = 'https://commons.wikimedia.org/w/api.php?' + urllib.parse.urlencode(dict(params, format='json'))
    for attempt in range(5):
        r = subprocess.run(['curl', '-sS', '-A', UA, url], capture_output=True)
        try: return json.loads(r.stdout)
        except Exception: time.sleep(30 * (attempt + 1))
    return None
def strip(s): return re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', '', s or '')).strip()
def q(s): return (s or '').replace('\\', '').replace('"', '\\"')

spec = json.load(open(sys.argv[1], encoding='utf-8'))
used = set()
for f in os.listdir(os.path.join(SITE, 'art', 'ru')):
    m = re.search(r'^commons: "(.+)"$', open(os.path.join(SITE, 'art', 'ru', f), encoding='utf-8').read(), re.M)
    if m: used.add(m.group(1))
total = 0
for card, items in spec.items():
    ids = []
    for it in items:
        if it.get('file'):
            res = api(dict(action='query', titles='File:' + it['file'], prop='imageinfo', iiprop='extmetadata'))
        else:
            res = api(dict(action='query', generator='search', gsrsearch=it['q'] + ' filetype:bitmap', gsrnamespace=6, gsrlimit=5, prop='imageinfo', iiprop='extmetadata'))
        time.sleep(2)
        pages = sorted((res or {}).get('query', {}).get('pages', {}).values(), key=lambda p: p.get('index', 0))
        pages = [p for p in pages if 'imageinfo' in p and p['title'][5:] not in used]
        if not pages: print('  нет:', card, it.get('q') or it.get('file')); continue
        p = pages[0]; fname = p['title'][5:]; used.add(fname)
        md = p['imageinfo'][0].get('extmetadata', {})
        lic = strip(md.get('LicenseShortName', {}).get('value'))
        lic = 'общественное достояние' if re.search(r'public domain|PD|CC0', lic, re.I) else lic
        credit = strip(md.get('Artist', {}).get('value'))[:120]
        n = 1
        while os.path.exists(os.path.join(SITE, 'art', 'ru', f'{card}-pic-{n:02d}.md')): n += 1
        aid = f'{card}-pic-{n:02d}'
        fm = ['---', f'title: "{q(it["title"])}"']
        if it.get('artist'): fm.append(f'artist: "{q(it["artist"])}"')
        fm += [f'date: "{q(it.get("date", "—"))}"', f'period: {it.get("period", "later")}', f'kind: {it.get("kind", "painting")}',
               f'museum: "{q(it.get("museum", "—"))}"', f'commons: "{q(fname)}"']
        if credit: fm.append(f'credit: "{q(credit)}"')
        if lic: fm.append(f'license: "{q(lic)}"')
        if it.get('caution'): fm.append('caution: true')
        fm.append('---')
        open(os.path.join(SITE, 'art', 'ru', aid + '.md'), 'w', encoding='utf-8').write('\n'.join(fm) + '\n' + it.get('note', 'Изображение с Wikimedia Commons.') + '\n')
        ids.append(aid); total += 1
        print(card, '→', fname, '|', lic)
    if ids:
        path = os.path.join(SITE, 'cards', 'ru', card + '.md')
        s = open(path, encoding='utf-8').read(); head, rest = s.split('\n---', 1)
        m = re.search(r'^art: \[(.*)\]$', head, re.M)
        if m:
            old = [x.strip().strip('"\'') for x in m.group(1).split(',') if x.strip()]
            head = head.replace(m.group(0), 'art: [' + ', '.join(old + ids) + ']')
        else:
            head += '\nart: [' + ', '.join(ids) + ']'
        open(path, 'w', encoding='utf-8').write(head + '\n---' + rest)
print('written', total)
