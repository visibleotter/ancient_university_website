# -*- coding: utf-8 -*-
# Шаг 3: пишет записи art/ru/*.md и добавляет их id в поле art: карточек.
import os, re, sys, json, os
sys.stdout.reconfigure(encoding='utf-8')
S = os.path.dirname(os.path.abspath(__file__))
SITE = r'C:\Stuff\ancient_university_website\site\src\content'
d = json.load(open(S + r'\art_resolved.json', encoding='utf-8'))
rows, meta = d['rows'], d['meta']
existing_commons = set()
for f in os.listdir(SITE + r'\art\ru'):
    m = re.search(r'^commons: "(.+)"$', open(SITE + r'\art\ru\\' + f, encoding='utf-8').read(), re.M)
    if m: existing_commons.add(m.group(1))

def q(s): return s.replace('\\', '').replace('"', '\\"')
count = {}; per_card = {}; written = 0; skipped = []
for r in rows:
    c, f = r.get('card'), r.get('pick')
    if not c or not f or not meta.get(f) or f in existing_commons:
        if c and f: skipped.append((c, r['desc'][:60], 'no meta' if not meta.get(f) else 'dup'))
        continue
    existing_commons.add(f)
    desc = re.sub(r'🇷🇺|⚠|❓', '', r['desc']).strip()
    # «Артист, «Название», дата (Музей)»
    m = re.match(r'^(?P<artist>[^«]+?),\s*«(?P<title>[^»]+(?:»[^«(]*«[^»]+)?)»(?P<rest>.*)$', desc)
    if m:
        artist = m.group('artist').strip(); title = m.group('title').strip(); rest = m.group('rest')
    else:
        artist = None; title = desc; rest = ''
    museum = None
    mm = re.search(r'\(([^()]+)\)\s*$', rest)
    if mm: museum = mm.group(1).strip(); rest = rest[:mm.start()]
    date = rest.strip(' ,;') or 'Новое время'
    date = re.sub(r',?\s*(скульптура|бронза|фреска|плафон[^,]*)\s*$', '', date).strip(' ,') or 'Новое время'
    low = desc.lower()
    kind = 'sculpture' if ('скульптур' in low or 'бронза' in low or 'мрамор' in low) else 'fresco' if ('фреск' in low or 'плафон' in low) else 'painting'
    if c not in count:
        nums = [int(m.group(1)) for f2 in os.listdir(os.path.join(SITE, 'art', 'ru')) for m in [re.match(re.escape(c) + r'-art-(\d+)\.md$', f2)] if m]
        count[c] = max(nums, default=0)
    count[c] += 1
    aid = f'{c}-art-{count[c]:02d}'
    mt = meta[f]
    lic = mt['license'] or ''
    lic_ru = 'общественное достояние' if re.search(r'public domain|PD', lic, re.I) else lic
    fm = ['---', f'title: "{q(title)}"']
    if artist: fm.append(f'artist: "{q(artist)}"')
    fm += [f'date: "{q(date)}"', 'period: later', f'kind: {kind}', f'museum: "{q(museum or "—")}"', f'commons: "{q(f)}"']
    if mt['artist']: fm.append(f'credit: "{q(mt["artist"])}"')
    if lic_ru: fm.append(f'license: "{q(lic_ru)}"')
    if r.get('caution'): fm.append('caution: true')
    if r.get('dispute'): fm.append('reliability: disputed')
    fm.append('---')
    body = 'Подборка из тома «Мифы Греции в искусстве».' + (' Произведение из российского музея или русского художника.' if r.get('ru') else '')
    open(SITE + rf'\art\ru\{aid}.md', 'w', encoding='utf-8').write('\n'.join(fm) + '\n' + body + '\n')
    per_card.setdefault(c, []).append(aid); written += 1

for c, ids in per_card.items():
    p = SITE + rf'\cards\ru\{c}.md'
    s = open(p, encoding='utf-8').read()
    head, rest = s.split('\n---', 1)
    m = re.search(r'^art: \[(.*)\]$', head, re.M)
    if m:
        old = [x.strip().strip('"\'') for x in m.group(1).split(',') if x.strip()]
        head = head.replace(m.group(0), 'art: [' + ', '.join(old + ids) + ']')
    else:
        head += '\nart: [' + ', '.join(ids) + ']'
    open(p, 'w', encoding='utf-8').write(head + '\n---' + rest)
print('written', written, 'cards', len(per_card))
for k, v in sorted(per_card.items()): print(f'  {k}: {len(v)}')
print('skipped', len(skipped))
json.dump(skipped, open(S + r'\art_skipped.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
