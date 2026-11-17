import re, glob, os
from lxml import etree
T='{http://www.tei-c.org/ns/1.0}'
HERE=os.path.dirname(os.path.abspath(__file__))
_x=None
def _doc():
    global _x
    if _x is None: _x=etree.parse(glob.glob(os.path.join(HERE,'pgl/data/tlg1799/tlg001/*grc2.xml'))[0])
    return _x
def div(book, typ, num=None):
    x=_doc()
    for b in x.iter(T+'div'):
        if b.get('subtype')=='book' and b.get('n')==str(book):
            for d in b.iter(T+'div'):
                if d.get('subtype')=='type' and d.get('n')==typ:
                    tgt=d
                    if num is not None:
                        tgt=next((c for c in d.iter(T+'div') if c.get('subtype')=='number' and c.get('n')==str(num)),None)
                        if tgt is None: continue
                    for n in list(tgt.iter(T+'note')): n.getparent().remove(n)
                    return re.sub(r'\s+',' ',''.join(tgt.itertext())).strip()
    raise KeyError((book,typ,num))
def enun(book,num):
    s=div(book,'prop',num)
    m=re.search(r'[.·;]\s',s+' ')
    return s[:m.start()+1].strip()
if __name__=='__main__':
    import sys
    for a in sys.argv[1:]:
        b,n=a.split('.'); print(a,'|',enun(b,n))
