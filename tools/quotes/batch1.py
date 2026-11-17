import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from src import find
F = dict(
 MET='pgl/data/tlg0086/tlg025/*grc*.xml', POL='pgl/data/tlg0086/tlg035/*grc*.xml',
 PHYS='f1k/data/tlg0086/tlg031/*grc1.xml', DA='f1k/data/tlg0086/tlg002/*grc1.xml',
 CAEL='f1k/data/tlg0086/tlg005/*grc1.xml', APR='f1k/data/tlg0086/tlg001/*grc1.xml',
 PROB='f1k/data/tlg0086/tlg036/*grc1.xml', RESP='f1k/data/tlg0086/tlg037/*grc1.xml',
 DL='pgl/data/tlg0004/tlg001/*grc2.xml', HDT='pgl/data/tlg0016/*/*grc*.xml',
 THT='pgl/data/tlg0059/tlg006/*grc*.xml', MENO='pgl/data/tlg0059/tlg024/*grc*.xml',
 REP='pgl/data/tlg0059/tlg030/*grc*.xml', LAWS='pgl/data/tlg0059/tlg034/*grc*.xml',
 LYS='pgl/data/tlg0059/tlg020/*grc*.xml', APOL='pgl/data/tlg0059/tlg002/*grc*.xml',
 CRAT='pgl/data/tlg0059/tlg005/*grc*.xml', PARM='pgl/data/tlg0059/tlg009/*grc*.xml',
 TIM='pgl/data/tlg0059/tlg031/*grc*.xml',
 SEPT='pgl/data/tlg0007/tlg079/*grc*.xml', FUGA='pgl/data/tlg0007/tlg110/*grc*.xml',
 CNOT='pgl/data/tlg0007/tlg138/*grc*.xml', COL='pgl/data/tlg0007/tlg140/*grc*.xml',
 DEE='pgl/data/tlg0007/tlg090/*grc*.xml', FACIE='pgl/data/tlg0007/tlg126/*grc*.xml',
 SIMP='f1k/data/tlg4013/tlg004/*grc1.xml', SEXT='f1k/data/tlg0544/tlg002/*grc1.xml',
 HIPP='f1k/data/tlg2115/tlg060/*perseus-grc1.xml', IAM='f1k/data/tlg2023/tlg001/*grc1.xml',
 NIC='f1k/data/tlg0358/tlg001/*grc1.xml', EUT='f1k/data/tlg4072/tlg001/*grc1.xml',
 CLEM='f1k/data/tlg0555/tlg004/*grc1.xml', PHDA='f1k/data/tlg4015/tlg008/*grc1.xml',
 EUC='pgl/data/tlg1799/tlg001/*grc2.xml', THEON='f1k/data/tlg1724/tlg001/*grc1.xml',
 PORPH='f1k/data/tlg2034/tlg002/*grc1.xml', SOPH='pgl/data/tlg0059/tlg007/*grc*.xml', EE='pgl/data/tlg0086/tlg009/*grc*.xml', RHET='pgl/data/tlg0086/tlg038/*grc*.xml', QCONV='pgl/data/tlg0007/tlg112/*grc*.xml', PHAEDO='pgl/data/tlg0059/tlg004/*grc*.xml', PERIC='pgl/data/tlg0007/tlg012/*grc*.xml', FRIG='pgl/data/tlg0007/tlg127/*grc*.xml', NICH='f1k/data/tlg0358/tlg002/*grc1.xml',
)
Q = [l.split('|', 1) for l in sys.stdin.read().strip().split('\n') if '|' in l]
ctx = int(sys.argv[1]) if len(sys.argv) > 1 else 200
for k, pat in Q:
    k = k.strip(); pat = pat.strip()
    r = find(F[k], pat, ctx, 2)
    print(f'===== {k} | {pat} -> {len(r)} hit(s)')
    for f, loc, t in r[:1]:
        print(f'  @{loc.split("/",1)[-1] if "/" in loc else loc}\n  {t}\n')
