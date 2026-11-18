# -*- coding: utf-8 -*-
"""Проверка внутренних ссылок в собранном сайте: все href/src, ведущие внутрь, должны указывать на существующий файл в site/dist.
Запуск после сборки: python tools/site/check_links.py   (код выхода 1, если есть битые ссылки)."""
import os, re, sys
from urllib.parse import urlparse, unquote

DIST = os.path.join(os.path.dirname(__file__), '..', '..', 'site', 'dist')
bad = []
pages = 0
for root, _, files in os.walk(DIST):
    for fn in files:
        if not fn.endswith('.html'):
            continue
        pages += 1
        path = os.path.join(root, fn)
        here = '/' + os.path.relpath(root, DIST).replace(os.sep, '/').strip('./') + '/'
        html = open(path, encoding='utf-8').read()
        bm = re.search(r'<base href="([^"]+)"', html)
        if bm: here = bm.group(1)
        for m in re.finditer(r'(?:href|src)="([^"#]*)(#[^"]*)?"', html):
            url = m.group(1)
            if not url or urlparse(url).scheme or url.startswith('//') or url.startswith('mailto:'):
                continue
            target = url if url.startswith('/') else here + url
            target = os.path.normpath(unquote(target)).replace(os.sep, '/')
            f = os.path.join(DIST, target.lstrip('/'))
            if os.path.isdir(f):
                f = os.path.join(f, 'index.html')
            if not os.path.exists(f):
                bad.append((os.path.relpath(path, DIST), url))
for p, u in bad:
    print(f'{p}: {u}')
print(f'{pages} pages, {len(bad)} broken internal links')
sys.exit(1 if bad else 0)
