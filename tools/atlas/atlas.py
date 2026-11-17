# -*- coding: utf-8 -*-
import figs, html
ORDER = ['Основания', 'Книга I', 'Книга II', 'Книга III', 'Книга IV', 'Книга VI', 'Книги VII–IX', 'Книга X', 'Платон', 'Книга XII', 'Книга XIII',
         'Наглядная геометрия', 'До Евклида', 'Архимед', 'После Евклида', 'Евдем']
F = sorted(figs.FIGS, key=lambda d: (ORDER.index(d['sec']), d['n']))
for i, d in enumerate(F, 1): d['n'] = i

CSS = """
:root{
 /* Layout: a drafting sheet. Header, chips of sections, then a two-column grid of plates, each with Рис. N, title, drawing, caption. */
 --bg:#f3f5f6; --card:#ffffff; --ink:#1b2430; --mute:#6b7682; --line:#d5dbe0;
 --red:#c8321f; --yel:#d99a06; --blu:#1f5fa8; --gry:#8a949e;
 --serif:"EB Garamond",Georgia,"Times New Roman",serif; --sans:"Inter",system-ui,-apple-system,"Segoe UI",sans-serif; --mono:"JetBrains Mono",ui-monospace,monospace;
}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#11161c;--card:#18202a;--ink:#e3e8ee;--mute:#9aa6b2;--line:#2c3743;--red:#f06a52;--yel:#f2c13d;--blu:#6fa8ee;--gry:#7d8995;color-scheme:dark}}
:root[data-theme="dark"]{--bg:#11161c;--card:#18202a;--ink:#e3e8ee;--mute:#9aa6b2;--line:#2c3743;--red:#f06a52;--yel:#f2c13d;--blu:#6fa8ee;--gry:#7d8995;color-scheme:dark}
body{background:var(--bg);color:var(--ink);font-family:var(--sans);line-height:1.5;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px));padding-block:28px 56px}
.wrap{max-width:1180px;margin:0 auto}
header{display:grid;gap:10px;margin-bottom:22px;border-bottom:2px solid var(--ink);padding-bottom:18px}
.eyebrow{font:600 12px/1 var(--mono);letter-spacing:.12em;text-transform:uppercase;color:var(--red)}
h1{font:500 clamp(34px,6vw,58px)/1.02 var(--serif);margin:0;text-wrap:balance}
h1 em{font-style:italic;color:var(--blu)}
.lead{max-width:68ch;color:var(--mute);margin:0;font-size:15px}
.byrne{display:flex;gap:6px;align-items:center;font-size:13px;color:var(--mute);flex-wrap:wrap}
.sw{width:14px;height:14px;display:inline-block}
.sw.r{background:var(--red)}.sw.y{background:var(--yel)}.sw.b{background:var(--blu)}.sw.k{background:var(--ink)}
nav{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 26px}
nav a{font:500 13px/1 var(--sans);color:var(--ink);text-decoration:none;border:1px solid var(--line);padding:7px 10px;background:var(--card)}
nav a:hover,nav a:focus-visible{border-color:var(--ink);outline:none}
h2{font:500 28px/1.1 var(--serif);margin:34px 0 14px;display:flex;gap:12px;align-items:baseline}
h2 small{font:500 12px var(--mono);color:var(--mute);letter-spacing:.08em}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,500px),1fr));gap:18px}
figure{margin:0;background:var(--card);border:1px solid var(--line);display:grid;grid-template-rows:auto 1fr auto;min-width:0;scroll-margin-top:16px}
figure:target{border-color:var(--red);box-shadow:0 0 0 2px var(--red)}
.fh{display:flex;gap:10px;align-items:baseline;padding:12px 16px 0;flex-wrap:wrap}
.num{font:700 13px var(--mono);color:var(--red);white-space:nowrap}
.fh h3{font:600 17px/1.2 var(--sans);margin:0;flex:1;min-width:0}
.ref{font:12px var(--mono);color:var(--mute);width:100%}
.pic{padding:10px 12px;display:flex;align-items:center;justify-content:center;overflow-x:auto}
.pic svg{width:100%;height:auto;max-height:330px}
figcaption{padding:0 16px 16px;font-size:14px;max-width:72ch}
svg .s{fill:none;stroke-width:2;stroke-linejoin:round;stroke-linecap:round}
svg .k{stroke:var(--ink)} svg .r{stroke:var(--red)} svg .y{stroke:var(--yel)} svg .b{stroke:var(--blu)} svg .g{stroke:var(--gry)} svg .nos{stroke:none}
svg .d{stroke-dasharray:5 4;stroke-width:1.5} svg .wide{stroke-width:4} svg .w4{stroke-width:5}
svg .fr{fill:var(--red);fill-opacity:.2} svg .fy{fill:var(--yel);fill-opacity:.3} svg .fb{fill:var(--blu);fill-opacity:.2} svg .fg{fill:var(--gry);fill-opacity:.15} svg .fbgf{fill:var(--card);fill-opacity:1}
svg .dot{stroke:none} svg .dot.k{fill:var(--ink)} svg .dot.r{fill:var(--red)} svg .dot.g{fill:var(--gry)}
svg .t{fill:var(--ink);font:13px var(--sans)} svg .t.g{font:italic 18px var(--serif);fill:var(--ink)} svg .t.h{font:600 16px var(--serif)} svg .t.s{fill:var(--mute);font-size:12.5px}
footer{margin-top:40px;border-top:1px solid var(--line);padding-top:14px;color:var(--mute);font-size:13px;max-width:80ch}
@media (prefers-reduced-motion:no-preference){figure:target{transition:box-shadow .3s}}
"""

def page():
    secs = []
    for s in ORDER:
        items = [d for d in F if d['sec'] == s]
        if items: secs.append((s, items))
    out = ['<title>Атлас чертежей Евклида</title>', '<meta name="claude:viewport-fit-sides" content="cover">',
           '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
           '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,500&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap">',
           f'<style>{CSS}</style>', '<div class="wrap"><header>', '<div class="eyebrow">Приложение к тому «Геометрия Евклида и наглядная геометрия»</div>',
           '<h1>Атлас чертежей <em>Евклида</em></h1>',
           f'<p class="lead">{len(F)} чертежей: от пяти постулатов до Лобачевского. Номер «Рис. N» совпадает со ссылками в тексте тома. Каждый чертёж можно повторить циркулем и линейкой на листе бумаги.</p>',
           '<div class="byrne"><span class="sw r"></span><span class="sw y"></span><span class="sw b"></span><span class="sw k"></span>&nbsp;Цвета по образцу «Начал» Оливера Бирна (1847): равные части одного цвета.</div></header><nav aria-label="Разделы">']
    for i, (s, _) in enumerate(secs): out.append(f'<a href="#sec-{i+1}">{html.escape(s)}</a>')
    out.append('</nav>')
    for i, (s, items) in enumerate(secs):
        out.append(f'<h2 id="sec-{i+1}">{html.escape(s)} <small>{len(items)} рис.</small></h2><div class="grid">')
        for d in items:
            out.append(f'<figure id="fig-{d["n"]}"><div class="fh"><span class="num">Рис. {d["n"]}</span><h3>{html.escape(d["title"])}</h3><span class="ref">{html.escape(d["ref"])}</span></div>'
                       f'<div class="pic">{d["svg"]}</div><figcaption>{html.escape(d["cap"])}</figcaption></figure>')
        out.append('</div>')
    out.append('<footer>📜 — поздняя традиция или легенда; подробности, греческие цитаты и задачи в Markdown-томе. Чертежи построены по координатам, вычисленным из теорем: углы и пропорции настоящие, кроме трёх рисунков с явной пометкой «увеличен» или «сжато».</footer></div>')
    return '\n'.join(out)

if __name__ == '__main__':
    open(__import__('os').path.join(__import__('os').path.dirname(__file__), 'atlas.html'), 'w', encoding='utf-8').write(page())
    for d in F: print(d['n'], d['title'])
