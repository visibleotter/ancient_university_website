# -*- coding: utf-8 -*-
"""Публичные снимки с Commons для карточек первобытности, у которых нет картинок.
Для каждой карточки — поисковый запрос; берём первый файл-изображение, проверяем лицензию (imageinfo)
и пишем запись art/ru/<card>-photo-NN.md + поле art: в карточке. Паузы между запросами — Commons ограничивает частоту.

    python -I tools/art/prehistory_commons.py
"""
import os, re, sys, json, time, subprocess, urllib.parse
sys.stdout.reconfigure(encoding='utf-8')
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SITE = os.path.join(ROOT, 'site', 'src', 'content')
UA = 'AncientUniversitySiteBuilder/0.1 (educational static site)'
QALL = {
 'almendres': [('Almendres Cromlech', 'Кромлех Алмендреш', 'Эвора, Португалия')],
 'asikli-hoyuk': [('Aşıklı Höyük', 'Ашиклы-Хююк', 'Аксарай, Турция')],
 'avebury': [('Avebury stone circle aerial', 'Каменный круг Эйвбери', 'Уилтшир, Англия'), ('Silbury Hill', 'Силбери-Хилл', 'Уилтшир, Англия')],
 'banpo': [('Banpo Museum Xi\'an', 'Раскоп в музее Баньпо', 'Сиань, Китай'), ('Yangshao fish face basin', 'Миска с «рыбой с человеческим лицом»', 'Национальный музей Китая')],
 'callanish': [('Callanish Stones', 'Камни Каллениша', 'о. Льюис, Шотландия')],
 'carrowmore': [('Carrowmore megalithic cemetery', 'Кладбище Кэрроумор', 'Слайго, Ирландия')],
 'caucasus-dolmens': [('Dolmen Zhane', 'Дольмен в долине Жане', 'Геленджик'), ('Dolmen Krasnodar Krai', 'Кавказский дольмен с круглым отверстием', 'Краснодарский край')],
 'cayonu': [('Çayönü', 'Чайоню', 'Диярбакыр, Турция')],
 'gavrinis': [('Gavrinis carved stones', 'Резные камни коридора Гавриниса', 'Морбиан, Франция')],
 'korean-dolmens': [('Gochang dolmen', 'Дольмены Гочхана', 'Корея'), ('Ganghwa dolmen', 'Дольмен Канхвадо', 'Корея')],
 'locmariaquer': [('Locmariaquer broken menhir', 'Разбитый менгир Er Grah', 'Локмарьякер, Франция'), ('Table des Marchand', 'Стол Торговцев', 'Локмарьякер, Франция')],
 'orkney-neolithic': [('Ring of Brodgar', 'Кольцо Бродгар', 'Оркнейские острова'), ('Maeshowe', 'Мейсхау', 'Оркнейские острова')],
 'sesklo-dimini': [('Sesklo neolithic settlement', 'Неолитическое поселение Сескло', 'Фессалия, Греция'), ('Dimini neolithic', 'Поселение Димини', 'Фессалия, Греция')],
 'skara-brae': [('Skara Brae house', 'Дом в Скара-Брэй', 'Оркнейские острова')],
 'skateholm': [('Skateholm', 'Скатехольм', 'Сконе, Швеция')],
 'varna-necropolis': [('Varna Necropolis gold', 'Золото Варненского некрополя', 'Археологический музей Варны')],
}

import sys as _s
Q = {k: v for k, v in QALL.items() if len(_s.argv) < 2 or k in _s.argv[1:]}
QALL['gavrinis'] = [('Gavrinis', 'Резные камни коридора Гавриниса', 'Морбиан, Франция')]
Q = {k: QALL[k] for k in (_s.argv[1:] or QALL)}

def api(params):
    url = 'https://commons.wikimedia.org/w/api.php?' + urllib.parse.urlencode(dict(params, format='json'))
    for attempt in range(5):
        r = subprocess.run(['curl', '-sS', '-A', UA, url], capture_output=True)
        try: return json.loads(r.stdout)
        except Exception: time.sleep(30 * (attempt + 1))
    return None
def strip(s): return re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', '', s or '')).strip()

done = 0
for card, items in Q.items():
    ids = []
    for n, (query, title, where) in enumerate(items, 1):
        res = api(dict(action='query', generator='search', gsrsearch=query + ' filetype:bitmap', gsrnamespace=6, gsrlimit=3,
                       prop='imageinfo', iiprop='extmetadata'))
        time.sleep(2)
        pages = sorted((res or {}).get('query', {}).get('pages', {}).values(), key=lambda p: p.get('index', 99))
        if not pages: print('  нет:', card, query); continue
        p = pages[0]; f = p['title'][5:]
        md = p.get('imageinfo', [{}])[0].get('extmetadata', {})
        lic = strip(md.get('LicenseShortName', {}).get('value'))
        credit = strip(md.get('Artist', {}).get('value'))[:120]
        aid = f'{card}-photo-{n:02d}'
        q = lambda s: s.replace('"', '\\"')
        fm = ['---', f'title: "{q(title)}"', 'date: "наши дни (снимок)"', 'period: ancient', 'kind: photo', f'museum: "{q(where)}"', f'commons: "{q(f)}"']
        if credit: fm.append(f'credit: "{q(credit)}"')
        if lic: fm.append(f'license: "{q("общественное достояние" if re.search("public domain|PD|CC0", lic, re.I) else lic)}"')
        fm.append('---')
        open(os.path.join(SITE, 'art', 'ru', aid + '.md'), 'w', encoding='utf-8').write('\n'.join(fm) + '\nСнимок с Wikimedia Commons.\n')
        ids.append(aid); done += 1
        print(card, '→', f, '|', lic)
    if ids:
        pth = os.path.join(SITE, 'cards', 'ru', card + '.md')
        s = open(pth, encoding='utf-8').read(); head, rest = s.split('\n---', 1)
        if re.search(r'^art:', head, re.M): print('  уже есть art:', card); continue
        open(pth, 'w', encoding='utf-8').write(head + '\nart: [' + ', '.join(ids) + ']' + '\n---' + rest)
print('written', done)
