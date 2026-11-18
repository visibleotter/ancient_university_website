# -*- coding: utf-8 -*-
"""Поиск и проверка изображений на Wikimedia Commons для коллекции art (site/src/content/art).
Картинки в репозиторий не копируем: на сайте они грузятся с Commons по имени файла (Special:FilePath).

  python commons.py search "Bernini Amalthea" ["другой запрос" ...]   — первые файлы по запросу
  python commons.py info "File name.jpg" [...]                       — автор, лицензия, размер (проверка перед вставкой)
"""
import json, re, sys, urllib.parse, urllib.request

API = 'https://commons.wikimedia.org/w/api.php'
UA = 'AncientUniversitySiteBuilder/0.1 (educational static site; contact via repository)'

def get(params):
    params = dict(params, format='json')
    url = API + '?' + urllib.parse.urlencode(params)
    try:
        req = urllib.request.Request(url, headers={'User-Agent': UA})
        return json.load(urllib.request.urlopen(req, timeout=5))
    except OSError:
        # В некоторых окружениях наружу ходит только curl.
        import subprocess
        return json.loads(subprocess.run(['curl', '-sS', '-A', UA, url], capture_output=True, check=True).stdout)

def strip(html):
    return re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', '', html or '')).strip()

def search(q, n=6):
    r = get(dict(action='query', list='search', srsearch=q, srnamespace=6, srlimit=n))
    return [s['title'][5:] for s in r['query']['search']]

def info(names):
    r = get(dict(action='query', titles='|'.join('File:' + x for x in names), prop='imageinfo', iiprop='extmetadata|size|url'))
    out = {}
    for p in r['query']['pages'].values():
        name = p['title'][5:]
        if 'imageinfo' not in p:
            out[name] = None
            continue
        ii = p['imageinfo'][0]; md = ii.get('extmetadata', {})
        v = lambda k: strip(md.get(k, {}).get('value', ''))
        out[name] = dict(artist=v('Artist'), license=v('LicenseShortName'), credit=v('Credit'), size=f"{ii['width']}x{ii['height']}", desc=v('ImageDescription')[:160])
    return out

if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    cmd, args = sys.argv[1], sys.argv[2:]
    if cmd == 'search':
        for q in args:
            print('##', q)
            for t in search(q): print('  ', t)
    elif cmd == 'info':
        for k, v in info(args).items(): print(k, '→', v)
