# -*- coding: utf-8 -*-
"""Assemble one volume from the three math/geometry files. Text is moved verbatim; only headings, cross-refs and duplicates change."""
import re
H = '/home/claude/'
M = open(H + 'Математика_ранних_греков.md', encoding='utf-8').read().split('\n')
G = open(H + 'Геометрия_Евклида_и_наглядная_геометрия.md', encoding='utf-8').read().split('\n')
K = open(H + 'Введение_в_математику_6-7_лет.md', encoding='utf-8').read().split('\n')
ATLAS = 'https://claude.ai/artifact/QrDkCVE6AqK7syuNyHdvA4'

def idx(L, s, start=0):
    for i in range(start, len(L)):
        if L[i].startswith(s): return i
    raise KeyError(s)

# ---------- history (M)
m_src = idx(M, '## Главная трудность: источники'); m_p1 = idx(M, '# Часть I. До греков'); m_p2 = idx(M, '# Часть II.')
m_p3 = idx(M, '# Часть III.'); m_p4 = idx(M, '# Часть IV.'); m_myth = idx(M, '## §21.'); m_lit = idx(M, '## §22.')
epigraph = M[idx(M, '> **Аристотель, «Метафизика», XIII'):m_src - 1]
hist_sources = M[m_src:m_p1]
hist_p1 = M[m_p1 + 1:m_p2]          # §1 (heading line dropped, new part title)
hist_p2 = M[m_p2 + 1:m_p3]
hist_p3 = M[m_p3 + 1:m_p4]
hist_myth = M[m_myth + 1:m_lit]
hist_lit = M[m_lit + 1:]

# ---------- geometry (G)
g = {}
for n in ['0', '0а'] + [str(i) for i in range(1, 16)]:
    g[n] = idx(G, f'# {n}. ')
order = ['0', '0а'] + [str(i) for i in range(1, 16)]
def gsec(n):
    i = order.index(n); end = g[order[i + 1]] if i + 1 < len(order) else len(G)
    return G[g[n]:end]

def strip_rule(L):
    while L and L[-1].strip() in ('', '---'): L = L[:-1]
    return L

def geo_refs(L):
    out = []
    for s in L:
        s = s.replace('«Математика_ранних_греков.md», §1', '§§H1').replace('(§2 свода математики)', '(§§H2)')
        s = s.replace('«Математика_ранних_греков.md» (§ о Гиппократе и Архите)', '§§H7 и §§H12')
        s = s.replace('подробности — «Математика_ранних_греков.md».', 'подробности — §§H2–§§H15.')
        s = s.replace('— см. «Математика_ранних_греков.md».', '— см. §§H10.')
        s = s.replace('Подробности — «Математика_ранних_греков.md», §Евдокс.', 'Подробности — §§H14.')
        s = re.sub(r'§0а(\.\d+)?', lambda m: '§Е' + (m.group(1) or ''), s)
        s = re.sub(r'§(\d+(?:\.\d+)?)', r'§Г\1', s)
        s = s.replace('§§H', '§').replace('§Г', '§Г')
        out.append(s)
    return out

def geo_head(L, eud=False):
    out = []
    for s in L:
        m = re.match(r'^(#+) (0а|\d+)(\.\d+)?\. (.*)$', s)
        if m:
            lvl, num, sub, title = m.groups()
            lab = ('Е' if num == '0а' else 'Г' + num) + (sub or '')
            if eud and not sub: out.append(f'## Евдем Родосский: первая «История геометрии»'); continue
            out.append('#' * (len(lvl) + 1) + f' {lab}. {title}')
        elif s.startswith('#'):
            out.append('#' + s)
        else:
            out.append(s)
    return out

eudemus = geo_head(geo_refs(strip_rule(gsec('0а'))), eud=True)
geo_main = []
for n in ['0'] + [str(i) for i in range(1, 13)] + ['14']:
    geo_main += geo_head(geo_refs(strip_rule(gsec(n)))) + ['', '---', '']
geo_myth = geo_refs(strip_rule(gsec('13')))[1:]
geo_lit = strip_rule(gsec('15'))[1:]

# ---------- kids (K)
k_intro_end = idx(K, '## Как заниматься')
kids = K[k_intro_end - 0:]
kids_head = ['## Как устроен курс'] + K[2:k_intro_end]
kids_head = [s.replace('ссылка на раздел свода «Математика_ранних_греков.md» (знак §);', 'ссылка на раздел частей I–III этого тома (знак §);') for s in kids_head]
def kid_head(L):
    return [('#' + s) if s.startswith('#') else s for s in L]
kids = kid_head(kids)

# ---------- myths: history table + geometry items not already in the table
skip_items = ('**«Пифагор доказал теорему Пифагора».**', '**«Египтяне размечали прямой угол', '**«Над входом в Академию')
items, cur, drop = [], [], False
in_quote = False
for s in geo_myth:
    if re.match(r'^\d+\. ', s):
        if cur and not drop and any(x.strip() for x in cur): items.append(cur)
        cur = [s]; drop = any(k in s for k in skip_items)
    elif s.startswith('>'):
        continue  # the Philoponus block duplicates §13
    else:
        cur.append(s)
if cur and not drop: items.append(cur)
myth_geo = []
for i, it in enumerate(items, 1):
    it[0] = re.sub(r'^\d+\. ', f'{i}. ', it[0]); myth_geo += [x for x in it]
while myth_geo and not myth_geo[-1].strip(): myth_geo.pop()
myth_geo = [x for j, x in enumerate(myth_geo) if not (x == '' and j + 1 < len(myth_geo) and myth_geo[j + 1] == '')]

# ---------- literature union
drop_lit = ('Мордухай-Болтовского', 'Щетникова', 'Heath T. L. A History', 'Netz R. The Shaping', 'Ван дер Варден')
geo_lit2 = [s for s in geo_lit if not any(d in s for d in drop_lit)]
geo_lit2 = [s.replace('— 46 рисунков к этому тому.', '— 46 рисунков к этому тому (часть IV и раздел о Евдеме).') for s in geo_lit2]

# ---------- assemble
TITLE = '# Математика и геометрия древних греков: история, наглядная геометрия, курс для детей'
intro = f'''{TITLE}

Это единый том по математике и геометрии греков. Он заменяет три прежних файла: «Математика ранних греков» (история идей от Египта до Евклида), «Геометрия Евклида и наглядная геометрия» (законы, доказательства, применения, Евдем) и «Введение в математику для детей 6–7 лет». Текст перенесён без переписывания; повторы убраны, вместо них стоят ссылки «см. выше». Биографии и учения философов остаются в отдельном файле «Ранние_греческие_философы.md», мифология — в «Мифы_Греции_в_искусстве.md» и «Мифология_Греции_кратко.md».

**Атлас чертежей.** Рисунки вынесены на страницу [Атлас чертежей Евклида]({ATLAS}). Ссылка вида [Рис. 1]({ATLAS}#fig-1) ведёт к нужному чертежу. Цвета — по изданию Оливера Бирна (1847): равные части окрашены одинаково.

**Условные обозначения:**
- ✅ — засвидетельствовано источником IV в. до н. э. (Платон, Аристотель, Евдем), самим математическим текстом (Евклид, Архимед, Герон) или ещё более ранним;
- 📜 — позднее предание или легенда: Прокл, Ямвлих, Диоген Лаэртский, Плутарх и др.;
- ❓ — спорно.

**Для какого возраста:**
- 👶 — 6–7 лет: показать руками, циркулем, верёвкой, вырезать из бумаги (весь курс — часть VI);
- 🧒 — 8–10 лет: понять идею, построить самому;
- 🧑 — 11–15 лет: провести доказательство полностью.

**Нумерация.** Разделы истории — §1–§22 (на них ссылается и детский курс), разделы о Евклиде и наглядной геометрии — §Г0–§Г14, о Евдеме — §Е.1–§Е.12.

**Источники текста.** Греческие цитаты извлечены из изданий Perseus и First1KGreek (Евклид — по изданию Гейберга) и сверены по этим файлам. Переводы наши. Комментария Прокла к Евклиду в этих собраниях нет, поэтому Прокл всюду дан только в переводе, с пометкой.

'''.split('\n') + epigraph + ['', '---', '']

parts = []
parts += ['# Часть I. Истоки и источники', ''] + strip_rule(hist_sources) + ['', '---', '']
parts += eudemus + ['', '---', '']
parts += ['## До греков: Египет и Вавилон'.replace('## До греков: Египет и Вавилон', '')] if False else []
parts += strip_rule(hist_p1) + ['', '---', '']
parts += ['# Часть II. По порядку: люди и открытия'] + strip_rule(hist_p2) + ['', '---', '']
parts += ['# Часть III. Сумма идей по темам'] + strip_rule(hist_p3) + ['', '---', '']
parts += ['# Часть IV. «Начала» Евклида и наглядная геометрия: законы, доказательства, применения', ''] + strip_rule(geo_main) + ['', '---', '']
parts += ['# Часть V. Мифы и ошибки — что повторяют, а источники не подтверждают', '', '## §21. Проверка популярных утверждений'] + strip_rule(hist_myth) + \
         ['', '### Мифы о Евклиде, Архимеде и геометрии', ''] + myth_geo + ['', '---', '']
parts += ['# Часть VI. Как греки придумали математику: курс для детей 6–7 лет', ''] + kids_head + kids + ['', '---', '']
parts += ['# §22. Литература', ''] + strip_rule(hist_lit) + ['', '**Евклид, наглядная геометрия, Евдем.**'] + geo_lit2
out = intro + parts

fix = {'Мифы о золотом сечении — §Г13.': 'Мифы о золотом сечении — часть V.',
       'начало выписки и чертёж — в §Г10.1': 'начало выписки — в §7, разбор и чертёж — в §Г10.1',
       '§Г0–§Г14': '§Г0–§Г13'}
out2 = []
for s_ in out:
    for a, b_ in fix.items(): s_ = s_.replace(a, b_)
    s_ = re.sub(r'^(#+) Г14(\.\d+)?\. ', lambda m: f'{m.group(1)} Г13{m.group(2) or ""}. ', s_)
    out2.append(s_)
out = out2
# ---------- dedupe quote blocks: keep first, replace later copies with a pointer
text_lines, seen, cur_head = [], {}, ''
i = 0
while i < len(out):
    s = out[i]
    if s.startswith('#'): cur_head = s.lstrip('#').strip()
    m = re.match(r'^> \*\*(.+)\*\*$', s)
    if m:
        j = i
        while j < len(out) and out[j].startswith('>'): j += 1
        key = m.group(1)
        if key in seen:
            text_lines.append(f'> *Цитата «{key}» приведена выше, в разделе «{seen[key]}».*')
            i = j; continue
        seen[key] = cur_head
    text_lines.append(s); i += 1

# table of contents
toc = ['## Оглавление', '']
for s in text_lines:
    m = re.match(r'^(#{1,2}) (.+)$', s)
    if m and not s.startswith('# Математика и геометрия') and m.group(2) != 'Оглавление':
        t = m.group(2); a = re.sub(r'[^\w\- ]', '', t.lower()).strip().replace(' ', '-')
        toc.append(('' if len(m.group(1)) == 1 else '  ') + f'- [{t}](#{a})')
pos = text_lines.index('# Часть I. Истоки и источники')
final = text_lines[:pos] + toc + ['', '---', ''] + text_lines[pos:]
res = '\n'.join(final)
res = re.sub(r'\n{3,}', '\n\n', res)
res = re.sub(r'(\n---\n\n)(---\n\n)+', r'\1', res)
open(H + 'Математика_и_геометрия_греков.md', 'w', encoding='utf-8').write(res + '\n')
print(len(res), 'dedup pointers:', res.count('приведена выше'))
