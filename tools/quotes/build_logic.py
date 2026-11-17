import sys, os, re
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import lquotes
from quotes import Q
from build import block
t = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'templates', 't_logic.md'), encoding='utf-8').read()
used = re.findall(r'\{\{Q:([A-Z0-9_]+)\}\}', t)
miss = [u for u in used if u not in Q]; assert not miss, miss
unused = [i for i in lquotes.L if i not in used]
t = re.sub(r'\{\{Q:([A-Z0-9_]+)\}\}', lambda m: block(m.group(1)), t)
open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'Начала_логики.md'), 'w', encoding='utf-8').write(t)
print('used', len(used), 'unique', len(set(used)), 'unused', unused, 'bytes', len(t.encode()))
