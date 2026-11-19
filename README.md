# Trener szachowy – kamtek

Mobilna aplikacja treningowa oparta na analizie partii z chess.com (konto **kamtek**).

- Ćwiczenia z własnych partii: pozycja tuż przed błędem, wyjaśnienie „dlaczego” i warianty na szachownicy.
- Plan poprawy: otwarcie, gra środkowa, końcówka. Repertuar otwarć i szkoła notacji.
- Przycisk „Odśwież moje gry i przeanalizuj postępy” sam pobiera nowe partie z publicznego API chess.com i sprawdza je silnikiem Stockfish 16 w przeglądarce.

Postępy zapisują się w pamięci przeglądarki na danym urządzeniu.

Silnik: [Stockfish.js 16](https://github.com/nmrugg/stockfish.js) (GPLv3), ładowany z jsDelivr. Logika szachowa: [chess.js](https://github.com/jhlywa/chess.js) (BSD).
