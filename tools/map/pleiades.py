# -*- coding: utf-8 -*-
"""Поиск античных мест в газеттере Pleiades (CC BY, https://pleiades.stoa.org) — для полей place.pleiades / places[].pleiades.

Дамп скачивается curl'ом (Python на этой машине наружу не ходит):
    curl -sSL -o places.csv.gz https://atlantides.org/downloads/pleiades/dumps/pleiades-places-latest.csv.gz
Использование:
    python -I pleiades.py places.csv.gz Miletus Delphi "Elea/Velia"
Печатает: id, широту, долготу, типы, годы (minDate..maxDate) для каждого совпадения названия.
"""
import csv, gzip, sys

csv.field_size_limit(10**8)


def main(dump, names):
    sys.stdout.reconfigure(encoding='utf-8')
    want = {n.lower(): n for n in names}
    rows = {n: [] for n in names}
    with gzip.open(dump, 'rt', encoding='utf-8', newline='') as f:
        for r in csv.DictReader(f):
            t = (r['title'] or '').lower()
            for key, n in want.items():
                if t == key or t.startswith(key + ' ') or t.startswith(key + '/') or ('/' + key) in t:
                    rows[n].append(r)
    for n in names:
        print(f'== {n}')
        for r in rows[n][:6]:
            print(f"  {r['id']:>8}  {r['reprLat'][:8]:>8} {r['reprLong'][:8]:>8}  {r['title']}  [{r['featureTypes']}]  {r['minDate']}..{r['maxDate']}")
        if not rows[n]:
            print('  -- not found')


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2:])
