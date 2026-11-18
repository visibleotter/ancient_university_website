# -*- coding: utf-8 -*-
"""Atlas v2: a guided page. Every figure gets: how to read it, why it works, what to do by hand, where in life, where in the volume."""
import html, json
import atlas, meta
F = sorted(atlas.F, key=lambda d: d['n'])
E = html.escape
AGE = [('👶', '6–7 лет'), ('🧒', '8–10 лет'), ('🧑', '11–15 лет')]

CSS = atlas.CSS + """
.how{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,250px),1fr));gap:12px;margin:0 0 18px}
.how div{background:var(--card);border:1px solid var(--line);padding:14px 16px;min-width:0}
.how b{display:block;font:600 15px/1.3 var(--sans);margin-bottom:4px}
.how p{margin:0;font-size:14px}
.legend{background:var(--card);border:1px solid var(--line);padding:14px 16px;margin:0 0 22px}
.legend h2{margin:0 0 10px;font-size:22px}
.legend ul{list-style:none;padding:0;margin:0;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));gap:8px 18px}
.legend li{display:flex;gap:10px;align-items:center;font-size:14px;min-width:0}
.legend svg{flex:none;width:46px;height:26px}
.filters{display:grid;gap:8px;margin:0 0 8px;position:sticky;top:env(safe-area-inset-top,0px);background:var(--bg);padding-block:10px;z-index:5;border-bottom:1px solid var(--line)}
.row{display:flex;flex-wrap:wrap;gap:6px;align-items:center}
.row span.lab{font:600 12px var(--mono);color:var(--mute);letter-spacing:.06em;text-transform:uppercase;margin-right:4px}
button.chip{font:500 13px/1 var(--sans);color:var(--ink);background:var(--card);border:1px solid var(--line);padding:7px 10px;cursor:pointer}
button.chip[aria-pressed="true"]{background:var(--ink);color:var(--bg);border-color:var(--ink)}
button.chip:focus-visible,input:focus-visible{outline:2px solid var(--blu);outline-offset:2px}
.row input{font:14px var(--sans);width:5.5em;padding:6px 8px;border:1px solid var(--line);background:var(--card);color:var(--ink)}
.count{font-size:13px;color:var(--mute)}
.list{display:grid;gap:18px;margin-top:14px}
article.fig{background:var(--card);border:1px solid var(--line);scroll-margin-top:120px}
article.fig:target{box-shadow:0 0 0 2px var(--red);border-color:var(--red)}
.fhead{display:flex;flex-wrap:wrap;gap:8px 12px;align-items:baseline;padding:14px 18px 0}
.fhead h3{font:600 19px/1.25 var(--sans);margin:0;flex:1 1 260px;min-width:0}
.tags{display:flex;flex-wrap:wrap;gap:6px}
.tag{font:500 12px var(--sans);border:1px solid var(--line);padding:3px 7px;color:var(--mute);white-space:nowrap}
.ref2{width:100%;font:12px var(--mono);color:var(--mute)}
.fbody{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,1fr);gap:8px 22px;padding:10px 18px 18px;align-items:start}
@media (max-width:820px){.fbody{grid-template-columns:minmax(0,1fr)}}
.fbody .pic{padding:4px 0;position:sticky;top:130px}
@media (max-width:820px){.fbody .pic{position:static}}
.txt{min-width:0;font-size:14.5px;max-width:68ch}
.txt h4{font:700 12px var(--mono);letter-spacing:.08em;text-transform:uppercase;color:var(--red);margin:14px 0 4px}
.txt h4:first-child{margin-top:4px}
.txt p{margin:0}
.txt ol{margin:0;padding-left:1.3em;display:grid;gap:4px}
.where{margin-top:14px;padding-top:10px;border-top:1px dashed var(--line);font-size:13px;color:var(--mute)}
.where b{color:var(--ink);font-weight:600}
@media (max-width:820px){.filters{position:static}article.fig{scroll-margin-top:12px}}
.empty{padding:30px;text-align:center;color:var(--mute);border:1px dashed var(--line)}
"""

LEG = [
 ('<rect x="2" y="4" width="18" height="18" class="s r fr"/><rect x="26" y="4" width="18" height="18" class="s r fr"/>', 'Одинаковый цвет — равные части: что окрашено красным, равно другому красному (так красил Евклида О. Бирн).'),
 ('<line x1="2" y1="13" x2="44" y2="13" class="s g d"/>', 'Пунктир — вспомогательная линия: её проводят для доказательства или это то, что не видно.'),
 ('<line x1="2" y1="13" x2="44" y2="13" class="s k"/><circle cx="2" cy="13" r="3" class="dot k"/><circle cx="44" cy="13" r="3" class="dot k"/>', 'Точка — конец отрезка или место пересечения.'),
 ('<path d="M6,22 L6,6 M6,22 L40,22" class="s k"/><path d="M6,14 L14,14 L14,22" class="s r"/>', 'Маленький уголок — прямой угол (90°).'),
 ('<path d="M4,22 L42,22 M4,22 L34,4" class="s k"/><path d="M20,22 A16,16 0 0 0 17.7,14 L4,22 Z" class="s y fy"/>', 'Закрашенная дужка у вершины — угол; дужки одного цвета — равные углы.'),
 ('<text x="23" y="19" text-anchor="middle" class="t g">Α Β Γ</text>', 'Греческие буквы — так точки обозначает сам Евклид: Α = A, Β = B, Γ = C (Г), Δ = D, Ε = E, Ζ = Z, Η = H.'),
]

def card(d):
    th, ages, where, read, do, life = meta.META[d['n']]
    agechips = ''.join(f'<span class="tag">{e} {lab}</span>' for e, lab in AGE if e in ages)
    ol = ''.join(f'<li>{E(s)}</li>' for s in do)
    return (f'<article class="fig" id="fig-{d["n"]}" data-theme="{E(th)}" data-age="{ages}">'
            f'<div class="fhead"><span class="num">Рис. {d["n"]}</span><h3>{E(d["title"])}</h3><div class="tags"><span class="tag">{E(th)}</span>{agechips}</div>'
            f'<span class="ref2">Источник: {E(d["ref"])}</span></div>'
            f'<div class="fbody"><div class="pic">{d["svg"]}</div><div class="txt">'
            f'<h4>Как читать рисунок</h4><p>{E(read)}</p>'
            f'<h4>Почему так</h4><p>{E(d["cap"])}</p>'
            f'<h4>Сделайте сами</h4><ol>{ol}</ol>'
            f'<h4>Где в жизни</h4><p>{E(life)}</p>'
            f'<div class="where"><b>В томе «Математика и геометрия древних греков»:</b> {E(where)}</div>'
            f'</div></div></article>')

JS = """
(function(){
 var theme='all', age='all';
 var cards=[].slice.call(document.querySelectorAll('article.fig'));
 var cnt=document.getElementById('count'), empty=document.getElementById('empty');
 function apply(){
  var n=0;
  cards.forEach(function(c){var ok=(theme==='all'||c.dataset.theme===theme)&&(age==='all'||c.dataset.age.indexOf(age)>=0);c.hidden=!ok;if(ok)n++;});
  cnt.textContent='Показано '+n+' из '+cards.length; empty.hidden=n>0;
 }
 function bind(group,set){
  var bs=[].slice.call(document.querySelectorAll('button[data-'+group+']'));
  bs.forEach(function(b){b.addEventListener('click',function(){bs.forEach(function(x){x.setAttribute('aria-pressed','false')});b.setAttribute('aria-pressed','true');set(b.getAttribute('data-'+group));apply();});});
 }
 bind('theme',function(v){theme=v}); bind('age',function(v){age=v});
 function reset(){theme='all';age='all';document.querySelectorAll('button.chip').forEach(function(b){b.setAttribute('aria-pressed',b.getAttribute('data-theme')==='all'||b.getAttribute('data-age')==='all'?'true':'false')});apply();}
 function go(n){var el=document.getElementById('fig-'+n);if(!el)return;if(el.hidden)reset();el.scrollIntoView({block:'start'});}
 var inp=document.getElementById('goto');
 document.getElementById('gotoform').addEventListener('submit',function(e){e.preventDefault();var n=parseInt(inp.value,10);if(n){try{history.replaceState(null,'','#fig-'+n)}catch(_){location.hash='fig-'+n}go(n);}});
 window.addEventListener('hashchange',function(){var m=location.hash.match(/^#fig-(\\d+)$/);if(m)go(m[1]);});
 var m=location.hash.match(/^#fig-(\\d+)$/); apply(); if(m)setTimeout(function(){go(m[1])},50);
})();
"""

def plural(n):
    if n % 10 == 1 and n % 100 != 11: return 'рисунок'
    if 2 <= n % 10 <= 4 and not 12 <= n % 100 <= 14: return 'рисунка'
    return 'рисунков'

def page():
    leg = ''.join(f'<li><svg viewBox="0 0 46 26" aria-hidden="true">{s}</svg><span>{E(t)}</span></li>' for s, t in LEG)
    themes = ''.join(f'<button class="chip" type="button" data-theme="{E(t)}" aria-pressed="false">{E(t)}</button>' for t in meta.THEMES)
    ages = ''.join(f'<button class="chip" type="button" data-age="{e}" aria-pressed="false">{e} {lab}</button>' for e, lab in AGE)
    o = ['<title>Атлас чертежей Евклида</title>', '<meta name="claude:viewport-fit-sides" content="cover">',
         '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
         '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,500&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap">',
         f'<style>{CSS}</style>', '<div class="wrap"><header>',
         '<div class="eyebrow">Приложение к тому «Математика и геометрия древних греков»</div>',
         '<h1>Атлас чертежей <em>Евклида</em></h1>',
         f'<p class="lead">{len(F)} {plural(len(F))} к тому. У каждого рисунка одинаковый порядок: как его читать, почему это верно, что сделать руками с ребёнком и где это встречается в жизни. Внизу карточки — раздел тома, где тема разобрана подробно.</p></header>',
         '<div class="how">',
         '<div><b>1. Читаете том</b><p>В тексте стоит ссылка «Рис. 23» — она открывает здесь нужную карточку. Или введите номер в поле «Рис. №» ниже.</p></div>',
         '<div><b>2. Готовите занятие</b><p>Выберите тему и возраст в фильтрах: останутся только подходящие рисунки. Блок «Сделайте сами» — готовый план на 10–20 минут.</p></div>',
         '<div><b>3. Занимаетесь с ребёнком</b><p>Покажите рисунок, прочитайте вслух «Как читать рисунок», потом повторите чертёж на бумаге по шагам. Объяснение «Почему так» — для вас или для старших.</p></div>',
         '</div>',
         f'<section class="legend" aria-labelledby="lg"><h2 id="lg">Как читать любой чертёж</h2><ul>{leg}</ul></section>',
         '<div class="filters" role="group" aria-label="Фильтры">',
         f'<div class="row"><span class="lab">Тема</span><button class="chip" type="button" data-theme="all" aria-pressed="true">Все</button>{themes}</div>',
         f'<div class="row"><span class="lab">Возраст</span><button class="chip" type="button" data-age="all" aria-pressed="true">Любой</button>{ages}'
         f'<form id="gotoform" class="row" style="margin-left:auto"><label class="lab" for="goto">Рис. №</label><input id="goto" type="number" min="1" max="{len(F)}" inputmode="numeric" placeholder="1–{len(F)}"><button class="chip" type="submit">Открыть</button></form></div>',
         '<div class="count" id="count" aria-live="polite"></div></div>',
         '<div class="list">'] + [card(d) for d in F] + [
         '<div class="empty" id="empty" hidden>Для этой темы и возраста рисунков нет. Выберите «Все» или «Любой».</div></div>',
         '<footer>📜 — поздняя традиция или легенда. Рисунки построены по точным координатам: углы и пропорции настоящие, кроме рисунков 36, 37, 41, 47 и 49, где угол для наглядности изменён (это подписано). Рисунки 50–51 — по «Занимательной геометрии» Я. И. Перельмана (1925), гл. I.</footer></div>',
         f'<script>{JS}</script>']
    return '\n'.join(o)

if __name__ == '__main__':
    open(__import__('os').path.join(__import__('os').path.dirname(__file__), 'atlas.html'), 'w', encoding='utf-8').write(page())
    print('ok', len(F))
