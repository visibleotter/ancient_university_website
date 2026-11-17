# -*- coding: utf-8 -*-
"""Search Greek source texts (Perseus / First1KGreek TEI) accent-insensitively.
usage: python3 src.py GLOB 'pattern words' [ctx]
Prints matching passages with nearest preceding location markers."""
import sys, re, glob, unicodedata, os
from lxml import etree
T = '{http://www.tei-c.org/ns/1.0}'
HERE = os.path.dirname(os.path.abspath(__file__))

def norm(s):
    s = unicodedata.normalize('NFD', s)
    s = ''.join(c for c in s if not unicodedata.combining(c))
    s = s.lower().replace('ς', 'σ').replace('ʼ', "'").replace('’', "'").replace('ϲ', 'σ')
    return s

def flatten(path):
    x = etree.parse(path)
    for n in list(x.iter(T + 'note')):
        n.getparent().remove(n)
    body = x.find('.//' + T + 'body')
    out = []
    def walk(el, ctx):
        tag = etree.QName(el).localname if isinstance(el.tag, str) else ''
        if tag in ('div', 'div1', 'div2', 'div3') and el.get('n'):
            ctx = ctx + [f"{el.get('subtype') or el.get('type') or tag}:{el.get('n')}"]
            out.append(('M', '/'.join(ctx)))
        if tag in ('milestone', 'pb', 'lb') and el.get('n') and tag != 'lb':
            out.append(('M', '/'.join(ctx + [f"{el.get('unit') or tag}:{el.get('n')}"])))
        if tag == 'l' and el.get('n'):
            out.append(('M', '/'.join(ctx + [f"line:{el.get('n')}"])))
        if el.text: out.append(('T', el.text))
        for ch in el:
            walk(ch, ctx)
            if ch.tail: out.append(('T', ch.tail))
    walk(body, [])
    text, marks = [], []
    pos = 0
    for k, v in out:
        if k == 'M':
            marks.append((pos, v))
        else:
            v = re.sub(r'\s+', ' ', v)
            text.append(v); pos += len(v)
    return ''.join(text), marks

_cache = {}
def get(path):
    if path not in _cache:
        _cache[path] = flatten(path)
    return _cache[path]

def find(globpat, pattern, ctx=350, maxhits=5):
    files = sorted(glob.glob(os.path.join(HERE, globpat)))
    res = []
    for f in files:
        text, marks = get(f)
        nt = norm(text)
        assert len(nt) == len(text) or True
        # build mapping between normalized and original by normalizing char by char
        idx = []; buf = []
        for i, ch in enumerate(text):
            n = norm(ch)
            for c in n:
                buf.append(c); idx.append(i)
        nts = ''.join(buf)
        pat = norm(pattern)
        pat = re.escape(pat).replace(r'\ ', r'\s*')
        for m in re.finditer(pat, nts):
            a, b = idx[m.start()], idx[m.end() - 1] + 1
            loc = [v for p, v in marks if p <= a]
            res.append((os.path.basename(f), loc[-1] if loc else '?', text[max(0, a - ctx):b + ctx]))
            if len(res) >= maxhits: return res
    return res

if __name__ == '__main__':
    g, p = sys.argv[1], sys.argv[2]
    c = int(sys.argv[3]) if len(sys.argv) > 3 else 350
    for f, loc, t in find(g, p, c):
        print(f'### {f} | {loc}\n{t}\n')
