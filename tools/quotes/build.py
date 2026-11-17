# -*- coding: utf-8 -*-
"""Render a Markdown template: lines '{{Q:ID}}' become quote blocks (Greek verified from sources)."""
import sys, os, re
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import gquotes
from quotes import Q

def block(i):
    head, greek, tr, note, verse = Q[i]
    s = [f"> **{head}**", ">"]
    if verse or len(greek) > 1:
        s += [f"> {g[4:]}  " if g.startswith('RAW:') else (f"> *{g}*  " if g != '…' else "> …  ") for g in greek]
        s[-1] = s[-1].rstrip()
    else:
        s += [f"> *{greek[0]}*"]
    s += [">", f"> {tr}"]
    if note:
        s += [">", f"> <sub>{note}</sub>"]
    return "\n".join(s)

def render(src, dst):
    t = open(src, encoding='utf-8').read()
    used = re.findall(r'\{\{Q:([A-Z0-9_]+)\}\}', t)
    missing = [u for u in used if u not in Q]
    assert not missing, missing
    t = re.sub(r'\{\{Q:([A-Z0-9_]+)\}\}', lambda m: block(m.group(1)), t)
    assert '{{' not in t
    open(dst, 'w', encoding='utf-8').write(t)
    return used

if __name__ == '__main__':
    u = render(sys.argv[1], sys.argv[2])
    print(sys.argv[2], 'quotes:', len(u))
