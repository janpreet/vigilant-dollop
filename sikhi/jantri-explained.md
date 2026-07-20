---
layout: page
title: "How a Jantri Date Is Made"
permalink: /sikhi/jantri-explained/
show_title: true
parent: Sikhi
parent_url: /sikhi/
tags: [sikh, calendar, astronomy]
description: "An interactive walkthrough of the two computations behind every Nanakshahi Jantri date, the sankranti that starts a solar month, and the tithi that fixes a gurpurab."
---

Every date in the Nanakshahi Jantri comes out of one of two machines. **Sangrands**, the first day of each solar month, come from the sun alone: the moment its *sidereal* longitude crosses a 30° boundary. **Gurpurabs and lunar observances** come from the sun and moon together: the angle between them, cut into 30 slices called tithis. This page runs both machines live, in your browser, using the same conventions as [the feed you can subscribe to](/nanakshahi), calibrated against the printed Jantri from Amritsar. ([How the feed was rebuilt.](/nanakshahi-rebuilt))

<div class="jx-today" id="jx-today" aria-live="polite"></div>

## Machine 1, the sidereal sun and the sangrand

The Jantri's solar year is **sidereal**: the sun's position is measured against the fixed stars, not against the seasons. The two zero-points drift apart by about 50″ a year, the accumulated gap, called the **ayanamsa**, is now just over 24°. That is why Vaisakhi falls around 13–14 April rather than at the March equinox: the sidereal Mesha boundary sits 24° "later" along the ecliptic than the tropical one.

A **sankranti** is the instant the sun's sidereal longitude crosses a multiple of 30°, entering a new rashi. The Jantri's rule, forced by 11 of the 36 sangrands in the pinned years, is *sunrise-to-sunrise*: the new month begins on the day (Amritsar sunrise to next Amritsar sunrise) that contains the sankranti moment. A sankranti at 3 a.m. belongs to the *previous* civil day.

Pick a month and year, and watch the derivation:

<div class="jx-panel">
  <div class="jx-controls">
    <label>Month <select id="s-month"></select></label>
    <label>NS year <input type="number" id="s-year" min="540" max="580" value="558"></label>
  </div>
  <div class="jx-flex">
    <div id="s-dial" class="jx-dial"></div>
    <div id="s-steps" class="jx-steps"></div>
  </div>
  <div id="s-strip"></div>
</div>

## Machine 2, the tithi and the gurpurab

A **tithi** is one-thirtieth of the moon's monthly lap around the sun: each time the moon pulls another 12° ahead (in ecliptic longitude), a new tithi begins. Tithis 1–15 are the bright half (*sudi*), ending at **purnmashi** (full moon, 168°–180°); tithis 16–30 are the dark half (*vadi*), ending at **massia** (new moon). Because the moon's speed varies, a tithi lasts anywhere from ~20 to ~26 hours, it is a phase angle, not a day.

Two conventions pin a tithi to a civil date:

**Which lunar month?** Lunar months run new moon to new moon (*amanta*), and a month is named by the sankranti it contains, the month holding the Mesha sankranti is Chet, and so on. A rare month containing *no* sankranti is **adhik** (intercalary) and hosts no gurpurabs, the Jantri prints it as ਵਾ:ਜੇਠ and skips it.

**Which day?** The **udaya rule**: the event falls on the day whose *sunrise at Amritsar* lands inside the target tithi. If the moon moves fast enough that a tithi begins and ends between two sunrises (*kshaya*, skipped), the event takes the day the tithi actually ran; if a tithi covers two sunrises (*vridhi*), the first day wins.

Pick a gurpurab and year:

<div class="jx-panel">
  <div class="jx-controls">
    <label>Gurpurab <select id="t-event"></select></label>
    <label>NS year <input type="number" id="t-year" min="540" max="580" value="558"></label>
  </div>
  <div id="t-anchor"></div>
  <div class="jx-flex">
    <div id="t-dial" class="jx-dial"></div>
    <div id="t-steps" class="jx-steps"></div>
  </div>
  <div id="t-scan"></div>
</div>

Notice what this means: **a gurpurab keeps its tithi, not its Gregorian date, and not even its Nanakshahi date.** Parkash Guru Nanak Dev Ji is always Katak purnmashi, but that full moon can land in solar Katak one year and solar Maghar the next. The date moves in *every* calendar except the lunar one it is defined in.

## What this page doesn't show

Two festival dates use time-window rules instead of sunrise: **Bandi Chhor Divas** takes the evening (*pradosh*) the massia tithi covers, and the Jantri's **Dussehra** uses an afternoon (*aparahna*) window. And a handful of observances are moved by the Jantri's compilers for practical reasons no formula predicts, the feed never guesses those; they appear only once printed.

## Accuracy, honestly

The math on this page is a compact in-browser ephemeris (Meeus-style series, good to about an arcminute), running the same calibrated conventions as the real engine: Lahiri-type ayanamsa (23.8532° at J2000 + 50.28796″/yr), Amritsar sunrise, sunrise-to-sunrise sangrands, udaya tithis. Checked against the pinned printed-Jantri data, the full engine reproduces all 36 sangrands and all 25 massia/purnmashi across its three bundled pinned years (NS 549, 557, 558); this page's own badges above check the 24 sangrands and 6 tithi gurpurabs pinned for NS 557–558. Dates carrying a <span class="jx-badge jx-ok">✓ printed Jantri</span> badge match the published Jantri; anything else is marked <span class="jx-badge jx-est">≈ computed</span>, same honesty policy as the feed. For anything you plan around, trust [the feed](/nanakshahi), which uses a full ephemeris and pinned data, or better, the Jantri itself. The full engine is open source: [nanakshahi-jantri](https://github.com/janpreet/nanakshahi-jantri).

<style>
.jx-today { background:var(--bg-surface); border:1px solid var(--border); border-radius:12px; padding:.7em 1em; margin:1.2em 0; font-size:.95em; color:var(--text); }
.jx-panel { background:var(--bg-surface); border:1px solid var(--border); border-radius:12px; padding:1em; margin:1.2em 0 2em; }
.jx-controls { display:flex; gap:1.2em; flex-wrap:wrap; margin-bottom:.8em; }
.jx-controls label { font-size:.9em; font-weight:600; color:var(--accent-dim); }
.jx-controls select, .jx-controls input { font:inherit; padding:.25em .5em; border:1px solid var(--border); border-radius:8px; background:var(--bg); color:var(--text); margin-left:.35em; }
.jx-controls input { width:5.5em; }
.jx-flex { display:flex; gap:1.2em; flex-wrap:wrap; align-items:flex-start; }
.jx-dial { flex:0 0 300px; max-width:100%; }
.jx-dial svg { width:100%; height:auto; display:block; }
.jx-steps { flex:1 1 260px; font-size:.92em; color:var(--text); }
.jx-steps ol { margin:0; padding-left:1.3em; }
.jx-steps li { margin-bottom:.55em; }
.jx-steps .jx-num { font-variant-numeric:tabular-nums; }
.jx-result { font-size:1.05em; background:var(--bg-surface); border-left:4px solid var(--chip-warm); padding:.5em .8em; border-radius:0 8px 8px 0; margin-top:.6em; }
.jx-badge { display:inline-block; font-size:.78em; font-weight:700; padding:.1em .55em; border-radius:999px; vertical-align:middle; }
.jx-ok { background:color-mix(in srgb, var(--tag-hue-4) 18%, transparent); color:var(--tag-hue-4); border:1px solid var(--tag-hue-4); }
.jx-est { background:var(--bg-surface); color:var(--chip-warm); border:1px solid var(--border); }
.jx-scan { display:flex; gap:.4em; flex-wrap:wrap; margin-top:.9em; }
.jx-chip { border:1px solid var(--border); border-radius:10px; padding:.35em .55em; font-size:.82em; text-align:center; color:var(--text); background:var(--bg); min-width:4.6em; }
.jx-chip .d { font-weight:700; display:block; }
.jx-chip .t { color:var(--accent-dim); }
.jx-chip.hit { background:color-mix(in srgb, var(--tag-hue-4) 18%, transparent); border-color:var(--tag-hue-4); box-shadow:0 0 0 2px var(--tag-hue-4); }
.jx-chip.ksh { background:color-mix(in srgb, var(--tag-hue-3) 18%, transparent); border-color:var(--tag-hue-3); }
.jx-note { font-size:.85em; color:var(--accent-dim); margin-top:.6em; }
.jx-strip svg { width:100%; height:auto; display:block; margin-top:.9em; }
@media (max-width:640px){ .jx-dial{flex-basis:100%;} }
</style>

<script>
(function () {
'use strict';
// ============ core astronomy (browser port of nanakshahi-jantri conventions;
// this page's own pinned data covers NS 557/558: 24/24 sangrands, 6/6 tithi
// gurpurabs. massia/purnmashi (25/25) is validated in the full engine across
// its three bundled pinned years, NS 549/557/558, not reproduced here) ========
var RAD = Math.PI / 180, IST = 330 * 60000;
var LOC = { lat: 31.62, lon: 74.8765 };
var MONTHS = ['Chet','Vaisakh','Jeth','Harh','Sawan','Bhadon','Assu','Katak','Maghar','Poh','Magh','Phagan'];
var MONTHS_PA = ['ਚੇਤ','ਵੈਸਾਖ','ਜੇਠ','ਹਾੜ','ਸਾਵਣ','ਭਾਦੋਂ','ਅੱਸੂ','ਕੱਤਕ','ਮੱਘਰ','ਪੋਹ','ਮਾਘ','ਫੱਗਣ'];
var RASHI_PA = ['ਮੇਖ','ਬ੍ਰਿਖ','ਮਿਥਨ','ਕਰਕ','ਸਿੰਘ','ਕੰਨਿਆ','ਤੁਲਾ','ਬ੍ਰਿਸ਼ਚਕ','ਧਨ','ਮਕਰ','ਕੁੰਭ','ਮੀਨ'];
var TARGET = { Chet:330, Vaisakh:0, Jeth:30, Harh:60, Sawan:90, Bhadon:120, Assu:150, Katak:180, Maghar:210, Poh:240, Magh:270, Phagan:300 };
var ANCHOR = { Chet:[3,14], Vaisakh:[4,13], Jeth:[5,14], Harh:[6,15], Sawan:[7,16], Bhadon:[8,16], Assu:[9,16], Katak:[10,17], Maghar:[11,16], Poh:[12,15], Magh:[1,14], Phagan:[2,12] };

function n360(x){ return ((x % 360) + 360) % 360; }
function jd(ms){ return ms / 86400000 + 2440587.5; }
function cT(ms){ return (jd(ms) + 69/86400 - 2451545.0) / 36525; }

function sunCalc(ms){
  var T = cT(ms);
  var L0 = n360(280.46646 + 36000.76983*T + 0.0003032*T*T);
  var M = n360(357.52911 + 35999.05029*T - 0.0001537*T*T);
  var C = (1.914602 - 0.004817*T - 0.000014*T*T)*Math.sin(M*RAD)
        + (0.019993 - 0.000101*T)*Math.sin(2*M*RAD) + 0.000289*Math.sin(3*M*RAD);
  var tl = L0 + C;
  var om = 125.04 - 1934.136*T;
  var dpsi = -0.00478*Math.sin(om*RAD);
  return { tl:n360(tl), app:n360(tl - 0.00569 + dpsi), L0:L0, T:T, dpsi:dpsi };
}
var LT = [[0,0,1,0,6288774],[2,0,-1,0,1274027],[2,0,0,0,658314],[0,0,2,0,213618],
[0,1,0,0,-185116],[0,0,0,2,-114332],[2,0,-2,0,58793],[2,-1,-1,0,57066],
[2,0,1,0,53322],[2,-1,0,0,45758],[0,1,-1,0,-40923],[1,0,0,0,-34720],
[0,1,1,0,-30383],[2,0,0,-2,15327],[0,0,1,2,-12528],[0,0,1,-2,10980],
[4,0,-1,0,10675],[0,0,3,0,10034],[4,0,-2,0,8548],[2,1,-1,0,-7888],
[2,1,0,0,-6766],[1,0,-1,0,-5163],[1,1,0,0,4987],[2,-1,1,0,4036],
[2,0,2,0,3994],[4,0,0,0,3861],[2,0,-3,0,3665],[0,1,-2,0,-2689],
[2,0,-1,2,-2602],[2,-1,-2,0,2390],[1,0,1,0,-2348],[2,-2,0,0,2236],
[0,1,2,0,-2120],[0,2,0,0,-2069],[2,-2,-1,0,2048],[2,0,1,-2,-1773],
[2,0,0,2,-1595],[4,-1,-1,0,1215],[0,0,2,2,-1110],[3,0,-1,0,-892],
[2,1,1,0,-810],[4,-1,-2,0,759],[0,2,-1,0,-713],[2,2,-1,0,-700],
[2,1,-2,0,691],[2,-1,0,-2,596],[4,0,1,0,549],[0,0,4,0,537],
[4,-1,0,0,520],[1,0,-2,0,-487],[2,1,0,-2,-399],[0,0,2,-2,-381],
[1,1,1,0,351],[3,0,-2,0,-340],[4,0,-3,0,330],[2,-1,2,0,327],
[0,2,1,0,-323],[1,1,-1,0,299],[2,0,3,0,294]];
function moonLon(ms){
  var T = cT(ms);
  var Lp = n360(218.3164477 + 481267.88123421*T - 0.0015786*T*T + T*T*T/538841);
  var D = n360(297.8501921 + 445267.1114034*T - 0.0018819*T*T + T*T*T/545868);
  var M = n360(357.5291092 + 35999.0502909*T - 0.0001536*T*T);
  var Mp = n360(134.9633964 + 477198.8675055*T + 0.0087414*T*T + T*T*T/69699);
  var F = n360(93.2720950 + 483202.0175233*T - 0.0036539*T*T - T*T*T/3526000);
  var E = 1 - 0.002516*T - 0.0000074*T*T, s = 0, i, t, c;
  for (i = 0; i < LT.length; i++){
    t = LT[i]; c = t[4];
    if (t[1] === 1 || t[1] === -1) c *= E; else if (t[1] === 2 || t[1] === -2) c *= E*E;
    s += c * Math.sin((t[0]*D + t[1]*M + t[2]*Mp + t[3]*F) * RAD);
  }
  s += 3958*Math.sin((119.75 + 131.849*T)*RAD) + 1962*Math.sin((Lp - F)*RAD) + 318*Math.sin((53.09 + 479264.290*T)*RAD);
  return n360(Lp + s/1e6);
}
function elong(ms){ return n360(moonLon(ms) - sunCalc(ms).tl + 0.00569); }
function tithiAt(ms){ return Math.floor(elong(ms)/12) + 1; }
function ayan(ms){
  var y = (ms - Date.UTC(2000,0,1,12)) / (365.25*86400000);
  return 23.8532 + (50.28796*y + 0.000111*y*y)/3600;
}
function sidSun(ms){ return n360(sunCalc(ms).app - ayan(ms)); }
function sdiff(x,t){ return ((x - t + 180) % 360 + 360) % 360 - 180; }
function solve(fn, target, t0, days){
  var lo = t0, flo = sdiff(fn(lo), target), i, hi, fhi, a, b, m, k;
  for (i = 1; i <= days; i++){
    hi = t0 + i*86400000; fhi = sdiff(fn(hi), target);
    if (flo < 0 && fhi >= 0){
      a = lo; b = hi;
      for (k = 0; k < 50; k++){ m = (a+b)/2; if (sdiff(fn(m), target) < 0) a = m; else b = m; }
      return (a+b)/2;
    }
    lo = hi; flo = fhi;
  }
  return null;
}
function istISO(ms){ return new Date(ms + IST).toISOString().slice(0,10); }
function addD(iso, n){ var d = new Date(iso + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0,10); }
function sunriseMs(iso){
  var mid = Date.parse(iso + 'T00:00:00Z') - IST, t = mid + 6.5*3600000, i;
  for (i = 0; i < 3; i++){
    var s = sunCalc(t), eps = (23.4392911 - 0.0130042*s.T)*RAD, lam = s.app*RAD;
    var dec = Math.asin(Math.sin(eps)*Math.sin(lam));
    var ra = Math.atan2(Math.cos(eps)*Math.sin(lam), Math.cos(lam))/RAD;
    var eot = 4*sdiff(s.L0 - 0.00569 + s.dpsi*Math.cos(eps), ra);
    var noon = Date.parse(iso + 'T00:00:00Z') + (720 - 4*LOC.lon - eot)*60000;
    var cH = (Math.sin(-0.833*RAD) - Math.sin(LOC.lat*RAD)*Math.sin(dec)) / (Math.cos(LOC.lat*RAD)*Math.cos(dec));
    t = noon - Math.acos(Math.max(-1, Math.min(1, cH)))/RAD*4*60000;
  }
  return t;
}
function sankranti(month, gy){
  var a = ANCHOR[month];
  return solve(sidSun, TARGET[month], Date.UTC(gy, a[0]-1, a[1]) - 12*86400000, 25);
}
function sangrandDay(ms){
  var d = istISO(ms);
  if (ms < sunriseMs(d)) d = addD(d, -1);
  return d;
}
function nmBefore(ms){
  var t = solve(elong, 0, ms - 40*86400000, 45), nx;
  while (t !== null){
    nx = solve(elong, 0, t + 86400000, 35);
    if (nx === null || nx >= ms) break;
    t = nx;
  }
  return t;
}
function nmAfter(ms){ return solve(elong, 0, ms + 86400000, 35); }
function amanta(month, gy){
  var k = MONTHS.indexOf(month), ns = MONTHS[(k+1)%12];
  var iy = (ns === 'Magh' || ns === 'Phagan') ? gy + 1 : gy;
  var s = sankranti(ns, iy);
  var st = nmBefore(s), en = nmAfter(s);
  // adhik check: previous lunar month with no sankranti?
  var pst = nmBefore(st - 3600000);
  var lon0 = sidSun(pst), nextB = (Math.floor(lon0/30) + 1) * 30 % 360;
  var cross = solve(sidSun, nextB, pst, 35);
  return { start: st, end: en, sank: s, sankMonth: ns, adhikBefore: !(cross !== null && cross < st) };
}
function srTithi(iso){ return tithiAt(sunriseMs(iso)); }
function lunarEvent(month, n, gy){
  var m = amanta(month, gy), st = istISO(m.start), prev = null, i, day, t;
  for (i = 0; i <= 20; i++){
    day = addD(st, i); t = srTithi(day);
    if (t === n) return { day: day, kshaya: false, m: m };
    if (prev !== null && prev < n && t > n) return { day: addD(day, -1), kshaya: true, m: m };
    prev = t;
  }
  return null;
}
// NS date of a Gregorian day
function nsDateOf(iso){
  var sr = sunriseMs(iso), lon = sidSun(sr);
  var k = (Math.floor(lon/30) + 1) % 12; // rashi 0 (Mesha) => solar Vaisakh (idx 1)
  var mIdx = (k) % 12, mName = MONTHS[mIdx === 0 ? 0 : mIdx];
  // month whose TARGET was just crossed: rashi r means solar month index (r+1)%12
  var r = Math.floor(lon/30); mIdx = (r + 1) % 12; mName = MONTHS[mIdx];
  var y = +iso.slice(0,4);
  var s = sankranti(mName, y);
  if (s === null || sangrandDay(s) > iso) s = sankranti(mName, y - 1);
  var sd = sangrandDay(s);
  var dayNum = Math.round((Date.parse(iso) - Date.parse(sd)) / 86400000) + 1;
  var sy = +sd.slice(0,4);
  var nsYear = (mIdx >= 10) ? sy - 1469 : sy - 1468; // Magh/Phagan fall Jan-Feb
  return { day: dayNum, month: mName, monthPa: MONTHS_PA[mIdx], nsYear: nsYear, sangrand: sd };
}
// ============ pinned Jantri data for badges ============
var PIN_SANG = {
  557: { Chet:'2025-03-14', Vaisakh:'2025-04-13', Jeth:'2025-05-14', Harh:'2025-06-15', Sawan:'2025-07-16', Bhadon:'2025-08-16', Assu:'2025-09-16', Katak:'2025-10-17', Maghar:'2025-11-16', Poh:'2025-12-15', Magh:'2026-01-14', Phagan:'2026-02-12' },
  558: { Chet:'2026-03-14', Vaisakh:'2026-04-14', Jeth:'2026-05-15', Harh:'2026-06-15', Sawan:'2026-07-16', Bhadon:'2026-08-17', Assu:'2026-09-17', Katak:'2026-10-17', Maghar:'2026-11-16', Poh:'2026-12-16', Magh:'2027-01-14', Phagan:'2027-02-13' }
};
var PIN_EV = {
  'Katak|15': { 557:'2025-11-05', 558:'2026-11-24' },
  'Jeth|4':  { 557:'2025-05-30', 558:'2026-06-18' },
  'Poh|7':   { 557:'2025-12-27', 558:'2027-01-15' }
};
var EVENTS = [
  { id:'Katak|15', month:'Katak', n:15, name:'Parkash Guru Nanak Dev Ji', pa:'ਕੱਤਕ ਦੀ ਪੂਰਨਮਾਸ਼ੀ', tithi:'Katak purnmashi' },
  { id:'Jeth|4', month:'Jeth', n:4, name:'Shaheedi Guru Arjan Dev Ji', pa:'ਜੇਠ ਸੁਦੀ ੪', tithi:'Jeth sudi 4' },
  { id:'Poh|7', month:'Poh', n:7, name:'Parkash Guru Gobind Singh Ji', pa:'ਪੋਹ ਸੁਦੀ ੭', tithi:'Poh sudi 7' }
];
// ============ formatting helpers ============
function fmtIST(ms){
  var d = new Date(ms + IST);
  var h = d.getUTCHours(), mi = d.getUTCMinutes();
  return d.toISOString().slice(0,10) + ', ' + (h < 10 ? '0' : '') + h + ':' + (mi < 10 ? '0' : '') + mi + ' IST';
}
function fmtDate(iso){
  var m = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return +iso.slice(8,10) + ' ' + m[+iso.slice(5,7)-1] + ' ' + iso.slice(0,4);
}
function badge(pinned){
  return pinned ? '<span class="jx-badge jx-ok">✓ printed Jantri</span>' : '<span class="jx-badge jx-est">≈ computed</span>';
}
function deg(x){ return x.toFixed(3) + '°'; }
function pt(cx, cy, lon, R){ var a = (90 + lon)*RAD; return [cx + R*Math.cos(a), cy - R*Math.sin(a)]; }
// ============ zodiac dial (machine 1) ============
function drawZodiac(el, sankMs, targetLon){
  var cx = 160, cy = 160, R1 = 148, R2 = 108, i, s = '';
  s += '<svg viewBox="0 0 320 320" role="img" aria-label="Zodiac ring showing the sun crossing a rashi boundary">';
  for (i = 0; i < 12; i++){
    var a0 = i*30, hit = (a0 === targetLon);
    var p0 = pt(cx, cy, a0, R1), p1 = pt(cx, cy, (i+1)*30, R1), q0 = pt(cx, cy, a0, R2), q1 = pt(cx, cy, (i+1)*30, R2);
    s += '<path d="M' + q0[0].toFixed(1) + ',' + q0[1].toFixed(1) + ' L' + p0[0].toFixed(1) + ',' + p0[1].toFixed(1)
      + ' A' + R1 + ',' + R1 + ' 0 0 0 ' + p1[0].toFixed(1) + ',' + p1[1].toFixed(1)
      + ' L' + q1[0].toFixed(1) + ',' + q1[1].toFixed(1)
      + ' A' + R2 + ',' + R2 + ' 0 0 1 ' + q0[0].toFixed(1) + ',' + q0[1].toFixed(1) + ' Z"'
      + ' fill="' + (hit ? 'var(--bg-surface)' : (i % 2 ? 'var(--bg-surface)' : 'var(--bg-hover)')) + '" stroke="var(--border)" stroke-width="1"/>';
    var lm = pt(cx, cy, a0 + 15, (R1+R2)/2);
    s += '<text x="' + lm[0].toFixed(1) + '" y="' + (lm[1]+4).toFixed(1) + '" text-anchor="middle" font-size="12" fill="var(--accent-dim)" font-family="system-ui,sans-serif">' + RASHI_PA[i] + '</text>';
  }
  // target boundary
  var b0 = pt(cx, cy, targetLon, R2 - 6), b1 = pt(cx, cy, targetLon, R1 + 6);
  s += '<line x1="' + b0[0].toFixed(1) + '" y1="' + b0[1].toFixed(1) + '" x2="' + b1[0].toFixed(1) + '" y2="' + b1[1].toFixed(1) + '" stroke="var(--chip-warm)" stroke-width="3"/>';
  var bl = pt(cx, cy, targetLon, R1 + 16);
  s += '<text x="' + bl[0].toFixed(1) + '" y="' + (bl[1]+4).toFixed(1) + '" text-anchor="middle" font-size="11" font-weight="700" fill="var(--chip-warm)" font-family="system-ui,sans-serif">' + targetLon + '°</text>';
  // sun trail: -3d, -2d, -1d, moment
  var k;
  for (k = 3; k >= 1; k--){
    var lonK = sidSun(sankMs - k*86400000), pk = pt(cx, cy, lonK, (R1+R2)/2 - 26);
    s += '<circle cx="' + pk[0].toFixed(1) + '" cy="' + pk[1].toFixed(1) + '" r="' + (4 - k*0.7) + '" fill="var(--border)"/>';
  }
  var ps = pt(cx, cy, sidSun(sankMs), (R1+R2)/2 - 26);
  s += '<circle cx="' + ps[0].toFixed(1) + '" cy="' + ps[1].toFixed(1) + '" r="7" fill="var(--accent)" stroke="var(--chip-warm)" stroke-width="1.5"/>';
  // tropical zero tick (ayanamsa gap): sidereal position of tropical 0 = 360 - ayanamsa
  var ay = ayan(sankMs), tz = pt(cx, cy, n360(-ay), R1 + 6), tz2 = pt(cx, cy, n360(-ay), R1 - 4);
  s += '<line x1="' + tz2[0].toFixed(1) + '" y1="' + tz2[1].toFixed(1) + '" x2="' + tz[0].toFixed(1) + '" y2="' + tz[1].toFixed(1) + '" stroke="var(--tag-hue-3)" stroke-width="2.5"/>';
  var tzl = pt(cx, cy, n360(-ay), R1 + 24);
  s += '<text x="' + tzl[0].toFixed(1) + '" y="' + (tzl[1]+4).toFixed(1) + '" text-anchor="middle" font-size="10" fill="var(--tag-hue-3)" font-family="system-ui,sans-serif">tropical 0°</text>';
  s += '<text x="160" y="156" text-anchor="middle" font-size="11" fill="var(--accent-dim)" font-family="system-ui,sans-serif">sidereal ring</text>';
  s += '<text x="160" y="172" text-anchor="middle" font-size="11" fill="var(--accent-dim)" font-family="system-ui,sans-serif">ayanamsa ' + ay.toFixed(2) + '°</text>';
  s += '</svg>';
  el.innerHTML = s;
}
// ============ sunrise-to-sunrise strip (machine 1) ============
function drawStrip(el, sankMs){
  var civil = istISO(sankMs), owner = sangrandDay(sankMs);
  var d0 = addD(owner, -1), days = [d0, addD(d0,1), addD(d0,2)], W = 700, H = 120;
  var t0 = Date.parse(d0 + 'T00:00:00Z') - IST, t1 = t0 + 3*86400000;
  function X(ms){ return 20 + (ms - t0) / (t1 - t0) * (W - 40); }
  var s = '<div class="jx-strip"><svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Sunrise-to-sunrise day assignment">';
  var sr = days.map(function(d){ return sunriseMs(d); });
  var srNext = sunriseMs(addD(d0, 3));
  var band0 = null, band1 = null, i;
  var all = sr.concat([srNext]);
  for (i = 0; i < all.length - 1; i++){
    if (sankMs >= all[i] && sankMs < all[i+1]){ band0 = all[i]; band1 = all[i+1]; }
  }
  if (band0 !== null){
    s += '<rect x="' + X(band0).toFixed(1) + '" y="30" width="' + (X(band1)-X(band0)).toFixed(1) + '" height="52" fill="color-mix(in srgb, var(--tag-hue-4) 18%, transparent)" stroke="var(--tag-hue-4)" stroke-width="1.5" rx="6"/>';
  }
  for (i = 0; i <= 3; i++){
    var mx = X(t0 + i*86400000);
    s += '<line x1="' + mx.toFixed(1) + '" y1="26" x2="' + mx.toFixed(1) + '" y2="86" stroke="var(--border)" stroke-width="1" stroke-dasharray="3,3"/>';
    if (i < 3) s += '<text x="' + (X(t0 + i*86400000 + 43200000)).toFixed(1) + '" y="20" text-anchor="middle" font-size="12" fill="var(--text)" font-family="system-ui,sans-serif"' + (days[i] === owner ? ' font-weight="700"' : '') + '>' + fmtDate(days[i]) + '</text>';
  }
  for (i = 0; i < all.length; i++){
    var sx = X(all[i]);
    s += '<line x1="' + sx.toFixed(1) + '" y1="30" x2="' + sx.toFixed(1) + '" y2="82" stroke="var(--accent)" stroke-width="2"/>';
    s += '<text x="' + sx.toFixed(1) + '" y="100" text-anchor="middle" font-size="10" fill="var(--accent)" font-family="system-ui,sans-serif">☀ sunrise</text>';
  }
  var kx = X(sankMs);
  s += '<circle cx="' + kx.toFixed(1) + '" cy="56" r="7" fill="var(--chip-warm)"/>';
  s += '<text x="' + kx.toFixed(1) + '" y="115" text-anchor="middle" font-size="11" font-weight="700" fill="var(--chip-warm)" font-family="system-ui,sans-serif">sankranti</text>';
  s += '</svg></div>';
  var note = '';
  if (owner !== civil) note = '<div class="jx-note">The sankranti falls after midnight but <em>before sunrise</em>, so it belongs to the previous sunrise-to-sunrise day, ' + fmtDate(owner) + '.</div>';
  el.innerHTML = s + note;
}
// ============ tithi dial (machine 2) ============
function drawTithiDial(el, ms){
  var cx = 160, cy = 160, R1 = 148, R2 = 112, i, s = '';
  var sl = sunCalc(ms).tl + 0.0, ml = moonLon(ms), e = elong(ms), ti = Math.floor(e/12) + 1;
  s += '<svg viewBox="0 0 320 320" role="img" aria-label="Sun-moon elongation dial showing the tithi">';
  for (i = 0; i < 30; i++){
    var a0 = sl + i*12, p0 = pt(cx,cy,a0,R1), p1 = pt(cx,cy,a0+12,R1), q0 = pt(cx,cy,a0,R2), q1 = pt(cx,cy,a0+12,R2);
    var fill = (i < 15) ? 'var(--bg-surface)' : 'var(--bg-hover)';
    if (i === ti - 1) fill = 'color-mix(in srgb, var(--tag-hue-4) 18%, transparent)';
    s += '<path d="M' + q0[0].toFixed(1) + ',' + q0[1].toFixed(1) + ' L' + p0[0].toFixed(1) + ',' + p0[1].toFixed(1)
      + ' A' + R1 + ',' + R1 + ' 0 0 0 ' + p1[0].toFixed(1) + ',' + p1[1].toFixed(1)
      + ' L' + q1[0].toFixed(1) + ',' + q1[1].toFixed(1)
      + ' A' + R2 + ',' + R2 + ' 0 0 1 ' + q0[0].toFixed(1) + ',' + q0[1].toFixed(1) + ' Z" fill="' + fill + '" stroke="var(--border)" stroke-width="0.8"/>';
    if ((i+1) % 5 === 0 || i === 14 || i === 29){
      var lm = pt(cx,cy,a0+6,(R1+R2)/2);
      s += '<text x="' + lm[0].toFixed(1) + '" y="' + (lm[1]+3.5).toFixed(1) + '" text-anchor="middle" font-size="10" fill="var(--accent-dim)" font-family="system-ui,sans-serif">' + (i+1) + '</text>';
    }
  }
  // elongation arc
  var ea0 = pt(cx,cy,sl,R2-18), ea1 = pt(cx,cy,sl+e,R2-18);
  var large = e > 180 ? 1 : 0;
  s += '<path d="M' + ea0[0].toFixed(1) + ',' + ea0[1].toFixed(1) + ' A' + (R2-18) + ',' + (R2-18) + ' 0 ' + large + ' 0 ' + ea1[0].toFixed(1) + ',' + ea1[1].toFixed(1) + '" fill="none" stroke="var(--chip-warm)" stroke-width="2.5" stroke-dasharray="5,4"/>';
  var sp = pt(cx,cy,sl,R2-18);
  s += '<circle cx="' + sp[0].toFixed(1) + '" cy="' + sp[1].toFixed(1) + '" r="8" fill="var(--accent)" stroke="var(--chip-warm)" stroke-width="1.5"/>';
  s += '<text x="' + sp[0].toFixed(1) + '" y="' + (sp[1]-12).toFixed(1) + '" text-anchor="middle" font-size="10" fill="var(--chip-warm)" font-family="system-ui,sans-serif">☀</text>';
  var mp = pt(cx,cy,sl+e,R2-18);
  s += '<circle cx="' + mp[0].toFixed(1) + '" cy="' + mp[1].toFixed(1) + '" r="7" fill="var(--tag-hue-2)" stroke="var(--tag-hue-2)" stroke-width="1.5"/>';
  s += '<text x="' + mp[0].toFixed(1) + '" y="' + (mp[1]-11).toFixed(1) + '" text-anchor="middle" font-size="10" fill="var(--tag-hue-2)" font-family="system-ui,sans-serif">☾</text>';
  s += '<text x="160" y="150" text-anchor="middle" font-size="12" fill="var(--text)" font-family="system-ui,sans-serif">elongation ' + e.toFixed(1) + '°</text>';
  s += '<text x="160" y="168" text-anchor="middle" font-size="13" font-weight="700" fill="var(--tag-hue-4)" font-family="system-ui,sans-serif">tithi ' + ti + (ti === 15 ? ', purnmashi' : (ti === 30 ? ', massia' : (ti <= 15 ? ' (sudi ' + ti + ')' : ' (vadi ' + (ti-15) + ')'))) + '</text>';
  s += '<text x="160" y="186" text-anchor="middle" font-size="10" fill="var(--accent-dim)" font-family="system-ui,sans-serif">at Amritsar sunrise, result day</text>';
  s += '</svg>';
  el.innerHTML = s;
}
// ============ anchor timeline (machine 2) ============
function drawAnchor(el, m, monthName){
  var W = 700, H = 96, t0 = m.start - 2.5*86400000, t1 = m.end + 2.5*86400000;
  function X(ms){ return 20 + (ms - t0)/(t1 - t0)*(W - 40); }
  var s = '<div class="jx-strip"><svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Lunar month anchored by its sankranti">';
  s += '<rect x="' + X(m.start).toFixed(1) + '" y="34" width="' + (X(m.end)-X(m.start)).toFixed(1) + '" height="30" fill="var(--bg-surface)" stroke="var(--border)" rx="6"/>';
  s += '<text x="' + X((m.start+m.end)/2).toFixed(1) + '" y="54" text-anchor="middle" font-size="12" font-weight="700" fill="var(--accent-dim)" font-family="system-ui,sans-serif">amanta ' + monthName + '</text>';
  s += '<circle cx="' + X(m.start).toFixed(1) + '" cy="49" r="6" fill="var(--tag-hue-2)"/><text x="' + X(m.start).toFixed(1) + '" y="80" text-anchor="middle" font-size="10" fill="var(--tag-hue-2)" font-family="system-ui,sans-serif">new moon ' + fmtDate(istISO(m.start)) + '</text>';
  s += '<circle cx="' + X(m.end).toFixed(1) + '" cy="49" r="6" fill="var(--tag-hue-2)"/><text x="' + X(m.end).toFixed(1) + '" y="80" text-anchor="middle" font-size="10" fill="var(--tag-hue-2)" font-family="system-ui,sans-serif">new moon ' + fmtDate(istISO(m.end)) + '</text>';
  s += '<line x1="' + X(m.sank).toFixed(1) + '" y1="20" x2="' + X(m.sank).toFixed(1) + '" y2="64" stroke="var(--chip-warm)" stroke-width="2.5"/>';
  s += '<text x="' + X(m.sank).toFixed(1) + '" y="14" text-anchor="middle" font-size="11" font-weight="700" fill="var(--chip-warm)" font-family="system-ui,sans-serif">' + m.sankMonth + ' sankranti</text>';
  s += '</svg></div>';
  var note = '<div class="jx-note">The new-moon month containing the <strong>' + m.sankMonth + ' sankranti</strong> is amanta <strong>' + monthName + '</strong>, the lunar month is named one step behind the solar month its sankranti begins.'
    + (m.adhikBefore ? ' The month before it contained <em>no</em> sankranti: an <strong>adhik</strong> month (the Jantri prints ਵਾ:' + MONTHS_PA[MONTHS.indexOf(monthName)] + '), skipped for all events.' : '') + '</div>';
  el.innerHTML = s + note;
}
// ============ sunrise scan (machine 2) ============
function drawScan(el, res){
  var startIso = istISO(res.m.start);
  var from = addD(res.day, -6);
  if (from < startIso) from = startIso;
  var to = addD(res.day, 1), s = '<div class="jx-scan">', d;
  for (d = from; d <= to; d = addD(d, 1)){
    var t = srTithi(d), cls = 'jx-chip';
    if (d === res.day) cls += res.kshaya ? ' ksh hit' : ' hit';
    s += '<div class="' + cls + '"><span class="d">' + fmtDate(d).replace(/ \d{4}$/, '') + '</span><span class="t">sunrise tithi ' + t + '</span></div>';
  }
  s += '</div>';
  s += '<div class="jx-note">Scanning forward from the new moon: the event takes the first day whose <em>sunrise</em> falls in the target tithi'
    + (res.kshaya ? ', here the tithi was <strong>kshaya</strong> (it began and ended between two sunrises), so the event takes the day the tithi actually ran.' : ' (udaya rule).') + '</div>';
  el.innerHTML = s;
}
// ============ wiring ============
var $ = function(id){ return document.getElementById(id); };
var sMonth = $('s-month'), sYear = $('s-year'), tEvent = $('t-event'), tYear = $('t-year');
MONTHS.forEach(function(m, i){
  var o = document.createElement('option');
  o.value = m; o.textContent = m + ' · ' + MONTHS_PA[i];
  if (m === 'Vaisakh') o.selected = true;
  sMonth.appendChild(o);
});
EVENTS.forEach(function(e){
  var o = document.createElement('option');
  o.value = e.id; o.textContent = e.name + ', ' + e.tithi;
  tEvent.appendChild(o);
});
function runSangrand(){
  var month = sMonth.value, ns = +sYear.value, gy = ns + 1468;
  var inYear = (month === 'Magh' || month === 'Phagan') ? gy + 1 : gy;
  var sk = sankranti(month, inYear);
  if (sk === null){ $('s-steps').innerHTML = 'Could not solve.'; return; }
  var day = sangrandDay(sk), ay = ayan(sk), app = sunCalc(sk).app;
  var pinned = PIN_SANG[ns] && PIN_SANG[ns][month] === day;
  drawZodiac($('s-dial'), sk, TARGET[month]);
  drawStrip($('s-strip'), sk);
  var kIdx = MONTHS.indexOf(month);
  $('s-steps').innerHTML =
    '<ol>' +
    '<li><strong>Target:</strong> ' + month + ' begins when the sun\'s <em>sidereal</em> longitude reaches <span class="jx-num">' + TARGET[month] + '°</span> (' + RASHI_PA[TARGET[month]/30] + ' rashi).</li>' +
    '<li><strong>Sidereal = tropical − ayanamsa:</strong> <span class="jx-num">' + deg(app) + ' − ' + deg(ay) + ' = ' + deg(n360(app - ay)) + '</span></li>' +
    '<li><strong>Solve the crossing:</strong> sankranti at <span class="jx-num">' + fmtIST(sk) + '</span></li>' +
    '<li><strong>Sunrise-to-sunrise rule:</strong> that instant belongs to the day shown below.</li>' +
    '</ol>' +
    '<div class="jx-result"><strong>1 ' + month + ' NS ' + ns + '</strong> (' + MONTHS_PA[kIdx] + ') = <strong>' + fmtDate(day) + '</strong> ' + badge(pinned) + '</div>';
}
function runTithi(){
  var ev = EVENTS.filter(function(e){ return e.id === tEvent.value; })[0];
  var ns = +tYear.value, gy = ns + 1468;
  var res = lunarEvent(ev.month, ev.n, gy);
  if (!res){ $('t-steps').innerHTML = 'Could not solve.'; return; }
  var pinned = PIN_EV[ev.id] && PIN_EV[ev.id][ns] === res.day;
  drawAnchor($('t-anchor'), res.m, ev.month);
  drawTithiDial($('t-dial'), sunriseMs(res.day));
  drawScan($('t-scan'), res);
  var nsd = nsDateOf(res.day);
  var wanders = nsd.month !== ev.month;
  $('t-steps').innerHTML =
    '<ol>' +
    '<li><strong>Definition:</strong> ' + ev.name + ' = <strong>' + ev.tithi + '</strong> (' + ev.pa + ').</li>' +
    '<li><strong>Find the lunar month</strong> (timeline above): amanta ' + ev.month + ' of NS ' + ns + '.</li>' +
    '<li><strong>Target tithi:</strong> ' + (ev.n === 15 ? 'purnmashi, elongation 168°–180°' : 'sudi ' + ev.n + ', elongation ' + ((ev.n-1)*12) + '°–' + (ev.n*12) + '°') + '.</li>' +
    '<li><strong>Udaya scan</strong> (below): first Amritsar sunrise inside that tithi.</li>' +
    '</ol>' +
    '<div class="jx-result"><strong>' + fmtDate(res.day) + '</strong> = ' + nsd.day + ' ' + nsd.month + ' NS ' + nsd.nsYear + ' ' + badge(pinned) +
    (wanders ? '<br><span class="jx-note">A ' + ev.month + ' tithi landing in solar <strong>' + nsd.month + '</strong>, the date moves in every calendar except the lunar one.</span>' : '') +
    '</div>';
}
sMonth.addEventListener('change', runSangrand);
sYear.addEventListener('change', runSangrand);
tEvent.addEventListener('change', runTithi);
tYear.addEventListener('change', runTithi);
// today widget
try {
  var today = istISO(Date.now());
  var nd = nsDateOf(today), tt = srTithi(today);
  $('jx-today').innerHTML = '☀ Today, <strong>' + fmtDate(today) + '</strong>, is <strong>' + nd.day + ' ' + nd.month + ' NS ' + nd.nsYear + '</strong> (' + nd.monthPa + '), computed live by this page. Sunrise tithi at Amritsar: <strong>' + tt + (tt === 15 ? ' (purnmashi)' : tt === 30 ? ' (massia)' : '') + '</strong>.';
} catch (e) { $('jx-today').style.display = 'none'; }
runSangrand();
runTithi();
})();
</script>
