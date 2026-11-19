// Dane aplikacji: statystyki z chess.com (kamtek) i ćwiczenia z własnych partii.
// Stan analizy: 19.11.2026. 243 partie rapid 10 min (lis 2025 – lis 2026), 90 ostatnich przeanalizowanych silnikiem Stockfish.
window.DATA = {
  user: "kamtek",
  analysisDate: "2026-11-19",
  baseline: {
    games: 243, w: 114, d: 9, l: 120,
    white: { w: 60, d: 2, l: 59 }, black: { w: 54, d: 7, l: 61 },
    ratingNow: 1473, ratingStart: 1533, ratingMax: 1610, ratingMin: 925,
    winPct: 47,
    analysed: 90,
    blundersPerGame: 2.02,
    blundersByPhase: { open: 0.37, mid: 1.12, end: 0.53 },
    firstDecisive: { open: 13, mid: 23, end: 7, of: 45 },
    medianTimeUsed: 284,
    medianClockLeftInLosses: 333,
    lossesUnder1min: 6,
    mateWins: 27,
    castlePct: 79, castleMedianMove: 10, earlyQueenPct: 17,
    openings: {
      qgd: { label: "Gambit Hetmański Odrzucony (1.d4 d5 2.c4 e6/inne)", w: 24, d: 2, l: 22 },
      qga: { label: "Gambit Hetmański Przyjęty (2...dxc4)", w: 4, d: 0, l: 10 },
      d4nf6: { label: "1.d4 Nf6 (obrony indyjskie)", w: 4, d: 0, l: 8 },
      d4e6: { label: "1.d4 e6", w: 13, d: 0, l: 3 },
      sicOpen: { label: "Sycylijska otwarta (2.Nf3)", w: 21, d: 0, l: 12 },
      sicAnti: { label: "Sycylijska – boczne warianty (2.Bc4, 2.c3, 2.Nc3, 2.f4…)", w: 13, d: 3, l: 27 },
      blackVsD4: { label: "Czarne przeciw 1.d4 / 1.c4 / 1.Nf3", w: 20, d: 4, l: 21 }
    },
    antiDetail: [
      ["2.Bc4 (Bowdler)", 3, 1, 9], ["2.c3 (Alapin)", 1, 1, 7], ["2.Nc3 (zamknięta)", 2, 0, 5], ["2.f4 (McDonnell)", 0, 0, 4]
    ],
    after10: { qgd: 148, qga: 21, sicOpen: -74, sicAnti: 4, blackVsD4: -118 },
    ratingSeries: [["2025-11-01",1533],["2025-11-05",1525],["2025-11-13",1525],["2025-11-16",1517],["2025-11-18",1526],["2025-11-21",1558],["2025-12-06",1567],["2025-12-12",1526],["2025-12-21",1535],["2025-12-25",1585],["2025-12-29",1579],["2026-07-01",1510],["2026-07-03",1467],["2026-07-08",1532],["2026-07-12",1540],["2026-07-31",1548],["2026-08-02",1540],["2026-08-08",1531],["2026-08-14",1521],["2026-08-24",1486],["2026-09-08",1461],["2026-11-17",1448],["2026-11-18",1473]]
  },

  // ---------- ĆWICZENIA Z TWOICH PARTII ----------
  exercises: [
  // ===== OTWARCIE =====
  {
    verified: "Stockfish 16, głębokość 18–25, sprawdzone wszystkie główne obrony",
    id: "o1", ph: "open", c: "w", theme: "Pole bite przez piona",
    fen: "rn1qkbnr/ppp1pppp/4b3/8/2pP4/4P3/PP3PPP/RNBQKBNR w KQkq - 1 4",
    hist: ["d4","d5","c4","dxc4","e3","Be6"], last: { f: "c8", t: "e6" },
    opp: "galanitin", oe: 1466, me: 1439, date: "2026-11-17", url: "https://www.chess.com/game/live/187398207554", res: "L", mv: 4,
    my: "Qb3", eb: 76, ea: -1422,
    task: "Gambit Hetmański Przyjęty. Czarne zabrały piona c4 i bronią go gońcem z e6. Co grasz?",
    hint: "Zanim wyprowadzisz hetmana, sprawdź, które pola atakuje czarny pion c4.",
    best: ["Nc3","c6","a4","Nf6","e4"],
    ref: ["Qb3","cxb3","axb3"],
    whyBad: "Hetman na b3 atakuje piona c4 i piona b7, więc ruch wygląda kusząco. Ale pole b3 jest bite przez piona c4. Pion bije na ukos do przodu, czyli czarny pion z c4 bije na b3 albo d3. Po [[cxb3]] oddajesz hetmana za piona i partia jest przegrana. To najprostszy, ale u Ciebie najgroźniejszy typ błędu: stawiasz figurę na pole, którego nie sprawdziłeś.",
    whyGood: "[[Nc3]] rozwija figurę i przygotowuje [[e4]], czyli silne centrum. Piona c4 nie musisz odbierać natychmiast. Jeśli czarne będą go trzymać pionami ([[c6]], [[b5]]), osłabią swoje skrzydło hetmańskie, a ruch [[a4]] je podważy. Najpierw rozwój, potem odzyskanie piona.",
    look: ["Przed każdym ruchem zadaj pytanie: na jakie pole idę i kto je atakuje? Zacznij od pionów przeciwnika, bo ich atak najłatwiej przeoczyć.", "W Gambicie Przyjętym nie goń piona c4 hetmanem. Rozwój i centrum dają więcej.", "Hetman w otwarciu wychodzi późno, bo wystawiony za wcześnie staje się celem."]
  },
  {
    verified: "Stockfish 16, głębokość 18–25, sprawdzone wszystkie główne obrony",
    id: "o2", ph: "open", c: "w", theme: "Luźna figura za zasłoną",
    fen: "r1bq1rk1/pp3ppp/2nb1n2/4p1N1/Q1B5/2N1P3/PP3PPP/R1B1K2R w KQ - 4 11",
    hist: ["d4","d5","c4","dxc4","e3","Nf6","Bxc4","Nc6","Nc3","e5","d5","Na5","Qa4+","c6","dxc6","Nxc6","Nf3","Bd6","Ng5","O-O"], last: { f: "e8", t: "g8" },
    opp: "PastorJMV", oe: 1472, me: 1447, date: "2026-11-05", url: "https://www.chess.com/game/live/186598375112", res: "L", mv: 11,
    my: "Nd5", eb: 109, ea: -715,
    task: "Twój skoczek stoi na g5, a hetman na a4. Czarne właśnie zrobiły roszadę. Twój ruch.",
    hint: "Kto broni Twojego skoczka g5? Co się stanie, jeśli czarny skoczek f6 zniknie ze swojego pola?",
    best: ["O-O","Bf5","Be2"],
    ref: ["Nd5","Nxd5","Bxd5","Qxg5"],
    whyBad: "[[Nd5]] wygląda aktywnie, bo skoczek wchodzi do centrum. Spójrz jednak na skoczka g5: nikt go nie broni. Bezpieczny jest tylko dlatego, że czarny skoczek f6 zasłania hetmanowi d8 przekątną d8–e7–f6–g5. Po [[Nxd5]] skoczek f6 znika i przekątna się otwiera. Jeśli odbijesz [[Bxd5]], czarne grają [[Qxg5]] i są figurę do przodu. Silnik pokazuje, że jeszcze mocniejsze jest wtrącenie [[Bb4+]], ale wynik jest ten sam: tracisz figurę.",
    whyGood: "[[O-O]] chowa króla i łączy wieże. Czarne mają minimalnie lepszą pozycję, ale nie tracisz materiału i nie zostawiasz figury bez obrony. Twój skoczek g5 i hetman a4 stoją daleko od reszty figur, więc najpierw dokończ rozwój (roszada, goniec c1), a dopiero potem szukaj akcji.",
    look: ["Figury, których nikt nie broni, to pierwszy cel taktyki. Co kilka ruchów sprawdź: które moje figury stoją bez obrony?", "Gdy przeciwnik może zbić figurą, która coś zasłania, zapytaj: co się otworzy, gdy ona zniknie?", "W Gambicie Przyjętym masz wynik 4–0–10. W tych partiach często wcześnie wychodzisz hetmanem i skoczkiem, zanim zrobisz roszadę."]
  },
  {
    verified: "Stockfish 16, głębokość 18–25, sprawdzone wszystkie główne obrony",
    id: "o3", ph: "open", c: "w", theme: "Szach z widłami",
    fen: "rnbqk2r/p1p2ppp/1p2pn2/3p4/1bPP4/2N1PN2/PP3PPP/R1BQKB1R w KQkq - 0 6",
    hist: ["d4","e6","c4","d5","Nf3","Nf6","Nc3","Bb4","e3","b6"], last: { f: "b7", t: "b6" },
    opp: "DANDEYB", oe: 1517, me: 1556, date: "2026-07-09", url: "https://www.chess.com/game/live/171325599360", res: "W", mv: 6,
    my: "Qb3", eb: 477, ea: 29,
    task: "Czarne zagrały b6. Znajdź najmocniejszy ruch.",
    hint: "Czarny goniec b4 nie jest niczym broniony. Szukaj ruchu z szachem, który przy okazji go atakuje.",
    best: ["Qa4+","Nbd7","Qxb4"],
    ref: ["Qb3","c5"],
    whyBad: "[[Qb3]] też atakuje gońca b4, ale bez szachu. Czarne mają więc czas, żeby spokojnie się obronić, np. [[c5]], po którym pion c5 osłania b4. Okazja na wygranie figury przepadła. W partii i tak wygrałeś, ale silnik pokazuje, że mogłeś mieć figurę więcej już w 6. ruchu.",
    whyGood: "[[Qa4+]] daje szach przez pola b5, c6 i d7, a jednocześnie atakuje gońca b4 wzdłuż czwartego rzędu. Czarne muszą najpierw zasłonić króla ([[Nbd7]], [[Nc6]], [[c6]], [[Bd7]] albo [[Qd7]]), a potem [[Qxb4]] zabiera gońca. Najlepszą obroną czarnych jest zasłona [[Nc6]]. Wtedy nie bijesz od razu na b4, bo po [[Qxb4]] związanie znika i skoczek c6 zbiłby Twojego hetmana. Zamiast tego grasz [[Qxc6+]]: hetman bije skoczka z szachem. Skoczka c6 nic nie broni, bo czarne przed chwilą zagrały [[b6]] i pion z b7 przestał pilnować pola c6. Po [[Bd7]] hetman musi ustąpić gońcowi (np. [[Qb7]]), ale jesteś figurę do przodu. Dlatego ruch b6 był błędem czarnych. To są widły: jeden ruch z szachem i drugi cel, a obrona przed jednym zagrożeniem odsłania drugie.",
    alt: [{ label: "Jeśli czarne zasłonią się skoczkiem: Nc6", moves: ["Qa4+","Nc6","Qxc6+","Bd7","Qb7"] }],
    look: ["Figura bez obrony plus możliwy szach to sygnał, żeby szukać wideł.", "Szach to najsilniejsza groźba, bo przeciwnik musi na niego odpowiedzieć i nie ma czasu bronić drugiej figury.", "Przeglądaj pozycję w stałej kolejności: szachy, bicia, groźby. Najpierw swoje, potem przeciwnika."]
  },
  {
    verified: "Stockfish 16, głębokość 18–25, sprawdzone wszystkie główne obrony",
    id: "o4", ph: "open", c: "w", theme: "Kto bije pierwszy",
    fen: "r2qk1nr/2ppbppp/p3p3/n7/2BPbB2/P4N2/1P1N1PPP/2RQK2R w Kkq - 1 11",
    hist: ["d4","b5","e4","a6","Nf3","Bb7","Bd3","e6","Bf4","Nc6","c4","bxc4","Bxc4","Bb4+","Nbd2","Na5","Rc1","Bxe4","a3","Be7"], last: { f: "b4", t: "e7" },
    opp: "vijayanmm", oe: 1501, me: 1478, date: "2026-08-23", url: "https://www.chess.com/game/live/173408653134", res: "L", mv: 11,
    my: "O-O", eb: 522, ea: 4,
    task: "Czarne zbiły piona e4 i skoczkiem a5 atakują Twojego gońca c4. Twój ruch.",
    hint: "Pod biciem stoją dwie figury: Twoja i przeciwnika. Która jest broniona, a która nie?",
    best: ["Nxe4","Nxc4","Rxc4"],
    ref: ["O-O","Nxc4","Nxe4","Nd6"],
    whyBad: "Pod biciem stoją dwie figury: Twój goniec c4 (atakuje go skoczek a5) i czarny goniec e4 (atakuje go Twój skoczek d2). Roszada nie rozwiązuje żadnego z tych problemów. Czarne zbijają pierwsze, [[Nxc4]], i figury wymieniają się jedna za jedną. Zostajesz bez piona e4, choć mogłeś być figurę do przodu.",
    whyGood: "[[Nxe4]] zabiera gońca od razu, bo nikt go nie bronił. Jeśli czarne zbiją [[Nxc4]], odbijasz wieżą [[Rxc4]], bo linia c jest otwarta. Masz całą figurę więcej.",
    look: ["Gdy obie strony mają figury pod biciem, nie rób ruchu, który niczego nie rozstrzyga. Policz, kto zyska, jeśli zbije pierwszy.", "Sprawdzaj, czy figura przeciwnika jest broniona. Zbicie figury bez obrony to czysty zysk.", "Przed każdym ruchem zapytaj: czy coś wisi? Moje? Jego?"]
  },
  {
    verified: "Stockfish 16, głębokość 18–25, sprawdzone wszystkie główne obrony",
    id: "o5", ph: "open", c: "w", theme: "Napięcie w centrum",
    fen: "rn2kbnr/ppq1pppp/2p5/3p4/2PP2b1/1QN5/PP2PPPP/R1B1KBNR w KQkq - 4 5",
    hist: ["d4","d5","c4","c6","Nc3","Bg4","Qb3","Qc7"], last: { f: "d8", t: "c7" },
    opp: "street140", oe: 1440, me: 1457, date: "2026-11-04", url: "https://www.chess.com/game/live/186527512764", res: "W", mv: 5,
    my: "g3", eb: 279, ea: -4,
    task: "Czarne bronią piona b7 hetmanem z c7. Twój ruch.",
    hint: "Twój pion c4 i czarny pion d5 stoją naprzeciw siebie. Kto powinien zbić pierwszy?",
    best: ["cxd5","Nf6","e4"],
    ref: ["g3","dxc4","Qxc4"],
    alt: [{ label: "Jeśli czarne odbiją pionem", moves: ["cxd5","cxd5","Nxd5"] }],
    whyBad: "[[g3]] to ruch powolny. Napięcie w centrum (Twój pion c4 naprzeciw czarnego d5) wciąż trwa, a czarne mogą je rozładować na swoją korzyść: [[dxc4]] zbija piona i od razu atakuje Twojego hetmana na b3. Po [[Qxc4]] materiał jest równy, a przewaga znika.",
    whyGood: "[[cxd5]] rozstrzyga napięcie na Twoją korzyść. Jeśli czarne odbiją [[cxd5]], to [[Nxd5]]: skoczek bije piona i atakuje hetmana c7, więc zostajesz z pionem więcej. Dlatego silnik pokazuje, że czarne nie odbijają, tylko grają [[Nf6]], a Ty spokojnie zajmujesz centrum ruchem [[e4]].",
    look: ["Napięcie pionów (c4 naprzeciw d5) wymaga decyzji: kto zbije pierwszy i co z tego wyniknie?", "Jeśli przeciwnik może zbić z tempem, czyli przy okazji atakując Twojego hetmana, rozstrzygnij napięcie sam.", "Gdy czarne wcześnie wyprowadzą gońca c8, ich pion b7 jest słaby. Hetman na b3 lubi to wykorzystywać, ale dopiero po rozstrzygnięciu napięcia w centrum."]
  },
  {
    verified: "Stockfish 16, głębokość 18–25, sprawdzone wszystkie główne obrony",
    id: "o6", ph: "open", c: "b", theme: "Złap skoczka pionem",
    fen: "rnbqkb1r/ppp2ppp/5n2/1N6/2Pp4/6P1/PP1P1P1P/R1BQKBNR b KQkq - 1 6",
    hist: ["c4","e5","Nc3","Nf6","g3","d5","e3","d4","exd4","exd4","Nb5"], last: { f: "c3", t: "b5" },
    opp: "aaaditya237", oe: 1449, me: 1448, date: "2026-11-17", url: "https://www.chess.com/game/live/187397712446", res: "W", mv: 6,
    my: "Bd7", eb: 395, ea: -70,
    task: "Biały skoczek wskoczył na b5 i atakuje piona d4. Twój ruch.",
    hint: "Policz pola, na które skoczek b5 może uciec. Czy któryś pion może go przegonić?",
    best: ["c6","Na3","d3"],
    ref: ["Bd7","Nf3","Nc6","Bg2"],
    alt: [{ label: "Jeśli białe oddadzą skoczka za piona", moves: ["c6","Nxd4","Qxd4"] }],
    whyBad: "[[Bd7]] atakuje skoczka, ale skoczek b5 jest broniony pionem c4. Wymiana gońca na skoczka nic Ci nie daje, a białe spokojnie się rozwijają ([[Nf3]], [[Bg2]]). Pozycja jest mniej więcej równa, a mogłeś mieć dużo więcej.",
    whyGood: "[[c6]] przegania skoczka, a ten nie ma dobrego pola. Pola c7 i d4 broni Twój hetman, c3 bije pion d4, a d6 broni goniec f8 i hetman. Zostaje a3 na skraju planszy, ale wtedy [[d3]] wbija się w obóz białych i blokuje im gońca c1 oraz piona d2. Białe nie mają dobrego wyjścia: albo skoczek stoi bezużytecznie na a3, albo oddają go za piona ([[Nxd4]] [[Qxd4]]). Silnik ocenia obie drogi podobnie, na wyraźną przewagę czarnych (ok. 2 piony). Równie mocne jest [[a6]], które też przegania skoczka.",
    look: ["Figura daleko w obozie przeciwnika, bez wsparcia, często da się złapać pionem.", "Zanim zaatakujesz figurą, sprawdź, czy da się zaatakować pionem. Pion jest najtańszy i odbiera pola.", "Licz pola ucieczki. Dla każdego pola zapytaj, kto je atakuje."]
  },

  // ===== GRA ŚRODKOWA =====
  {
    verified: "Stockfish 16, głębokość 18–25, sprawdzone wszystkie główne obrony",
    id: "m1", ph: "mid", c: "b", theme: "Groźba mata",
    fen: "r3r1k1/ppn2p2/3R2pQ/4B3/4p1q1/2P5/PP4PP/3R2K1 b - - 11 26",
    hist: ["d4","d5","e3","c6","Bd3","Nf6","f4","Bg4","Nf3","e6","O-O","Bd6","Nbd2","O-O","Qe1","Re8","Qg3","Na6","c3","Nc7","Ne5","Bf5","Bxf5","exf5","Qh3","c5","Qxf5","cxd4","exd4","g6","Qh3","Ne4","Nxe4","dxe4","f5","Bxe5","dxe5","Rxe5","fxg6","hxg6","Bf4","Re7","Rad1","Qc8","Qh6","Qe6","Rd6","Qg4","Rfd1","Ree8","Be5"], last: { f: "f4", t: "e5" },
    opp: "Colonellawn", oe: 1561, me: 1556, date: "2026-07-10", url: "https://www.chess.com/game/live/171397835660", res: "L", mv: 26,
    my: "Ne6", eb: 455, ea: -9990,
    task: "Białe postawiły gońca na e5, tuż przed Twoim królem. Twój ruch.",
    hint: "Ile białych figur celuje w pola g7 i h8? Co się stanie, jeśli jedna z nich zniknie?",
    best: ["Rxe5","Qe3","Ne6"],
    ref: ["Ne6","Qh8#"],
    whyBad: "[[Ne6]] broni pola g7, bo zauważyłeś groźbę [[Qg7#]]. Białe mają jednak drugą drogę: [[Qh8#]]. Hetman h6 idzie linią h na h8, a goniec e5 broni tego pola po przekątnej e5–f6–g7–h8. Twój król nie ma dokąd uciec: pole f8 kontroluje hetman z h8, na f7 i g6 stoją Twoje piony, a g7 i h7 bije hetman.",
    whyGood: "[[Rxe5]] usuwa gońca, czyli jedyną figurę, która wspierała hetmana przy Twoim królu. Sam hetman h6 nie da mata: po [[Qh8+]] po prostu [[Kxh8]]. Do tego gońca dostajesz za darmo, bo nikt go nie bronił. Silnik ocenia, że jesteś wyraźnie lepszy.",
    look: ["Gdy hetman przeciwnika stoi blisko Twojego króla, policz, ile figur go wspiera. Usuń to wsparcie, a atak się rozpadnie.", "Sprawdź wszystkie szachy przeciwnika, nie tylko pierwszy, który zauważysz.", "Najlepsza obrona to często zbicie atakującej figury, a nie zasłanianie się."]
  },
  {
    verified: "Stockfish 16, głębokość 18–25, sprawdzone wszystkie główne obrony",
    id: "m2", ph: "mid", c: "w", theme: "Obrońca króla",
    fen: "4r1k1/2p3pp/p2p4/3P3n/2PN2b1/4p1q1/PP2Q1PN/6RK w - - 2 33",
    hist: ["e4","e5","Nf3","Nc6","Bb5","d6","c3","a6","Bxc6+","bxc6","d4","f6","O-O","Ne7","h3","Ng6","Re1","Be7","Be3","O-O","Nbd2","Be6","c4","f5","d5","cxd5","exd5","Bd7","Nf1","Qe8","Bg5","e4","Bxe7","Qxe7","Nd4","Qh4","Ne3","Nf4","Qd2","Qg5","Kh2","Nh5","Rg1","f4","Nec2","e3","Qe2","Rae8","Nf3","Qg6","Ncd4","exf2","Qxf2","Re3","Rae1","Rfe8","Rxe3","fxe3","Qe2","Qg3+","Kh1","Bxh3","Nh2","Bg4"], last: { f: "h3", t: "g4" },
    opp: "DoubleDotGambit", oe: 1511, me: 1486, date: "2026-08-26", url: "https://www.chess.com/game/live/173554296410", res: "L", mv: 33,
    my: "Nxg4", eb: -118, ea: -9980,
    task: "Czarny goniec przeszedł na g4 i atakuje Twojego hetmana. Twój ruch.",
    hint: "Możesz zbić gońca dwiema figurami. Która z nich pilnuje Twojego króla?",
    best: ["Qxg4","e2","Ndf3","Qxg4","Nxg4"],
    ref: ["Nxg4","Qh4+","Nh2","Ng3#"],
    whyBad: "[[Nxg4]] zbija gońca, ale skoczkiem z h2, a ten skoczek zamykał linię h przed Twoim królem. Po jego odejściu czarne grają [[Qh4+]]. Musisz się zasłonić [[Nh2]], a wtedy [[Ng3#]] to mat. Twój król na h1 jest zamurowany przez własne figury: wieżę g1, piona g2 i skoczka h2.",
    whyGood: "[[Qxg4]] bije gońca hetmanem, a skoczek h2 zostaje na straży króla. Najgroźniejsza odpowiedź czarnych to [[e2]]: pion idzie w stronę promocji. Ty grasz [[Ndf3]], skoczek zatrzymuje piona, a po [[Qxg4]] [[Nxg4]] hetmany i tak schodzą z planszy. Bez hetmanów czarne nie mają ataku na Twojego króla. Pozycja jest trudna (czarne stoją lepiej o mniej więcej piona), ale da się jej bronić, a mata już nie ma.",
    look: ["Zanim zbijesz jakąś figurą, zapytaj: co ta figura teraz broni?", "Gdy Twój król stoi w rogu za własnymi figurami, uważaj na szachy po linii i na skoczki. Mat w rogu zdarza się bardzo często.", "W obronie wymiana hetmanów jest Twoim sprzymierzeńcem."]
  },
  {
    verified: "Stockfish 16, głębokość 18–25, sprawdzone wszystkie główne obrony",
    id: "m3", ph: "mid", c: "w", theme: "Usuń obrońcę",
    fen: "2r5/p3kp2/np1q4/3pNp1p/1P1Rb3/P3P3/3QBPrP/3R1K2 w - - 2 25",
    hist: ["d4","e6","c4","Nf6","Nc3","b6","Nf3","Bb4","Qc2","Bb7","Bg5","d6","Rd1","Qd7","Bxf6","gxf6","e3","Na6","a3","Bxc3+","Qxc3","Ke7","Be2","Rag8","O-O","c5","dxc5","Nxc5","Qc2","Be4","Qc1","h5","b4","Na6","Rd4","f5","Rfd1","d5","cxd5","exd5","Qc3","Rc8","Qd2","Rhg8","Ne5","Rxg2+","Kf1","Qd6"], last: { f: "d7", t: "d6" },
    opp: "lorscheidersoares", oe: 1553, me: 1548, date: "2026-08-02", url: "https://www.chess.com/game/live/172442279720", res: "W", mv: 25,
    my: "f3", eb: 362, ea: -475,
    task: "Czarna wieża wtargnęła na g2, a hetman z d6 atakuje Twojego skoczka e5. Twój ruch.",
    hint: "Twój król atakuje wieżę g2. Kto ją broni?",
    best: ["Rxe4","Rxf2+","Kxf2"],
    ref: ["f3","Rxh2","Rxd5"],
    alt: [{ label: "Jeśli czarne odbiją pionem f5", moves: ["Rxe4","fxe4","Kxg2"] }],
    whyBad: "[[f3]] atakuje gońca e4 pionem, ale niczego nie zbija. Czarne mogą np. odpowiedzieć [[Rxh2]]: wieża bierze piona i ucieka z g2. Do tego Twój skoczek e5 dalej stoi pod biciem hetmana. Silnik pokazuje, że po tym ruchu czarne są wyraźnie lepsze.",
    whyGood: "Wieżę g2 broni tylko goniec e4 (przekątna e4–f3–g2), a Twój król na f1 już ją atakuje. [[Rxe4]] usuwa tego obrońcę. Jeśli czarne odbiją [[dxe4]], otwiera się linia d i [[Qxd6+]] wygrywa hetmana. Po [[fxe4]] grasz [[Kxg2]] i masz wyraźną przewagę. Najlepsze, co mają czarne, to [[Rxf2+]] [[Kxf2]], ale i tak zostają z mniejszą liczbą figur. Przy okazji wieża e4 broni Twojego skoczka e5.",
    look: ["Jeśli figura przeciwnika jest broniona tylko raz, zbij jej obrońcę.", "Zanim zagrasz pionem, który tylko atakuje, sprawdź, czy nie możesz od razu czegoś zbić.", "Licz: ile razy atakuję, a ile razy przeciwnik broni?"]
  },
  {
    verified: "Stockfish 16, głębokość 18–25, sprawdzone wszystkie główne obrony",
    id: "m4", ph: "mid", c: "w", theme: "Wisząca wieża",
    fen: "4r3/1b6/p6k/1pP1nBRP/8/P7/5Pn1/3R2K1 w - - 9 34",
    hist: ["d4","g6","c4","d5","Nc3","dxc4","e4","e6","Bxc4","Be7","Nf3","Nf6","Bg5","O-O","e5","Nfd7","Ne4","a6","O-O","b5","Bb3","c5","dxc5","Bxg5","Nfxg5","Nxe5","Qxd8","Rxd8","Nf6+","Kg7","Nfxh7","Rh8","h4","Rxh7","Nxh7","Kxh7","Rad1","Nbc6","Rd6","Bb7","a3","Kh6","Bd1","Nc4","Rd7","Rb8","Rxf7","Nxb2","Rf6","Nd4","Bg4","Nf5","h5","Nh4","Rxe6","Nxg2","Rxg6+","Kh7","Rb1","Nc4","Rd1","Ne5","Rg5","Re8","Bf5+","Kh6"], last: { f: "h7", t: "h6" },
    opp: "manmath0000", oe: 1522, me: 1521, date: "2026-08-12", url: "https://www.chess.com/game/live/172892706750", res: "L", mv: 34,
    my: "Rd6+", eb: 247, ea: -748,
    task: "Po Twoim szachu gońcem czarny król przeszedł na h6. Twój ruch.",
    hint: "Na co teraz patrzy czarny król?",
    best: ["Rxg2","Bxg2","Kxg2"],
    ref: ["Rd6+","Kxg5"],
    whyBad: "Szach wygląda groźnie, ale czarny król po prostu zbija Twoją wieżę: [[Kxg5]]. Wieża g5 stała tuż obok króla i nikt jej nie bronił, więc po przejściu króla na h6 znalazła się pod biciem. Szach tego nie zmienia, bo król ucieka z szachu właśnie biciem.",
    whyGood: "[[Rxg2]]: wieża schodzi z zagrożonego pola i od razu zabiera skoczka g2. Czarne mogą odbić [[Bxg2]], a Ty [[Kxg2]]. W sumie oddałeś wieżę za skoczka i gońca. Zostajesz z wieżą i gońcem przeciwko wieży i skoczkowi, z dwoma pionami więcej, a silnik ocenia to na przewagę białych.",
    look: ["Po każdym ruchu króla przeciwnika zapytaj: co ten król teraz atakuje? Król też bije.", "Szach nie jest dobry tylko dlatego, że jest szachem. Liczy się to, co stanie się po odpowiedzi przeciwnika.", "Jeśli Twoja figura jest atakowana, najpierw ją ratuj, najlepiej ruchem, który coś zbija."]
  },
  {
    verified: "Stockfish 16, głębokość 18–25, sprawdzone wszystkie główne obrony",
    id: "m5", ph: "mid", c: "b", theme: "Związanie",
    fen: "r4rk1/pp3pp1/3q1n1p/2nP4/1B4b1/P3PN2/2Q1BPPP/1R1R2K1 b - - 6 20",
    hist: ["d4","d5","c4","e6","Nc3","Bb4","a3","Bxc3+","bxc3","Nf6","e3","c6","Nf3","Nbd7","Bd3","O-O","O-O","Qa5","Qc2","h6","Bd2","Qc7","cxd5","exd5","c4","Qd6","Bb4","c5","dxc5","Nxc5","Rfd1","Qe6","cxd5","Qb6","Bc4","Bg4","Rab1","Qd6","Be2"], last: { f: "c4", t: "e2" },
    opp: "murrayjo", oe: 1524, me: 1502, date: "2026-08-21", url: "https://www.chess.com/game/live/173337150670", res: "L", mv: 20,
    my: "Nce4", eb: -118, ea: -970,
    task: "Białe cofnęły gońca na e2. Twój ruch.",
    hint: "Spójrz na przekątną b4–c5–d6. Co by się stało, gdyby skoczek c5 się ruszył?",
    best: ["Rfc8","h3","Bd7"],
    ref: ["Nce4","Bxd6","Nxd6"],
    whyBad: "Skoczek c5 stał na linii między gońcem b4 a Twoim hetmanem d6. To związanie: dopóki skoczek tam stoi, goniec nie widzi hetmana. Po [[Nce4]] linia się otwiera i [[Bxd6]] zabiera hetmana. Dostajesz za niego tylko gońca.",
    whyGood: "[[Rfc8]] dokłada obronę skoczka c5 wieżą po otwartej linii c. Najważniejsze, że skoczek zostaje na miejscu, więc hetman jest dalej zasłonięty. Pozycja jest trochę gorsza (białe mają silnego piona d5 i nacisk na skoczka c5), ale zachowujesz hetmana i możesz walczyć.",
    look: ["Gdy Twoja figura stoi między figurą przeciwnika a Twoją cenniejszą figurą (hetmanem, królem), jest związana. Zanim nią ruszysz, sprawdź, co odsłonisz.", "Gońce i wieże działają na całej linii. Patrz na całe przekątne, nie tylko na sąsiednie pola.", "Hetman na jednej przekątnej z gońcem przeciwnika to sygnał alarmowy."]
  },
  {
    verified: "Stockfish 16, głębokość 18–25, sprawdzone wszystkie główne obrony",
    id: "m6", ph: "mid", c: "b", theme: "Pułapka na hetmana",
    fen: "2r1k2r/pb2nppp/3bpq2/3p4/1P6/2PB1N2/P2B1PPP/2RQ1RK1 b k - 4 14",
    hist: ["e4","c5","Nf3","e6","d4","cxd4","Nxd4","Nc6","Nxc6","bxc6","Bd3","d5","exd5","cxd5","Nd2","Bc5","c3","Qf6","Nf3","Ne7","O-O","Bb7","b4","Bd6","Bd2","Rc8","Rc1"], last: { f: "a1", t: "c1" },
    opp: "Jnova9271", oe: 1407, me: 1448, date: "2026-11-17", url: "https://www.chess.com/game/live/187398265116", res: "W", mv: 14,
    my: "Ng6", eb: 39, ea: -828,
    task: "Białe postawiły wieżę na c1. Twój ruch.",
    hint: "Gdyby biały goniec stanął na g5, dokąd uciekłby Twój hetman f6?",
    best: ["e5","Bg5","Qe6"],
    ref: ["Ng6","Bg5","Qxg5","Nxg5"],
    whyBad: "[[Ng6]] wygląda naturalnie, bo skoczek idzie bliżej króla. Zabiera jednak ostatnie dobre pole Twojemu hetmanowi f6. Po [[Bg5]] goniec atakuje hetmana, a ten nie ma ucieczki: pola e7 i d8 leżą na tej samej przekątnej co goniec, e5 bije skoczek f3, f5 goniec d3, a na g6 stoi Twój skoczek. Musisz oddać hetmana za gońca: [[Qxg5]] [[Nxg5]].",
    whyGood: "[[e5]] zajmuje centrum i, co najważniejsze, zwalnia Twojemu hetmanowi pole e6. Teraz nawet [[Bg5]] nie łapie hetmana, bo ucieknie na [[Qe6]]. Pozycja pozostaje równa. Dobrym ruchem było też [[h6]], które zabiera gońcowi pole g5, ale silnik nieco wyżej ocenia [[e5]].",
    look: ["Hetman stojący przed własnymi pionami i figurami łatwo traci pola ucieczki. Co kilka ruchów sprawdź: dokąd ucieknie, jeśli zostanie zaatakowany?", "Gdy przeciwnik może zaatakować Twojego hetmana (tu Bd2–g5), masz dwie drogi: daj hetmanowi pole ucieczki (e5 zwalnia e6) albo zabierz napastnikowi pole pionem (h6).", "Każdy ruch figury zmienia, które pola są wolne dla pozostałych. Myśl o wszystkich swoich figurach naraz."]
  },
  {
    verified: "Stockfish 16, głębokość 18–25, sprawdzone wszystkie główne obrony",
    id: "m7", ph: "mid", c: "w", theme: "Najpierw odbij",
    fen: "r2q1rk1/3nbpp1/pp2pn1p/2p1P3/2P4B/2NB1b2/PPQ2PPP/2KR3R w - - 0 14",
    hist: ["d4","Nf6","c4","b6","Nc3","Bb7","Bg5","e6","Nf3","Be7","e3","h6","Bh4","d6","Bd3","Nbd7","Qc2","a6","O-O-O","O-O","e4","c5","e5","dxe5","dxe5","Bxf3"], last: { f: "b7", t: "f3" },
    opp: "DANCHRIS172", oe: 1549, me: 1532, date: "2026-08-03", url: "https://www.chess.com/game/live/172476688258", res: "L", mv: 14,
    my: "Bxf6", eb: 104, ea: -430,
    task: "Czarny goniec zbił Twojego skoczka na f3. Twój ruch.",
    hint: "Co atakuje czarny goniec f3, jeśli zostawisz go na planszy?",
    best: ["gxf3","Nh5","Bg3"],
    ref: ["Bxf6","Bxd1","Qxd1"],
    whyBad: "[[Bxf6]] zbija skoczka, ale zostawia na planszy czarnego gońca f3, który atakuje Twoją wieżę d1 (przekątna f3–e2–d1). Czarne grają [[Bxd1]], czyli ruch pośredni: zamiast od razu odbijać na f6, najpierw zabierają wieżę. Po [[Qxd1]] Twój goniec f6 i tak zostanie zbity, a w sumie tracisz wieżę.",
    whyGood: "[[gxf3]] po prostu odbija figurę i materiał wraca do równowagi. Czarny skoczek f6 dalej jest atakowany przez piona e5, więc musi odejść ([[Nh5]]). Otwiera się też linia g dla Twojej wieży h1, co przy długiej roszadzie pomaga w ataku.",
    look: ["Gdy przeciwnik zbije Twoją figurę, najpierw sprawdź, czy możesz ją odbić i co jego figura zaatakuje, jeśli jej nie zbijesz.", "Ruch pośredni: zanim odbijesz, przeciwnik może wtrącić bicie albo szach. Ty też możesz tak grać, ale licz dokładnie.", "Figura, która właśnie coś zbiła, często stoi bez obrony i atakuje kolejny cel."]
  },
  {
    verified: "Stockfish 16, głębokość 18–25, sprawdzone wszystkie główne obrony",
    id: "m8", ph: "mid", c: "w", theme: "Hetman związany z królem",
    fen: "5rk1/pbrn1pbp/4pnp1/qp4B1/3P3P/PBNQ1N2/1P3PP1/1K1R3R w - - 5 17",
    hist: ["d4","c6","c4","d5","Nc3","g6","Nf3","Bg7","Bg5","Nf6","e3","e6","Bd3","dxc4","Bxc4","O-O","Qc2","Nbd7","O-O-O","Qa5","h4","b5","Bb3","c5","a3","cxd4","exd4","Bb7","Qd3","Rac8","Kb1","Rc7"], last: { f: "c8", t: "c7" },
    opp: "SKYASHURAGI", oe: 1564, me: 1540, date: "2026-08-02", url: "https://www.chess.com/game/live/172415602684", res: "L", mv: 17,
    my: "Nxb5", eb: 9, ea: -625,
    task: "Czarna wieża przeszła na c7. Twój ruch.",
    hint: "Twój król na b1 i hetman na d3 stoją na jednej przekątnej. Która figura pilnuje pola e4?",
    best: ["Qxb5","Qxb5","Nxb5"],
    ref: ["Nxb5","Be4","Nxc7","Bxd3+","Rxd3","Qxc7"],
    whyBad: "[[Nxb5]] zbija piona i atakuje wieżę c7, więc wygląda kusząco. Ale skoczek c3 pilnował pola e4. Po jego odejściu czarny goniec idzie na [[Be4]] i wiąże Twojego hetmana: hetman d3 stoi na przekątnej e4–d3–c2–b1, tuż przed Twoim królem. Hetman nie może uciec, a jeśli zbije gońca [[Qxe4]], odbija skoczek f6. Tracisz hetmana.",
    whyGood: "[[Qxb5]] zbija piona hetmanem. Czarne wymieniają hetmany [[Qxb5]] [[Nxb5]] i masz piona więcej. Czarne mają w zamian aktywne figury, więc pozycja jest mniej więcej równa, ale bez katastrofy.",
    look: ["Jeśli Twój król i hetman stoją na jednej linii (tu przekątna b1–h7), każdy goniec przeciwnika, który może na nią wejść, to śmiertelne zagrożenie.", "Zanim zbijesz figurą, sprawdź, jakich pól ona pilnowała.", "Po długiej roszadzie, z królem na b1, pilnuj przekątnej b1–h7 i linii b."]
  },
  {
    verified: "Stockfish 16, głębokość 18–25, sprawdzone wszystkie główne obrony",
    id: "m9", ph: "mid", c: "b", theme: "Widły skoczkiem",
    fen: "5rk1/ppp3pp/n4p2/3p1Q2/2qPr1N1/2P1P3/PP1N2PP/4R1K1 b - - 2 19",
    hist: ["d4","d5","e3","e6","Nf3","Nc6","Bb5","Bb4+","Bd2","Bxd2+","Nbxd2","Bd7","O-O","Nb4","Bxd7+","Qxd7","Nb3","Ne7","c3","Na6","Ne5","Qa4","f4","O-O","f5","Nxf5","Qh5","f6","Ng4","Qc4","Rae1","Rae8","Rxf5","exf5","Qxf5","Re4","Nd2"], last: { f: "b3", t: "d2" },
    opp: "jualca07", oe: 1521, me: 1522, date: "2026-08-10", url: "https://www.chess.com/game/live/172799432660", res: "L", mv: 19,
    my: "Rxe3", eb: -19, ea: -790,
    task: "Biały skoczek wskoczył na d2. Twój ruch.",
    hint: "Sprawdź wszystkie pola, które atakuje skoczek d2.",
    best: ["Qxa2","Nxe4","dxe4"],
    ref: ["Rxe3","Rxe3"],
    whyBad: "Skoczek d2 atakuje naraz dwie Twoje figury: hetmana c4 i wieżę e4. To widły. [[Rxe3]] zbija piona, ale wieżę e3 broni wieża e1, więc po [[Rxe3]] tracisz wieżę za piona, a Twój hetman dalej stoi pod biciem.",
    whyGood: "Ratuj najcenniejszą figurę i zabierz coś po drodze: [[Qxa2]], czyli hetman ucieka i bierze piona. Wieżę e4 i tak oddasz za skoczka ([[Nxe4]] [[dxe4]]), ale wcześniej byłeś o jakość do przodu (wieża za skoczka). Po tej wymianie materiał się wyrównuje (masz nawet piona więcej), a silnik ocenia pozycję jako równą.",
    look: ["Po każdym ruchu skoczka przeciwnika sprawdź wszystkie pola, które atakuje. Widły skoczkiem to najczęstsza taktyka na Twoim poziomie.", "Gdy atakowane są dwie figury, ratuj cenniejszą, najlepiej z biciem albo z szachem.", "Nie bierz piona w pośpiechu, jeśli coś Twojego stoi pod biciem."]
  },

  // ===== KOŃCÓWKA =====
  {
    verified: "Stockfish 16, głębokość 18–25, sprawdzone wszystkie główne obrony",
    id: "e1", ph: "end", c: "b", theme: "Król na skraju planszy",
    fen: "8/R6p/2r1pppk/8/6PP/4PK2/5P2/2b5 b - - 0 39",
    hist: ["d4","d5","c4","e6","Nf3","Nf6","g3","g6","Bg2","Bg7","O-O","O-O","Nc3","c6","Bg5","Nbd7","Ne5","Qc7","cxd5","Nxe5","dxe5","Qxe5","Bxf6","Qxf6","dxc6","bxc6","Rb1","Bb7","Ne4","Qe5","Qb3","Rab8","Rfd1","c5","Qe3","Bxe4","Bxe4","Rxb2","Rxb2","Qxb2","Qxc5","Qxa2","e3","Qe2","Rf1","Qg4","Bg2","Qa4","Rc1","a6","Bc6","Qa2","Qc4","Qxc4","Rxc4","Rc8","Kf1","a5","Ke1","a4","Rxa4","Rxc6","Ra8+","Bf8","Kf1","Kg7","h4","Bb4","Kg2","Bd2","Ra2","Bc1","Kf3","f6","Ra7+","Kh6","g4"], last: { f: "g3", t: "g4" },
    opp: "rteryio", oe: 1501, me: 1470, date: "2026-08-30", url: "https://www.chess.com/game/live/173733690878", res: "L", mv: 39,
    my: "f5", eb: 394, ea: -9980,
    task: "Masz gońca więcej. Białe zagrały g4. Twój ruch.",
    hint: "Twój król stoi na skraju, a biała wieża kontroluje 7. rząd. Które pole broni pion f6?",
    best: ["g5","hxg5+","fxg5","Ke2","Kg6"],
    ref: ["f5","g5+","Kh5","Rxh7#"],
    whyBad: "[[f5]] wygląda aktywnie, bo atakujesz piona g4. Ale pion f6 bronił pola g5. Po [[f5]] białe grają [[g5+]]: pion daje szach, a broni go pion h4. Król musi iść na h5, bo pole g7 kontroluje wieża a7. Wtedy [[Rxh7#]] to mat. Twój król na skraju planszy, odcięty wieżą na 7. rzędzie, nie miał wolnych pól.",
    whyGood: "[[g5]] pcha piona do przodu i otwiera Twojemu królowi pole g6. Po [[hxg5+]] [[fxg5]] król stoi bezpiecznie, a z gońcem więcej to Ty grasz o wygraną. Silnik równie wysoko ocenia spokojne ruchy gońcem ([[Bb2]], [[Bd2]]). Najważniejsze, żeby nie ruszać piona f6, który pilnuje pola g5.",
    look: ["W końcówce wieża przeciwnika na Twoim 7. rzędzie odcina króla. Jeśli Twój król stoi na skraju, najpierw zrób mu miejsce.", "Przed ruchem pionem obok własnego króla zapytaj: które pole przestaje być bronione?", "Z przewagą materialną najważniejsze jest bezpieczeństwo. Przeciwnik szuka już tylko mata albo pata."]
  },
  {
    verified: "Stockfish 16, głębokość 18–25, sprawdzone wszystkie główne obrony",
    id: "e2", ph: "end", c: "w", theme: "Otwarta linia do króla",
    fen: "7k/p1R2R1p/1p2p2r/3p4/3P1P1q/6r1/PPQ4P/6K1 w - - 0 26",
    hist: ["d4","d5","c4","c6","Nf3","Bg4","Qb3","Bxf3","exf3","b6","Nc3","e6","cxd5","cxd5","Bb5+","Nd7","O-O","Nf6","Re1","Bd6","Bg5","O-O","Bxd7","Qxd7","Bxf6","gxf6","Nb5","Kh8","Rac1","Rg8","Nxd6","Qxd6","Rc2","Rg6","Rec1","Rh6","g3","f5","Rc7","f4","Rxf7","fxg3","fxg3","Rg8","f4","Qd8","Rcc7","Qh4","Qc2","Rxg3+"], last: { f: "g8", t: "g3" },
    opp: "Debasish_Sarkar", oe: 1498, me: 1510, date: "2026-08-21", url: "https://www.chess.com/game/live/173305268926", res: "W", mv: 26,
    my: "hxg3", eb: 158, ea: -9940,
    task: "Czarna wieża zbiła na g3 z szachem. Jak odpowiesz?",
    hint: "Co się stanie z linią h, jeśli zbijesz wieżę pionem h2?",
    best: ["Kh1","Rg8","Qe2"],
    ref: ["hxg3","Qxg3+","Qg2","Qe1+","Qf1","Rg6+","Kh2","Qg3+"],
    whyBad: "Odbicie [[hxg3]] wygląda oczywiście, bo wieża jest za darmo. Ale pion h2 był ostatnią zasłoną Twojego króla. Po [[hxg3]] czarne grają [[Qxg3+]], a po otwartej linii h dołącza wieża h6. Przy najlepszej grze czarnych to mat w kilku ruchach. W partii przeciwnik tego nie znalazł, więc miałeś szczęście.",
    whyGood: "[[Kh1]] chowa króla w rogu, a pion h2 dalej zasłania linię h. Wieża g3 nadal stoi pod biciem piona h2, więc czarne muszą ją cofnąć ([[Rg8]]). Twoje dwie wieże na 7. rzędzie zostają groźne, a Twój król jest bezpieczny.",
    look: ["Zanim odbijesz figurę obok własnego króla, sprawdź, które linie się otworzą.", "Ofiara figury przy Twoim królu to sygnał, że przeciwnik coś policzył. Policz i Ty, przynajmniej wszystkie szachy.", "Gdy masz atak (tu wieże na 7. rzędzie), nie musisz brać wszystkiego. Wystarczy, że nie dasz się zamatować."]
  },
  {
    verified: "Stockfish 16, głębokość 18–25, sprawdzone wszystkie główne obrony",
    id: "e3", ph: "end", c: "b", theme: "Szach po przekątnej",
    fen: "8/3n2k1/3q2p1/7p/7P/5PP1/1Q3PK1/8 b - - 23 52",
    hist: [], last: { f: "b7", t: "b2" }, lastSan: "Qb2+",
    opp: "robobobobobobob", oe: 1593, me: 1556, date: "2026-08-01", url: "https://www.chess.com/game/live/172374802866", res: "L", mv: 52,
    my: "Kh6", eb: 177, ea: -9990,
    task: "Masz skoczka za dwa piony. Biały hetman daje szach z b2. Jak się bronisz?",
    hint: "Hetman działa wzdłuż całej przekątnej b2–h8. Gdzie może stanąć w następnym ruchu?",
    best: ["Kh7","Qb7","Kg7"],
    ref: ["Kh6","Qh8#"],
    alt: [{ label: "Też dobre: zasłona hetmanem", moves: ["Qe5","Qb3"] }],
    whyBad: "[[Kh6]] schodzi z przekątnej, ale prosto w matową sieć: [[Qh8#]]. Hetman idzie dalej tą samą przekątną b2–h8. Król na h6 nie ma pól: g7 i h7 bije hetman, g5 pion h4, a na h5 i g6 stoją Twoje piony.",
    whyGood: "[[Kh7]] chowa króla za pionami g6 i h5. Pole h8 sąsiaduje teraz z Twoim królem, więc hetman nie może tam wejść z matem, bo zostałby zbity. Równie dobre są [[Kf7]], [[Kg8]] i zasłona hetmanem [[Qe5]]. Każdy z tych ruchów utrzymuje Twoją lekką przewagę (skoczek za dwa piony). Jedyny przegrywający ruch to wejście królem na h6.",
    look: ["Przy szachu hetmanem nie uciekaj królem na skraj planszy. Sprawdź, czy hetman nie stanie na sąsiednim polu z matem.", "Przy szachu wybieraj pole, na którym król jest osłonięty pionami i ma kontrolę nad sąsiednimi polami.", "W końcówkach hetmańskich policz każdy szach przeciwnika aż do końca."]
  },
  {
    verified: "Stockfish 16, głębokość 18–25, sprawdzone wszystkie główne obrony",
    id: "e4", ph: "end", c: "w", theme: "Obrona z daleka",
    fen: "3q2k1/p4pn1/7Q/3P2p1/8/8/PP3PP1/5R1K w - - 1 28",
    hist: ["d4","d5","c4","e6","Nc3","Nc6","Nf3","Nge7","Bg5","h6","Bh4","g5","Bg3","Nf5","cxd5","exd5","Be5","Nxe5","Nxe5","Bd6","e4","dxe4","Bb5+","c6","Nxc6","bxc6","Bxc6+","Bd7","Bxa8","Qxa8","Rc1","O-O","O-O","Qb8","Nxe4","Bxh2+","Kh1","Bf4","Nf6+","Kg7","Nxd7","Qd8","Nxf8","Bxc1","Qxc1","Qxf8","Qc3","Kh8","d5+","Ng7","Qf6","Kg8","Qxh6","Qd8"], last: { f: "f8", t: "d8" },
    opp: "Bob_Vampire", oe: 1491, me: 1495, date: "2026-08-19", url: "https://www.chess.com/game/live/173213187344", res: "L", mv: 28,
    my: "Qxg5", eb: 648, ea: -1040,
    task: "Masz wieżę za skoczka i groźnego piona d5. Czarny hetman przeszedł na d8. Twój ruch.",
    hint: "Kto broni piona g5? Spójrz na całą przekątną od czarnego hetmana.",
    best: ["Qc6","Kh7","d6","Ne6","d7"],
    ref: ["Qxg5","Qxg5"],
    whyBad: "[[Qxg5]] bierze piona, ale pion g5 był broniony przez hetmana d8 po przekątnej d8–e7–f6–g5. Po [[Qxg5]] tracisz hetmana za piona i partia się odwraca.",
    whyGood: "[[Qc6]]: hetman wspiera Twojego wolnego piona d5 w drodze do promocji. Plan jest prosty: d6 i d7 z pomocą hetmana. Czarne nie są w stanie jednocześnie zatrzymać piona i bronić króla. Równie mocne jest [[Rd1]]: wieża staje za wolnym pionem (to jedna z zasad końcówek).",
    look: ["Hetman przeciwnika broni z daleka. Sprawdzaj całe przekątne i linie, nie tylko sąsiednie pola.", "Przy dużej przewadze nie zbieraj pionów przy okazji. Graj według planu: wolny pion do przodu.", "Przed każdym biciem zapytaj: kto broni tej bierki?"]
  },
  {
    verified: "Stockfish 16, głębokość 18–25, sprawdzone wszystkie główne obrony",
    id: "e5", ph: "end", c: "b", theme: "Odsłonięta przekątna",
    fen: "6k1/5p1p/6pn/8/8/5BP1/r4B2/6K1 b - - 3 33",
    hist: ["e4","c5","d3","Nf6","Nc3","e6","Nf3","Nc6","g3","Bd6","Bg2","O-O","O-O","Bc7","Re1","d5","exd5","exd5","Nb5","Bb6","Nc3","Bg4","Qd2","Re8","b3","Bxf3","Bxf3","Nd4","Bg2","Rxe1+","Qxe1","Nxc2","Qd2","Nxa1","Qb2","Nxb3","Qxb3","c4","dxc4","dxc4","Qxc4","Rc8","Qb3","Bxf2+","Kxf2","Qd4+","Be3","Qxc3","Qxc3","Rxc3","Bxa7","Rc2+","Kg1","Rxa2","Bd4","Ng4","Bxb7","Nxh2","Be3","Ng4","Bd4","g6","Bf3","Nh6","Bf2"], last: { f: "d4", t: "f2" },
    opp: "Hadi_saleki", oe: 1459, me: 1478, date: "2026-08-30", url: "https://www.chess.com/game/live/173731267136", res: "D", mv: 33,
    my: "f5", eb: 454, ea: -203,
    task: "Masz wieżę i skoczka przeciwko dwóm gońcom. Białe zagrały Bf2. Twój ruch.",
    hint: "Twój król g8 i Twoja wieża a2 stoją na jednej przekątnej. Co je rozdziela?",
    best: ["Kg7","Kf1","f6"],
    ref: ["f5","Bd5+","Kf8"],
    whyBad: "[[f5]] odsuwa piona sprzed króla i otwiera przekątną a2–g8. Białe grają [[Bd5+]]: szach, a ten sam goniec atakuje Twoją wieżę a2 (przekątna d5–c4–b3–a2). To widły gońcem. Po ucieczce królem tracisz wieżę. Partia skończyła się remisem, choć była wygrana.",
    whyGood: "[[Kg7]] zdejmuje króla z przekątnej a2–g8, na której groziły mu widły, i przybliża go do centrum. Nie musisz się spieszyć: przewaga jest po Twojej stronie.",
    look: ["Król i wieża na jednej przekątnej (tu a2–g8) to zaproszenie do wideł gońcem. Rozdziel je.", "Ruch pionem sprzed króla może otworzyć linię. Sprawdź, czyje figury na nią wejdą.", "W wygranej końcówce najpierw zadbaj o bezpieczeństwo króla i figur, potem o piony."]
  },
  {
    verified: "Stockfish 16, głębokość 18–25, sprawdzone wszystkie główne obrony",
    id: "e6", ph: "end", c: "w", theme: "Sam się związałeś",
    fen: "2r5/4kp2/4ppb1/pPN4p/7P/P1K1R3/5PP1/8 w - - 1 37",
    hist: ["d4","d5","c4","dxc4","e3","Nf6","Bxc4","e6","Nf3","c5","Nc3","cxd4","Qxd4","Qxd4","Nxd4","Bb4","Bd2","Bd7","a3","Ba5","b4","Bb6","O-O","Bxd4","exd4","Nc6","Nb5","O-O","Bc3","a6","Nd6","b5","d5","bxc4","dxc6","Bxc6","Bxf6","gxf6","Nxc4","Bb5","Rfc1","Kh8","Nd6","Rad8","Rd1","Kg7","Rac1","Be2","Rd2","Bh5","Rc3","Rg8","Rg3+","Bg6","h4","h5","Kf1","Kf8","Ke1","Ke7","Nb7","Rxd2","Kxd2","Rb8","Nc5","Rd8+","Kc3","Ra8","Re3","a5","b5","Rc8"], last: { f: "a8", t: "c8" },
    opp: "ciberal", oe: 1534, me: 1513, date: "2026-08-13", url: "https://www.chess.com/game/live/172941778646", res: "L", mv: 37,
    my: "Kc4", eb: 150, ea: -366,
    task: "Czarna wieża przeszła na c8 i atakuje Twojego skoczka c5. Twój ruch.",
    hint: "Możesz bronić skoczka królem z dwóch pól. Na którym z nich król stanie na jednej linii z wieżą c8?",
    best: ["Kd4"],
    alt: [{ label: "Jeśli czarny król zaatakuje skoczka: Kd6", moves: ["Kd4","Kd6","Nb7+"] }],
    ref: ["Kc4","Kd6","Kb3","Rxc5"],
    whyBad: "[[Kc4]] broni skoczka królem, ale król staje na linii c razem ze skoczkiem i wieżą czarnych. Skoczek jest teraz związany: gdyby się ruszył, Twój król byłby w szachu. Czarne podchodzą królem [[Kd6]] i atakują skoczka dwa razy (król i wieża). Ty bronisz go raz i nie możesz nim uciec, więc skoczek pada.",
    whyGood: "[[Kd4]] też broni skoczka, ale z boku, poza linią wieży. Skoczek zostaje wolny: jeśli czarny król go zaatakuje ([[Kd6]]), skoczek odskakuje z szachem [[Nb7+]]. Pozycja zostaje mniej więcej równa, a po [[Kc4]] przegrywasz skoczka.",
    look: ["Nie stawiaj króla na linii z wieżą przeciwnika, jeśli między wami stoi Twoja figura. Sam ją wtedy wiążesz.", "W końcówce figura broniona przez króla musi zachować swobodę ruchu.", "Licz: ile razy figura jest atakowana, ile razy broniona i czy może uciec."]
  },
  {
    verified: "Stockfish 16, głębokość 18–25, sprawdzone wszystkie główne obrony",
    id: "e7", ph: "end", c: "w", theme: "Wolny pion – pchaj!",
    fen: "6k1/6pp/1r1NP3/2rpp2b/8/1P2P3/P2R2PP/5RK1 w - - 0 30",
    hist: ["d4","d5","c4","Nf6","Nc3","Nc6","Nf3","Bg4","Qb3","e6","Bg5","Be7","Qxb7","Na5","Qb5+","c6","Qa4","O-O","Bxf6","Bxf6","cxd5","cxd5","Ne5","Bf5","e3","Bxe5","dxe5","Rc8","Be2","Nc4","Bxc4","Rxc4","Qxa7","Bd3","Rd1","Bc2","Rd2","Rc7","Qa5","Bg6","O-O","Qe7","Nb5","Qc5","Qc3","Rc6","Qxc5","Rxc5","Nd6","Rb8","b3","Rb6","f4","f6","f5","Bh5","fxe6","fxe5"], last: { f: "f6", t: "e5" },
    opp: "AmrZakiHelmi", oe: 1464, me: 1502, date: "2026-08-21", url: "https://www.chess.com/game/live/173300267134", res: "W", mv: 30,
    my: "Nf5", eb: 531, ea: -265,
    task: "Twój pion e6 doszedł już bardzo daleko. Czarne zbiły na e5. Twój ruch.",
    hint: "Co zasłania Twojego piona e6 przed wieżą b6? Ile pól dzieli piona od promocji?",
    best: ["e7","h6","Rf8+","Kh7","Rd8"],
    ref: ["Nf5","Rxe6"],
    whyBad: "[[Nf5]] zostawia piona e6 bez osłony. Skoczek d6 stał między wieżą b6 a Twoim pionem i go zasłaniał. Po odejściu skoczka [[Rxe6]] i Twój najsilniejszy atut znika. Przewaga spada z decydującej do niewielkiej.",
    whyGood: "[[e7]] wprowadza piona na przedostatnie pole i grozi promocją na e8. Czarne pilnują pola e8 gońcem h5, ale do akcji dołączają Twoje wieże: [[Rf8+]] wypycha króla, a [[Rd8]] dokłada nacisk na pole promocji. Silnik pokazuje, że w końcu pion i tak przejdzie albo czarne będą musiały oddać za niego figurę.",
    look: ["Wolny pion na 6. rzędzie jest często wart więcej niż figura. Wspieraj go i pchaj.", "Figura, która zasłania Twojego piona przed wieżą przeciwnika, ma ważne zadanie. Nie odsuwaj jej bez powodu.", "W końcówce pytaj: co przybliża mnie do nowego hetmana?"]
  }
  ],

  // ---------- PLAN POPRAWY ----------
  plan: {
    open: {
      diag: [
        "Jako białe w Gambicie Hetmańskim Odrzuconym grasz dobrze: wynik 24–2–22, a po 10. ruchu masz zwykle wyraźnie lepszą pozycję.",
        "Gambit Przyjęty (2...dxc4) to Twój najsłabszy wariant białymi: 4–0–10. Typowy błąd to wczesny wypad hetmanem (Qb3, Qa4+) zamiast rozwoju. Wcześnie wychodzisz hetmanem w 17% wszystkich partii.",
        "Przeciw 1...Nf6 (obrony indyjskie) masz wynik 4–0–8, a przeciw Obronie Królewsko-Indyjskiej 0–0–4.",
        "Czarnymi przeciw 1.d4 po 10 ruchach jesteś średnio o ponad pionka gorzej, a w 5 z 11 przeanalizowanych partii wyraźnie gorzej. Nie masz tu jednego, stałego systemu.",
        "W Sycylijskiej otwartej (2.Nf3) grasz świetnie: 21–0–12. W bocznych wariantach masz tylko 13–3–27, choć po 10 ruchach pozycja jest zwykle równa. Przegrywasz później, bo nie znasz typowych planów."
      ],
      steps: [
        { t: "Zasada 3 pytań w otwarciu", d: "Przed każdym ruchem: (1) Które pola atakują piony przeciwnika? (2) Czy rozwijam nową figurę? (3) Czy król będzie bezpieczny do 10. ruchu? Hetman wychodzi dopiero po roszadzie." },
        { t: "Gambit Przyjęty: rozwój zamiast pogoni za pionem", d: "Graj Nf3, e3, Bxc4, O-O. Pion c4 wraca sam. Przećwicz wariant w zakładce Repertuar." },
        { t: "Nowe otwarcie białymi: System Londyński przeciw 1...Nf6", d: "Po 1.d4 Nf6 grasz 2.Bf4 i stały układ: e3, Nf3, c3, Nbd2, Bd3, h3. Przeciw 1...d5 zostajesz przy 2.c4." },
        { t: "Nowe otwarcie czarnymi: Obrona Słowiańska przeciw 1.d4", d: "1...d5 i 2...c6, a goniec c8 wychodzi na f5 przed ruchem e6. Jeden system przeciw 2.c4, Systemowi Londyńskiemu i 2.e3." },
        { t: "Jeden prosty układ na każdy boczny wariant Sycylijskiej", d: "2.c3 d5, 2.Bc4 e6 i d5, 2.f4 d5, 2.Nc3 Nc6 i g6. Zrób po jednym przejściu każdej linii dziennie przez tydzień." }
      ]
    },
    mid: {
      diag: [
        "To tu przegrywasz najwięcej. W 45 przegranych partiach pierwszy decydujący błąd padał w grze środkowej 23 razy (w otwarciu 13, w końcówce 7).",
        "Średnio popełniasz 2 poważne błędy na partię (spadek oceny o 3 piony lub więcej), z czego ponad połowa przypada na grę środkową (1,1 na partię).",
        "Najczęściej powtarzają się te same motywy: figury bez obrony, przeoczone widły, związania, usunięcie obrońcy oraz groźby mata, których nie widzisz, bo patrzysz tylko na swój plan.",
        "Grasz za szybko. Z 10 minut zużywasz średnio niecałe 5 (4:44). Przegrane partie kończysz z ponad 5 minutami na zegarze, a tylko 6 z 120 przegrałeś w niedoczasie.",
        "Twój styl jest aktywny i taktyczny: 27 ze 114 wygranych to maty. Lubisz atak i aktywne figury, ale za rzadko sprawdzasz odpowiedź przeciwnika."
      ],
      steps: [
        { t: "Kontrola przed każdym ruchem (10 sekund)", d: "Po ruchu przeciwnika zapytaj: co on teraz atakuje? Przed swoim ruchem: czy po nim coś mi wisi? Jakie szachy i bicia ma przeciwnik?" },
        { t: "Wykorzystaj czas", d: "Celuj w zużycie 7–8 minut z 10. W ważnych momentach (bicia, szachy, wymiany) zatrzymaj się na 20–30 sekund." },
        { t: "Pytanie o obrońcę", d: "Zanim ruszysz figurą albo nią zbijesz: czego ona broniła? Co zasłaniała? To błędy z ćwiczeń m2, m5, m8." },
        { t: "Codziennie 10 minut taktyki tematycznej", d: "W kolejności: widły, związania, usunięcie obrońcy, ruch pośredni, groźby mata. Najpierw zrób ćwiczenia z tej zakładki, potem zadania z tymi motywami na chess.com." },
        { t: "Po każdej przegranej: jeden ruch", d: "Znajdź moment, w którym ocena spadła najbardziej, i opisz w jednym zdaniu, czego nie sprawdziłeś." }
      ]
    },
    end: {
      diag: [
        "W końcówkach popełniasz 0,5 poważnego błędu na partię i 7 razy był to błąd decydujący.",
        "Typowy schemat: masz przewagę materialną i tracisz ją przez nieuwagę, czyli niezabezpieczonego króla, widły albo zbicie piona, którego broniła figura z daleka.",
        "Król w końcówce bywa u Ciebie bierny albo stoi na złej linii (związanie własnej figury, matowa sieć na skraju planszy)."
      ],
      steps: [
        { t: "Z przewagą: najpierw bezpieczeństwo", d: "Gdy masz więcej materiału, zadaj pytanie: czy mój król i moje figury są bezpieczne? Wymieniaj hetmany i figury, a nie zbieraj pionów." },
        { t: "Wolny pion to plan", d: "Wolnego piona wspieraj i pchaj. Nie odsuwaj figur, które go chronią (ćwiczenie e7)." },
        { t: "Aktywny król, ale nie na linii wieży", d: "Król idzie do centrum, ale nie staje na jednej linii z wieżą przeciwnika, jeśli między wami stoi Twoja figura (ćwiczenie e6)." },
        { t: "Podstawowe końcówki", d: "Opanuj: opozycję w końcówce król i pion przeciw królowi, pozycję Philidora i Lucenę w końcówkach wieżowych. Na chess.com znajdziesz je w lekcjach o końcówkach." }
      ],
      rules: [
        "Wieża za wolnym pionem: swoim i przeciwnika.",
        "Król w końcówce to figura atakująca. Wprowadź go do gry.",
        "Z przewagą wymieniaj figury, nie piony.",
        "Przed pchnięciem piona obok własnego króla sprawdź, jakie pole przestaje być bronione.",
        "Przy szachach hetmanem chowaj króla bliżej własnych pionów, a nie na skraju planszy."
      ]
    }
  },

  // ---------- REPERTUAR ----------
  repertoire: [
    {
      group: "Białe", items: [
        { id: "r-qgd", name: "Gambit Hetmański Odrzucony", tag: "Twoje", color: "w",
          why: "Twoja najmocniejsza broń: 24–2–22, a po 10. ruchu zwykle masz przewagę. Zostaje bez zmian.",
          moves: ["d4","d5","c4","e6","Nc3","Nf6","Bg5","Be7","e3","O-O","Nf3","Nbd7","Rc1","c6","Bd3","dxc4","Bxc4"],
          notes: { 0: "Zajmujesz centrum i otwierasz drogę gońcowi c1.", 2: "Gambit Hetmański: proponujesz piona c4, żeby odciągnąć czarnego piona d5 z centrum.", 3: "Czarne nie przyjmują gambitu i bronią d5 pionem e6.", 4: "Kolejny nacisk na d5.", 6: "Wiążesz skoczka f6, który broni pola d5.", 8: "Otwierasz drogę gońcowi f1. Spokojnie, bez wypadów hetmanem.", 10: "Rozwój. Roszada będzie za chwilę.", 12: "Wieża staje na linii c, bo tam będzie Twoja gra.", 14: "Goniec czeka na d3. Po dxc4 odbije piona i od razu stanie na aktywnym polu c4.", 16: "Wszystkie figury rozwinięte, za chwilę O-O. Plan: nacisk na linii c albo pchnięcie e3–e4 w centrum." } },
        { id: "r-qga", name: "Gambit Hetmański Przyjęty", tag: "Do poprawy", color: "w",
          why: "Tu masz 4–0–10. Problemem nie jest otwarcie, tylko wczesne wypady hetmanem (ćwiczenia o1 i o2). Ten układ jest spokojny i sprawdzony.",
          moves: ["d4","d5","c4","dxc4","Nf3","Nf6","e3","e6","Bxc4","c5","O-O","a6","a4"],
          notes: { 3: "Gambit przyjęty. Nie musisz od razu odzyskiwać piona.", 4: "Najpierw rozwój. Skoczek pilnuje też pola e5.", 6: "Otwierasz gońca f1, który za chwilę odbierze piona c4.", 8: "Pion odzyskany bez ryzyka i bez ruchu hetmanem.", 10: "Król bezpieczny. Dopiero teraz myśl o akcji.", 12: "Nie pozwalasz na b5, które przegoniłoby Twojego gońca. Często powstaje izolowany pion d4. Twój plan to atak na skrzydle królewskim: Ne5, Qe2, Rd1." } },
        { id: "r-qga2", name: "Gambit Przyjęty: gdy czarne bronią c4 gońcem e6", tag: "Z Twojej partii", color: "w",
          why: "Pozycja z ćwiczenia o1. Zamiast Qb3?? (pole bite przez piona) budujesz centrum.",
          moves: ["d4","d5","c4","dxc4","e3","Be6","Nc3","c6","e4","b5"],
          notes: { 5: "Czarne bronią piona c4 gońcem.", 6: "Rozwój i przygotowanie e4. Nie Qb3, bo pion c4 bije na b3.", 8: "Silne centrum. Do tego grozi d4–d5, czyli atak pionem na gońca e6.", 9: "Czarne trzymają piona, ale osłabiają skrzydło. Teraz a4 podważy ich łańcuch pionów." } },
        { id: "r-lon", name: "System Londyński (przeciw 1...Nf6)", tag: "NOWE", color: "w",
          why: "Dlaczego: przeciw 1...Nf6 masz 4–0–8, a przeciw Obronie Królewsko-Indyjskiej 0–0–4. Wtedy szybko kończysz się w nieznanej teorii, a 13 z 45 decydujących błędów popełniłeś w otwarciu. System Londyński to stały układ figur bez dużej teorii, z bezpiecznym królem. Przenosi walkę do gry środkowej, gdzie liczy się kontrola przed ruchem, nad którą pracujemy. Grasz 1.d4 jak dotąd. Po 1...d5 zostajesz przy 2.c4.",
          moves: ["d4","Nf6","Bf4","e6","e3","c5","c3","Nc6","Nd2","d5","Ngf3","Bd6","Bg3","O-O","Bd3"],
          notes: { 2: "Goniec wychodzi przed e3, żeby nie został zamknięty.", 4: "Otwierasz gońca f1.", 6: "Pion c3 mocno trzyma d4. To fundament systemu.", 8: "Skoczek idzie na d2, żeby wspierać e4 i nie blokować piona c.", 10: "Drugi skoczek dołącza do rozwoju.", 12: "Goniec cofa się na g3 i nie daje się zbić na swoich warunkach. Jeśli czarne wymienią gońce (Bxg3), odbijesz pionem h2 i otworzysz linię h dla wieży.", 14: "Rozwój zakończony. Następnie O-O, Qe2 i e3–e4 w centrum." } },
        { id: "r-lon2", name: "System Londyński przeciw układowi z g6 (Królewsko-Indyjska)", tag: "NOWE", color: "w",
          why: "Ten sam układ, gdy czarne fianchettują gońca na g7.",
          moves: ["d4","Nf6","Bf4","g6","e3","Bg7","Nf3","O-O","Be2","d6","h3","c5","c3"],
          notes: { 3: "Czarne przygotowują gońca na g7.", 6: "Normalny rozwój.", 8: "Goniec na e2 jest bezpieczny i nie wystawia się na ...e5–e4.", 10: "Ruch h3 robi miejsce gońcowi f4 na h2 i zabiera pole g4 skoczkowi oraz gońcowi czarnych.", 12: "Pion c3 trzyma środek. Plan: O-O, Nbd2, a4 albo Qb3 przeciw b7, ale dopiero po roszadzie." } }
      ]
    },
    {
      group: "Czarne", items: [
        { id: "r-sic", name: "Sycylijska otwarta (Taimanow)", tag: "Twoje", color: "b",
          why: "Tu grasz świetnie: 21–0–12. Zostaje bez zmian.",
          moves: ["e4","c5","Nf3","e6","d4","cxd4","Nxd4","Nc6","Nc3","Qc7","Be2","a6","O-O","Nf6","Be3","Bb4"],
          notes: { 1: "Obrona Sycylijska: walczysz o pole d4 z boku.", 3: "Elastyczny ruch, który otwiera gońca f8.", 5: "Wymieniasz piona c na centralnego piona białych.", 7: "Skoczek uderza w skoczka d4.", 9: "Hetman kontroluje pole e5 i linię c.", 11: "Ruch a6 zabiera białym pole b5.", 13: "Rozwój i atak na piona e4.", 15: "Związanie skoczka c3, które zwiększa nacisk na e4." } },
        { id: "r-alapin", name: "Przeciw 2.c3 (Alapin)", tag: "Do poprawy", color: "b",
          why: "Tu masz 1–1–7. Najprostsze rozwiązanie to od razu ...d5.",
          moves: ["e4","c5","c3","d5","exd5","Qxd5","d4","Nf6","Nf3","Bg4","Be2","e6","O-O","Nc6"],
          notes: { 3: "Białe chcą zagrać d4, więc uderzasz w centrum od razu.", 5: "Hetman w centrum jest tu bezpieczny, bo pole c3 zajmuje pion i białe nie mają Nc3 z tempem.", 9: "Wiązanie skoczka f3 i nacisk na d4.", 11: "Otwierasz gońca f8, potem Be7 i O-O.", 13: "Kolejny nacisk na d4. Plan: O-O, a często cxd4 i walka z izolowanym pionem." } },
        { id: "r-bowdler", name: "Przeciw 2.Bc4 (Bowdler)", tag: "Do poprawy", color: "b",
          why: "Tu masz 3–1–9. Goniec c4 celuje w f7. Ruch ...e6 stawia mu mur, a ...d5 atakuje go z tempem.",
          moves: ["e4","c5","Bc4","e6","Nf3","d5","exd5","exd5","Bb5+","Nc6","O-O","Nf6"],
          notes: { 3: "Zamykasz przekątną c4–f7.", 5: "Atakujesz gońca i zajmujesz centrum.", 7: "Masz piona d5 i wolną grę figurami.", 9: "Zasłona skoczkiem, który się przy tym rozwija.", 11: "Rozwój. Plan: Be7, O-O. Uważaj na związanie skoczka c6." } },
        { id: "r-gp", name: "Przeciw 2.f4 (McDonnell)", tag: "Do poprawy", color: "b",
          why: "Tu masz 0–0–4. Ruch ...d5 wykorzystuje osłabienie, które białe same tworzą ruchem f4.",
          moves: ["e4","c5","f4","d5","exd5","Qxd5","Nc3","Qd8","Nf3","Nf6"],
          notes: { 3: "Uderzenie w centrum, zanim białe zbudują atak.", 6: "Skoczek atakuje hetmana.", 7: "Hetman wraca do domu. Pozycja jest zdrowa.", 9: "Rozwój. Plan: g6 i Bg7 albo e6 i Be7, potem O-O." } },
        { id: "r-closed", name: "Przeciw 2.Nc3 (Sycylijska zamknięta)", tag: "Do poprawy", color: "b",
          why: "Tu masz 2–0–5. Gra się spokojnym układem lustrzanym z gońcem na g7.",
          moves: ["e4","c5","Nc3","Nc6","g3","g6","Bg2","Bg7","d3","d6","Be3","e6","Qd2","Nge7"],
          notes: { 3: "Rozwój, kontrola d4.", 5: "Fianchetto, czyli goniec na długiej przekątnej.", 7: "Goniec g7 to Twoja najlepsza figura.", 11: "Ruch e6 przygotowuje Nge7, żeby piona f nie blokował skoczek.", 13: "Plan: O-O, Rb8 i b5, czyli atak na skrzydle hetmańskim." } },
        { id: "r-slav", name: "Obrona Słowiańska (przeciw 1.d4 2.c4)", tag: "NOWE", color: "b",
          why: "Dlaczego: przeciw 1.d4 masz 20–4–21, a po 10 ruchach jesteś średnio wyraźnie gorzej (5 z 11 przeanalizowanych partii). W 1.d4 d5 2.e3 masz 0–0–4. Grasz już 1...d5, więc zmiana jest mała. Obrona Słowiańska rozwiązuje główny problem obron hetmańskich: goniec c8 wychodzi na f5, zanim zamkniesz go pionem e6. Struktura jest solidna, plany proste, a ten sam układ działa przeciw 2.c4, Systemowi Londyńskiemu i 2.e3. Znasz ją też od strony białych, bo często grasz Qb3 przeciw gońcowi na f5 lub g4.",
          moves: ["d4","d5","c4","c6","Nf3","Nf6","Nc3","dxc4","a4","Bf5","e3","e6","Bxc4","Bb4","O-O","O-O"],
          notes: { 3: "Pion c6 broni d5 i nie zamyka gońca c8.", 5: "Rozwój.", 7: "Zbijasz piona. Białe muszą coś zrobić, żeby go odzyskać.", 8: "Ruch a4 zapobiega b5.", 9: "Goniec wychodzi na f5 przed e6. To idea całej obrony.", 11: "Dopiero teraz e6, bo goniec jest już na zewnątrz.", 13: "Związanie skoczka c3, co utrudnia białym e4.", 15: "Solidna pozycja. Plan: Nbd7, Qe7, e5 albo c5 w odpowiednim momencie." } },
        { id: "r-slav2", name: "Słowiańska przeciw Systemowi Londyńskiemu / 2.e3", tag: "NOWE", color: "b",
          why: "Ten sam układ przeciw spokojnym systemom. To pozycje, w których dotąd przegrywałeś (2.e3: 0–0–4).",
          moves: ["d4","d5","Bf4","c6","e3","Bf5","Nf3","e6","Bd3","Bxd3","Qxd3","Nf6","O-O","Nbd7"],
          notes: { 3: "Pion c6 wzmacnia d5 i zostawia drogę dla gońca c8, który za chwilę wyjdzie na f5.", 5: "Goniec na zewnątrz, zanim zagrasz e6.", 9: "Wymiana gońców pozbawia białych najlepszej figury atakującej.", 11: "Rozwój. Plan: Be7, O-O, c5 albo e5, żeby uwolnić pozycję.", 13: "Skoczek wspiera e5 i c5." } }
      ]
    }
  ],

  // ---------- SZKOŁA NOTACJI ----------
  notation: [
    { id: "n1", title: "Pola szachownicy", type: "square",
      text: "Każde pole ma nazwę z litery i cyfry. **Litery a–h** oznaczają kolumny od lewej strony białych. **Cyfry 1–8** oznaczają rzędy, licząc od białych. Białe zaczynają na rzędach 1 i 2, czarne na 7 i 8. Pole **e4** to kolumna e, rząd 4. Grając czarnymi, widzisz planszę odwróconą, więc litery idą od prawej, ale nazwy pól się nie zmieniają." },
    { id: "n2", title: "Litery figur", type: "piece",
      text: "W zapisie (tak jak na chess.com i w plikach PGN) używa się angielskich liter: **K** = król (King), **Q** = hetman (Queen), **R** = wieża (Rook), **B** = goniec (Bishop), **N** = skoczek (kNight, bo K jest już zajęte). **Pion nie ma litery.** W polskich książkach spotkasz litery K, H, W, G, S. W ustawieniach aplikacji możesz przełączać zapis: figurki, litery angielskie albo polskie." },
    { id: "n3", title: "Zwykły ruch", type: "seq", start: "start",
      moves: ["e4","e5","Nf3","Nc6","Bb5","a6","Ba4","Nf6","O-O"],
      text: "Ruch zapisuje się jako **litera figury + pole docelowe**. **Nf3** = skoczek idzie na f3. **Bb5** = goniec na b5. Ruch pionem zapisuje się samym polem: **e4** = pion na e4. Numer przed ruchem to numer posunięcia: **1. e4 e5** to pierwszy ruch białych i pierwszy ruch czarnych. Zagraj na planszy ruchy z zapisu, po kolei za obie strony." },
    { id: "n4", title: "Bicie, szach i mat", type: "seq", start: "start",
      moves: ["d4","d5","c4","dxc4","e3","b5","a4","c6","axb5","cxb5","Qf3"],
      text: "**x** oznacza bicie: **Bxe5** = goniec bije na e5. Gdy bije pion, piszemy literę jego kolumny: **dxc4** = pion z kolumny d bije na c4. **+** oznacza szach, **#** to mat. Ta krótka sekwencja to znana pułapka w Gambicie Przyjętym. Na końcu Qf3 atakuje wieżę a8 przez długą przekątną." },
    { id: "n5", title: "Mat w czterech ruchach", type: "seq", start: "start",
      moves: ["e4","e5","Bc4","Nc6","Qh5","Nf6","Qxf7#"],
      text: "Przećwicz **x** i **#** na słynnym macie szewskim. Zwróć uwagę na ostatni ruch: **Qxf7#** = hetman bije na f7 i daje mata. Ten mat działa tylko wtedy, gdy przeciwnik nie sprawdza Twoich groźb. Nie pozwól, żeby tobie się to zdarzyło." },
    { id: "n6", title: "Roszada, promocja i ujednoznacznienie", type: "play",
      text: "**O-O** to roszada krótka (król na g1 lub g8), **O-O-O** to roszada długa (król na c1 lub c8). **e8=Q** oznacza, że pion doszedł na e8 i zamienia się w hetmana. Gdy dwie takie same figury mogą wejść na to samo pole, dopisuje się kolumnę lub rząd, z którego rusza figura: **Nbd2** = skoczek z kolumny b idzie na d2, **R1e2** = wieża z 1. rzędu idzie na e2. Trzy kropki, jak w **12...Nf6**, oznaczają ruch czarnych.",
      items: [
        { fen: "r3k2r/pppq1ppp/2n1bn2/3pp3/3PP3/2N1BN2/PPPQ1PPP/R3KB1R w KQkq - 0 8", san: "O-O-O" },
        { fen: "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 0 5", san: "O-O" },
        { fen: "8/4P1k1/8/8/8/8/5K2/8 w - - 0 1", san: "e8=Q" },
        { fen: "rnbqkb1r/ppp2ppp/4pn2/3p4/2PP4/5N2/PP2PPPP/RNBQKB1R w KQkq - 0 4", san: "Nbd2" },
        { fen: "4k3/8/8/8/8/8/4K3/R3R3 w - - 0 1", san: "Rad1" },
        { fen: "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 5 4", san: "Nxe4" }
      ] },
    { id: "n7", title: "Czytanie zapisu", type: "read",
      text: "Ostatni krok: przeczytaj zapis i wybierz poprawny opis. To umiejętność, której potrzebujesz przy analizie partii na chess.com.",
      items: [
        { san: "Nxe5", ok: "Skoczek bije na e5", bad: ["Skoczek idzie na e5 bez bicia", "Pion z kolumny e bije skoczka"] },
        { san: "Qh5+", ok: "Hetman idzie na h5 i daje szach", bad: ["Hetman bije na h5", "Wieża idzie na h5 i daje szach"] },
        { san: "exd5", ok: "Pion z kolumny e bije na d5", bad: ["Pion idzie z e5 na d5", "Hetman bije na d5"] },
        { san: "O-O-O", ok: "Roszada długa", bad: ["Roszada krótka", "Remis"] },
        { san: "Rfd1", ok: "Wieża z kolumny f idzie na d1", bad: ["Wieża z d1 idzie na f1", "Wieża bije na d1"] },
        { san: "Bb5#", ok: "Goniec idzie na b5 i daje mata", bad: ["Goniec bije na b5", "Goniec idzie na b5 i daje szach"] },
        { san: "a8=Q", ok: "Pion dochodzi na a8 i zamienia się w hetmana", bad: ["Hetman idzie na a8", "Pion bije na a8"] },
        { san: "N1f3", ok: "Skoczek z 1. rzędu idzie na f3", bad: ["Skoczek idzie na f1, potem na f3", "Pierwszy ruch skoczkiem na f3"] }
      ] }
  ],

  knownIds: ["144980333796","144991174308","145019517704","145024351226","145025235812","145026052902","145031718102","145033517834","145038564438","145074395880","145118702456","145153834050","145159460760","145159629310","145188917890","145190600022","145233454356","145253740182","145308301082","145377015850","145412798802","145414372756","145451248818","145451482796","145455359758","145457572778","145491373490","145493401374","145531696072","145539699318","145571624842","145572085700","145577179318","145583043800","145589529834","145624164168","145624496446","145626817622","145627514112","145628140022","145662009596","145663953642","145670211294","145670831030","145673479096","145703745324","145708464882","145709368646","145712618318","145737723336","145738597032","145742361808","145747275380","145750563764","145755040954","145787412054","145787604402","145818277578","145856565326","146146744224","146150052188","146231232850","146267814426","146313336408","146345688304","146375580586","146375724816","146377207282","146420792994","146430490964","146449578114","146454358498","146493534260","146535879014","146538310044","146616335606","146618744246","146620814416","146655897500","146664633038","146697378544","146750734840","146754523394","146796560322","146830987824","146837861584","146841162516","146873660628","146983732348","147022977534","147029008694","147069931156","147107119378","147109898574","147115815980","147118037330","147150394070","147150714384","147152540790","147154831540","147155062678","147156037684","147191086074","147191223992","147192652794","147192874528","147195000604","147231577900","147233379160","147287837428","147339667292","147354829900","147357718704","147359703468","147410016702","147415657072","147459836276","147666216362","147694372450","170732828942","170914624802","170961065040","170961689022","170962671198","170972063258","170980073384","170980292048","171011345940","171011772596","171011862364","171053927232","171054117376","171054295240","171171351410","171186311144","171189944738","171229820834","171230194458","171232102670","171232334856","171233218902","171237965132","171274491252","171274727110","171274829372","171275573276","171276892018","171307041748","171307057078","171323385444","171325599360","171354682546","171397835660","171484454674","171491386786","172232295892","172232353878","172242465866","172242680906","172256752904","172273873714","172274023688","172291759708","172298674532","172331496194","172331746080","172344097416","172344382558","172366115386","172366316320","172367292196","172368247860","172374802866","172412982210","172415602684","172442279720","172442679668","172457307286","172468391864","172476688258","172504646674","172534199748","172552117668","172552649830","172562882300","172645776264","172659570638","172706042852","172734061818","172741225810","172748199506","172798250680","172799432660","172850065964","172892706750","172935336466","172940258920","172941778646","172981658322","172981852538","173013397766","173213187344","173300267134","173305268926","173337150670","173349504264","173355822184","173408653134","173470486988","173470809788","173509049868","173510782848","173514794246","173554296410","173609805818","173731267136","173733690878","173976508362","174131449218","174132423622","174177578770","184692626356","185015920538","185047964620","186527105372","186527512764","186529562258","186530734726","186581224070","186598375112","186831151544","187397712446","187398207554","187398265116","187399382388","187399589054","187420732154","187421470612","187421881536","187500091990","187500978170","187502721198","187503519852"]
};
