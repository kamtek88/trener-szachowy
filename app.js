/* Trener szachowy – aplikacja (mobile-first). Wymaga chess.js 0.10.3 i data.js. */
(function(){
"use strict";
const D = window.DATA;
const $ = (s, el=document) => el.querySelector(s);
const app = $("#app");
const HAS_CHESS = typeof window.Chess === "function";

/* ---------------- storage ---------------- */
const KEY = "kamtek-trener-v1";
let S = { settings:{ nota:"fig", coords:true, engine:true }, ex:{}, mis:{}, flags:{}, nota:{}, plan:{}, imported:{ ids:[], games:[], snaps:[], exercises:[] }, ai:{} };
try { const raw = localStorage.getItem(KEY); if (raw) { const p = JSON.parse(raw); S = Object.assign(S, p); S.settings = Object.assign({ nota:"fig", coords:true, engine:true }, p.settings||{}); S.imported = Object.assign({ ids:[], games:[], snaps:[], exercises:[] }, p.imported||{}); S.mis = p.mis || {}; S.flags = p.flags || {}; } } catch(e) {}
function save(){ try { localStorage.setItem(KEY, JSON.stringify(S)); } catch(e) {} }

/* ---------------- helpers ---------------- */
const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const FIG = { K:"♚", Q:"♛", R:"♜", B:"♝", N:"♞" };
const PLL = { K:"K", Q:"H", R:"W", B:"G", N:"S" };
function fmtSan(san){
  const m = S.settings.nota;
  if (m === "en") return esc(san);
  if (m === "pl") return esc(san.replace(/^[KQRBN]/, c => PLL[c]).replace(/=([QRBN])/, (a,c) => "="+PLL[c]));
  let out = esc(san).replace(/^([KQRBN])/, (a,c) => '<span class="fig">'+FIG[c]+'︎</span>');
  out = out.replace(/=([QRBN])/, (a,c) => '=<span class="fig">'+FIG[c]+'︎</span>');
  return out;
}
function rich(str){
  let s = esc(str);
  s = s.replace(/\[\[([^\]]+)\]\]/g, (a,san) => '<span class="mv">'+fmtSan(san.replace(/&amp;/g,"&"))+'</span>');
  s = s.replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>");
  return s;
}
const NOM = { p:"pion", n:"skoczek", b:"goniec", r:"wieża", q:"hetman", k:"król" };
const ACC = { p:"piona", n:"skoczka", b:"gońca", r:"wieżę", q:"hetmana", k:"króla" };
function words(m){
  if (!m) return "";
  let t;
  if (m.flags.includes("k")) t = "Roszada krótka (król idzie na " + (m.color==="w"?"g1":"g8") + ", wieża na " + (m.color==="w"?"f1":"f8") + ")";
  else if (m.flags.includes("q")) t = "Roszada długa (król idzie na " + (m.color==="w"?"c1":"c8") + ", wieża na " + (m.color==="w"?"d1":"d8") + ")";
  else if (m.flags.includes("e")) t = "Pion z " + m.from + " bije piona w przelocie i staje na " + m.to;
  else {
    t = NOM[m.piece].charAt(0).toUpperCase() + NOM[m.piece].slice(1) + " z " + m.from + (m.captured ? " bije " + ACC[m.captured] + " na " + m.to : " idzie na " + m.to);
    if (m.promotion) t += " i zamienia się w " + ({q:"hetmana",r:"wieżę",b:"gońca",n:"skoczka"}[m.promotion]);
  }
  if (m.san.includes("#")) t += ". Mat!"; else if (m.san.includes("+")) t += ", z szachem";
  return t;
}
function toast(msg){ const t = document.createElement("div"); t.className = "toast"; t.textContent = msg; document.body.appendChild(t); setTimeout(()=>t.remove(), 2200); }
function evalWords(cp, me){ // cp from "me" perspective
  if (cp === null || cp === undefined || isNaN(cp)) return "brak oceny";
  const a = Math.abs(cp);
  if (a >= 9000) return cp > 0 ? "masz forsowny mat" : "przeciwnik ma forsownego mata";
  const who = cp > 0 ? "Ty" : "przeciwnik";
  if (a < 50) return "pozycja równa";
  if (a < 130) return "lekka przewaga – " + who;
  if (a < 300) return "wyraźna przewaga – " + who;
  if (a < 700) return "duża przewaga – " + who + " (ok. " + Math.round(a/100) + " piony)";
  return "decydująca przewaga – " + who;
}
const PH = { open:"Otwarcie", mid:"Gra środkowa", end:"Końcówka" };
const PHTAB = { open:"otwarcie", mid:"srodek", end:"koncowka" };
const PHBACK = { open:"otwarcie-plan", mid:"srodek", end:"koncowka" };
const RES = { W:"wygrana", L:"przegrana", D:"remis" };
function fmtDate(d){ const [y,m,dd] = d.split("-"); return dd + "." + m + "." + y; }
function allExercises(){ return D.exercises.concat(S.imported.exercises || []); }
function exById(id){ return allExercises().find(e => e.id === id); }
function isMis(id){ return !!(S.mis && S.mis[id]); }
function activeExercises(){ return allExercises().filter(e => !isMis(e.id)); }
function exStatus(id){ const r = S.ex[id]; if (!r) return "new"; if (r.first === true) return "ok"; if (r.solved) return "fix"; return "fail"; }

/* ---------------- engine (Stockfish 10, asm.js, w Web Workerze) ---------------- */
const Engine = {
  w:null, state:"idle", q:[], cur:null, waiters:[], tier:null, name:"",
  // Najpierw Stockfish 16 (WASM). Gdy strona go nie wpuści (np. w ramce claude.ai), automatycznie Stockfish 10 (asm.js).
  start(){
    if (!S.settings.engine) return;
    if (this.w || this.state === "failed") return;
    this.state = "loading";
    const tier = this.tier || 16; this._try(tier);
  },
  _try(tier){
    const SF16 = "https://cdn.jsdelivr.net/npm/stockfish@16.0.0/src/";
    let url;
    try {
      if (tier === 16) url = URL.createObjectURL(new Blob(['importScripts("' + SF16 + 'stockfish-nnue-16-single.js");'], { type:"text/javascript" })) + "#" + encodeURIComponent(SF16 + "stockfish-nnue-16-single.wasm");
      else url = URL.createObjectURL(new Blob(['importScripts("https://cdn.jsdelivr.net/npm/stockfish.js@10.0.2/stockfish.js");'], { type:"text/javascript" }));
      const w = this.w = new Worker(url); this.pending = tier;
      w.onmessage = e => { if (w === this.w) this._msg(String(e.data)); };
      w.onerror = () => { if (w === this.w) this._loadFail(tier); };
      w.postMessage("uci");
      setTimeout(() => { if (w === this.w && this.state === "loading") this._loadFail(tier); }, tier === 16 ? 12000 : 25000);
    } catch(e) { this._loadFail(tier); }
  },
  _loadFail(tier){
    if (this.state === "ready") { this._fail(); return; }
    try { this.w && this.w.terminate(); } catch(e){} this.w = null;
    if (tier === 16) { this._try(10); return; }
    this._fail();
  },
  _fail(){ this.state = "failed"; try { this.w && this.w.terminate(); } catch(e){} this.w = null; this.waiters.forEach(f => f(false)); this.waiters = []; this.q.forEach(j => j.resolve(null)); this.q = []; updEngineBadge(); },
  ready(){ return new Promise(res => { if (this.state === "ready") return res(true); if (this.state === "failed" || !S.settings.engine) return res(false); this.waiters.push(res); this.start(); }); },
  _msg(s){
    if (s === "uciok") { this.state = "ready"; this.tier = this.pending; this.name = this.tier === 16 ? "Stockfish 16" : "Stockfish 10"; this.w.postMessage("setoption name Hash value 16"); this.waiters.forEach(f => f(true)); this.waiters = []; updEngineBadge(); this._next(); return; }
    const c = this.cur; if (!c) return;
    if (s.startsWith("info") && s.includes(" score ") && !s.includes("bound")) {
      const m = s.match(/score (cp|mate) (-?\d+)/);
      if (m) { const v = +m[2]; c.cp = m[1] === "cp" ? v : (v > 0 ? 10000 - v*10 : -10000 - v*10); }
      const pv = s.split(" pv ")[1]; if (pv) c.pv = pv.trim().split(" ");
    }
    if (s.startsWith("bestmove")) { clearTimeout(c.to); this.cur = null; c.resolve({ cp: c.cp, pv: c.pv || [s.split(" ")[1]], best: s.split(" ")[1] }); this._next(); }
  },
  eval(fen, ms){
    return new Promise(resolve => {
      if (HAS_CHESS) { const g = new Chess(fen); if (g.in_checkmate()) return resolve({ cp:-10000, pv:[], best:null }); if (g.in_draw() || g.in_stalemate()) return resolve({ cp:0, pv:[], best:null }); }
      this.q.push({ fen, ms: ms || 1000, resolve, cp:null });
      this.start(); this._next();
    });
  },
  _next(){
    if (this.cur || !this.q.length || this.state !== "ready") return;
    const c = this.cur = this.q.shift();
    c.to = setTimeout(() => { if (this.cur === c) { this.cur = null; try { this.w.terminate(); } catch(e){} this.w = null; this.state = "idle"; c.resolve(null); this.start(); } }, c.ms + 8000);
    this.w.postMessage("position fen " + c.fen); this.w.postMessage("go movetime " + c.ms);
  },
  stop(){ this.q.forEach(j => j.resolve(null)); this.q = []; }
};
function updEngineBadge(){ const b = $("#engState"); if (!b) return; b.innerHTML = engLabel(); }
function engLabel(){ if (!S.settings.engine) return "wyłączony"; return ({ idle:"nieuruchomiony", loading:'<span class="spin"></span> ładuję…', ready: (Engine.name || "gotowy") + " ✓", failed:"niedostępny" })[Engine.state]; }
function uciToSanLine(fen, uciList, n){ const g = new Chess(fen); const out = []; for (const u of (uciList||[]).slice(0, n)) { const m = g.move({ from:u.slice(0,2), to:u.slice(2,4), promotion:u[4] || "q" }); if (!m) break; out.push(m.san); } return out; }

/* ---------------- board ---------------- */
const GL = { k:["♚","♔"], q:["♛","♕"], r:["♜","♖"], b:["♝","♗"], n:["♞","♘"], p:["♟","♙"] };
class Board {
  constructor(host, opt={}){
    this.host = host; this.opt = opt; this.orient = opt.orient || "w";
    this.wrap = document.createElement("div"); this.wrap.className = "boardwrap";
    this.grid = document.createElement("div"); this.grid.className = "board"; this.wrap.appendChild(this.grid);
    this.svg = document.createElementNS("http://www.w3.org/2000/svg","svg"); this.svg.setAttribute("class","arrows"); this.svg.setAttribute("viewBox","0 0 8 8"); this.wrap.appendChild(this.svg);
    host.appendChild(this.wrap);
    this.sel = null; this.interactive = false; this.last = null; this.arrows = []; this.flashSq = null; this.uid = "ah" + Math.random().toString(36).slice(2,8);
    this.grid.addEventListener("click", e => { const sq = e.target.closest(".sq"); if (sq) this.tap(sq.dataset.sq); });
    this.ro = () => this.size(); window.addEventListener("resize", this.ro);
  }
  size(){ const w = this.wrap.clientWidth || 320; this.wrap.style.setProperty("--sqs", (w/8) + "px"); }
  set(fen, o={}){ this.game = new Chess(); if (!this.game.load(fen)) this.game.clear(); if (o.orient) this.orient = o.orient; this.last = o.last || null; this.arrows = o.arrows || []; this.marks = o.marks || []; this.interactive = !!o.interactive; this.onMove = o.onMove || null; this.sel = null; this.render(); }
  sqName(i){ const f = i % 8, r = Math.floor(i / 8); return this.orient === "w" ? "abcdefgh"[f] + (8 - r) : "abcdefgh"[7 - f] + (r + 1); }
  render(){
    const g = this.game; let html = "";
    const targets = this.sel ? g.moves({ square:this.sel, verbose:true }) : [];
    const tset = {}; targets.forEach(m => tset[m.to] = m.captured ? "cap" : "mv");
    let chk = null; if (g.in_check()) { const t = g.turn(); for (let r=1;r<=8;r++) for (let f=0;f<8;f++){ const s = "abcdefgh"[f]+r; const p = g.get(s); if (p && p.type==="k" && p.color===t) chk = s; } }
    const showCo = this.opt.coords !== undefined ? this.opt.coords : S.settings.coords;
    for (let i=0;i<64;i++){
      const sq = this.sqName(i); const f = "abcdefgh".indexOf(sq[0]), r = +sq[1];
      const light = (f + r) % 2 === 1;
      let cls = "sq " + (light ? "l" : "d");
      if (this.last && (sq === this.last.f || sq === this.last.t)) cls += " hl";
      if (sq === this.sel) cls += " sel";
      if (tset[sq]) cls += " target" + (tset[sq] === "cap" ? " cap" : "");
      if (sq === chk) cls += " chk";
      if (sq === this.flashSq) cls += " flash";
      let inner = "";
      if (showCo) {
        const col = i % 8, row = Math.floor(i / 8);
        if (row === 7) inner += '<span class="co f">' + sq[0] + "</span>";
        if (col === 0) inner += '<span class="co r">' + sq[1] + "</span>";
      }
      const p = g.get(sq);
      if (p) inner += '<div class="pc ' + p.color + '"><span class="f">' + GL[p.type][0] + '︎</span><span class="o">' + GL[p.type][1] + '︎</span></div>';
      html += '<div class="' + cls + '" data-sq="' + sq + '">' + inner + "</div>";
    }
    this.grid.innerHTML = html;
    this.drawArrows(); this.size();
  }
  xy(sq){ const f = "abcdefgh".indexOf(sq[0]), r = +sq[1]; return this.orient === "w" ? [f + .5, 8 - r + .5] : [7 - f + .5, r - 1 + .5]; }
  drawArrows(){
    let s = "";
    (this.marks || []).forEach(mk => { const [x,y] = this.xy(mk.sq); const c = mk.c || "rgba(34,139,84,.9)"; s += '<circle cx="'+x+'" cy="'+y+'" r=".42" fill="'+c.replace(/[\d.]+\)$/, ".18)")+'" stroke="'+c+'" stroke-width=".07"/>'; });
    this.arrows.forEach((a, k) => {
      const pts = (a.p || [a.f, a.t]).map(q => this.xy(q)); if (pts.length < 2) return;
      const col = a.c || "rgba(255,170,0,.85)"; const id = this.uid + "_" + k;
      const [x0,y0] = pts[0], [x1,y1] = pts[1]; const L0 = Math.hypot(x1-x0, y1-y0) || 1; pts[0] = [x0 + (x1-x0)/L0*.15, y0 + (y1-y0)/L0*.15];
      const n = pts.length - 1; const [xa,ya] = pts[n-1], [xb,yb] = pts[n]; const L1 = Math.hypot(xb-xa, yb-ya) || 1; pts[n] = [xb - (xb-xa)/L1*.32, yb - (yb-ya)/L1*.32];
      s += '<defs><marker id="'+id+'" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="3" markerHeight="3" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="'+col+'"/></marker></defs>';
      s += '<polyline points="'+pts.map(q => q[0].toFixed(3)+","+q[1].toFixed(3)).join(" ")+'" fill="none" stroke="'+col+'" stroke-width=".16" stroke-linecap="round" stroke-linejoin="round"'+(a.dash ? ' stroke-dasharray=".28 .2"' : "")+' marker-end="url(#'+id+')"/>';
    });
    this.svg.innerHTML = s;
  }
  tap(sq){
    if (this.opt.onSquare) { this.opt.onSquare(sq); return; }
    if (!this.interactive) return;
    const g = this.game; const p = g.get(sq);
    if (this.sel) {
      const mv = g.moves({ square:this.sel, verbose:true }).filter(m => m.to === sq);
      if (mv.length) { const m = mv.find(x => !x.promotion || x.promotion === "q") || mv[0]; const from = this.sel; this.sel = null; const done = g.move({ from, to:sq, promotion: m.promotion ? "q" : undefined }); this.last = { f:from, t:sq }; this.render(); if (this.onMove) this.onMove(done, g); return; }
      if (p && p.color === g.turn()) { this.sel = sq; this.render(); return; }
      this.sel = null; this.render(); return;
    }
    if (p && p.color === g.turn()) { this.sel = sq; this.render(); }
  }
  flash(sq, ms=700){ this.flashSq = sq; this.render(); setTimeout(() => { this.flashSq = null; this.render(); }, ms); }
}

/* ---------------- line player ---------------- */
function linePlayer(host, startFen, moves, o={}){
  const box = document.createElement("div"); box.className = "lp"; host.appendChild(box);
  const bHost = document.createElement("div"); box.appendChild(bHost);
  const board = new Board(bHost, { orient:o.orient || "w" });
  const ctrl = document.createElement("div"); ctrl.className = "ctrl";
  ctrl.innerHTML = '<button data-a="first" aria-label="Początek">⏮</button><button data-a="prev" aria-label="Wstecz">◀</button><button data-a="next" aria-label="Dalej">▶</button><button data-a="last" aria-label="Koniec">⏭</button>';
  box.appendChild(ctrl);
  const desc = document.createElement("div"); desc.className = "desc"; box.appendChild(desc);
  const chips = document.createElement("div"); chips.className = "chips"; box.appendChild(chips);
  const tip = document.createElement("p"); tip.className = "small muted"; tip.style.margin = "2px 2px 0";
  tip.innerHTML = "🔍 <b>Co jeśli…?</b> Możesz zagrać na tej planszy dowolny ruch za każdą ze stron. Silnik pokaże ocenę i najlepszą odpowiedź."; box.appendChild(tip);
  const g = new Chess(startFen); const objs = []; const fens = [startFen];
  for (const s of moves) { const m = g.move(s, { sloppy:true }); if (!m) { console.warn("Nielegalny ruch w linii:", s, startFen); break; } objs.push(m); fens.push(g.fen()); }
  const startTurn = startFen.split(" ")[1]; const startNo = +startFen.split(" ")[5] || 1;
  let idx = o.startIdx === undefined ? -1 : o.startIdx;
  let sb = null; let token = 0; const me = o.orient || "w";
  function label(i){ const ply = i + (startTurn === "b" ? 1 : 0); const no = startNo + Math.floor(ply/2); return ply % 2 === 0 ? no + "." : (i === 0 ? no + "…" : ""); }
  chips.innerHTML = objs.map((m,i) => '<button class="chip" data-i="'+i+'"><span class="n">'+label(i)+'</span>'+fmtSan(m.san)+"</button>").join("");
  function show(){
    sb = null; token++;
    const m = objs[idx];
    board.set(fens[idx+1], { last: m ? { f:m.from, t:m.to } : (o.last || null), arrows: (idx === -1 && o.firstArrow && objs[0]) ? [{ f:objs[0].from, t:objs[0].to, c:o.arrowColor }] : [], interactive:true, onMove: userMove });
    chips.querySelectorAll(".chip").forEach((c,i) => c.classList.toggle("on", i === idx));
    if (idx === -1) desc.innerHTML = o.startText ? rich(o.startText) : '<span class="muted">Pozycja wyjściowa. Naciśnij ▶, żeby zobaczyć kolejne ruchy.</span>';
    else {
      const who = m.color === "w" ? "Białe" : "Czarne"; const note = o.notes && o.notes[idx];
      desc.innerHTML = '<div><span class="mv">' + fmtSan(m.san) + '</span> <span class="w">' + who + ":</span> " + esc(words(m)) + "</div>" + (note ? '<div class="note">' + rich(note) + "</div>" : "");
    }
  }
  function userMove(m, gg){
    if (!sb && objs[idx+1] && m.san === objs[idx+1].san) { idx++; show(); return; }
    if (!sb) sb = { base: idx, moves: [] };
    sb.moves.push(m); board.interactive = true; board.onMove = userMove; renderSb();
  }
  async function renderSb(){
    const t = ++token; const fen = board.game.fen();
    const list = sb.moves.map(x => '<span class="mv">' + fmtSan(x.san) + "</span>").join(" ");
    const last = sb.moves[sb.moves.length-1];
    let html = '<div class="kicker" style="margin:0">Twój wariant (Co jeśli…?)</div><div>' + list + '</div><div class="small">' + esc(words(last)) + "</div>";
    const btns = '<div class="row" style="margin-top:8px"><button class="btn sec sbBack" style="min-height:42px;font-size:14px">Wróć do wariantu</button></div>';
    const gg = new Chess(fen);
    if (gg.in_checkmate()) { desc.innerHTML = html + "<div><b>Mat!</b></div>" + btns; bindSb(); return; }
    if (gg.in_draw() || gg.in_stalemate()) { desc.innerHTML = html + "<div><b>Remis (pat lub brak materiału).</b></div>" + btns; bindSb(); return; }
    if (!S.settings.engine) { desc.innerHTML = html + '<div class="small muted">Silnik jest wyłączony w ustawieniach.</div>' + btns; bindSb(); return; }
    desc.innerHTML = html + '<div class="small"><span class="spin"></span> Silnik liczy…</div>' + btns; bindSb();
    const ok = await Engine.ready(); if (t !== token) return;
    if (!ok) { desc.innerHTML = html + '<div class="small muted">Silnik jest niedostępny.</div>' + btns; bindSb(); return; }
    const r = await Engine.eval(fen, 2500); if (t !== token) return;
    if (!r) { desc.innerHTML = html + '<div class="small muted">Nie udało się policzyć.</div>' + btns; bindSb(); return; }
    const cpMe = (gg.turn() === me ? 1 : -1) * r.cp;
    const rep = r.best ? new Chess(fen).move({ from:r.best.slice(0,2), to:r.best.slice(2,4), promotion:r.best[4] || "q" }) : null;
    const line = uciToSanLine(fen, r.pv, 5);
    html += '<div style="margin-top:6px"><b>Ocena (' + esc(Engine.name || "silnik") + ', 2,5 s):</b> ' + esc(evalWords(cpMe)) + "</div>";
    if (rep) html += '<div>Najlepsza odpowiedź ' + (rep.color === "w" ? "białych" : "czarnych") + ': <span class="mv">' + fmtSan(rep.san) + "</span> " + esc(words(rep).toLowerCase()) + "</div>" + (line.length > 1 ? '<div class="small muted">Dalej silnik widzi: ' + line.map(x => fmtSan(x)).join(" ") + "</div>" : "");
    desc.innerHTML = html + '<div class="row" style="margin-top:8px">' + (rep ? '<button class="btn sbPlay" style="min-height:42px;font-size:14px">Zagraj tę odpowiedź</button>' : "") + '<button class="btn sec sbBack" style="min-height:42px;font-size:14px">Wróć do wariantu</button></div>';
    board.arrows = rep ? [{ f:rep.from, t:rep.to, c:"rgba(40,110,200,.85)" }] : []; board.render();
    bindSb(rep);
  }
  function bindSb(rep){
    desc.querySelectorAll(".sbBack").forEach(b => b.addEventListener("click", show));
    const p = desc.querySelector(".sbPlay"); if (p && rep) p.addEventListener("click", () => { const mm = board.game.move(rep.san); board.last = { f:mm.from, t:mm.to }; board.arrows = []; sb.moves.push(mm); board.render(); renderSb(); });
  }
  ctrl.addEventListener("click", e => { const a = e.target.closest("button"); if (!a) return; const act = a.dataset.a;
    if (sb && act === "prev") { board.game.undo(); sb.moves.pop(); board.arrows = []; board.last = null; if (!sb.moves.length) { show(); return; } board.render(); renderSb(); return; }
    if (act==="first") idx=-1; if (act==="prev") idx=Math.max(-1, idx-1); if (act==="next" && !sb) idx=Math.min(objs.length-1, idx+1); if (act==="last") idx=objs.length-1; show(); });
  chips.addEventListener("click", e => { const c = e.target.closest(".chip"); if (!c) return; idx = +c.dataset.i; show(); });
  show();
  return { board, objs };
}

/* ---------------- router ---------------- */
let NAVSTACK = [];
function go(hash){ if (location.hash !== "#" + hash) location.hash = hash; else route(); }
window.addEventListener("hashchange", route);
function setTab(t){ document.querySelectorAll("#tabs button").forEach(b => b.classList.toggle("on", b.dataset.t === t)); }
$("#tabs").addEventListener("click", e => { const b = e.target.closest("button"); if (b) go(b.dataset.t); });
$("#btnNot").addEventListener("click", () => go("notacja"));
$("#btnSet").addEventListener("click", openSettings);
function route(){
  Engine.stop();
  const h = (location.hash || "#start").slice(1);
  window.scrollTo(0,0);
  if (!HAS_CHESS) { app.innerHTML = '<div class="card"><h2>Brak biblioteki szachowej</h2><p>Nie udało się wczytać chess.js z internetu. Sprawdź połączenie i odśwież stronę.</p></div>'; return; }
  if (h.startsWith("ex-")) return viewExercise(h.slice(3));
  if (h.startsWith("lesson-")) return viewLesson(h.slice(7));
  if (h.startsWith("rep-")) return viewRep(h.slice(4));
  if (h.startsWith("opv-")) { const [oid, vid] = h.slice(4).split("--"); return viewOpVariant(oid, vid); }
  if (h.startsWith("op-")) return viewOpening(h.slice(3));
  if (h === "otwarcie-plan") return viewPhase("open", "plan");
  if (h === "otwarcie-rep") return viewPhase("open", "rep");
  ({ start:viewStart, otwarcie:()=>viewPhase("open", "moje"), srodek:()=>viewPhase("mid"), koncowka:()=>viewPhase("end"), postepy:viewProgress, notacja:viewNotation }[h] || viewStart)();
}

/* ---------------- views: start ---------------- */
function nextExercises(n){
  const all = activeExercises();
  const score = e => ({ new:0, fail:1, fix:2, ok:3 })[exStatus(e.id)];
  return all.slice().sort((a,b) => score(a) - score(b) || (S.ex[a.id]?.ts||0) - (S.ex[b.id]?.ts||0)).slice(0,n);
}
function viewStart(){
  setTab("start"); $("#ttl").textContent = "Trener szachowy";
  const B = D.baseline; const all = activeExercises();
  const done = all.filter(e => ["ok","fix"].includes(exStatus(e.id))).length;
  const nl = D.notation.filter(l => S.nota[l.id]).length;
  const nextL = D.notation.find(l => !S.nota[l.id]);
  const today = nextExercises(3);
  app.innerHTML = `
  <div class="card hero">
    <div class="kicker" style="color:#f0c27a">Cześć, Kamil</div>
    <h2>Twój plan treningowy na podstawie ${B.games} partii z chess.com</h2>
    <p class="muted" style="margin:0">Analiza z ${fmtDate(D.analysisDate)}. Partie rapid 10 min, ${B.analysed} ostatnich sprawdzonych Stockfishem.</p>
    <div class="kpis">
      <div class="kpi"><b>${B.ratingNow}</b><span>rating rapid (max ${B.ratingMax})</span></div>
      <div class="kpi"><b>${B.winPct}%</b><span>wygranych (${B.w}–${B.d}–${B.l})</span></div>
      <div class="kpi"><b>${String(B.blundersPerGame).replace(".",",")}</b><span>poważnych błędów na partię</span></div>
      <div class="kpi"><b>4:44</b><span>średnio zużyty czas z 10:00</span></div>
    </div>
  </div>
  <div id="newGames"></div>
  <div class="card">
    <div class="kicker">Trening na dziś</div>
    <h2>3 pozycje z Twoich partii</h2>
    <div class="list" id="today"></div>
    ${nextL ? `<div style="height:10px"></div><button class="item" data-go="lesson-${nextL.id}"><span class="badge">Aa</span><span class="t"><b>Notacja: ${esc(nextL.title)}</b><span>Lekcja ${D.notation.indexOf(nextL)+1} z ${D.notation.length}</span></span><span class="chev">›</span></button>` : ""}
  </div>
  <div class="card">
    <div class="kicker">Od trenera</div>
    <h2>Najważniejsze wnioski</h2>
    <ul class="clean">
      <li><b>Przegrywasz głównie w grze środkowej.</b> W 23 z 45 przegranych partii decydujący błąd padł właśnie tam. Najczęściej to figura bez obrony, przeoczone widły, związanie albo groźba mata.</li>
      <li><b>Grasz za szybko.</b> Z 10 minut zużywasz średnio mniej niż 5, a przegrane partie kończysz z ponad 5 minutami na zegarze. Masz czas na 10-sekundową kontrolę przed ruchem.</li>
      <li><b>Wczesny hetman.</b> W Gambicie Przyjętym (4–0–10) i w innych otwarciach często wychodzisz hetmanem przed roszadą.</li>
      <li><b>Czarne:</b> w Sycylijskiej otwartej masz 21–0–12, ale w bocznych wariantach 13–3–27, a przeciw 1.d4 brakuje Ci stałego systemu.</li>
    </ul>
    <div class="row" style="margin-top:12px"><button class="btn sec" data-go="srodek">Plan: gra środkowa</button><button class="btn sec" data-go="otwarcie">Moje otwarcia</button></div>
  </div>
  <div class="card">
    <div class="kicker">Postęp</div>
    <div style="display:flex;justify-content:space-between"><span>Ćwiczenia rozwiązane</span><b>${done}/${all.length}</b></div>
    <div class="prog" style="margin:6px 0 12px"><i style="width:${all.length?done/all.length*100:0}%"></i></div>
    <div style="display:flex;justify-content:space-between"><span>Lekcje notacji</span><b>${nl}/${D.notation.length}</b></div>
    <div class="prog" style="margin:6px 0 12px"><i style="width:${nl/D.notation.length*100}%"></i></div>
    <button class="btn" data-go="postepy">Odśwież moje gry i przeanalizuj postępy</button>
  </div>`;
  const t = $("#today"); today.forEach(e => t.appendChild(exItem(e)));
  bindGo(app);
  newGamesBanner();
}
function bindGo(root){ root.querySelectorAll("[data-go]").forEach(b => b.addEventListener("click", () => go(b.dataset.go))); }
function exItem(e){
  const mis = isMis(e.id); const st = mis ? "mis" : exStatus(e.id); const b = document.createElement("button"); b.className = "item" + (mis ? " misitem" : "");
  const icon = { new:(e.c==="w"?"♔":"♚"), ok:"✓", fix:"↻", fail:"✗", mis:"⊘" }[st];
  const solvedOnce = st === "ok" || st === "fix";
  b.innerHTML = `<span class="badge ${st==="new"?"":st}" style="${st==="new"?"font-family:'Noto Sans Symbols 2';font-size:22px":""}">${icon}</span><span class="t"><b>${solvedOnce ? esc(e.theme) : PH[e.ph] + " · ruch " + e.mv}</b><span>${e.c==="w"?"Białe":"Czarne"} vs ${esc(e.opp)} (${e.oe}) · ${fmtDate(e.date)}${e.auto?' · <span class="pill new">nowe</span>':""}${mis?' · <span class="pill">misclick</span>':""}${S.flags && S.flags[e.id]?' · <span class="pill fix">⚑ zgłoszone</span>':""}</span></span><span class="chev">›</span>`;
  b.addEventListener("click", () => go("ex-" + e.id));
  return b;
}

/* ---------------- views: phase ---------------- */
function segBar(active){
  const items = [["moje","Moje otwarcia","otwarcie"],["plan","Plan i ćwiczenia","otwarcie-plan"],["rep","Repertuar","otwarcie-rep"]];
  return '<div class="seg">' + items.map(([k,l,h]) => '<button class="' + (k === active ? "on" : "") + '" data-go="' + h + '">' + l + "</button>").join("") + "</div>";
}
function viewPhase(ph, sub){
  setTab(PHTAB[ph]); $("#ttl").textContent = ph === "open" ? "Otwarcia" : PH[ph];
  if (ph === "open" && sub === "moje") return viewMyOpenings();
  if (ph === "open" && sub === "rep") { app.innerHTML = segBar("rep") + repCard(); bindGo(app); return; }
  const P = D.plan[ph]; const exs0 = allExercises().filter(e => e.ph === ph); const exs = exs0.filter(e => !isMis(e.id)).concat(exs0.filter(e => isMis(e.id)));
  const doneSteps = S.plan[ph] || {};
  app.innerHTML = (ph === "open" ? segBar("plan") : "") + `
  <div class="card">
    <div class="kicker">Diagnoza z Twoich partii</div>
    <h2>${PH[ph]}: co się dzieje</h2>
    <ul class="clean">${P.diag.map(d => "<li>" + rich(d) + "</li>").join("")}</ul>
  </div>
  <div class="card">
    <div class="kicker">Plan poprawy</div>
    <h2>Co robimy</h2>
    <ol class="steps">${P.steps.map((s,i) => `<li><b>${esc(s.t)}</b><span class="small">${rich(s.d)}</span><div style="margin-top:6px"><label style="display:inline-flex;gap:8px;align-items:center;font-size:14px;cursor:pointer;min-height:36px"><input type="checkbox" data-st="${i}" ${doneSteps[i]?"checked":""} style="width:20px;height:20px"> wdrażam to</label></div></li>`).join("")}</ol>
  </div>
  <div class="card">
    <div class="kicker">Ćwiczenia z Twoich partii</div>
    <h2>Zagraj jeszcze raz</h2>
    <p class="muted small" style="margin-top:0">Jeśli któraś pozycja była tylko przypadkowym kliknięciem, otwórz ją i oznacz jako misclick, a wypadnie z treningu. Pokazuję pozycję tuż przed Twoim błędem. Zagraj najlepszy ruch, a potem przeczytaj, dlaczego Twój ruch z partii był słaby.</p>
    <div class="list" id="exl"></div>
  </div>
  ${P.rules ? `<div class="card"><div class="kicker">Zasady</div><h2>Złote zasady końcówek</h2><ul class="clean">${P.rules.map(r=>"<li>"+rich(r)+"</li>").join("")}</ul></div>` : ""}`;
  const l = $("#exl"); exs.forEach(e => l.appendChild(exItem(e)));
  app.querySelectorAll("[data-st]").forEach(c => c.addEventListener("change", () => { S.plan[ph] = S.plan[ph] || {}; S.plan[ph][c.dataset.st] = c.checked; save(); }));
  bindGo(app);
}
/* ---------------- grafika: ocena, wyniki, plany, mapa ---------------- */
const PLANCOL = { me:"rgba(34,139,84,.92)", opp:"rgba(214,120,20,.92)", warn:"rgba(200,45,35,.92)" };
const PLANLBL = { me:"Twój plan", opp:"Plan przeciwnika", warn:"Uwaga" };
function scorePct(o){ const n = o.w + o.d + o.l; return n ? Math.round((o.w + o.d/2) / n * 100) : 0; }
function evalGauge(cpWhite, myColor){
  const share = 50 + 50 * (2 / (1 + Math.exp(-cpWhite / 250)) - 1);
  const mine = myColor === "w" ? cpWhite : -cpWhite;
  const num = (cpWhite >= 0 ? "+" : "−") + (Math.abs(cpWhite) / 100).toFixed(1).replace(".", ",");
  return `<div class="gauge"><div class="gauge-top"><span>Ocena silnika po 6. ruchu</span><b>${num}</b></div>
    <div class="gbar"><i style="width:${share}%"></i><span class="gmid"></span><span class="gmark" style="left:${share}%"></span></div>
    <div class="gauge-lbl"><span>białe</span><span>czarne</span></div>
    <div class="gauge-txt">${esc(evalWords(mine).replace(/^./, c => c.toUpperCase()))}${Math.abs(mine) < 50 ? "" : ""} · grasz ${myColor === "w" ? "białymi" : "czarnymi"}</div></div>`;
}
function resultsViz(st, all){
  const n = st.n || (st.w + st.d + st.l); const pv = scorePct(st), pa = scorePct(all);
  const seg = (k, v, c, l) => v ? `<i style="flex:${v};background:${c}" title="${l}"></i>` : "";
  return `<div class="res">
    <div class="res-nums"><div><b style="color:var(--ok)">${st.w}</b><span>wygrane</span></div><div><b style="color:#8d8676">${st.d}</b><span>remisy</span></div><div><b style="color:var(--bad)">${st.l}</b><span>porażki</span></div></div>
    <div class="res-bar">${seg("w", st.w, "var(--ok)", "wygrane")}${seg("d", st.d, "#b9b3a2", "remisy")}${seg("l", st.l, "var(--bad)", "porażki")}</div>
    <div class="cmp"><div class="cmp-row"><span>Ten wariant</span><div class="cmp-bar"><i style="width:${pv}%;background:${pv >= pa ? "var(--ok)" : "var(--bad)"}"></i></div><b>${pv}%</b></div>
    <div class="cmp-row"><span>Całe otwarcie</span><div class="cmp-bar"><i style="width:${pa}%;background:#9aa59d"></i></div><b>${pa}%</b></div></div>
    <p class="small muted" style="margin:6px 0 0">Wynik % = (wygrane + ½ remisów) / ${n} partii.</p></div>`;
}
function plansViz(host, v, orient){
  const plans = v.plans || []; if (!plans.length) return;
  const wrap = document.createElement("div"); host.appendChild(wrap);
  const chips = document.createElement("div"); chips.className = "planchips"; wrap.appendChild(chips);
  const bh = document.createElement("div"); wrap.appendChild(bh);
  const board = new Board(bh, { orient });
  const cap = document.createElement("div"); cap.className = "plancap"; wrap.appendChild(cap);
  const leg = document.createElement("div"); leg.className = "legend"; leg.style.marginTop = "8px";
  leg.innerHTML = '<span><i style="background:' + PLANCOL.me + '"></i>Twój plan</span><span><i style="background:' + PLANCOL.opp + '"></i>przeciwnik</span><span><i style="background:' + PLANCOL.warn + '"></i>uwaga</span><span>━ ruch teraz</span><span>┅ plan na kolejne ruchy</span><span>◯ ważne pole</span>';
  wrap.appendChild(leg);
  chips.innerHTML = plans.map((p,i) => `<button data-i="${i}"><span class="dot" style="background:${PLANCOL[p.who]}"></span>${esc(p.t)}</button>`).join("");
  function show(i){
    const p = plans[i];
    chips.querySelectorAll("button").forEach((b,j) => b.classList.toggle("on", j === i));
    board.set(p.fen, { orient, arrows: p.a.map(a => ({ p:a.p, c:PLANCOL[a.who || p.who], dash:!a.s })), marks: p.m.map(q => ({ sq:q, c:PLANCOL[p.who] })) });
    cap.innerHTML = `<div class="plancap-h" style="color:${PLANCOL[p.who]}">${PLANLBL[p.who]}</div><b>${esc(p.t)}</b><div>${rich(p.x)}</div>`;
  }
  chips.addEventListener("click", e => { const b = e.target.closest("button"); if (b) show(+b.dataset.i); });
  show(0);
}
function variantMap(o){
  const max = Math.max(...o.variants.map(v => v.stats.n));
  const base = o.base.map((m,i) => { const ply = i; return (ply % 2 === 0 ? (ply/2+1) + "." : "") + m; }).join(" ");
  return `<div class="vmap"><div class="vroot">${esc(base)}</div><div class="vbranches">${o.variants.map((v,i) => {
    const w = Math.max(18, v.stats.n / max * 100);
    return `<button class="vbr" data-go="opv-${o.id}--${v.id}"><span class="vname">${esc(v.name.split(" – ")[0])}<small>${esc(v.name.split(" – ")[1] || "")}</small></span>
      <span class="vline"><span class="vbar" style="width:${w}%">${v.stats.w ? `<i style="flex:${v.stats.w};background:var(--ok)"></i>` : ""}${v.stats.d ? `<i style="flex:${v.stats.d};background:#b9b3a2"></i>` : ""}${v.stats.l ? `<i style="flex:${v.stats.l};background:var(--bad)"></i>` : ""}</span><span class="vnum">${v.stats.n} · ${scorePct(v.stats)}%</span></span></button>`; }).join("")}</div>
    <p class="small muted" style="margin:8px 0 0">Długość paska = liczba partii, kolory = wyniki, procent = Twój wynik w wariancie.</p></div>`;
}
/* ---------------- views: moje otwarcia ---------------- */
function wdlTxt(o){ return o.w + "–" + o.d + "–" + o.l; }
function viewMyOpenings(){
  const O = D.openings || [];
  app.innerHTML = segBar("moje") + `<div class="card"><div class="kicker">Z Twoich partii</div><h2>Otwarcia, które grasz</h2><p class="small muted" style="margin:0">Każde otwarcie ma 5 wariantów, które najczęściej pojawiały się w Twoich partiach. Każdy wariant jest pokazany do 6. posunięcia, z komentarzem do każdego ruchu: dlaczego się go gra i co daje.</p></div>` +
    O.map(o => `<button class="item" data-go="op-${o.id}" style="margin-bottom:10px"><span class="badge" style="font-family:'Noto Sans Symbols 2';font-size:22px">${o.color === "w" ? "♔" : "♚"}</span><span class="t"><b>${esc(o.name)}</b><span>${o.color === "w" ? "białymi" : "czarnymi"} · ${o.games} partii · wynik ${wdlTxt(o)}</span><div style="margin-top:6px">${wdlBar(o.w,o.d,o.l)}</div></span><span class="chev">›</span></button>`).join("") +
    `<div class="legend"><span><i style="background:var(--ok)"></i>wygrane</span><span><i style="background:#b9b3a2"></i>remisy</span><span><i style="background:var(--bad)"></i>porażki</span></div>`;
  bindGo(app);
}
function viewOpening(id){
  const o = (D.openings || []).find(x => x.id === id); if (!o) return viewMyOpenings();
  setTab("otwarcie"); $("#ttl").textContent = "Otwarcia";
  app.innerHTML = `<button class="back" data-go="otwarcie">‹ Moje otwarcia</button>
  <div class="card"><div class="kicker">${o.color === "w" ? "Grasz białymi" : "Grasz czarnymi"} · ${o.games} partii · ${wdlTxt(o)}</div><h2>${esc(o.name)}</h2>${wdlBar(o.w,o.d,o.l)}<div style="margin-top:10px">${o.intro.map(x => "<p style='margin:0 0 8px'>" + rich(x) + "</p>").join("")}</div></div>
  <div class="card"><div class="kicker">Mapa wariantów z Twoich partii</div><h2 style="font-size:18px">Dokąd prowadzi to otwarcie</h2>${variantMap(o)}</div>
  <div id="startHost"></div>`;
  bindGo(app);
  const c = document.createElement("div"); c.className = "card"; c.innerHTML = '<div class="sec-title">Pozycja po pierwszych ruchach</div>'; $("#startHost").appendChild(c);
  linePlayer(c, "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", o.base, { orient:o.color, notes:o.baseNotes, startIdx:o.base.length - 1 });
}
function viewOpVariant(oid, vid){
  const o = (D.openings || []).find(x => x.id === oid); const v = o && o.variants.find(x => x.id === vid); if (!v) return viewMyOpenings();
  setTab("otwarcie"); $("#ttl").textContent = "Otwarcia";
  const i = o.variants.indexOf(v); const nx = o.variants[i+1];
  app.innerHTML = `<button class="back" data-go="op-${o.id}">‹ ${esc(o.name)}</button>
  <div class="card"><div class="kicker">${esc(o.name)} · wariant ${i+1} z ${o.variants.length}</div><h2>${esc(v.name)}</h2>
  <p class="small muted" style="margin:0 0 6px">W Twoich partiach: ${v.stats.n} razy, wynik ${wdlTxt(v.stats)}${v.stats.note ? " · " + esc(v.stats.note) : ""}</p>${wdlBar(v.stats.w,v.stats.d,v.stats.l)}
  <div class="tagline" style="margin-top:8px"><span class="pill" style="background:#dcefe2;color:#174d2d">✓ Sprawdzone: ${esc(v.verified || "")}</span></div></div>
  <div class="card" id="lpHost"><div class="sec-title">Ruch po ruchu (naciśnij ▶)</div></div>
  <div class="card"><div class="kicker">Czego się spodziewać</div><h2>Po tym wariancie</h2>${v.ev !== undefined ? evalGauge(v.ev, o.color) : ""}</div>
  <div class="card" id="plansHost"><div class="kicker">Plany na szachownicy</div><h2 style="font-size:18px">Pozycja po 6. ruchu</h2></div>
  <div class="card"><div class="kicker">Twoje wyniki w tym wariancie</div>${resultsViz(v.stats, o)}</div>
  <details class="box"><summary>Opis słowny</summary><div style="padding-bottom:10px">${v.expect.map(x => "<p style='margin:0 0 8px'>" + rich(x) + "</p>").join("")}</div></details>
  <div class="card"><div class="kicker">Ćwiczenie</div><h2>Zagraj wariant z pamięci</h2><p class="muted small" style="margin-top:0">Grasz swoje ruchy, a aplikacja odpowiada za przeciwnika.</p><div id="drill"></div></div>
  ${nx ? `<button class="btn" data-go="opv-${o.id}--${nx.id}">Następny wariant: ${esc(nx.name)} ›</button>` : `<button class="btn sec" data-go="op-${o.id}">Wróć do listy wariantów</button>`}`;
  bindGo(app);
  linePlayer($("#lpHost"), "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", v.moves, { orient:o.color, notes:v.notes });
  plansViz($("#plansHost"), v, o.color);
  repDrill($("#drill"), { moves:v.moves, color:o.color, name:v.name });
}
function repCard(){
  return `<div class="card"><div class="kicker">Repertuar</div><h2>Twoje otwarcia</h2>
  <p class="muted small" style="margin-top:0">Zostają Gambit Hetmański i Sycylijska. Dochodzą dwa nowe otwarcia: <b>System Londyński</b> (białe) i <b>Obrona Słowiańska</b> (czarne). Każdy ruch jest pokazany na szachownicy i opisany słowami.</p>
  ${D.repertoire.map(g => `<h3>${g.group}</h3><div class="list">${g.items.map(it => `<button class="item" data-go="rep-${it.id}"><span class="badge" style="font-family:'Noto Sans Symbols 2';font-size:22px">${it.color==="w"?"♔":"♚"}</span><span class="t"><b>${esc(it.name)}</b><span><span class="pill ${it.tag==="NOWE"?"new":(it.tag==="Do poprawy"?"fix":"")}">${esc(it.tag)}</span></span></span><span class="chev">›</span></button>`).join("")}</div>`).join("")}
  </div>`;
}
function viewRep(id){
  setTab("otwarcie"); let it; D.repertoire.forEach(g => g.items.forEach(x => { if (x.id === id) it = x; }));
  if (!it) return viewPhase("open", "rep");
  $("#ttl").textContent = "Repertuar";
  app.innerHTML = `<button class="back" data-go="otwarcie-rep">‹ Repertuar</button>
  <div class="card"><div class="kicker">${it.color==="w"?"Grasz białymi":"Grasz czarnymi"} · <span class="pill ${it.tag==="NOWE"?"new":(it.tag==="Do poprawy"?"fix":"")}">${esc(it.tag)}</span></div><h2>${esc(it.name)}</h2><p style="margin:0">${rich(it.why)}</p></div>
  <div class="card" id="lpHost"><div class="sec-title">Przejdź wariant ruch po ruchu</div></div>
  <div class="card"><div class="kicker">Ćwiczenie</div><h2>Zagraj wariant z pamięci</h2><p class="muted small" style="margin-top:0">Grasz swoje ruchy, a aplikacja odpowiada za przeciwnika. Przy pomyłce pokażę właściwy ruch.</p><div id="drill"></div></div>`;
  linePlayer($("#lpHost"), "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", it.moves, { orient: it.color, notes: it.notes });
  repDrill($("#drill"), it);
  bindGo(app);
}
function repDrill(host, it){
  const info = document.createElement("div"); info.className = "desc"; host.appendChild(info);
  const bh = document.createElement("div"); bh.style.marginTop = "10px"; host.appendChild(bh);
  const board = new Board(bh, { orient: it.color });
  const again = document.createElement("button"); again.className = "btn sec"; again.style.marginTop = "10px"; again.textContent = "Od początku"; host.appendChild(again);
  let i = 0, errors = 0; const g0 = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
  function step(){
    const g = board.game;
    while (i < it.moves.length && (g.turn() !== it.color)) { const m = g.move(it.moves[i], { sloppy:true }); board.last = { f:m.from, t:m.to }; i++; }
    board.render();
    if (i >= it.moves.length) { info.innerHTML = errors ? `Koniec wariantu. Pomyłki: <b>${errors}</b>. Spróbuj jeszcze raz, aż zagrasz bez błędu.` : "<b>Bezbłędnie!</b> Znasz ten wariant."; board.interactive = false; return; }
    info.innerHTML = "Twój ruch (" + (it.color === "w" ? "białe" : "czarne") + "). Zagraj kolejne posunięcie z wariantu.";
    board.interactive = true;
  }
  function start(){ i = 0; errors = 0; board.set(g0, { orient: it.color, interactive:true, onMove }); step(); }
  function onMove(m, g){
    const want = it.moves[i];
    if (m.san.replace(/[+#]/g,"") === want.replace(/[+#]/g,"")) { i++; setTimeout(step, 250); }
    else { errors++; g.undo(); const gg = new Chess(g.fen()); const w = gg.move(want, { sloppy:true }); board.last = null; board.render(); board.arrows = [{ f:w.from, t:w.to, c:"rgba(47,125,79,.9)" }]; board.render(); info.innerHTML = 'Nie ten ruch. W wariancie gramy <span class="mv">' + fmtSan(want) + "</span>: " + esc(words(w)) + ". Zagraj go."; }
  }
  again.addEventListener("click", start); start();
}

/* ---------------- views: exercise ---------------- */
function viewExercise(id){
  const e = exById(id); if (!e) return viewStart();
  setTab(PHTAB[e.ph]); $("#ttl").textContent = PH[e.ph];
  const list = allExercises().filter(x => x.ph === e.ph); const pos = list.indexOf(e);
  const me = e.c === "w" ? "białymi" : "czarnymi";
  app.innerHTML = `<button class="back" data-go="${PHBACK[e.ph]}">‹ ${PH[e.ph]}</button>
  <div class="card">
    <div class="kicker">Ćwiczenie ${pos+1} z ${list.length} · ${PH[e.ph]}</div>
    <h2 style="font-size:19px">Partia z ${esc(e.opp)} (${e.oe}), ${fmtDate(e.date)}</h2>
    <p class="muted small" style="margin:0 0 8px">Grasz ${me} (${e.me}) · ${e.mv}. ruch · wynik partii: ${RES[e.res] || "-"}</p>
    <p style="margin:0">${rich(e.task)}</p>
    <div id="lastmv" class="small muted" style="margin-top:6px"></div>
  </div>
  <div id="bHost"></div>
  <div class="bcap"><span class="turn"><i style="background:${e.c==="w"?"#fff":"#222"}"></i>Twój ruch: ${e.c==="w"?"białe":"czarne"}</span><span>Silnik: <span id="engState">${engLabel()}</span></span></div>
  <div id="exMsg"></div>
  <div class="row" id="exBtns" style="margin:10px 0 14px"><button class="btn sec" id="hintB">Podpowiedź</button><button class="btn ghost" id="giveB">Pokaż rozwiązanie</button></div>
  <div id="hintBox"></div>
  <div id="misBox"></div>
  ${e.hist && e.hist.length ? `<details class="box" id="histBox"><summary>Jak doszło do tej pozycji (przebieg partii)</summary><div id="histHost" style="padding-bottom:12px"></div></details>` : ""}
  <div id="analysis"></div>`;
  bindGo(app);
  // ostatni ruch przeciwnika (słownie)
  if (e.hist && e.hist.length) {
    const g = new Chess(); let lm = null; for (const s of e.hist) lm = g.move(s, { sloppy:true });
    if (lm) $("#lastmv").innerHTML = 'Ostatni ruch przeciwnika: <span class="mv">' + fmtSan(lm.san) + "</span> " + esc(words(lm).toLowerCase());
    const hb = $("#histBox"); let built = false;
    hb.addEventListener("toggle", () => { if (hb.open && !built) { built = true; linePlayer($("#histHost"), "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", e.hist, { orient:e.c, startIdx: e.hist.length - 1 }); } });
  } else if (e.lastSan) $("#lastmv").innerHTML = 'Ostatni ruch przeciwnika: <span class="mv">' + fmtSan(e.lastSan) + "</span>";
  const board = new Board($("#bHost"), { orient:e.c });
  let attempt = 0;
  function drawMis(){
    const on = isMis(e.id);
    $("#misBox").innerHTML = on
      ? '<div class="verdict mid" style="margin-top:0">⊘ <b>Oznaczone jako misclick.</b> To był przypadkowy ruch, a nie błąd w myśleniu, więc ta pozycja nie trafia do treningu na dziś ani do statystyk ćwiczeń. Możesz ją nadal rozwiązać.</div><button class="btn ghost" id="misB">Cofnij: to jednak był mój ruch</button>'
      : '<button class="btn ghost" id="misB">⊘ To był misclick: nie chciałem tak zagrać</button><p class="small muted" style="margin:6px 2px 0">Oznacz, jeśli w partii ruch padł przez przypadkowe kliknięcie albo przeciągnięcie figury na złe pole.</p>';
    $("#misB").addEventListener("click", () => { if (isMis(e.id)) delete S.mis[e.id]; else S.mis[e.id] = Date.now(); save(); toast(isMis(e.id) ? "Oznaczono jako misclick" : "Przywrócono do treningu"); drawMis(); });
  }
  drawMis();
  function reset(){ board.set(e.fen, { orient:e.c, last:e.last, interactive:true, onMove }); $("#exMsg").innerHTML = ""; $("#exBtns").classList.remove("hide"); }
  reset();
  if (S.settings.engine) Engine.ready().then(updEngineBadge);
  $("#hintB").addEventListener("click", () => { $("#hintBox").innerHTML = '<div class="verdict mid">💡 ' + rich(e.hint) + "</div>"; });
  $("#giveB").addEventListener("click", () => { record(false, null); reveal(null, null); });
  function record(ok, san){
    const r = S.ex[e.id] || { tries:0 }; r.tries++; if (r.first === undefined) r.first = ok; if (ok) r.solved = true; r.ts = Date.now(); r.lastSan = san; S.ex[e.id] = r; save();
  }
  async function onMove(m){
    board.interactive = false; attempt++;
    const bestSan = e.best[0];
    const strip = s => s.replace(/[+#]/g,"");
    if (strip(m.san) === strip(bestSan)) { record(true, m.san); return reveal(m, { kind:"ok" }); }
    $("#exMsg").innerHTML = '<div class="verdict mid"><span class="spin"></span> Sprawdzam Twój ruch <span class="mv">' + fmtSan(m.san) + "</span>…</div>";
    let user = null, eb = null;
    if (S.settings.engine && await Engine.ready()) {
      const r = await Engine.eval(board.game.fen(), 2000); if (r) user = -r.cp;
      const gb = new Chess(e.fen); gb.move(bestSan, { sloppy:true }); const rb = await Engine.eval(gb.fen(), 2000); if (rb) eb = -rb.cp;
    }
    let kind = "bad";
    if (user !== null && eb !== null && (eb - user <= 70 || (user >= 600 && eb >= 600))) kind = "alt";
    if (strip(m.san) === strip(e.my)) kind = "same";
    record(kind === "alt", m.san);
    reveal(m, { kind, user });
  }
  function reveal(m, res){
    $("#exBtns").classList.add("hide"); $("#hintBox").innerHTML = "";
    let v = "";
    if (!res) v = '<div class="verdict mid">Oto rozwiązanie. Wróć do tej pozycji później i spróbuj samodzielnie.</div>';
    else if (res.kind === "ok") v = '<div class="verdict ok">✓ <b>Brawo!</b> <span class="mv">' + fmtSan(m.san) + "</span> to najlepszy ruch. Przeczytaj analizę, żeby utrwalić motyw.</div>";
    else if (res.kind === "alt") v = '<div class="verdict ok">✓ <b>Dobry ruch!</b> <span class="mv">' + fmtSan(m.san) + '</span> silnik ocenia prawie tak samo jak najlepszy (' + esc(evalWords(res.user)) + '). Najdokładniejszy był jednak <span class="mv">' + fmtSan(e.best[0]) + "</span>.</div>";
    else if (res.kind === "same") v = '<div class="verdict bad">✗ To ten sam ruch, który zagrałeś w partii: <span class="mv">' + fmtSan(m.san) + "</span>. Zobacz poniżej, co go obala.</div>";
    else v = '<div class="verdict bad">✗ <b>Nie tym razem.</b> Twój ruch <span class="mv">' + fmtSan(m.san) + "</span>: " + esc(words(m).toLowerCase()) + (res.user !== null && res.user !== undefined ? ". Ocena silnika: " + esc(evalWords(res.user)) : "") + ".</div>";
    $("#exMsg").innerHTML = v + `<div class="row"><button class="btn sec" id="againB">Spróbuj ponownie</button><button class="btn" id="nextB">Następne ›</button></div>`;
    $("#againB").addEventListener("click", () => { $("#analysis").innerHTML = ""; reset(); });
    $("#nextB").addEventListener("click", () => { const l = allExercises().filter(x => x.ph === e.ph); let i = l.indexOf(e), n = null; for (let k = 1; k <= l.length; k++) { const c = l[(i+k) % l.length]; if (!isMis(c.id) || c === e) { n = c; break; } } go("ex-" + (n || e).id); });
    if (m) { const g = new Chess(e.fen); const mm = g.move(m.san); board.set(g.fen(), { orient:e.c, last:{ f:mm.from, t:mm.to } }); }
    const A = $("#analysis"); A.innerHTML = "";
    const tag = document.createElement("div"); tag.className = "tagline"; tag.innerHTML = '<span class="pill">Motyw: ' + esc(e.theme) + "</span>" + (e.verified ? ' <span class="pill" style="background:#dcefe2;color:#174d2d">✓ Sprawdzone: ' + esc(e.verified) + "</span>" : (e.auto ? ' <span class="pill fix">Opis automatyczny (szybki silnik)</span>' : "")); A.appendChild(tag);
    // 1. ruch z partii
    const c1 = document.createElement("div"); c1.className = "card";
    const gm = new Chess(e.fen); const myObj = gm.move(e.my, { sloppy:true });
    c1.innerHTML = '<div class="sec-title"><span class="dot" style="background:var(--bad)"></span>W partii zagrałeś: <span class="mv">' + fmtSan(e.my) + "</span></div>" + '<p class="small muted" style="margin:0 0 6px">' + esc(myObj ? words(myObj) : "") + "</p>" + '<div class="kicker">Dlaczego to błąd i co tracisz</div><p style="margin-top:0">' + rich(e.whyBad) + "</p>";
    A.appendChild(c1);
    linePlayer(c1, e.fen, e.ref, { orient:e.c, last:e.last, firstArrow:true, arrowColor:"rgba(180,68,47,.85)", startText:"Pozycja przed Twoim ruchem. Naciśnij ▶, żeby zobaczyć, co się stało w partii i jak przeciwnik mógł to wykorzystać." });
    // 2. najlepszy
    const c2 = document.createElement("div"); c2.className = "card";
    const gb = new Chess(e.fen); const bObj = gb.move(e.best[0], { sloppy:true });
    c2.innerHTML = '<div class="sec-title"><span class="dot" style="background:var(--ok)"></span>Najlepszy ruch: <span class="mv">' + fmtSan(e.best[0]) + "</span></div>" + '<p class="small muted" style="margin:0 0 6px">' + esc(bObj ? words(bObj) : "") + "</p>" + '<div class="kicker">Dlaczego jest najlepszy i co zyskujesz</div><p style="margin-top:0">' + rich(e.whyGood) + "</p>";
    A.appendChild(c2);
    linePlayer(c2, e.fen, e.best, { orient:e.c, last:e.last, firstArrow:true, arrowColor:"rgba(47,125,79,.9)", startText:"Naciśnij ▶, żeby przejść najlepszy wariant." });
    (e.alt || []).forEach(a => { const d = document.createElement("details"); d.className = "box"; d.innerHTML = "<summary>" + esc(a.label) + "</summary>"; c2.appendChild(d); let b = false; d.addEventListener("toggle", () => { if (d.open && !b) { b = true; const h = document.createElement("div"); h.style.paddingBottom = "12px"; d.appendChild(h); linePlayer(h, e.fen, a.moves, { orient:e.c, last:e.last }); } }); });
    // 3. jak patrzeć
    const c3 = document.createElement("div"); c3.className = "card";
    c3.innerHTML = '<div class="kicker">Jak patrzeć na taką pozycję</div><ul class="clean">' + e.look.map(x => "<li>" + rich(x) + "</li>").join("") + "</ul>" + (e.url ? '<p class="small" style="margin-bottom:0"><a href="' + esc(e.url) + '" target="_blank" rel="noopener">Otwórz całą partię na chess.com ›</a></p>' : "");
    A.appendChild(c3);
    if (e.auto) aiExplainCard(A, e);
    flagCard(A, e);
    A.scrollIntoView ? 0 : 0;
  }
}

/* ---------------- views: notation ---------------- */
function viewNotation(){
  setTab(""); $("#ttl").textContent = "Szkoła notacji";
  app.innerHTML = `<div class="card"><div class="kicker">Krok po kroku</div><h2>Naucz się czytać zapis szachowy</h2><p class="muted small" style="margin:0">Siedem krótkich lekcji. Każda ma ćwiczenie na szachownicy. Robiąc jedną dziennie, w tydzień swobodnie przeczytasz każdą partię na chess.com.</p></div><div class="list" id="nl"></div>`;
  const l = $("#nl");
  D.notation.forEach((ls,i) => { const b = document.createElement("button"); b.className = "item"; const r = S.nota[ls.id]; b.innerHTML = `<span class="badge ${r?"ok":""}">${r?"✓":i+1}</span><span class="t"><b>${esc(ls.title)}</b><span>${r ? "Wynik: " + r.score : "Nie zaczęta"}</span></span><span class="chev">›</span>`; b.addEventListener("click", () => go("lesson-" + ls.id)); l.appendChild(b); });
}
function viewLesson(id){
  const ls = D.notation.find(x => x.id === id); if (!ls) return viewNotation();
  setTab(""); $("#ttl").textContent = "Notacja";
  const i = D.notation.indexOf(ls);
  app.innerHTML = `<button class="back" data-go="notacja">‹ Szkoła notacji</button><div class="card"><div class="kicker">Lekcja ${i+1} z ${D.notation.length}</div><h2>${esc(ls.title)}</h2><p style="margin:0">${rich(ls.text)}</p></div><div class="card"><div class="kicker">Ćwiczenie</div><div id="drill"></div></div>`;
  bindGo(app);
  const H = $("#drill");
  const finish = (score) => { S.nota[ls.id] = { score, ts:Date.now() }; save(); const nx = D.notation[i+1]; const d = document.createElement("div"); d.style.marginTop = "12px"; d.innerHTML = `<div class="verdict ok">Lekcja zaliczona: <b>${esc(score)}</b></div>` + (nx ? `<button class="btn" data-go="lesson-${nx.id}">Następna lekcja: ${esc(nx.title)} ›</button>` : `<button class="btn" data-go="start">Wszystkie lekcje zaliczone! Wróć do treningu</button>`); H.appendChild(d); bindGo(d); };
  if (ls.type === "square") drillSquare(H, finish);
  else if (ls.type === "piece") drillPiece(H, finish);
  else if (ls.type === "seq") drillSeq(H, ls, finish);
  else if (ls.type === "play") drillPlay(H, ls, finish);
  else if (ls.type === "read") drillRead(H, ls, finish);
}
function drillSquare(H, finish){
  const N = 10; let k = 0, ok = 0, target = null, orient = "w";
  H.innerHTML = '<div class="desc" id="q"></div><div id="bh" style="margin-top:10px"></div><p class="score" id="sc"></p>';
  const board = new Board($("#bh", H), { orient:"w", onSquare: sq => {
    if (!target) return;
    if (sq === target) { ok++; board.flash(sq, 400); } else { board.flash(target, 900); toast("To pole " + sq + ". Szukane: " + target); }
    k++; setTimeout(next, sq === target ? 350 : 950);
  }});
  function next(){
    if (k >= N) { board.opt.coords = true; board.render(); target = null; $("#q",H).innerHTML = "Koniec! Trafione: <b>" + ok + "/" + N + "</b>"; finish(ok + "/" + N); return; }
    orient = k >= N/2 ? "b" : "w";
    target = "abcdefgh"[Math.floor(Math.random()*8)] + (1 + Math.floor(Math.random()*8));
    board.opt.coords = k < 3;
    board.set("8/8/8/8/8/8/8/8 w - - 0 1", { orient });
    $("#q",H).innerHTML = "Dotknij pola <b style='font-size:22px'>" + target + "</b>" + (orient === "b" ? " <span class='muted small'>(plansza od strony czarnych)</span>" : "") + (k >= 3 ? " <span class='muted small'>(bez opisu pól)</span>" : "");
    $("#sc",H).textContent = "Pytanie " + (k+1) + "/" + N + " · trafione: " + ok;
  }
  next();
}
function drillPiece(H, finish){
  const pieces = [["n","N","skoczek"],["b","B","goniec"],["r","R","wieża"],["q","Q","hetman"],["k","K","król"],["p","","pion"]];
  const N = 8; let k = 0, ok = 0;
  H.innerHTML = '<div class="desc" id="q"></div><div id="bh" style="margin-top:10px"></div><div class="letters" id="lt"></div><p class="score" id="sc"></p>';
  const board = new Board($("#bh",H), { orient:"w" }); let cur;
  const lt = $("#lt",H);
  lt.innerHTML = pieces.map(p => `<button data-l="${p[1]}">${p[1] || "(brak)"}<div class="small muted" style="font-weight:600">${p[2]}</div></button>`).join("");
  lt.addEventListener("click", ev => { const b = ev.target.closest("button"); if (!b || !cur) return; const good = b.dataset.l === cur[1]; if (good) ok++; else toast("To " + cur[2] + ": " + (cur[1] ? "litera " + cur[1] : "pion nie ma litery")); k++; cur = null; setTimeout(next, good ? 250 : 900); });
  function next(){
    if (k >= N) { $("#q",H).innerHTML = "Koniec! Poprawne: <b>" + ok + "/" + N + "</b>"; finish(ok + "/" + N); return; }
    cur = pieces[Math.floor(Math.random()*pieces.length)];
    const sq = "abcdefgh"[1+Math.floor(Math.random()*6)] + (3 + Math.floor(Math.random()*3));
    const col = Math.random() < .5 ? "w" : "b";
    const g = new Chess("4k3/8/8/8/8/8/8/4K3 w - - 0 1"); g.clear(); g.put({ type:cur[0], color:col }, sq);
    if (cur[0] !== "k") { g.put({ type:"k", color:"w" }, "h1"); g.put({ type:"k", color:"b" }, "a8"); }
    else g.put({ type:"k", color: col === "w" ? "b" : "w" }, col === "w" ? "a8" : "h1");
    board.set(g.fen()); board.last = { f:sq, t:sq }; board.render();
    $("#q",H).innerHTML = "Jaką literą zapisuje się podświetloną figurę na <b>" + sq + "</b>?";
    $("#sc",H).textContent = "Pytanie " + (k+1) + "/" + N + " · poprawne: " + ok;
  }
  next();
}
function drillSeq(H, ls, finish){
  H.innerHTML = '<div class="desc" id="q"></div><div id="bh" style="margin-top:10px"></div><div class="chips" id="done" style="margin-top:10px"></div><p class="score" id="sc"></p>';
  const board = new Board($("#bh",H), { orient:"w" }); let i = 0, err = 0, shown = false;
  board.set("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", { interactive:true, onMove });
  function lab(j){ return j % 2 === 0 ? (j/2+1) + ". " : (j/2+.5) + "... "; }
  function ask(){
    if (i >= ls.moves.length) { board.interactive = false; $("#q",H).innerHTML = "Świetnie! Wszystkie ruchy zagrane. Pomyłki: <b>" + err + "</b>"; finish(err ? (ls.moves.length - err) + "/" + ls.moves.length : "bez błędów"); return; }
    shown = false;
    $("#q",H).innerHTML = "Zagraj ruch: <span class='mv' style='font-size:20px'>" + lab(i) + fmtSan(ls.moves[i]) + "</span><div class='small muted'>" + (i % 2 === 0 ? "ruch białych" : "ruch czarnych") + " · <a href='#' id='hl'>pokaż podpowiedź</a></div>";
    $("#hl",H).addEventListener("click", ev => { ev.preventDefault(); const g = new Chess(board.game.fen()); const m = g.move(ls.moves[i], { sloppy:true }); board.arrows = [{ f:m.from, t:m.to, c:"rgba(47,125,79,.9)" }]; board.render(); $("#q",H).insertAdjacentHTML("beforeend", "<div class='small'>" + esc(words(m)) + "</div>"); shown = true; });
    $("#sc",H).textContent = "Ruch " + (i+1) + "/" + ls.moves.length;
  }
  function onMove(m, g){
    const want = ls.moves[i].replace(/[+#]/g,"");
    if (m.san.replace(/[+#]/g,"") === want) { const d = $("#done",H); d.insertAdjacentHTML("beforeend", "<span class='chip'><span class='n'>" + lab(i) + "</span>" + fmtSan(m.san) + "</span>"); i++; board.arrows = []; board.interactive = true; board.render(); ask(); }
    else { err++; g.undo(); board.last = null; board.render(); board.interactive = true; toast("To był ruch " + m.san + ". Szukamy " + ls.moves[i] + "."); }
  }
  ask();
}
function drillPlay(H, ls, finish){
  H.innerHTML = '<div class="desc" id="q"></div><div id="bh" style="margin-top:10px"></div><p class="score" id="sc"></p>';
  const board = new Board($("#bh",H), { orient:"w" }); let k = 0, ok = 0, first = true;
  function next(){
    if (k >= ls.items.length) { board.interactive = false; $("#q",H).innerHTML = "Koniec! Za pierwszym razem: <b>" + ok + "/" + ls.items.length + "</b>"; finish(ok + "/" + ls.items.length); return; }
    const it = ls.items[k]; const turn = it.fen.split(" ")[1]; first = true;
    board.set(it.fen, { orient: turn, interactive:true, onMove });
    $("#q",H).innerHTML = "Zagraj: <span class='mv' style='font-size:20px'>" + fmtSan(it.san) + "</span> <span class='small muted'>(" + (turn === "w" ? "białe" : "czarne") + ")</span>";
    $("#sc",H).textContent = "Zadanie " + (k+1) + "/" + ls.items.length;
  }
  function onMove(m, g){
    const it = ls.items[k];
    if (m.san.replace(/[+#]/g,"") === it.san.replace(/[+#]/g,"")) { if (first) ok++; toast("Dobrze: " + words(m)); k++; setTimeout(next, 700); }
    else { first = false; g.undo(); board.last = null; board.render(); board.interactive = true; const t = new Chess(g.fen()); const w = t.move(it.san, { sloppy:true }); toast("To " + m.san + ". Szukane " + it.san + ": " + (w ? words(w) : "")); }
  }
  next();
}
function drillRead(H, ls, finish){
  const items = ls.items.slice().sort(() => Math.random() - .5); let k = 0, ok = 0;
  H.innerHTML = '<div class="desc" id="q"></div><div class="quiz" id="qz"></div><p class="score" id="sc"></p>';
  function next(){
    if (k >= items.length) { $("#q",H).innerHTML = "Koniec! Poprawne: <b>" + ok + "/" + items.length + "</b>"; $("#qz",H).innerHTML = ""; finish(ok + "/" + items.length); return; }
    const it = items[k]; const opts = [it.ok, ...it.bad].sort(() => Math.random() - .5);
    $("#q",H).innerHTML = "Co oznacza zapis <span class='mv' style='font-size:22px'>" + fmtSan(it.san) + "</span>?" + (S.settings.nota !== "en" ? " <span class='small muted'>(" + esc(it.san) + ")</span>" : "");
    $("#qz",H).innerHTML = opts.map(o => "<button>" + esc(o) + "</button>").join("");
    $("#qz",H).querySelectorAll("button").forEach(b => b.addEventListener("click", () => { const good = b.textContent === it.ok; b.classList.add(good ? "ok" : "bad"); if (!good) [...$("#qz",H).children].find(x => x.textContent === it.ok).classList.add("ok"); if (good) ok++; k++; setTimeout(next, good ? 500 : 1300); }, { once:true }));
    $("#sc",H).textContent = "Pytanie " + (k+1) + "/" + items.length;
  }
  next();
}

/* ---------------- views: progress ---------------- */
function phaseStats(){
  const r = {}; ["open","mid","end"].forEach(ph => { const l = activeExercises().filter(e => e.ph === ph); r[ph] = { n:l.length, ok:l.filter(e => exStatus(e.id)==="ok").length, fix:l.filter(e => exStatus(e.id)==="fix").length, fail:l.filter(e => exStatus(e.id)==="fail").length }; }); return r;
}
function wdlBar(w,d,l){ const n = w+d+l || 1; return `<div class="wdl"><i class="w" style="width:${w/n*100}%"></i><i class="d" style="width:${d/n*100}%"></i><i class="l" style="width:${l/n*100}%"></i></div>`; }
function pct(o){ const n = o.w + o.d + o.l; return n ? Math.round((o.w + o.d/2) / n * 100) : null; }
function viewProgress(){
  setTab("postepy"); $("#ttl").textContent = "Postępy";
  const B = D.baseline; const snaps = S.imported.snaps || []; const L = snaps[snaps.length-1]; const P = snaps.length > 1 ? snaps[snaps.length-2] : null;
  const ps = phaseStats();
  app.innerHTML = `
  <div class="card">
    <div class="kicker">Aktualizacja</div>
    <h2>Odśwież moje gry i przeanalizuj postępy</h2>
    <p class="small muted" style="margin-top:0">Aplikacja pobierze nowe partie z chess.com (albo wkleisz je ręcznie, jeśli pobranie nie zadziała), policzy statystyki, sprawdzi je silnikiem, porówna z poprzednią analizą i doda nowe ćwiczenia z Twoich błędów.</p>
    <button class="btn" id="refB">Odśwież moje gry i przeanalizuj postępy</button>
    ${L ? `<p class="small muted" style="margin-bottom:0">Ostatnia aktualizacja: ${new Date(L.ts).toLocaleString("pl-PL")} · ${L.n} nowych partii</p>` : ""}
  </div>
  ${L ? compareCard(L, P) : ""}
  <div class="card chart"><div class="kicker">Rating rapid</div><h2>${L && L.rating ? L.rating : B.ratingNow}</h2>${ratingChart()}</div>
  <div class="card">
    <div class="kicker">Ćwiczenia</div><h2>Twoje rozwiązania</h2>
    <table class="t"><tr><th>Faza</th><th>Za 1. razem</th><th>Po poprawce</th><th>Do zrobienia</th></tr>
    ${["open","mid","end"].map(ph => `<tr><td>${PH[ph]}</td><td>${ps[ph].ok}</td><td>${ps[ph].fix}</td><td>${ps[ph].n - ps[ph].ok - ps[ph].fix}</td></tr>`).join("")}</table>
    <p class="small muted">Pozycje rozwiązane dopiero za drugim razem (↻) i nieudane (✗) wracają w treningu na dziś częściej.${Object.keys(S.mis||{}).length ? " Oznaczone jako misclick (⊘): " + Object.keys(S.mis).length + ". Nie są liczone w tabeli." : ""}</p>
  </div>
  <div class="card">
    <div class="kicker">Punkt wyjścia (${fmtDate(D.analysisDate)})</div><h2>Wyniki w otwarciach</h2>
    <table class="t"><tr><th>Otwarcie</th><th>W–R–P</th><th style="width:30%"></th></tr>
    ${Object.values(B.openings).map(o => `<tr><td class="small">${esc(o.label)}</td><td><b>${o.w}–${o.d}–${o.l}</b></td><td>${wdlBar(o.w,o.d,o.l)}</td></tr>`).join("")}</table>
    <div class="legend"><span><i style="background:var(--ok)"></i>wygrane</span><span><i style="background:#b9b3a2"></i>remisy</span><span><i style="background:var(--bad)"></i>porażki</span></div>
  </div>
  <div class="card" id="aiCard"><div class="kicker">Trener</div><h2>Ocena postępów</h2><p class="small muted" style="margin-top:0">Gdy zbierzesz nowe partie i rozwiążesz ćwiczenia, poproś o komentarz trenera do zmian i o wskazówki, na czym się teraz skupić.</p><div id="aiOut"></div><button class="btn acc hide" id="aiB">Poproś trenera o ocenę postępów</button><button class="btn sec" id="copyB" style="margin-top:8px">Kopiuj raport postępów</button><p class="small muted" style="margin-bottom:0">Raport możesz wkleić w rozmowie z Claude'em, żebym przygotował nowe lekcje na podstawie Twoich najnowszych partii.</p></div>`;
  $("#refB").addEventListener("click", openRefresh);
  $("#copyB").addEventListener("click", () => { const t = reportText(); (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(() => toast("Raport skopiowany"), () => { const ta = document.createElement("textarea"); ta.value = t; $("#aiOut").appendChild(ta); ta.select(); toast("Zaznacz i skopiuj tekst"); }); });
  setupAI();
}
function compareCard(L, P){
  const B = D.baseline; const ref = P || { winPct:B.winPct, bpg:B.blundersPerGame, bph:B.blundersByPhase, used:B.medianTimeUsed, open:{ qga:B.openings.qga, sicAnti:B.openings.sicAnti, blackVsD4:B.openings.blackVsD4 }, rating:B.ratingNow, label:"analiza z " + fmtDate(D.analysisDate) };
  const refLabel = P ? "poprzednia aktualizacja" : "analiza z " + fmtDate(D.analysisDate);
  const row = (name, a, b, better, fmt) => { if (b === null || b === undefined) return `<tr><td>${name}</td><td>${a===null||a===undefined?"–":fmt(a)}</td><td>–</td><td></td></tr>`; const d = b - a; const up = better === "up" ? d > 0 : d < 0; const cls = Math.abs(d) < 1e-9 ? "" : (up ? "up" : "dn"); return `<tr><td>${name}</td><td>${a===null||a===undefined?"–":fmt(a)}</td><td><b>${fmt(b)}</b></td><td class="delta ${cls}">${a===null||a===undefined||Math.abs(d)<1e-9?"":(d>0?"▲":"▼")}</td></tr>`; };
  const f1 = x => String(Math.round(x*100)/100).replace(".",","), fp = x => x + "%", ft = x => Math.floor(x/60) + ":" + String(Math.round(x%60)).padStart(2,"0");
  const op = k => (L.open && L.open[k] && (L.open[k].w + L.open[k].d + L.open[k].l)) ? pct(L.open[k]) : null;
  const opr = k => ref.open && ref.open[k] ? pct(ref.open[k]) : null;
  return `<div class="card"><div class="kicker">Zmiany</div><h2>Nowe partie a ${refLabel}</h2>
  <table class="t"><tr><th>Wskaźnik</th><th>Wcześniej</th><th>Teraz</th><th></th></tr>
  ${row("Rating", ref.rating, L.rating, "up", x => x)}
  ${row("Wygrane", ref.winPct, L.winPct, "up", fp)}
  ${L.bpg !== undefined && L.bpg !== null ? row("Poważne błędy / partia", ref.bpg, L.bpg, "down", f1) : ""}
  ${L.bph ? row("…w otwarciu", ref.bph.open, L.bph.open, "down", f1) + row("…w grze środkowej", ref.bph.mid, L.bph.mid, "down", f1) + row("…w końcówce", ref.bph.end, L.bph.end, "down", f1) : ""}
  ${row("Zużyty czas (mediana)", ref.used, L.used, "up", ft)}
  ${op("qga")!==null ? row("Gambit Przyjęty (wynik %)", opr("qga"), op("qga"), "up", fp) : ""}
  ${op("sicAnti")!==null ? row("Sycylijska boczne (wynik %)", opr("sicAnti"), op("sicAnti"), "up", fp) : ""}
  ${op("blackVsD4")!==null ? row("Czarne vs 1.d4 (wynik %)", opr("blackVsD4"), op("blackVsD4"), "up", fp) : ""}
  ${op("london")!==null ? row("System Londyński (wynik %)", null, op("london"), "up", fp) : ""}
  ${op("slav")!==null ? row("Obrona Słowiańska (wynik %)", null, op("slav"), "up", fp) : ""}
  </table>
  <p class="small muted" style="margin-bottom:0">${L.n} nowych partii. Wynik % liczony jako (wygrane + ½ remisów) / partie. Przy małej liczbie partii traktuj zmiany orientacyjnie.${L.bpg===undefined||L.bpg===null?" Błędy nie były sprawdzane silnikiem.":""}</p></div>`;
}
function ratingChart(){
  const pts = D.baseline.ratingSeries.map(p => [p[0], p[1]]).concat((S.imported.games || []).map(g => [g.date, g.rating]).filter(p => p[1]));
  pts.sort((a,b) => a[0] < b[0] ? -1 : 1);
  if (pts.length < 2) return "";
  const W = 600, H = 200, pad = 30; const ys = pts.map(p => p[1]); const mn = Math.min(...ys) - 20, mx = Math.max(...ys) + 20;
  const x = i => pad + i * (W - pad*2) / (pts.length - 1), y = v => H - pad - (v - mn) / (mx - mn) * (H - pad*2);
  const path = pts.map((p,i) => (i ? "L" : "M") + x(i).toFixed(1) + "," + y(p[1]).toFixed(1)).join(" ");
  const nb = D.baseline.ratingSeries.length;
  const grid = [mn+20, Math.round((mn+mx)/2), mx-20].map(v => `<line x1="${pad}" x2="${W-pad}" y1="${y(v)}" y2="${y(v)}" stroke="#e3ddd0"/><text x="2" y="${y(v)+4}" font-size="11" fill="#5f6b64">${Math.round(v)}</text>`).join("");
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Wykres ratingu">${grid}<path d="${path}" fill="none" stroke="#2e5a43" stroke-width="2.5" stroke-linejoin="round"/>${pts.length > nb ? `<line x1="${x(nb-1)}" x2="${x(nb-1)}" y1="${pad-10}" y2="${H-pad}" stroke="#c9822b" stroke-dasharray="4 4"/><text x="${x(nb-1)+4}" y="${pad-2}" font-size="11" fill="#c9822b">nowe partie</text>` : ""}<circle cx="${x(pts.length-1)}" cy="${y(pts[pts.length-1][1])}" r="4.5" fill="#c9822b"/><text x="${pad}" y="${H-8}" font-size="11" fill="#5f6b64">${fmtDate(pts[0][0])}</text><text x="${W-pad}" y="${H-8}" font-size="11" fill="#5f6b64" text-anchor="end">${fmtDate(pts[pts.length-1][0])}</text></svg>`;
}
function reportText(){
  const B = D.baseline; const L = (S.imported.snaps || []).slice(-1)[0]; const ps = phaseStats();
  let t = "RAPORT POSTĘPÓW – kamtek (" + new Date().toLocaleDateString("pl-PL") + ")\n";
  t += "Punkt wyjścia " + fmtDate(D.analysisDate) + ": rating " + B.ratingNow + ", wygrane " + B.winPct + "%, błędy/partia " + B.blundersPerGame + " (otw. " + B.blundersByPhase.open + ", środek " + B.blundersByPhase.mid + ", końc. " + B.blundersByPhase.end + "), zużyty czas " + B.medianTimeUsed + " s.\n";
  if (L) { t += "Ostatnia aktualizacja: " + L.n + " nowych partii, rating " + L.rating + ", wygrane " + L.winPct + "%" + (L.bpg != null ? ", błędy/partia " + L.bpg + " (otw. " + L.bph.open + ", środek " + L.bph.mid + ", końc. " + L.bph.end + ")" : "") + ", zużyty czas " + L.used + " s.\n"; t += "Otwarcia (W-R-P): " + Object.entries(L.open || {}).map(([k,o]) => k + " " + o.w + "-" + o.d + "-" + o.l).join(", ") + "\n"; }
  t += "Ćwiczenia: " + ["open","mid","end"].map(ph => PH[ph] + " " + ps[ph].ok + " za 1. razem, " + ps[ph].fix + " po poprawce, z " + ps[ph].n).join("; ") + "\n";
  const fails = allExercises().filter(e => ["fail","fix"].includes(exStatus(e.id))).map(e => e.id + " (" + e.theme + ")"); if (fails.length) t += "Sprawiły trudność: " + fails.join(", ") + "\n";
  const mis = allExercises().filter(e => isMis(e.id)).map(e => e.id + " (" + e.my + ")"); const fl = Object.entries(S.flags||{}).map(([id,f]) => { const x = exById(id); return id + (x ? " [" + x.fen + ", zagrano " + x.my + ", najlepszy wg aplikacji " + x.best[0] + "]" : "") + (f.note ? " – uwaga: " + f.note : ""); }); if (fl.length) t += "ZGŁOSZONE BŁĘDY W WYJAŚNIENIACH:\n" + fl.join("\n") + "\n";
  if (mis.length) t += "Oznaczone jako misclick (nie liczyć jako błąd w myśleniu): " + mis.join(", ") + "\n";
  t += "Notacja: " + D.notation.filter(l => S.nota[l.id]).length + "/" + D.notation.length + " lekcji.\n";
  const nx = (S.imported.exercises || []).map(e => e.id + " " + e.fen + " zagrano " + e.my + ", lepiej " + e.best[0]); if (nx.length) t += "Nowe pozycje z błędami:\n" + nx.join("\n") + "\n";
  return t;
}

/* ---------------- odświeżanie: import PGN ---------------- */
let NEWCACHE = null;
function plural(n, one, few, many){ const a = n % 10, b = n % 100; return n + " " + (n === 1 ? one : (a >= 2 && a <= 4 && (b < 12 || b > 14)) ? few : many); }
async function fetchChessCom(){
  const known = new Set(D.knownIds.concat(S.imported.ids || []));
  const last = (S.imported.games || []).map(g => g.date).sort().pop() || D.analysisDate;
  const since = last.slice(0,7).replace("-", "/");
  const ctl = new AbortController(); const to = setTimeout(() => ctl.abort(), 12000);
  try {
    const a = await (await fetch("https://api.chess.com/pub/player/" + D.user + "/games/archives", { signal: ctl.signal })).json();
    const months = (a.archives || []).filter(u => u.slice(-7) >= since);
    let pgns = [];
    for (const u of months) { const j = await (await fetch(u, { signal: ctl.signal })).json(); pgns = pgns.concat((j.games || []).filter(g => g.rules === "chess" && g.pgn).map(g => g.pgn)); }
    const games = pgns.map(parsePgn).filter(g => g && g.mine && g.id && !known.has(g.id));
    NEWCACHE = { ts: Date.now(), games }; return games;
  } finally { clearTimeout(to); }
}
async function newGamesBanner(){
  const host = $("#newGames"); if (!host) return;
  try {
    const known = new Set(D.knownIds.concat(S.imported.ids || []));
    const games = ((NEWCACHE && Date.now() - NEWCACHE.ts < 600000) ? NEWCACHE.games : await fetchChessCom()).filter(g => !known.has(g.id));
    if (!$("#newGames") || !games.length) return;
    host.innerHTML = `<div class="card" style="border-color:#efcd96;background:#fff8ec"><div class="kicker">Nowe partie</div><h2>Masz ${plural(games.length, "nową partię", "nowe partie", "nowych partii")} na chess.com</h2><p class="small muted" style="margin-top:0">Przeanalizuję je silnikiem, porównam z poprzednią analizą i dodam ćwiczenia z Twoich błędów.</p><button class="btn" id="ngB">Przeanalizuj teraz</button></div>`;
    $("#ngB").addEventListener("click", () => { go("postepy"); setTimeout(openRefresh, 300); });
  } catch(e) { /* brak dostępu do chess.com z tej strony (np. w ramce claude.ai) – baner się nie pokazuje */ }
}
function monthUrl(off){ const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - off); return "https://api.chess.com/pub/player/" + D.user + "/games/" + d.getFullYear() + "/" + String(d.getMonth()+1).padStart(2,"0"); }
function openRefresh(){
  const m = document.createElement("div"); m.className = "modal";
  m.innerHTML = `<div class="sheet"><h2>Odśwież moje gry</h2>
  <div id="autoBox" class="desc"><span class="spin"></span> Łączę się z chess.com…</div>
  <div id="manual" class="hide" style="margin-top:10px">
  <div class="banner">Ta strona nie może sama połączyć się z chess.com (tak jest np. w aplikacji Claude). Pobranie partii to wtedy jedno kliknięcie i jedno wklejenie.</div>
  <ol class="steps">
    <li><b>Otwórz swoje partie z tego miesiąca</b><span class="small">Otworzy się strona z danymi z chess.com (tekst z nawiasami, to normalne).</span><div class="row" style="margin-top:8px"><a class="btn sec" href="${monthUrl(0)}" target="_blank" rel="noopener">Ten miesiąc</a><a class="btn ghost" href="${monthUrl(1)}" target="_blank" rel="noopener">Poprzedni</a></div></li>
    <li><b>Zaznacz wszystko i skopiuj</b><span class="small">Na telefonie: przytrzymaj tekst, wybierz „Zaznacz wszystko”, potem „Kopiuj”. Możesz też wkleić plik PGN.</span></li>
    <li><b>Wklej tutaj</b><textarea id="pgnIn" placeholder="Wklej tu skopiowany tekst (JSON albo PGN)…"></textarea><label class="btn ghost" style="margin-top:8px;cursor:pointer">Albo wybierz plik .pgn / .json<input type="file" id="fileIn" accept=".pgn,.json,.txt,application/json,text/plain" style="display:none"></label></li>
  </ol></div>
  <div class="opt" style="margin:10px 0"><button class="on" data-eng="1">Ze sprawdzeniem silnikiem</button><button data-eng="0">Tylko statystyki (szybko)</button></div>
  <div id="refMsg"></div>
  <div class="row" style="margin-top:10px"><button class="btn ghost" id="refX">Zamknij</button><button class="btn" id="refGo">Analizuj</button></div></div>`;
  document.body.appendChild(m);
  let useEng = S.settings.engine; let autoGames = null;
  fetchChessCom().then(gs => { autoGames = gs; $("#autoBox", m).innerHTML = gs.length ? "✓ Pobrałem z chess.com <b>" + plural(gs.length, "nową partię", "nowe partie", "nowych partii") + "</b>. Naciśnij <b>Analizuj</b>." : "✓ Połączono z chess.com. Nie ma nowych partii od ostatniej analizy."; if (!gs.length) $("#refGo", m).disabled = true; })
    .catch(() => { $("#autoBox", m).classList.add("hide"); $("#manual", m).classList.remove("hide"); });
  m.querySelectorAll("[data-eng]").forEach(b => { b.classList.toggle("on", (b.dataset.eng === "1") === useEng); b.addEventListener("click", () => { useEng = b.dataset.eng === "1"; m.querySelectorAll("[data-eng]").forEach(x => x.classList.toggle("on", x === b)); }); });
  $("#refX", m).addEventListener("click", () => { Engine.stop(); m.remove(); viewProgress(); });
  $("#fileIn", m).addEventListener("change", ev => { const f = ev.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => { $("#pgnIn", m).value = r.result; }; r.readAsText(f); });
  $("#refGo", m).addEventListener("click", async () => {
    const txt = $("#pgnIn", m).value.trim(); const msg = $("#refMsg", m);
    let games;
    if (!txt && autoGames && autoGames.length) games = autoGames;
    else { if (!txt) { msg.innerHTML = '<div class="verdict bad">Najpierw wklej partie.</div>'; return; } try { games = parseInput(txt); } catch(e) { games = []; } }
    const known = new Set(D.knownIds.concat(S.imported.ids || []));
    const fresh = games.filter(g => g.id && !known.has(g.id) && g.mine);
    if (!games.length) { msg.innerHTML = '<div class="verdict bad">Nie rozpoznałem partii w tym tekście. Skopiuj całą stronę z chess.com.</div>'; return; }
    if (!fresh.length) { msg.innerHTML = '<div class="verdict mid">Znaleziono ' + games.length + " partii, ale wszystkie są już w analizie. Zagraj nowe i wróć!</div>"; return; }
    $("#refGo", m).disabled = true;
    msg.innerHTML = '<div class="verdict mid">Nowe partie: <b>' + fresh.length + "</b>. Liczę statystyki…</div>";
    const snap = statsFor(fresh);
    if (useEng) {
      msg.innerHTML = '<div class="verdict mid"><span class="spin"></span> Uruchamiam silnik…</div>';
      const ok = await Engine.ready();
      if (!ok) msg.innerHTML = '<div class="verdict bad">Silnik jest niedostępny, zapisuję same statystyki.</div>';
      else {
        const res = await analyseGames(fresh, (i, n) => { msg.innerHTML = '<div class="verdict mid"><span class="spin"></span> Analiza silnikiem: partia ' + (i+1) + " z " + n + '</div><div class="prog"><i style="width:' + (i/n*100) + '%"></i></div><p class="small muted">' + esc(Engine.name || "Silnik") + ': ok. 10–30 s na partię. Nie zamykaj tego okna.</p>'; });
        if (res) { snap.bpg = res.bpg; snap.bph = res.bph; const newEx = res.cands.slice(0, 8); S.imported.exercises = (S.imported.exercises || []).concat(newEx); snap.newEx = newEx.length; }
      }
    }
    S.imported.ids = (S.imported.ids || []).concat(fresh.map(g => g.id));
    S.imported.games = (S.imported.games || []).concat(fresh.map(g => ({ id:g.id, date:g.date, rating:g.myElo, res:g.res, c:g.color, cat:g.cat })));
    S.imported.snaps = (S.imported.snaps || []).concat([snap]); save();
    NEWCACHE = null;
    msg.innerHTML = '<div class="verdict ok">Gotowe! Przeanalizowałem ' + plural(fresh.length, "nową partię", "nowe partie", "nowych partii") + "." + (snap.newEx ? " Dodałem " + plural(snap.newEx, "nowe ćwiczenie", "nowe ćwiczenia", "nowych ćwiczeń") + " z Twoich błędów." : "") + "</div>";
    $("#refGo", m).disabled = false; $("#refGo", m).textContent = "Pokaż wyniki"; $("#refGo", m).onclick = () => { m.remove(); viewProgress(); };
  });
}
function parseInput(txt){
  let pgns = [];
  const t = txt.trim();
  if (t.startsWith("{") || t.startsWith("[")) { try { const j = JSON.parse(t); const arr = Array.isArray(j) ? j : (j.games || []); pgns = arr.map(g => g.pgn).filter(Boolean); } catch(e) {} }
  if (!pgns.length) pgns = t.split(/\n\s*\n(?=\[Event )/).map(s => s.trim()).filter(s => s.startsWith("[Event") || s.includes("[White "));
  return pgns.map(parsePgn).filter(Boolean);
}
function parsePgn(p){
  const h = {}; p.replace(/\[(\w+)\s+"([^"]*)"\]/g, (a,k,v) => { h[k] = v; return ""; });
  const body = p.replace(/\[(\w+)\s+"([^"]*)"\]/g, "");
  const clocks = [...body.matchAll(/\[%clk (\d+):(\d+):([\d.]+)\]/g)].map(m => +m[1]*3600 + +m[2]*60 + +m[3]);
  const toks = body.replace(/\{[^}]*\}/g, " ").replace(/\([^)]*\)/g, " ").replace(/\$\d+/g, " ").replace(/\d+\.(\.\.)?/g, " ").replace(/(1-0|0-1|1\/2-1\/2|\*)\s*$/, "").trim().split(/\s+/).filter(Boolean);
  const me = D.user.toLowerCase(); const white = (h.White||"").toLowerCase() === me, black = (h.Black||"").toLowerCase() === me;
  const color = white ? "w" : "b"; const r = h.Result;
  const res = r === "1/2-1/2" ? "D" : ((r === "1-0") === white ? "W" : "L");
  const id = (h.Link || h.Site || "").split("/").pop();
  const myClocks = clocks.filter((x,i) => (i % 2 === 0) === white);
  const tc = +(h.TimeControl || "600").split("+")[0] || 600;
  return { id, mine: white || black, color, res, toks, opp: white ? h.Black : h.White, oe: +(white ? h.BlackElo : h.WhiteElo) || 0, myElo: +(white ? h.WhiteElo : h.BlackElo) || 0, date: (h.UTCDate || h.Date || "").replace(/\./g,"-"), url: h.Link || "", used: myClocks.length > 10 ? tc - myClocks[myClocks.length-1] : null, cat: category(toks, color) };
}
function category(t, c){
  if (c === "w") { if (t[0]==="d4" && t[1]==="d5" && t[2]==="c4") return t[3]==="dxc4" ? "qga" : "qgd"; if (t[0]==="d4" && t[2]==="Bf4") return "london"; if (t[0]==="d4" && t[1]==="Nf6") return "d4nf6"; return "wOther"; }
  if (t[0]==="e4" && t[1]==="c5") return t[2]==="Nf3" ? "sicOpen" : "sicAnti";
  if (t[0]==="e4") return "bE4Other";
  const mine = t.filter((x,i) => i % 2 === 1).slice(0,3);
  if (mine.includes("d5") && mine.includes("c6")) return "slav";
  return "blackVsD4";
}
function statsFor(games){
  const o = {}; let w=0,d=0,l=0; const used = [];
  games.forEach(g => { if (g.res==="W") w++; else if (g.res==="D") d++; else l++; o[g.cat] = o[g.cat] || { w:0,d:0,l:0 }; o[g.cat][({W:"w",D:"d",L:"l"})[g.res]]++; if (g.used != null) used.push(g.used); if (g.cat === "slav") { o.blackVsD4 = o.blackVsD4 || { w:0,d:0,l:0 }; o.blackVsD4[({W:"w",D:"d",L:"l"})[g.res]]++; } });
  used.sort((a,b) => a-b);
  const last = games.slice().sort((a,b) => a.date < b.date ? -1 : 1).pop();
  return { ts:Date.now(), n:games.length, w, d, l, winPct: Math.round(w / games.length * 100), used: used.length ? Math.round(used[Math.floor(used.length/2)]) : null, rating: last ? last.myElo : null, open:o };
}
async function analyseGames(games, onProg){
  const MS = 150; let total = { open:0, mid:0, end:0 }; const cands = []; let done = 0;
  for (let gi = 0; gi < games.length; gi++) {
    onProg(gi, games.length);
    const G = games[gi]; const g = new Chess(); const fens = [g.fen()]; const moves = [];
    for (const s of G.toks) { const m = g.move(s, { sloppy:true }); if (!m) break; moves.push(m); fens.push(g.fen()); }
    const ev = new Array(fens.length).fill(null);
    for (let i = 10; i < fens.length; i++) { const r = await Engine.eval(fens[i], MS); if (Engine.state === "failed") return null; ev[i] = r ? r.cp : null; }
    const cl = x => Math.max(-1500, Math.min(1500, x));
    for (let i = 10; i < moves.length; i++) {
      const mover = moves[i].color; if (mover !== G.color) continue;
      if (ev[i] === null || ev[i+1] === null) continue;
      const before = ev[i], after = -ev[i+1]; const loss = cl(before) - cl(after);
      if ((before > 700 && after > 500) || (before < -700 && after < -700)) continue;
      if (loss < 300) continue;
      const ply = i + 1; const pcs = (fens[i].split(" ")[0].match(/[nbrqNBRQ]/g) || []).length;
      const ph = ply <= 24 ? "open" : (pcs <= 6 ? "end" : "mid"); total[ph]++;
      if (before > -150) cands.push({ G, i, ph, before, after, loss, fen:fens[i], move:moves[i], prev: moves[i-1] });
    }
    done++;
  }
  cands.sort((a,b) => b.loss - a.loss);
  const out = []; const seen = new Set();
  for (const c of cands) {
    if (out.length >= 8) break; if (seen.has(c.G.id + c.ph)) continue; seen.add(c.G.id + c.ph);
    const deepB = await Engine.eval(c.fen, 2500); const g2 = new Chess(c.fen); g2.move(c.move.san); const deepA = await Engine.eval(g2.fen(), 2500);
    const best = deepB ? uciToSanLine(c.fen, deepB.pv, 6) : []; if (!best.length) continue;
    const ref = [c.move.san].concat(deepA ? uciToSanLine(g2.fen(), deepA.pv, 5) : []);
    if (best[0].replace(/[+#]/g,"") === c.move.san.replace(/[+#]/g,"")) continue;
    const ex = autoExercise(c, best, ref, deepB ? deepB.cp : c.before, deepA ? -deepA.cp : c.after);
    out.push(ex);
  }
  const n = games.length || 1;
  return { bpg: Math.round((total.open + total.mid + total.end) / n * 100) / 100, bph: { open: Math.round(total.open/n*100)/100, mid: Math.round(total.mid/n*100)/100, end: Math.round(total.end/n*100)/100 }, cands: out };
}
const VAL = { p:1, n:3, b:3, r:5, q:9, k:0 };
function material(fen, c){ const b = fen.split(" ")[0]; let s = 0; for (const ch of b) { const l = ch.toLowerCase(); if (VAL[l] === undefined) continue; s += (ch === l ? -1 : 1) * VAL[l]; } return c === "w" ? s : -s; }
function autoExercise(c, best, ref, eb, ea){
  const G = c.G; const color = G.color;
  const g = new Chess(c.fen); const m0 = material(c.fen, color); let mEnd = m0; const gg = new Chess(c.fen); for (const s of ref) { if (!gg.move(s)) break; } mEnd = material(gg.fen(), color);
  const lostMat = m0 - mEnd;
  const matTxt = lostMat >= 8 ? "hetmana" : lostMat >= 5 ? "wieżę (lub jej równowartość)" : lostMat >= 3 ? "figurę" : lostMat >= 1 ? "piona" : null;
  const reply = ref[1];
  let whyBad = "Po [[" + c.move.san + "]] przeciwnik ma mocną odpowiedź" + (reply ? ": [[" + reply + "]]" : "") + ". Ocena spada z „" + evalWords(eb) + "” do „" + evalWords(ea) + "”.";
  if (matTxt) whyBad += " W tym wariancie tracisz " + matTxt + ".";
  if (/#/.test(ref.join(" "))) whyBad += " Wariant kończy się matem.";
  const bm = g.move(best[0]);
  let whyGood = "Silnik poleca [[" + best[0] + "]]" + (bm ? " (" + words(bm).toLowerCase() + ")" : "") + ". Ocena: „" + evalWords(eb) + "”." + (bm && bm.captured ? " Ten ruch coś zbija, więc sprawdź, czy figura przeciwnika nie stała bez obrony." : "") + (bm && /\+/.test(bm.san) ? " To ruch z szachem. Szachy zawsze sprawdzaj w pierwszej kolejności." : "");
  const look = ["Po ruchu przeciwnika zapytaj: co on teraz atakuje? Co mi grozi?", "Przed swoim ruchem sprawdź szachy i bicia, jakie będzie miał przeciwnik.", "Poproś trenera o pełne wyjaśnienie poniżej."];
  const lastObj = c.prev;
  return { id:"n" + G.id + "-" + (c.i+1), auto:true, ph:c.ph, c:color, theme:"Nowa pozycja z Twojej partii", fen:c.fen, hist:G.toks.slice(0, c.i), last: lastObj ? { f:lastObj.from, t:lastObj.to } : null, opp:G.opp, oe:G.oe, me:G.myElo, date:G.date, url:G.url, res:G.res, mv:Math.floor(c.i/2)+1, my:c.move.san, eb, ea, task:"Pozycja z Twojej nowej partii. Znajdź najlepszy ruch.", hint:"Sprawdź wszystkie szachy i bicia, swoje i przeciwnika.", best, ref, whyBad, whyGood, look };
}

/* ---------------- trener AI (opcjonalnie, przez claude.use("sample")) ---------------- */
let SAMPLE = null;
(function detectAI(tries){
  if (window.claude && typeof window.claude.use === "function") {
    window.claude.use("sample").then(s => { if (!s) return; SAMPLE = s; const b = $("#aiB"); if (b) b.classList.remove("hide"); document.querySelectorAll(".aiExplain").forEach(x => x.classList.remove("hide")); document.querySelectorAll(".aiNo").forEach(x => x.remove()); }).catch(() => {});
  } else if (tries < 20) setTimeout(() => detectAI(tries + 1), 500);
})(0);
const COACH = "Jesteś arcymistrzem szachowym i ciepłym, konkretnym trenerem. Piszesz po polsku do ucznia Kamila (rating rapid ok. 1450–1550, słaba znajomość notacji). Zwracasz się do niego per Ty, jak trener do konkretnego ucznia, a nie jak podręcznik. Każdy ruch w zapisie SAN zapisuj w podwójnych nawiasach kwadratowych, np. [[Nf3]], i zawsze dodawaj obok opis słowami (np. „skoczek na f3”). Nie podawaj suchych liczb oceny; tłumacz, dlaczego. Nie używaj nagłówków markdown.";
function setupAI(){
  const b = $("#aiB"); if (!b) return; if (SAMPLE) b.classList.remove("hide");
  if (S.ai.progress) $("#aiOut").innerHTML = '<div class="ai">' + rich(S.ai.progress) + "</div>";
  b.addEventListener("click", async () => {
    if (!SAMPLE) return; b.disabled = true; const out = $("#aiOut"); out.innerHTML = '<div class="ai"><span class="spin"></span> Trener analizuje…</div>';
    const prompt = COACH + "\n\nOto dane ucznia. Oceń postępy względem punktu wyjścia (co się poprawiło, co nie), wskaż 2–3 najważniejsze rzeczy na najbliższy tydzień i zaproponuj, które ćwiczenia powtórzyć. Maksymalnie 220 słów.\n\n" + reportText() + "\nWnioski z pierwszej analizy: najwięcej decydujących błędów w grze środkowej (figury bez obrony, widły, związania, groźby mata); gra za szybko (zużywa < 5 z 10 min); wczesne wypady hetmanem; słabe wyniki w Gambicie Przyjętym, bocznych wariantach Sycylijskiej i czarnymi przeciw 1.d4. Nowe otwarcia: System Londyński (białe vs 1...Nf6) i Obrona Słowiańska (czarne vs 1.d4).";
    try { const r = await SAMPLE(prompt, { onText: ({ text }) => { out.innerHTML = '<div class="ai">' + rich(text) + "</div>"; } }); S.ai.progress = r.text; save(); out.innerHTML = '<div class="ai">' + rich(r.text) + "</div>"; }
    catch(e) { out.innerHTML = '<div class="verdict bad">' + (e && e.code === "rate_limited" ? "Zbyt wiele próśb. Spróbuj za chwilę." : "Trener jest teraz niedostępny.") + "</div>"; }
    b.disabled = false;
  });
}
function flagCard(A, e){
  const c = document.createElement("div"); c.className = "card";
  const draw = () => {
    const f = S.flags[e.id];
    c.innerHTML = '<div class="kicker">Coś się nie zgadza?</div>' + (f
      ? '<div class="verdict mid" style="margin-top:0">⚑ <b>Zgłosiłeś błąd w tym wyjaśnieniu</b>' + (f.note ? ": „" + esc(f.note) + "”" : "") + '. Zgłoszenie trafia do raportu postępów. Wklej mi raport, a sprawdzę tę pozycję silnikiem i poprawię opis.</div><button class="btn ghost" id="unflag">Wycofaj zgłoszenie</button>'
      : '<p class="small muted" style="margin-top:0">Jeśli uważasz, że wyjaśnienie jest błędne (np. przeciwnik ma lepszą obronę), sprawdź to na planszy w trybie „Co jeśli…?” i zgłoś. Napisz krótko, co Ci nie pasuje.</p><textarea id="flagTxt" style="min-height:70px" placeholder="np. po Nc6 nie mogę zbić gońca, bo…"></textarea><button class="btn sec" id="flagB" style="margin-top:8px">⚑ Zgłoś błąd w wyjaśnieniu</button>');
    const fb = c.querySelector("#flagB"); if (fb) fb.addEventListener("click", () => { S.flags[e.id] = { ts:Date.now(), note: c.querySelector("#flagTxt").value.trim() }; save(); toast("Zgłoszenie zapisane"); draw(); });
    const ub = c.querySelector("#unflag"); if (ub) ub.addEventListener("click", () => { delete S.flags[e.id]; save(); draw(); });
  };
  draw(); A.appendChild(c);
}
function aiExplainCard(A, e){
  const c = document.createElement("div"); c.className = "card";
  c.innerHTML = '<div class="kicker">Trener</div><div id="aiEx"></div><button class="btn acc aiExplain ' + (SAMPLE ? "" : "hide") + '">Poproś trenera o pełne wyjaśnienie</button>' + (SAMPLE ? "" : '<p class="small muted aiNo">Wyjaśnienie trenera jest dostępne, gdy otworzysz tę stronę w aplikacji Claude. Możesz też skopiować raport w zakładce Postępy i wkleić go w rozmowie.</p>');
  A.appendChild(c);
  const out = $("#aiEx", c); if (S.ai[e.id]) out.innerHTML = '<div class="ai">' + rich(S.ai[e.id]) + "</div>";
  $(".aiExplain", c).addEventListener("click", async ev => {
    if (!SAMPLE) return; ev.target.disabled = true; out.innerHTML = '<div class="ai"><span class="spin"></span> Trener patrzy na pozycję…</div>';
    const g = new Chess(e.fen);
    const prompt = COACH + "\n\nPozycja z partii ucznia (FEN): " + e.fen + "\nUczeń gra " + (e.c === "w" ? "białymi" : "czarnymi") + ". Plansza:\n" + g.ascii() + "\nUczeń zagrał [[" + e.my + "]] – to był błąd. Silnik po tym ruchu pokazuje wariant: " + e.ref.join(" ") + ".\nNajlepszy ruch według silnika: [[" + e.best[0] + "]], wariant: " + e.best.join(" ") + ".\n\nNapisz trzy krótkie akapity: 1) Dlaczego ruch ucznia był błędem i co na nim traci. 2) Dlaczego najlepszy ruch jest najlepszy i co na nim zyskuje. 3) Jak patrzeć na taką pozycję: plany, zagrożenia, kluczowe cechy. Opieraj się wyłącznie na podanych wariantach i pozycji; jeśli czegoś nie jesteś pewien, nie zgaduj. Maks. 200 słów.";
    try { const r = await SAMPLE(prompt, { onText: ({ text }) => { out.innerHTML = '<div class="ai">' + rich(text) + "</div>"; } }); S.ai[e.id] = r.text; save(); out.innerHTML = '<div class="ai">' + rich(r.text) + "</div>"; }
    catch(err) { out.innerHTML = '<div class="verdict bad">Trener jest teraz niedostępny.</div>'; }
    ev.target.disabled = false;
  });
}

/* ---------------- ustawienia ---------------- */
function openSettings(){
  const m = document.createElement("div"); m.className = "modal";
  const N = S.settings.nota;
  m.innerHTML = `<div class="sheet"><h2>Ustawienia</h2>
  <h3>Zapis ruchów</h3><div class="opt" id="optN"><button data-v="fig" class="${N==="fig"?"on":""}"><span class="fig">♞</span>f3 (jak chess.com)</button><button data-v="en" class="${N==="en"?"on":""}">Nf3 (PGN)</button><button data-v="pl" class="${N==="pl"?"on":""}">Sf3 (polski)</button></div>
  <h3>Szachownica</h3><div class="opt" id="optC"><button data-v="1" class="${S.settings.coords?"on":""}">Opis pól: tak</button><button data-v="0" class="${!S.settings.coords?"on":""}">Opis pól: nie</button></div>
  <h3>Silnik Stockfish</h3><div class="opt" id="optE"><button data-v="1" class="${S.settings.engine?"on":""}">Włączony</button><button data-v="0" class="${!S.settings.engine?"on":""}">Wyłączony</button></div>
  <p class="small muted">Silnik (ok. 1,5 MB) ładuje się z internetu przy pierwszym użyciu i ocenia Twoje ruchy w ćwiczeniach oraz nowe partie. Stan: <span id="engState">${engLabel()}</span></p>
  <h3>Dane</h3><p class="small muted" style="margin-top:0">Postępy są zapisywane w tej przeglądarce, na tym urządzeniu.</p>
  <button class="btn ghost" id="resetB">Wyczyść moje postępy</button>
  <button class="btn" id="closeS" style="margin-top:10px">Gotowe</button></div>`;
  document.body.appendChild(m);
  $("#optN", m).addEventListener("click", e => { const b = e.target.closest("button"); if (!b) return; S.settings.nota = b.dataset.v; save(); $("#optN", m).querySelectorAll("button").forEach(x => x.classList.toggle("on", x === b)); });
  $("#optC", m).addEventListener("click", e => { const b = e.target.closest("button"); if (!b) return; S.settings.coords = b.dataset.v === "1"; save(); $("#optC", m).querySelectorAll("button").forEach(x => x.classList.toggle("on", x === b)); });
  $("#optE", m).addEventListener("click", e => { const b = e.target.closest("button"); if (!b) return; S.settings.engine = b.dataset.v === "1"; if (S.settings.engine && Engine.state === "failed") Engine.state = "idle"; save(); $("#optE", m).querySelectorAll("button").forEach(x => x.classList.toggle("on", x === b)); if (S.settings.engine) Engine.ready().then(updEngineBadge); updEngineBadge(); });
  let armed = false;
  $("#resetB", m).addEventListener("click", e => { if (!armed) { armed = true; e.target.textContent = "Na pewno? Naciśnij jeszcze raz"; e.target.style.borderColor = "var(--bad)"; return; } S.ex = {}; S.mis = {}; S.flags = {}; S.nota = {}; S.plan = {}; S.imported = { ids:[], games:[], snaps:[], exercises:[] }; S.ai = {}; save(); toast("Postępy wyczyszczone"); m.remove(); route(); });
  $("#closeS", m).addEventListener("click", () => { m.remove(); route(); });
  m.addEventListener("click", e => { if (e.target === m) { m.remove(); route(); } });
}

/* ---------------- autotest danych (wywołanie: __selfTest()) ---------------- */
window.__selfTest = function(){
  const errs = []; const tryLine = (fen, mv, tag) => { const g = new Chess(fen); for (const s of mv) { if (!g.move(s, { sloppy:true })) { errs.push(tag + ": " + s); return; } } };
  const START = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
  D.exercises.forEach(e => { const g = new Chess(); if (!g.load(e.fen)) errs.push(e.id + " FEN"); tryLine(e.fen, e.best, e.id + " best"); tryLine(e.fen, e.ref, e.id + " ref"); (e.alt||[]).forEach(a => tryLine(e.fen, a.moves, e.id + " alt")); if (e.hist.length) { const h = new Chess(); e.hist.forEach(s => h.move(s, { sloppy:true })); if (h.fen().split(" ").slice(0,4).join(" ") !== e.fen.split(" ").slice(0,4).join(" ")) errs.push(e.id + " hist->fen"); } const t = (e.whyBad + e.whyGood + e.hint).match(/\[\[([^\]]+)\]\]/g) || []; });
  D.repertoire.forEach(gr => gr.items.forEach(it => tryLine(START, it.moves, it.id)));
  (D.openings||[]).forEach(o => { tryLine(START, o.base, o.id + " base"); if (o.variants.length !== 5) errs.push(o.id + " ma " + o.variants.length + " wariantów"); o.variants.forEach(v => { tryLine(START, v.moves, o.id + "/" + v.id); if (v.moves.length !== 12) errs.push(o.id + "/" + v.id + " długość " + v.moves.length); for (let i = 0; i < v.moves.length; i++) if (!v.notes[i]) errs.push(o.id + "/" + v.id + " brak komentarza do ruchu " + i); if (!v.moves.join(" ").startsWith(o.base.join(" "))) errs.push(o.id + "/" + v.id + " nie zaczyna się od bazy"); }); });
  D.notation.forEach(n => { if (n.moves) tryLine(START, n.moves, n.id); (n.items||[]).forEach((it,i) => { if (it.fen) tryLine(it.fen, [it.san], n.id + "#" + i); }); });
  return errs.length ? errs : "OK";
};

route();
if (S.settings.engine) setTimeout(() => Engine.start(), 1500);
})();
