Dokument Wymagań Produktu (PRD) - Aplikacja EKO-Odznaki
Wersja: 1.0 Data: 10.08.2025

1. Wprowadzenie i Cel Produktu
   Cel: Celem aplikacji "EKO-Odznaki" jest zwiększenie świadomości ekologicznej i promowanie proekologicznych zachowań poprzez grywalizację i edukację. Aplikacja ma służyć jako platforma wspierająca wydarzenia (konferencje, festiwale, warsztaty), umożliwiając uczestnikom aktywne angażowanie się w tematykę ekologii, zdobywanie wiedzy oraz kolekcjonowanie cyfrowych odznak jako potwierdzenia ich zaangażowania.
   Wizja: Stworzenie angażującej społeczności, dla której ekologia staje się częścią stylu życia, a zdobyte odznaki są symbolem realnych działań i nabytej wiedzy.
2. Persony Użytkowników
   Zwykły Uczestnik (Marta, 24 lata)
   Cel: Chce w ciekawy sposób spędzić czas na wydarzeniu, nauczyć się czegoś nowego o ekologii i mieć z tego pamiątkę.
   Motywacja: Lubi rywalizację i kolekcjonowanie, chce pokazać znajomym swoje zaangażowanie.
   Frustracje: Nudne, teoretyczne wykłady. Brak praktycznych informacji, które może zastosować w życiu.
   Organizator Wydarzenia (Jan, 35 lat)
   Cel: Chce uatrakcyjnić swoje wydarzenie, dostarczyć uczestnikom wartość dodaną i w prosty sposób zarządzać elementem edukacyjnym.
   Motywacja: Chce, aby jego wydarzenie było postrzegane jako nowoczesne i proekologiczne. Potrzebuje narzędzi do angażowania publiczności.
   Frustracje: Skomplikowane systemy do zarządzania treścią, brak czasu na tworzenie dedykowanych rozwiązań.
3. Przepływy Użytkowników (User Flows)
   3.1. Przepływ Organizatora Wydarzenia
   Rejestracja i Pierwsze Logowanie:
   Jan wchodzi na stronę główną aplikacji i klika "Zarejestruj się".
   Wypełnia formularz: Nazwa wyświetlana ("Eko-Eventy"), e-mail, hasło.
   Wybiera rolę: "Organizator".
   Po pomyślnej rejestracji jest automatycznie logowany i widzi pusty panel główny.
   Tworzenie Nowego Wydarzenia:
   W panelu klika przycisk "Stwórz nowe wydarzenie".
   Wypełnia formularz: Nazwa wydarzenia ("Zielony Festiwal 2025"), data, krótki opis, opcjonalnie dodaje zdjęcie/baner wydarzenia.
   Po zapisaniu wydarzenie pojawia się na jego liście "Moje wydarzenia".
   Dodawanie Treści i Odznak:
   Jan wchodzi w szczegóły stworzonego "Zielonego Festiwalu".
   Dodaje Materiał Edukacyjny: Klika "Dodaj materiał". Wpisuje tytuł ("Jak segregować plastik?"), dodaje zdjęcie i pisze treść w edytorze Markdown. Zapisuje.
   Tworzy Odznakę: Przechodzi do zakładki "Odznaki" i klika "Stwórz odznakę".
   Wybiera tło: rozeta.
   Wybiera kolor: zielony.
   System automatycznie generuje gradient.
   Wybiera emoji: 🌱
   Wpisuje tytuł: "Mistrz Recyklingu".
   Dodaje opis: "Za udział w warsztatach segregacji".
   Zapisuje. Odznaka jest teraz dostępna dla tego wydarzenia.
   Zarządzanie Uczestnikami:
   W trakcie trwania festiwalu, Jan widzi listę uczestników, którzy dołączyli do jego wydarzenia w aplikacji.
   Po zakończeniu warsztatów recyklingu, filtruje listę uczestników i zaznacza osoby, które wzięły w nich udział.
   Klika przycisk "Przyznaj odznakę" i wybiera "Mistrz Recyklingu". Wybrani użytkownicy otrzymują powiadomienie i odznakę na swoim profilu.
   3.2. Przepływ Zwykłego Uczestnika
   Rejestracja i Dołączenie do Wydarzenia:
   Marta dowiaduje się o aplikacji na "Zielonym Festiwalu".
   Pobiera aplikację (PWA) na telefon i klika "Zarejestruj się".
   Wypełnia formularz: Nazwa wyświetlana ("EkoMarta"), e-mail, hasło.
   Wybiera rolę: "Uczestnik".
   Po zalogowaniu widzi listę dostępnych wydarzeń. Wybiera "Zielony Festiwal 2025" i klika "Dołącz".
   Edukacja i Interakcja:
   Na ekranie głównym wydarzenia widzi listę dostępnych materiałów.
   Klika w materiał "Jak segregować plastik?" i czyta artykuł przygotowany przez Jana.
   Otrzymuje powiadomienie o misji: "Odwiedź stoisko recyklingu i weź udział w warsztatach".
   Zdobywanie Odznaki:
   Marta idzie na warsztaty. W trakcie czy po zakończeniu organizator (Jan) przyznaje jej odznakę.
   Marta otrzymuje powiadomienie w aplikacji: "Gratulacje! Zdobyłeś/aś odznakę: Mistrz Recyklingu".
   Przeglądanie Profilu:
   Marta wchodzi na swój profil.
   Klika "Edytuj profil", dodaje swoje zdjęcie i krótkie bio: "Miłośniczka przyrody i zero waste".
   Poniżej widzi sekcję "Moje odznaki", a w niej nowo zdobytą odznakę "Mistrz Recyklingu". Klika na nią, aby zobaczyć szczegóły.
4. Wymagania Funkcjonalne
   4.1. Zarządzanie Kontem
   Rejestracja: Formularz z polami: Nazwa wyświetlana, E-mail, Hasło (z walidacją), Wybór roli (Uczestnik/Organizator).
   Logowanie: Formularz z polami: E-mail, Hasło. Opcja "Zapomniałem hasła".
   Profil Użytkownika:
   Możliwość edycji zdjęcia profilowego, nazwy wyświetlanej i bio.
   Wyświetlanie galerii zdobytych odznak.
   Opcja "Usuń konto", która po potwierdzeniu trwale usuwa dane użytkownika.
   4.2. Wydarzenia
   Tworzenie (Organizator): Możliwość stworzenia nowego wydarzenia z nazwą, datą, opisem i zdjęciem.
   Lista Wydarzeń (Wszyscy): Publiczna lista nadchodzących i trwających wydarzeń, które można przeglądać i do których można dołączyć.
   Panel Wydarzenia (Wszyscy): Po dołączeniu, użytkownik widzi dedykowany panel z materiałami, misjami i informacjami o wydarzeniu.
   4.3. Materiały Edukacyjne
   Tworzenie (Organizator): Prosty edytor (WYSIWYG lub czysty Markdown) do tworzenia materiałów z polami: Tytuł, Zdjęcie/Baner, Treść (Markdown).
   Przeglądanie (Uczestnik): Dostęp do materiałów w ramach wydarzenia. Treść renderowana z Markdown do HTML.
   4.4. EKO-Odznaki
   Generator Odznak (Organizator):
   Wybór kształtu tła: okrąg, rozeta.
   Wybór koloru z predefiniowanej palety (10 kolorów).
   Automatyczne generowanie gradientu (lewy górny róg jaśniejszy, prawy dolny ciemniejszy).
   Wybór jednego emoji z biblioteki.
   Pole na Tytuł odznaki.
   Opcjonalne pole na krótki Opis.
   Przyznawanie Odznak (Organizator): Możliwość wybrania jednego lub wielu uczestników danego wydarzenia i przyznania im stworzonej wcześniej odznaki.
   Galeria Odznak (Uczestnik): Widok wszystkich zdobytych odznak na profilu użytkownika. Odznaki są trwałe i przenoszone między wydarzeniami.
   4.5. Misje
   Definiowanie (Organizator): Możliwość zdefiniowania prostych zadań tekstowych dla uczestników w ramach wydarzenia (np. "Zrób zdjęcie EKO-instalacji").
   Wykonywanie (Uczestnik): Uczestnik odznacza wykonanie misji. Realizacja misji może być warunkiem przyznania odznaki przez organizatora.
5. Wymagania Niefunkcjonalne
   Technologia:
   Frontend: Next.js 15+ (z App Router)
   Backend & Baza Danych: Firebase (Authentication, Firestore)
   Stylowanie: Tailwind CSS
   Responsywność (RWD): Aplikacja musi być w pełni funkcjonalna i estetyczna na urządzeniach desktopowych, tabletach i smartfonach.
   Progressive Web App (PWA):
   Możliwość dodania aplikacji do ekranu głównego na urządzeniach mobilnych.
   Funkcjonalność Offline: Użytkownik po dołączeniu do wydarzenia powinien mieć możliwość pobrania materiałów edukacyjnych, aby móc je przeglądać bez dostępu do internetu. Synchronizacja postępów (np. ukończonych misji) nastąpi po ponownym połączeniu z siecią.
   Wydajność: Szybkie czasy ładowania, zoptymalizowane obrazy.
   Bezpieczeństwo: Zabezpieczenie danych użytkowników zgodnie ze standardami, bezpieczne przesyłanie haseł, reguły bezpieczeństwa w Firestore.
