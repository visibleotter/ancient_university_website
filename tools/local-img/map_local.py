# -*- coding: utf-8 -*-
"""Подбирает картинки из личной папки Вадима к карточкам — ТОЛЬКО для локального просмотра.
Копирует файлы в site/public/local-img/ и пишет site/src/data/local-images.json (оба пути в .gitignore).
Имена файлов в папке — это подписи к картинкам; по ним и ищем.

    python -I tools/local-img/map_local.py ["C:\\Stuff\\История Древнего Мира"]
"""
import os, re, sys, json, shutil, unicodedata
sys.stdout.reconfigure(encoding='utf-8')
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC = sys.argv[1] if len(sys.argv) > 1 else r'C:\Stuff\История Древнего Мира'
OUT_IMG = os.path.join(ROOT, 'site', 'public', 'local-img')
OUT_JSON = os.path.join(ROOT, 'site', 'src', 'data', 'local-images.json')
IMG = {'.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif'}
SKIP_DIRS = {'История России XX век', 'Книги', 'Лекции Ивана Негреева'}

# карточка → ключевые слова (подстрока в имени файла, без учёта регистра и диакритики)
K = {
 'laetoli': ['лаэтоли', 'laetoli'], 'lomekwi': ['ломекви', 'lomekwi', '3.4 million'], 'olduvai': ['олдувай', 'olduvai'],
 'wonderwerk': ['wonderwerk'], 'gesher-benot-yaaqov': ['gesher', 'мост дочерей'], 'zhoukoudian': ['чжоукоудян', 'синантроп'],
 'blombos': ['blombos', 'бломбос'], 'qafzeh': ['qafzeh', 'кафзех', 'схул'], 'neanderthal-burials': ['тешик', 'неандерт', 'мустье'],
 'lion-man': ['холенштайн', 'hohlenstein', 'человеколев', 'löwenmensch'], 'chauvet': ['шове', 'шовэ', 'chauvet', 'забытых снов'],
 'altamira': ['альтамира', 'altamira'], 'lascaux': ['ласко', 'lascaux'], 'trois-freres': ['великий колдун', 'трёх братьев', 'trois'],
 'gabillou-sorcerer': ['габийу'], 'cave-art-why': ['niaux', 'пещерная живопись'],
 'sungir': ['сунгир', 'sunghir', 'sungir', 'бадер'], 'kostenki': ['костёнк', 'kostenki', 'mammoth', 'мамонтов'],
 'dolni-vestonice': ['вестониц', 'vestonice', 'dvorsk'], 'brno-shaman': ['брно', 'брнен', 'brno'],
 'venus-figurines': ['венера', 'venus', 'венеры', 'vénus'], 'galgenberg': ['galgenberg', 'гальгенберг'],
 'berekhat-ram': ['берехат', 'tan-tan'], 'romito': ['ромито', 'romito'], 'spear-thrower': ['копьеметат', 'копьеметал', 'жезл', 'faon', 'mas-d', 'мас-д'],
 'ochre': ['охра', 'ochre'], 'krapina-talons': ['крапин'], 'bruniquel': ['брюникель'], 'divje-babe-flute': ['дивье', 'неандертальская флейта'],
 'geissenklosterle': ['гайсенкл', 'гайссенкл', 'адорант', 'флейта'], 'maltravieso': ['мальтравьесо', 'пасьега'],
 'zaraysk': ['зарайск', 'толбагин'], 'arene-candide': ['арене-кандиде', 'principe'], 'malta-buret': ['мальтинск', 'стоянки мальта', 'мальтинская'],
 'neolithic-why': ['карта неолитических', 'пшеница'], 'ain-mallaha': ['маллаха', 'эйнан', 'mallaha', 'eynan'],
 'hayonim': ['хайоним', 'хa-йоним', 'ха-йоним', 'hayonim'], 'nahal-mearot': ['меарот', 'эль-вад'], 'nahal-oren': ['нахаль-орен', 'нахал орен'],
 'hilazon-tachtit': ['хилазон'], 'karahan-tepe': ['карахан', 'karahan'], 'gobekli-tepe': ['гёбекли', 'гебекли', 'göbekli'],
 'nevali-cori': ['невалы', 'невали'], 'kortik-tepe': ['кёртик'], 'jerf-el-ahmar': ['джерф'], 'beidha': ['бейда', 'beida'],
 'jericho-skulls': ['иерихон'], 'catalhoyuk': ['чатал', 'çatal'], 'hacilar': ['hacılar', 'хаджилар'], 'ain-ghazal': ['ain ghazal', 'айн-газаль', "'ain ghazal"],
 'ain-sakhri-lovers': ['айн-сахри'], 'shaar-hagolan': ['шаар-ха-голан', 'мыслитель'], 'tell-arpachiyah': ['арпачи', 'arpachiyah', 'halaf'],
 'mehrgarh': ['mehrgarh', 'мехргарх'], 'vinca': ['винча'], 'trypillia': ['трипольск', 'сабатиновк'], 'lepenski-vir': ['железные ворота', 'лепенски'],
 'mesolithic-burials': ['тевьек', 'téviec', 'крыле лебедя', 'мезолитического дома'], 'otzi': ['ötzi', 'эци'],
 'gurcutepe': [], 'nebra-disk': ['небр', 'фланцевых'],
 'megaliths-intro': ['карта мегалитических'], 'nabta-playa': ['набта'], 'carnac': ['карнак'], 'petit-mont': ['пти-мон'],
 'poulnabrone': ['пулнаброн', 'poulnabrone'], 'menga': ['менга', 'menga'], 'antequera-dolmens': ['romeral', 'ромераль'], 'dolmen-soto': ['soto'],
 'dehus': ['дехю', 'dehus', 'хранитель гробницы'], 'hal-saflieni': ['сафлиени', 'saflieni', 'sleeping'], 'hagar-qim': ['хаджар-ким'],
 'mnajdra': ['мнайдра'], 'ggantija': ['джгантия', 'ggantija'], 'tarxien': ['таршиен', 'tarxien'], 'newgrange': ['ньюгрейндж', 'newgrange'],
 'stonehenge': ['стоунхендж'], 'los-millares': ['милларес', 'совиноглаз', 'совиноок'], 'tassili': ['тассили', 'tassili', 'хоггар'],
 'shigir-idol': ['шигирск'], 'star-carr': ['стар-карр'], 'bad-durrenberg': ['дюрренберг', 'dürrenberg'], 'oleni-ostrov': ['оленеостров'],
 'shaman': ['шаманизм', 'онгон'], 'shaman-drum': ['бубен', 'колотушка', 'бубне'], 'nanai-kasa': ['нанайц', 'коори', 'каса - проводы', 'сани'],
 'first-fires': ['костёр', 'campfire', 'рассвет человечества'],
 # Греция и Троя
 'troy': ['стены трои', 'раскопок в трое', 'гиссарлык', 'шлиман', 'взятие трои'], 'mycenae': ['микен', 'агамемнона'], 'bronze-age-collapse': ['катастрофа_бронзового', 'угарит', 'народов моря', 'хаттус'],
 'uluburun': ['улубурун', 'uluburun'], 'sea-peoples': ['мединет-абу'], 'minoan-crete': ['кносс', 'knossos', 'прыжки быков', 'царь-жрец', 'minoan', 'миной'],
 'eleusis-mysteries': ['элевсин', 'elevsin', 'триптолем'], 'omphalos': ['дельф'], 'hector-andromache': ['гектор', 'hektor'],
 'enuma-elish': ['энки', 'инанна', 'думузи', 'гильгамеш', 'энкиду', 'george smith', 'ashurbanipal', 'ашшурбанипал', 'nineveh', 'эриду', 'eridu', 'урук', 'uruk', 'warka', 'варка'],
 'geometry-from-nile': ['step pyramid', 'ступенчатая пирамида', 'нармер', 'saqqara', 'hieroglyphs 1', 'u-j', 'абу-гураб'],
 'amarna-letters': ['amarna'], 'kumarbi': ['hattusa', 'хаттус'], 'theogony': ['родословная греческих'],
 'zeus-crete': ['младенческом возрасте зевс'], 'hermes-dionysus': ['дионис', 'менад', 'вакханка'],
 'odysseus-adventures': ['сиренами'], 'tragedy': ['эфесский античный театр'], 'greek-sacrifice': ['жертвоприношение барана', 'жертвенник'],
 'atreids': ['ифигени', 'клитемнестр'], 'achilles': ['ахилл', 'rage of achilles'], 'trojan-war-prehistory': ['парис облачается', 'гектор упрекает париса'],
 'embassy-achilles': ['посольство одиссея'], 'glaucus-diomedes': ['главка и диомеда'], 'homer': ['homer-reciting'],
 'minoan-crete': ['кносс', 'knossos', 'прыжки быков', 'царь-жрец', 'minoan', 'миной', 'агиа триад', 'agia triada', 'larnax', 'малии', 'ханья', 'snake goddess', 'тронный зал'],
 'gobekli-tepe': ['гёбекли', 'гебекли', 'göbekli', 'gurcutepe', 'гюрджютепе'],
 'nahal-mearot': ['меарот', 'эль-вад', 'raqefet', 'ракефет'],
 'pythagoras-legacy': ['school of athens'], 'tetractys': ['теон (феон)'],
}

def norm(s): return ''.join(c for c in unicodedata.normalize('NFD', s.lower()) if unicodedata.category(c) != 'Mn')
files = []
for d, ds, fs in os.walk(SRC):
    ds[:] = [x for x in ds if x not in SKIP_DIRS]
    for f in fs:
        if os.path.splitext(f)[1].lower() in IMG: files.append(os.path.join(d, f))
os.makedirs(OUT_IMG, exist_ok=True)
for f in os.listdir(OUT_IMG): os.remove(os.path.join(OUT_IMG, f))
out = {}
for card, keys in K.items():
    if not keys: continue
    nk = [norm(k) for k in keys]
    hits = [p for p in files if any(k in norm(os.path.splitext(os.path.basename(p))[0]) for k in nk)]
    hits = sorted(hits)[:12]
    for i, p in enumerate(hits):
        ext = os.path.splitext(p)[1].lower()
        name = f'{card}-{i + 1:02d}{ext}'
        shutil.copyfile(p, os.path.join(OUT_IMG, name))
        cap = re.sub(r'\s+\d+$', '', os.path.splitext(os.path.basename(p))[0]).replace('_', ' ').strip()
        out.setdefault(card, []).append(dict(src=f'/local-img/{name}', caption=cap))
os.makedirs(os.path.dirname(OUT_JSON), exist_ok=True)
json.dump(out, open(OUT_JSON, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('cards', len(out), 'images', sum(len(v) for v in out.values()))
for k, v in sorted(out.items()): print(f'  {k}: {len(v)}')
