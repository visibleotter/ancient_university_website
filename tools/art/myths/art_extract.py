# -*- coding: utf-8 -*-
# Разбирает «Европа и Россия» из тома «Мифы Греции в искусстве» и ищет файлы на Commons (через curl, с паузами).
import os, re, sys, json, time, subprocess, urllib.parse
sys.stdout.reconfigure(encoding='utf-8')
VOL = r'C:\Stuff\ancient_university_website\docs\volumes\Мифы_Греции_в_искусстве.md'
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'art_rows.json')
UA = 'AncientUniversitySiteBuilder/0.1 (educational static site)'
L = open(VOL, encoding='utf-8').read().split('\n')
sec = sub = mode = None; rows = []
for i, l in enumerate(L):
    if l.startswith('### '): sec, sub = l[4:], None
    elif l.startswith('##### '): sub = l[6:]
    elif l.startswith('**Европа и Россия'): mode = 'later'
    elif l.startswith('**Античность'): mode = 'anc'
    elif l.startswith('#### ') or l.startswith('## '): mode = None
    elif l.startswith('- ') and mode == 'later' and sec not in ('Цитаты',):
        rows.append(dict(sec=sec, sub=sub, line=i + 1, raw=l[2:]))

def api(params):
    url = 'https://commons.wikimedia.org/w/api.php?' + urllib.parse.urlencode(dict(params, format='json'))
    for attempt in range(4):
        r = subprocess.run(['curl', '-sS', '-A', UA, url], capture_output=True)
        try:
            return json.loads(r.stdout)
        except Exception:
            time.sleep(20 * (attempt + 1))
    return None

for r in rows:
    raw = r['raw']
    desc = re.split(r' — \[| — ', raw, 1)[0]
    r['desc'] = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', desc).strip()
    r['caution'] = '⚠' in raw
    r['ru'] = '🇷🇺' in raw
    r['dispute'] = '❓' in raw
    m = re.search(r'commons\.wikimedia\.org/wiki/File:([^)\s]+)', raw)
    r['file'] = urllib.parse.unquote(m.group(1)).replace('_', ' ') if m else None
    m = re.search(r'search=([^&)]+)', raw)
    r['query'] = urllib.parse.unquote_plus(m.group(1)) if m else None
    m = re.search(r'\]\((https?://[^)]+)\)', raw)
    r['links'] = re.findall(r'\]\((https?://[^)]+)\)', raw)

for n, r in enumerate(rows):
    if r['file'] or not r['query']:
        continue
    res = api(dict(action='query', list='search', srsearch=r['query'] + ' filetype:bitmap', srnamespace=6, srlimit=5))
    r['cands'] = [s['title'][5:] for s in (res or {}).get('query', {}).get('search', [])]
    time.sleep(1.5)
    if n % 20 == 0:
        print(n, len(rows), flush=True)
        json.dump(rows, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
json.dump(rows, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('done', len(rows), sum(1 for r in rows if r.get('file') or r.get('cands')))
