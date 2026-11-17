// Интерактивные чертежи. Каждый — список шагов; id используется в поле `demo` карточки.
// Тексты шагов: ru — обязательно, en — желательно; для остальных языков показывается en.
import type { Scene } from './geo';

type Build = (s: Scene) => void;

export const demos: Record<string, Build> = {
  // ---------- Фалес ----------
  'vertical-angles': (s) => {
    s.step({ ru: 'Две прямые пересекаются в точке O, как половинки ножниц у винтика.', en: 'Two lines cross at O, like the blades of scissors at the screw.' });
    const A = s.free('A', 60, 90), B = s.free('B', 340, 220), C = s.free('C', 80, 240), D = s.free('D', 330, 70);
    const l1 = s.line(A, B, 'black'), l2 = s.line(C, D, 'black');
    const O = s.ll(l1, l2, 'O');
    s.step({ ru: 'Красные углы лежат напротив друг друга — это вертикальные углы. Двигайте точки: они всегда равны.', en: 'The red angles face each other: they are vertical angles. Drag the points: they stay equal.' });
    s.angle(A, O, C, 'red'); s.angle(B, O, D, 'red');
    s.step({ ru: 'Синие углы — тоже вертикальные. Красный и синий вместе дают прямую линию, 180°. Значит, оба красных угла равны 180° минус синий — они равны (Евклид, I.15).', en: 'The blue angles are vertical too. Red plus blue make a straight line, 180°. So each red angle is 180° minus blue: they are equal (Euclid I.15).' });
    s.angle(C, O, B, 'blue'); s.angle(D, O, A, 'blue');
  },

  isosceles: (s) => {
    s.step({ ru: 'Треугольник ABC, у которого две «ноги» равны: AB = AC. Это равнобедренный треугольник (ἰσοσκελές — «равноногий»).', en: 'Triangle ABC with two equal "legs": AB = AC. It is isosceles (Greek: "equal-legged").' });
    const A = s.free('A', 200, 50), B = s.free('B', 110, 240);
    const c = s.circle(A, B, 'grey', true);
    const C = s.glider('C', c, -60);
    s.poly([A, B, C], 'yellow');
    s.segment(A, B, 'red'); s.segment(A, C, 'red'); s.segment(B, C, 'blue');
    s.at(1, c);
    s.step({ ru: 'Почему AB = AC всегда? Точка C бегает по окружности с центром A и радиусом AB. Двигайте C и B.', en: 'Why is AB = AC always? Point C runs on the circle centred at A with radius AB. Drag C and B.' });
    s.step({ ru: 'Углы при основании BC равны. Фалес, по преданию, первым это заметил и называл их «подобными» (Прокл, 250).', en: 'The base angles at B and C are equal. Thales is said to have noticed this first and called them "similar" (Proclus 250).' });
    s.angle(C, B, A, 'blue'); s.angle(A, C, B, 'blue');
  },

  semicircle: (s) => {
    s.step({ ru: 'AB — диаметр окружности, C — любая точка на ней. Соединим C с концами диаметра.', en: 'AB is a diameter, C is any point on the circle. Join C to the ends of the diameter.' });
    const A = s.free('A', 90, 170), B = s.free('B', 310, 150);
    const k1 = s.hide(s.circle(A, B)), k2 = s.hide(s.circle(B, A));
    const p = s.hide(s.cc(k1, k2, 0)), q = s.hide(s.cc(k1, k2, 1));
    const O = s.ll(s.hide(s.line(p, q)), s.hide(s.line(A, B)), 'O');
    const c = s.circle(O, A, 'grey');
    const C = s.glider('C', c, 70);
    s.segment(A, B, 'black'); s.poly([A, B, C], 'yellow'); s.segment(A, C, 'blue'); s.segment(B, C, 'blue');
    s.step({ ru: 'Угол ACB всегда прямой, где бы ни была C. Двигайте C по окружности. На Западе это называют «теоремой Фалеса» (Евклид, III.31).', en: 'Angle ACB is always a right angle, wherever C is. Drag C around. This is "Thales\' theorem" (Euclid III.31).' });
    s.angle(A, C, B, 'red');
    s.step({ ru: 'Почему: OA = OB = OC (это радиусы). Треугольники AOC и BOC равнобедренные, у каждого углы при основании равны. Все углы треугольника ABC вместе — 180°, а угол C равен сумме двух других, значит, он 90°.', en: 'Why: OA = OB = OC (radii). Triangles AOC and BOC are isosceles with equal base angles. The angles of ABC add up to 180°, and angle C equals the other two together, so it is 90°.' });
    s.segment(O, C, 'grey');
    s.angle(C, A, O, 'yellow', false); s.angle(O, C, A, 'yellow', false);
    s.angle(O, B, C, 'blue', false); s.angle(B, C, O, 'blue', false);
  },

  ships: (s) => {
    s.step({ ru: 'A и B — две точки на берегу, расстояние AB измерено верёвкой. S — корабль в море: до него не дойти.', en: 'A and B are two points on the shore; AB is measured with a rope. S is a ship at sea: you cannot walk there.' });
    const sea1 = s.fixed(undefined, 0, 150), sea2 = s.fixed(undefined, 400, 150);
    s.hide(sea1); s.hide(sea2);
    s.line(sea1, sea2, 'blue');
    const A = s.free('A', 120, 150), B = s.free('B', 270, 150), S = s.free('S', 230, 45);
    s.segment(A, B, 'black', true);
    s.step({ ru: 'Каждый наблюдатель меряет угол между берегом и направлением на корабль.', en: 'Each observer measures the angle between the shore and the line of sight to the ship.' });
    s.ray(A, S, 'grey'); s.ray(B, S, 'grey');
    s.angle(B, A, S, 'red'); s.angle(S, B, A, 'blue');
    s.step({ ru: 'На суше строят такие же углы при A и B, но в другую сторону от берега. Лучи сходятся в точке S′ — «копии корабля».', en: 'On land, build the same angles at A and B on the other side of the shore. The rays meet at S′, a "copy of the ship".' });
    const cA = s.hide(s.circle(A, S)), cB = s.hide(s.circle(B, S));
    const S2 = s.ccPick(cA, cB, S, 'far', 'S′');
    s.segment(A, S2, 'grey'); s.segment(B, S2, 'grey');
    s.angle(S2, A, B, 'red'); s.angle(A, B, S2, 'blue');
    s.step({ ru: 'У треугольников ABS и ABS′ общая сторона AB и равные углы при ней — они равны (Евклид, I.26). Значит, AS = AS′: расстояние до корабля промеряем шагами на суше.', en: 'Triangles ABS and ABS′ share side AB and have equal angles at it, so they are congruent (Euclid I.26). Hence AS = AS′: pace it out on land.' });
    s.segment(A, S, 'red', true); s.segment(A, S2, 'red', true);
  },

  pyramid: (s) => {
    s.step({ ru: 'Пирамида высотой FT и её тень FE. Солнце S можно двигать.', en: 'A pyramid of height FT and its shadow FE. You can move the sun S.' });
    const g1 = s.hide(s.fixed(undefined, 0, 250)), g2 = s.hide(s.fixed(undefined, 400, 250));
    const ground = s.line(g1, g2, 'black');
    const b1 = s.fixed(undefined, 60, 250), b2 = s.fixed(undefined, 200, 250), T = s.fixed('T', 130, 120), F = s.fixed('F', 130, 250);
    s.poly([b1, b2, T], 'yellow');
    const S = s.free('S', 22, 22, 'red');
    const E = s.ll(s.hide(s.line(S, T)), ground, 'E');
    s.segment(S, E, 'red').dashed = true;
    s.segment(F, T, 'blue', true); s.segment(F, E, 'black', true);
    s.step({ ru: 'Рядом ставим палку KL. Солнечные лучи параллельны, поэтому тень палки KM даёт маленький треугольник той же формы.', en: 'Put a stick KL nearby. Sun rays are parallel, so the stick\'s shadow KM makes a small triangle of the same shape.' });
    const K = s.glider('K', s.hide(s.line(s.hide(s.fixed(undefined, 290, 250)), s.hide(s.fixed(undefined, 350, 250)))), 0.3);
    const Lp = s.pt('L', [K], (k) => ({ x: k.x, y: k.y - 40 }));
    const ray = s.parallel(s.hide(s.line(S, T)), Lp, 'red', true);
    const M = s.ll(ray, ground, 'M');
    s.segment(K, Lp, 'blue', true); s.segment(K, M, 'black', true);
    s.step({ ru: 'Высота пирамиды во столько раз больше палки, во сколько её тень длиннее тени палки: FT : KL = FE : KM (Плутарх). А когда тень палки равна палке, тень пирамиды равна её высоте (Иероним). Тень меряют от середины основания: к видимой тени надо прибавить половину основания.', en: 'The pyramid is as many times taller than the stick as its shadow is longer: FT : KL = FE : KM (Plutarch). When the stick\'s shadow equals the stick, the pyramid\'s shadow equals its height (Hieronymus). Measure from the centre of the base: add half the base to the visible shadow.' });
    void M;
  },

  // ---------- построения ----------
  equilateral: (s) => {
    s.step({ ru: 'Дан отрезок AB. Построим на нём равносторонний треугольник (Евклид, I.1).', en: 'Given segment AB, construct an equilateral triangle on it (Euclid I.1).' });
    const A = s.free('A', 130, 200), B = s.free('B', 270, 200);
    s.segment(A, B);
    s.step({ ru: 'Циркулем: центр A, раствор AB.', en: 'Compass: centre A, radius AB.' });
    const c1 = s.circle(A, B);
    s.step({ ru: 'Циркулем: центр B, раствор BA.', en: 'Compass: centre B, radius BA.' });
    const c2 = s.circle(B, A);
    s.step({ ru: 'Окружности пересекаются в точке C. Соединяем C с A и B. AC = AB (радиусы одной окружности), BC = BA (радиусы другой), значит, все три стороны равны.', en: 'The circles meet at C. Join CA and CB. AC = AB (radii of one circle), BC = BA (radii of the other), so all three sides are equal.' });
    const C = s.cc(c1, c2, 0, 'C');
    s.poly([A, B, C], 'yellow'); s.segment(A, C, 'red'); s.segment(B, C, 'blue');
  },

  'copy-segment': (s) => {
    s.step({ ru: 'Дан отрезок AB. Нужно отложить такой же отрезок от точки C на луче CD.', en: 'Given segment AB, lay off an equal segment from C along ray CD.' });
    const A = s.free('A', 60, 70), B = s.free('B', 190, 50);
    s.segment(A, B, 'red', true);
    const C = s.free('C', 90, 220), D = s.free('D', 330, 190);
    s.ray(C, D, 'black');
    s.step({ ru: 'Ставим циркуль в A, раствор — до B. Не меняя раствора, переносим циркуль в C и чертим окружность.', en: 'Set the compass from A to B. Without changing it, move it to C and draw a circle.' });
    const c = s.circleR(C, A, B);
    s.step({ ru: 'Окружность пересекает луч в точке E. CE = AB. Так циркулем сравнивают длины без линейки с делениями.', en: 'The circle meets the ray at E. CE = AB. This is how a compass compares lengths without a ruler.' });
    const E = s.lc(s.hide(s.line(C, D)), c, 1, 'E');
    s.segment(C, E, 'red', true);
  },

  'triangle-sss': (s) => {
    s.step({ ru: 'Даны три отрезка a, b, c. Построим треугольник с такими сторонами (Евклид, I.22).', en: 'Given three segments a, b, c, construct a triangle with these sides (Euclid I.22).' });
    const a1 = s.free(undefined, 20, 30), a2 = s.free('a', 150, 30);
    const b1 = s.free(undefined, 20, 55), b2 = s.free('b', 130, 55);
    const c1 = s.free(undefined, 20, 80), c2 = s.free('c', 180, 80);
    s.segment(a1, a2, 'blue', true); s.segment(b1, b2, 'red', true); s.segment(c1, c2, 'black', true);
    const A = s.free('A', 110, 240), R = s.free(undefined, 360, 240);
    s.ray(A, R, 'grey');
    s.step({ ru: 'На луче от A откладываем отрезок c: получаем точку B.', en: 'On the ray from A, lay off c: this gives point B.' });
    const kc = s.circleR(A, c1, c2, 'grey', true);
    const B = s.lc(s.hide(s.line(A, R)), kc, 1, 'B');
    s.step({ ru: 'Из A — окружность радиусом b, из B — окружностью радиусом a.', en: 'From A, a circle of radius b; from B, a circle of radius a.' });
    const kb = s.circleR(A, b1, b2, 'red', true), ka = s.circleR(B, a1, a2, 'blue', true);
    s.step({ ru: 'Окружности пересеклись в C: AC = b, BC = a. Если a, b, c не пересекаются — значит, одна сторона не меньше суммы двух других и треугольника нет (неравенство треугольника, I.20). Попробуйте!', en: 'They meet at C: AC = b, BC = a. If the circles do not meet, one side is at least the sum of the other two and there is no triangle (triangle inequality, I.20). Try it!' });
    const C = s.cc(kb, ka, 0, 'C');
    s.poly([A, B, C], 'yellow'); s.segment(A, B, 'black'); s.segment(A, C, 'red'); s.segment(B, C, 'blue');
  },

  'perp-bisector': (s) => {
    s.step({ ru: 'Дан отрезок AB. Найдём его середину и проведём через неё перпендикуляр (Евклид, I.10).', en: 'Given segment AB, find its midpoint and draw the perpendicular through it (Euclid I.10).' });
    const A = s.free('A', 120, 160), B = s.free('B', 280, 140);
    const ab = s.segment(A, B);
    s.step({ ru: 'Две окружности одинакового радиуса AB: с центрами A и B.', en: 'Two circles of the same radius AB, centred at A and B.' });
    const c1 = s.circle(A, B), c2 = s.circle(B, A);
    s.step({ ru: 'Они пересекаются в P и Q. Каждая из них одинаково далеко от A и от B.', en: 'They meet at P and Q, each equally far from A and B.' });
    const P = s.cc(c1, c2, 0, 'P'), Q = s.cc(c1, c2, 1, 'Q');
    s.step({ ru: 'Прямая PQ — серединный перпендикуляр: она делит AB пополам в точке M и стоит к нему под прямым углом. Все её точки одинаково удалены от A и B.', en: 'Line PQ is the perpendicular bisector: it halves AB at M at a right angle. Every point on it is equally far from A and B.' });
    const pq = s.line(P, Q, 'red');
    const M = s.ll(pq, ab, 'M');
    s.angle(A, M, P, 'red', false);
    s.segment(A, M, 'blue', true); s.segment(M, B, 'blue', true);
  },

  'angle-bisector': (s) => {
    s.step({ ru: 'Дан угол AOB. Разделим его пополам (Евклид, I.9).', en: 'Given angle AOB, bisect it (Euclid I.9).' });
    const O = s.free('O', 80, 230), A = s.free('A', 300, 220), B = s.free('B', 230, 60);
    s.ray(O, A, 'black'); s.ray(O, B, 'black');
    s.step({ ru: 'Окружность с центром O через A отмечает на другой стороне точку D: OA = OD.', en: 'A circle centred at O through A marks D on the other side: OA = OD.' });
    const c = s.circle(O, A, 'grey', true);
    const D = s.lc(s.hide(s.line(O, B)), c, 1, 'D');
    s.step({ ru: 'Из A и из D — две окружности радиусом AD. Они пересекаются в K.', en: 'From A and D, two circles of radius AD meet at K.' });
    const c1 = s.circle(A, D), c2 = s.circle(D, A);
    const K = s.ccPick(c1, c2, O, 'far', 'K');
    s.step({ ru: 'Луч OK — биссектриса: углы AOK и KOD равны (треугольники OAK и ODK равны по трём сторонам).', en: 'Ray OK is the bisector: angles AOK and KOD are equal (triangles OAK and ODK have three equal sides).' });
    s.ray(O, K, 'red');
    s.angle(A, O, K, 'yellow'); s.angle(K, O, D, 'blue');
  },

  'erect-perpendicular': (s) => {
    s.step({ ru: 'Дана прямая и точка P на ней. Восставим перпендикуляр в точке P (Евклид, I.11).', en: 'Given a line and a point P on it, erect a perpendicular at P (Euclid I.11).' });
    const A = s.free('A', 40, 200), B = s.free(undefined, 360, 190);
    const l = s.line(A, B, 'black');
    const seg = s.hide(s.segment(A, B));
    const P = s.glider('P', seg, 0.5);
    s.step({ ru: 'Окружность с центром P через A отмечает на прямой D: PA = PD.', en: 'A circle centred at P through A marks D on the line: PA = PD.' });
    const c = s.circle(P, A, 'grey', true);
    const D = s.lc(l, c, 1, 'D');
    s.step({ ru: 'Из A и D — окружности радиусом AD; они пересекаются в K.', en: 'From A and D, circles of radius AD meet at K.' });
    const c1 = s.circle(A, D), c2 = s.circle(D, A);
    const K = s.cc(c1, c2, 0, 'K');
    s.step({ ru: 'PK перпендикулярна прямой. Так садовник размечает прямой угол верёвкой и колышками.', en: 'PK is perpendicular to the line. A gardener lays out a right angle this way with a rope and pegs.' });
    s.line(P, K, 'red');
    s.angle(A, P, K, 'red', false);
  },

  'drop-perpendicular': (s) => {
    s.step({ ru: 'Дана прямая и точка P вне её. Опустим из P перпендикуляр на прямую (Евклид, I.12).', en: 'Given a line and a point P off it, drop a perpendicular from P (Euclid I.12).' });
    const A = s.free(undefined, 30, 200), B = s.free(undefined, 370, 210);
    const l = s.line(A, B, 'black');
    const P = s.free('P', 180, 70);
    const Q = s.free('Q', 230, 270, 'grey');
    s.step({ ru: 'Возьмём точку Q по другую сторону прямой и проведём окружность с центром P через Q. Она пересечёт прямую в X и Y.', en: 'Take Q on the other side of the line and draw the circle centred at P through Q. It cuts the line at X and Y.' });
    const c = s.circle(P, Q, 'grey', true);
    const X = s.lc(l, c, 0, 'X'), Y = s.lc(l, c, 1, 'Y');
    s.step({ ru: 'Строим середину отрезка XY двумя окружностями — точку H.', en: 'Find the midpoint H of XY with two circles.' });
    const c1 = s.circle(X, Y), c2 = s.circle(Y, X);
    const K = s.ccPick(c1, c2, P, 'far');
    const H = s.ll(s.hide(s.line(P, K)), l, 'H');
    s.step({ ru: 'PH — перпендикуляр. Это кратчайший путь от P до прямой.', en: 'PH is the perpendicular: the shortest path from P to the line.' });
    s.segment(P, H, 'red', true);
    s.angle(X, H, P, 'red', false);
  },

  'copy-angle': (s) => {
    s.step({ ru: 'Дан угол AOB. Построим такой же угол при точке O′ от луча O′A′ (Евклид, I.23).', en: 'Given angle AOB, build an equal angle at O′ on ray O′A′ (Euclid I.23).' });
    const O = s.free('O', 50, 130), A = s.free('A', 170, 130), B = s.free('B', 140, 50);
    s.ray(O, A, 'black'); s.ray(O, B, 'black');
    const O2 = s.free('O′', 200, 260), R = s.free(undefined, 380, 250);
    s.ray(O2, R, 'black');
    s.step({ ru: 'Окружностью с центром O (радиус OA) отмечаем D на стороне OB. Тем же раствором — окружность из O′, она даёт A′.', en: 'A circle centred at O (radius OA) marks D on OB. With the same radius, a circle from O′ gives A′.' });
    const c = s.circle(O, A, 'grey', true);
    const D = s.lc(s.hide(s.line(O, B)), c, 1, 'D');
    const c2 = s.circleR(O2, O, A, 'grey', true);
    const A2 = s.lc(s.hide(s.line(O2, R)), c2, 1, 'A′');
    s.step({ ru: 'Циркулем берём раствор AD и откладываем его от A′: получаем D′.', en: 'Take the compass span AD and lay it off from A′: this gives D′.' });
    const c3 = s.circleR(A2, A, D, 'blue', true);
    const D2 = s.cc(c2, c3, 0, 'D′');
    s.step({ ru: 'Луч O′D′ даёт угол, равный данному: треугольники OAD и O′A′D′ равны по трём сторонам.', en: 'Ray O′D′ gives an equal angle: triangles OAD and O′A′D′ have three equal sides.' });
    s.ray(O2, D2, 'red');
    s.angle(A, O, D, 'yellow'); s.angle(A2, O2, D2, 'yellow');
  },

  parallel: (s) => {
    s.step({ ru: 'Дана прямая и точка P вне её. Проведём через P параллельную прямую (Евклид, I.31; здесь — «способом ромба»).', en: 'Given a line and a point P off it, draw the parallel through P (Euclid I.31; here by the "rhombus" method).' });
    const A1 = s.free(undefined, 30, 220), A2 = s.free(undefined, 370, 230);
    const l = s.line(A1, A2, 'black');
    const P = s.free('P', 160, 90);
    const seg = s.hide(s.segment(A1, A2));
    const A = s.glider('A', seg, 0.45);
    s.step({ ru: 'Окружность с центром A через P пересекает прямую в X.', en: 'The circle centred at A through P cuts the line at X.' });
    const c = s.circle(A, P, 'grey', true);
    const X = s.lc(l, c, 1, 'X');
    s.step({ ru: 'Тем же раствором — окружности из P и из X. Вторая их общая точка — Q.', en: 'With the same span, circles from P and from X. Their second common point is Q.' });
    const cP = s.circleR(P, A, P), cX = s.circleR(X, A, P);
    const Q = s.ccPick(cP, cX, A, 'far', 'Q');
    s.step({ ru: 'APQX — ромб (все стороны равны), а у ромба противоположные стороны параллельны. Прямая PQ параллельна данной.', en: 'APQX is a rhombus (all sides equal), and opposite sides of a rhombus are parallel. Line PQ is parallel to the given line.' });
    s.poly([A, P, Q, X], 'yellow');
    s.line(P, Q, 'red');
  },

  hexagon: (s) => {
    s.step({ ru: 'Окружность с центром O через A.', en: 'A circle centred at O through A.' });
    const O = s.free('O', 200, 150), A = s.free('A', 290, 150);
    const c = s.circle(O, A, 'black');
    s.step({ ru: 'Тем же раствором (радиусом!) шагаем циркулем по окружности: из A засекаем B, из B — C и так далее. Ровно шесть шагов возвращают в A.', en: 'With the same span (the radius!) walk the compass round the circle: from A mark B, from B mark C, and so on. Exactly six steps bring you back to A.' });
    let prev = A;
    const pts = [A];
    for (const n of ['B', 'C', 'D', 'E', 'F']) {
      const k = s.circleR(prev, O, A, 'grey', true);
      prev = s.cc(c, k, 1, n);
      pts.push(prev);
    }
    s.step({ ru: 'Соединяем точки — правильный шестиугольник. Сторона равна радиусу: шестиугольник складывается из шести равносторонних треугольников (Евклид, IV.15). Через одну точку — равносторонний треугольник.', en: 'Join the points: a regular hexagon. Its side equals the radius: it is six equilateral triangles (Euclid IV.15). Every second point gives an equilateral triangle.' });
    s.poly(pts, 'yellow');
    for (let i = 0; i < 6; i++) s.segment(pts[i], pts[(i + 1) % 6], 'red');
  },

  'square-in-circle': (s) => {
    s.step({ ru: 'Окружность с центром O; проведём диаметр AC.', en: 'A circle centred at O; draw diameter AC.' });
    const O = s.free('O', 200, 150), A = s.free('A', 300, 160);
    const c = s.circle(O, A, 'black');
    const d1 = s.line(A, O, 'grey');
    const C = s.lc(d1, c, 1, 'C');
    s.step({ ru: 'Серединный перпендикуляр к AC (две окружности из A и C) даёт второй диаметр BD.', en: 'The perpendicular bisector of AC (two circles from A and C) gives the second diameter BD.' });
    const k1 = s.circle(A, C, 'grey', true), k2 = s.circle(C, A, 'grey', true);
    const p = s.cc(k1, k2, 0), q = s.cc(k1, k2, 1);
    s.hide(p); s.hide(q);
    const d2 = s.line(p, q, 'grey');
    const B = s.lc(d2, c, 0, 'B'), D = s.lc(d2, c, 1, 'D');
    s.step({ ru: 'Диаметры перпендикулярны и равны — ABCD квадрат (Евклид, IV.6).', en: 'The diameters are perpendicular and equal, so ABCD is a square (Euclid IV.6).' });
    s.poly([A, B, C, D], 'yellow');
    for (const [x, y] of [[A, B], [B, C], [C, D], [D, A]] as const) s.segment(x, y, 'red');
  },

  'circle-center': (s) => {
    s.step({ ru: 'Дана окружность, но её центр не отмечен. Возьмём на ней три точки A, B, C (их можно двигать).', en: 'A circle is given but its centre is not marked. Take three points A, B, C on it (drag them).' });
    const O0 = s.hide(s.fixed(undefined, 200, 150)), R0 = s.hide(s.fixed(undefined, 300, 150));
    const c = s.circle(O0, R0, 'black');
    const A = s.glider('A', c, 150), B = s.glider('B', c, 60), C = s.glider('C', c, -40);
    s.step({ ru: 'Серединный перпендикуляр к хорде AB (все его точки одинаково далеко от A и B).', en: 'The perpendicular bisector of chord AB (all its points are equally far from A and B).' });
    s.segment(A, B, 'grey');
    const a1 = s.circle(A, B, 'grey', true), a2 = s.circle(B, A, 'grey', true);
    const l1 = s.line(s.hide(s.cc(a1, a2, 0)), s.hide(s.cc(a1, a2, 1)), 'red');
    s.step({ ru: 'То же для хорды BC.', en: 'The same for chord BC.' });
    s.segment(B, C, 'grey');
    const b1 = s.circle(B, C, 'grey', true), b2 = s.circle(C, B, 'grey', true);
    const l2 = s.line(s.hide(s.cc(b1, b2, 0)), s.hide(s.cc(b1, b2, 1)), 'blue');
    s.step({ ru: 'Точка пересечения одинаково далека от A, B и C — это центр (Евклид, III.1).', en: 'The crossing point is equally far from A, B and C: it is the centre (Euclid III.1).' });
    s.ll(l1, l2, 'O', 'red');
  },

  circumcircle: (s) => {
    s.step({ ru: 'Дан треугольник ABC. Найдём окружность, проходящую через все три вершины.', en: 'Given triangle ABC, find the circle through all three vertices.' });
    const A = s.free('A', 90, 220), B = s.free('B', 320, 230), C = s.free('C', 170, 70);
    s.poly([A, B, C], 'yellow');
    s.segment(A, B); s.segment(B, C); s.segment(C, A);
    s.step({ ru: 'Серединные перпендикуляры к AB и BC.', en: 'Perpendicular bisectors of AB and BC.' });
    const a1 = s.hide(s.circle(A, B)), a2 = s.hide(s.circle(B, A));
    const l1 = s.line(s.hide(s.cc(a1, a2, 0)), s.hide(s.cc(a1, a2, 1)), 'red');
    const b1 = s.hide(s.circle(B, C)), b2 = s.hide(s.circle(C, B));
    const l2 = s.line(s.hide(s.cc(b1, b2, 0)), s.hide(s.cc(b1, b2, 1)), 'blue');
    s.step({ ru: 'Они пересекаются в O — центре описанной окружности (Евклид, IV.5). Где поставить колодец, чтобы трём домам было одинаково далеко? В точке O. У тупоугольного треугольника O оказывается снаружи — проверьте.', en: 'They meet at O, the circumcentre (Euclid IV.5). Where to dig a well equally far from three houses? At O. For an obtuse triangle O lies outside: check it.' });
    const O = s.ll(l1, l2, 'O', 'red');
    s.circle(O, A, 'red');
  },

  'tangent-from-point': (s) => {
    s.step({ ru: 'Дана окружность с центром O и точка P снаружи. Проведём из P касательные.', en: 'Given a circle centred at O and a point P outside, draw the tangents from P.' });
    const O = s.free('O', 130, 150), R = s.free(undefined, 200, 150, 'grey');
    const c = s.circle(O, R, 'black');
    const P = s.free('P', 340, 120);
    s.step({ ru: 'Находим середину M отрезка OP (серединным перпендикуляром).', en: 'Find the midpoint M of OP (with the perpendicular bisector).' });
    s.segment(O, P, 'grey');
    const k1 = s.hide(s.circle(O, P)), k2 = s.hide(s.circle(P, O));
    const M = s.ll(s.hide(s.line(s.hide(s.cc(k1, k2, 0)), s.hide(s.cc(k1, k2, 1)))), s.hide(s.line(O, P)), 'M');
    s.step({ ru: 'Окружность на OP как на диаметре («окружность Фалеса») пересекает данную в T₁ и T₂.', en: 'The circle on OP as diameter ("Thales circle") cuts the given circle at T₁ and T₂.' });
    const th = s.circle(M, O, 'blue', true);
    const T1 = s.cc(c, th, 0, 'T₁'), T2 = s.cc(c, th, 1, 'T₂');
    s.step({ ru: 'PT₁ и PT₂ — касательные: угол OT₁P опирается на диаметр OP, значит, он прямой, а касательная перпендикулярна радиусу (Евклид, III.17).', en: 'PT₁ and PT₂ are the tangents: angle OT₁P stands on diameter OP, so it is a right angle, and a tangent is perpendicular to the radius (Euclid III.17).' });
    s.line(P, T1, 'red'); s.line(P, T2, 'red');
    s.segment(O, T1, 'grey'); s.angle(O, T1, P, 'red', false);
  },

  'divide-segment': (s) => {
    s.step({ ru: 'Разделим отрезок AB на три равные части, не измеряя его (Евклид, VI.9).', en: 'Divide segment AB into three equal parts without measuring it (Euclid VI.9).' });
    const A = s.free('A', 50, 230), B = s.free('B', 340, 230);
    s.segment(A, B, 'black');
    const R = s.free('1', 120, 170);
    s.step({ ru: 'Из A проводим любой луч и откладываем на нём циркулем три равных отрезка: A1 = 12 = 23.', en: 'From A draw any ray and step off three equal segments with the compass: A1 = 12 = 23.' });
    const ray = s.ray(A, R, 'grey');
    const R2 = s.lc(s.hide(s.line(A, R)), s.circle(R, A, 'grey', true), 1, '2');
    const R3 = s.lc(s.hide(s.line(A, R)), s.circle(R2, R, 'grey', true), 1, '3');
    void ray;
    s.step({ ru: 'Соединяем 3 с B и через 1 и 2 проводим параллельные прямые. Они делят AB на три равные части. В российской школе на этом основана «теорема Фалеса» (хотя сам Фалес к ней отношения не имеет).', en: 'Join 3 to B and draw parallels through 1 and 2. They cut AB into three equal parts.' });
    const l3 = s.line(R3, B, 'red', 'segment');
    const ab = s.hide(s.line(A, B));
    s.ll(s.parallel(l3, R, 'blue', true), ab, 'M₁', 'red');
    s.ll(s.parallel(l3, R2, 'blue', true), ab, 'M₂', 'red');
  },
};
