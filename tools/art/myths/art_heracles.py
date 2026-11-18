# -*- coding: utf-8 -*-
# Досбор: картины к Гераклу (в томе они идут после «### Цитаты» внутри Части II, первый проход их пропустил).
import os, re, sys, json, time, subprocess, urllib.parse
sys.stdout.reconfigure(encoding='utf-8')
S = os.path.dirname(os.path.abspath(__file__))
VOL = r'C:\Stuff\ancient_university_website\docs\volumes\Мифы_Греции_в_искусстве.md'
UA = 'AncientUniversitySiteBuilder/0.1 (educational static site)'
rows = json.load(open(S + r'\art_rows.json', encoding='utf-8'))
L = open(VOL, encoding='utf-8').read().split('\n')
start = next(i for i, l in enumerate(L) if l.startswith('## Часть II'))
end = next(i for i, l in enumerate(L) if l.startswith('## Часть III'))
have = {r['line'] for r in rows}
mode = None; new = []
for i in range(start, end):
    l = L[i]
    if l.startswith('**Европа и Россия'): mode = 'later'
    elif l.startswith('**Античность') or l.startswith('#'): mode = None if not l.startswith('#####') else mode
    elif l.startswith('- ') and mode == 'later' and (i + 1) not in have:
        raw = l[2:]
        r = dict(sec='Цитаты', sub=None, line=i + 1, raw=raw)
        r['desc'] = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', re.split(r' — \[| — ', raw, maxsplit=1)[0]).strip()
        r['caution'] = '⚠' in raw; r['ru'] = '🇷🇺' in raw; r['dispute'] = '❓' in raw
        m = re.search(r'commons\.wikimedia\.org/wiki/File:([^)\s]+)', raw)
        r['file'] = urllib.parse.unquote(m.group(1)).replace('_', ' ') if m else None
        m = re.search(r'search=([^&)]+)', raw)
        r['query'] = urllib.parse.unquote_plus(m.group(1)) if m else None
        if not r['file'] and r['query']:
            url = 'https://commons.wikimedia.org/w/api.php?' + urllib.parse.urlencode(dict(action='query', list='search', srsearch=r['query'] + ' filetype:bitmap', srnamespace=6, srlimit=5, format='json'))
            try: res = json.loads(subprocess.run(['curl', '-sS', '-A', UA, url], capture_output=True).stdout)
            except Exception: res = {}
            r['cands'] = [s['title'][5:] for s in res.get('query', {}).get('search', [])]
            time.sleep(1.5)
        new.append(r)
rows += new
json.dump(rows, open(S + r'\art_rows.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('heracles rows added', len(new))
