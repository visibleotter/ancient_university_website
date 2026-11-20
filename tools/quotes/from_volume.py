# -*- coding: utf-8 -*-
"""Переносит цитаты из блоков тома (> **Заголовок** / > *греческий* / > «перевод» / > <sub>заметка</sub>) в коллекцию quotes — дословно.

    python -I tools/quotes/from_volume.py

Список Q: id → (том, подстрока заголовка блока, автор, произведение, место). Существующие файлы не перезаписываются.
"""
import os, re, sys
sys.stdout.reconfigure(encoding='utf-8')
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
VOL = os.path.join(ROOT, 'docs', 'volumes')
OUT = os.path.join(ROOT, 'site', 'src', 'content', 'quotes', 'ru')
M = 'Математика_и_геометрия_греков.md'; F = 'Ранние_греческие_философы.md'
Q = [
 ('aristotle-met-985b', M, 'Аристотель, «Метафизика», I (A) 5, 985b23', 'Аристотель', '«Метафизика»', 'I, 5, 985b23–26; 986a1–3'),
 ('aristotle-phys-203a', M, 'Аристотель, «Физика», III, 4, 203a13', 'Аристотель', '«Физика»', 'III, 4, 203a13–15'),
 ('aristotle-met-1092b', M, '1092b10', 'Аристотель', '«Метафизика»', 'XIV, 5, 1092b10–13 = DK 45 A3'),
 ('euclid-7-def', M, 'Евклид, «Начала», VII, определения', 'Евклид', '«Начала»', 'VII, опр. 1–2, 6–7'),
 ('philolaus-b6', M, 'Филолай у Никомаха', 'Филолай', 'у Никомаха, «Руководство по гармонике», 9', 'DK 44 B6'),
 ('nicomachus-harm-6', M, 'Никомах, «Руководство по гармонике», 6', 'Никомах Герасский', '«Руководство по гармонике»', '6'),
 ('archytas-b1', M, 'Архит у Никомаха', 'Архит', 'у Никомаха, «Введение в арифметику», I, 3, 4', 'DK 47 B1'),
 ('diogenes-8-12', M, 'Диоген Лаэртский, VIII, 12', 'Диоген Лаэртский', '«О жизни, учениях и изречениях знаменитых философов»', 'VIII, 12'),
 ('iamblichus-vp-88', M, '«О пифагорейской жизни», 88', 'Ямвлих', '«О пифагорейской жизни»', '88'),
 ('aristotle-de-caelo-293a', M, 'II, 13, 293a20', 'Аристотель', '«О небе»', 'II, 13, 293a20–23'),
 ('aristotle-de-caelo-290b', M, 'II, 9, 290b12', 'Аристотель', '«О небе»', 'II, 9, 290b12–15'),
 ('euclid-1-47', M, 'Евклид, «Начала», I, 47', 'Евклид', '«Начала»', 'I, 47'),
 ('euclid-1-48', M, 'Евклид, «Начала», I, 48', 'Евклид', '«Начала»', 'I, 48'),
 ('philolaus-b1', F, 'Филолай у Диогена Лаэртского, VIII, 85', 'Филолай', 'у Диогена Лаэртского, VIII, 85', 'DK 44 B1'),
 ('plato-phaedo-61d', F, 'Платон, «Федон», 61d', 'Платон', '«Федон»', '61d–e'),
 ('diogenes-8-83', F, 'Диоген Лаэртский, VIII, 83', 'Диоген Лаэртский', '«О жизни, учениях и изречениях знаменитых философов»', 'VIII, 83 = DK 47 A1'),
 ('eudemus-archytas-stick', F, 'Евдем у Симпликия', 'Евдем у Симпликия', 'Комментарий к «Физике» Аристотеля', '467.26–32 = DK 47 A24'),
 ('aristotle-politics-1340b', F, '1340b25', 'Аристотель', '«Политика»', 'VIII, 6, 1340b25–29 = DK 47 A10'),
]

def blocks(text):
    cur = []
    for line in text.split('\n'):
        if line.startswith('>'):
            cur.append(line[1:].strip())
        elif cur:
            yield cur; cur = []
    if cur: yield cur

cache = {}
for qid, vol, key, author, work, locus in Q:
    path = os.path.join(OUT, qid + '.md')
    if os.path.exists(path): print('есть', qid); continue
    text = cache.setdefault(vol, open(os.path.join(VOL, vol), encoding='utf-8').read())
    found = [b for b in blocks(text) if b and b[0].startswith('**') and key in b[0]]
    if not found: print('НЕ НАЙДЕНО', qid); continue
    b = found[0]
    greek = [re.sub(r'^\*|\*\s*$', '', l).rstrip('  ').strip() for l in b[1:] if l.startswith('*') and not l.startswith('**')]
    greek = [g.rstrip('*').strip() for g in greek if g and g != '…']
    trans = ' '.join(l for l in b[1:] if l.startswith('«') or (l and not l.startswith('*') and not l.startswith('<sub>') and not l.startswith('**') and l != '…'))
    note = ' '.join(re.sub(r'</?sub>', '', l) for l in b if l.startswith('<sub>'))
    esc = lambda s: s.replace('\\', '\\\\').replace('"', '\\"')
    g = '\n'.join('  ' + x for x in greek)
    fm = f'---\nauthor: "{esc(author)}"\nwork: "{esc(work)}"\nlocus: "{esc(locus)}"\ngreek: |\n{g}\ngreekVerified: true\n'
    if note: fm += f'note: "{esc(note.strip())}"\n'
    fm += '---\n'
    open(path, 'w', encoding='utf-8').write(fm + trans.strip() + '\n')
    print('ок', qid, '| греч. строк', len(greek), '| перевод', len(trans))
