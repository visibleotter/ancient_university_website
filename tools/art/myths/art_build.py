# -*- coding: utf-8 -*-
# Шаг 2: раскладывает найденные на Commons картины по карточкам, проверяет файлы (imageinfo) и пишет записи art + поле art: в карточки.
import os, re, sys, json, time, subprocess, urllib.parse, unicodedata, os
sys.stdout.reconfigure(encoding='utf-8')
S = os.path.dirname(os.path.abspath(__file__))
VOL = r'C:\Stuff\ancient_university_website\docs\volumes\Мифы_Греции_в_искусстве.md'
SITE = r'C:\Stuff\ancient_university_website\site\src\content'
UA = 'AncientUniversitySiteBuilder/0.1 (educational static site)'
rows = json.load(open(S + r'\art_rows.json', encoding='utf-8'))

# курсивные подзаголовки (*Афина*) — по номеру строки
L = open(VOL, encoding='utf-8').read().split('\n')
ital = {}
cur = None
for i, l in enumerate(L):
    if l.startswith('#'): cur = None
    m = re.fullmatch(r'\*([^*]+)\*', l.strip())
    if m: cur = m.group(1)
    ital[i + 1] = cur

def has(s, *ks): return any(k.lower() in s.lower() for k in ks)
def classify(r):
    sec, sub, d = r['sec'] or '', r['sub'] or '', r['desc']
    it = ital.get(r['line']) or ''
    if sec.startswith('5.'):
        if has(d, 'Сатурн'): return 'cronus-swallows'
        if has(d, 'титан'): return 'titans'
        if has(d, 'гигант', 'Гигант'): return 'gigantomachy'
        return None
    if sec.startswith('6.'):
        if has(d, 'Пандор'): return 'pandora'
        if has(d, 'Девкалион', 'потоп', 'век'): return 'pandora'
        return 'prometheus'
    if sub == 'Зевс и его возлюбленные': return 'zeus-loves'
    if sub == 'Олимпийцы':
        if has(d, 'Рождение Венеры'): return None  # уже есть botticelli-venus
        for keys, c in [(('Арахн', 'Минерв', 'Паллад', 'Афин'), 'athena'), (('Дафн', 'Гиацинт', 'Марси', 'Пифон', 'Аполлон'), 'apollo'),
                        (('Ниоб', 'Актеон', 'Каллисто', 'Диан'), 'artemis'), (('Вакх', 'Ариадн', 'Дионис', 'Гермес', 'Меркури', 'Вакхан'), 'hermes-dionysus'),
                        (('Венер', 'Марс', 'Адонис', 'Вулкан', 'грации', 'Весна', 'Амур'), 'aphrodite')]:
            if has(d, *keys): return c
        return {'Афина': 'athena', 'Аполлон': 'apollo', 'Артемида (Диана)': 'artemis', 'Дионис (Вакх)': 'hermes-dionysus'}.get(it, 'aphrodite' if 'Афродита' in it else None)
    if sub == 'Посейдон и море': return 'poseidon-sea'
    if sub == 'Аид и подземное царство': return 'demeter-persephone' if has(d, 'Прозерпин', 'Персефон') else 'hades-underworld'
    if sub == 'Музы, Пан, сатиры': return 'muses-pan'
    if sec.startswith('8.') and not sub:
        if has(d, 'Арахн'): return 'athena'
        if has(d, 'Мидас'): return 'apollo'
        return None
    m = {'Деметра и Персефона': 'demeter-persephone', 'Орфей и Эвридика': 'orpheus', 'Эрот и Психея': 'eros-psyche', 'Нарцисс и Эхо': 'narcissus-echo',
         'Солнце, Луна, Заря и Фаэтон': 'phaethon', 'Дедал, Икар, Пасифая': 'daedalus-icarus', 'Пигмалион': 'pygmalion',
         'Тесей, Минотавр, Ариадна': 'theseus', 'Кентавры, лапифы, амазонки': 'centaurs-amazons', 'Кадм, Эдип, Пенфей, Семеро против Фив': 'oedipus',
         'Орест и эринии': 'atreids'}
    if sub in m: return m[sub]
    if sec in ('Другие истории', 'Цитаты') or sec.startswith('Двенадцать'):
        return 'heracles-fate' if has(d, 'Омфал', 'Деянир', 'Несс', 'Алкест', 'Апофеоз', 'апофеоз', 'Геба', 'костёр', 'Гибель') else 'heracles'
    if sec.startswith('9.'): return 'perseus'
    if sec.startswith('10.'): return 'bellerophon'
    if sec.startswith('12.'): return 'theseus'
    if sec.startswith('13.'): return 'argonauts'
    if sec.startswith('14.'): return 'atalanta'
    if sec.startswith('15.'): return 'oedipus'
    if sec.startswith('16.') or sec.startswith('Ифигения'): return 'atreids'
    if sec.startswith('17.'): return 'trojan-war-prehistory'
    if sec.startswith('18.'):
        if has(d, 'Андромах'): return 'hector-andromache'
        if has(d, 'Приам') and has(d, 'Ахилл'): return 'iliad-ring'
        if has(d, 'Главк'): return 'glaucus-diomedes'
        if has(d, 'Гомер'): return 'homer'
        if has(d, 'Орест', 'эрини', 'Клитемнестр', 'Агамемнон'): return 'atreids'
        if has(d, 'Ахилл', 'Патрокл', 'Брисеид', 'Гектор'): return 'achilles'
        return 'trojan-horse'
    if sec.startswith('19.'): return 'odysseus-adventures'
    return None

def norm(s):
    return ''.join(c for c in unicodedata.normalize('NFD', s.lower()) if unicodedata.category(c) != 'Mn')

def api(params):
    url = 'https://commons.wikimedia.org/w/api.php?' + urllib.parse.urlencode(dict(params, format='json'))
    for attempt in range(5):
        r = subprocess.run(['curl', '-sS', '-A', UA, url], capture_output=True)
        try: return json.loads(r.stdout)
        except Exception: time.sleep(30 * (attempt + 1))
    return None

chosen = []
for r in rows:
    r['card'] = classify(r)
    if not r['card']: continue
    f = r.get('file')
    if not f and r.get('cands') and r.get('query'):
        tok = norm(r['query'].split()[0])
        for c in r['cands']:
            if tok in norm(c) and re.search(r'\.(jpe?g|png|tiff?)$', c, re.I):
                f = c; break
    if f:
        r['pick'] = f; chosen.append(r)

VERIFY = False  # API Commons под лимитом: проверку лицензий делаем позже
# imageinfo пачками по 40
meta = {}
names = list({r['pick'] for r in chosen})
for i in (range(0, len(names), 40) if VERIFY else []):
    res = api(dict(action='query', titles='|'.join('File:' + n for n in names[i:i + 40]), prop='imageinfo', iiprop='extmetadata|size'))
    norml = {x['to'][5:]: x['from'][5:] for x in (res or {}).get('query', {}).get('normalized', [])}
    for p in (res or {}).get('query', {}).get('pages', {}).values():
        n = p['title'][5:]; n = norml.get(n, n)
        if 'imageinfo' not in p: meta[n] = None; continue
        md = p['imageinfo'][0].get('extmetadata', {})
        strip = lambda k: re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', '', md.get(k, {}).get('value', ''))).strip()
        meta[n] = dict(artist=strip('Artist')[:120], license=strip('LicenseShortName'), w=p['imageinfo'][0].get('width', 0))
    time.sleep(2)

if not VERIFY:
    meta = {n: dict(artist='', license='', w=0) for n in names}
json.dump(dict(rows=rows, meta=meta), open(S + r'\art_resolved.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
ok = [r for r in chosen if meta.get(r['pick'])]
print('classified', sum(1 for r in rows if r['card']), 'picked', len(chosen), 'verified', len(ok))
