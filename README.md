# WorkAndStudySpots

Aplikacja mobilna pomagająca użytkownikom znajdować najlepsze miejsca do pracy i nauki (kawiarnie, biblioteki, przestrzenie co-workingowe). Użytkownicy mogą przeglądać miejsca na mapie i w formie listy, filtrować je po różnych parametrach (Wi-Fi, gniazdka, poziom hałasu), a także dodawać nowe miejsca i wystawiać opinie.

## 🚀 Technologie
* **Frontend:** React Native (Expo SDK)
* **Nawigacja:** React Navigation (Stack & Bottom Tabs)
* **Backend & Baza danych:** Firebase (Auth, Firestore)
* **Mapy:** `react-native-maps`

## 📦 Instalacja i uruchomienie

### Wymagania wstępne
* Zainstalowany Node.js (zalecana wersja LTS)
* Zainstalowany na smartfonie klient **Expo Go** (dostępny w App Store i Google Play) lub emulator (Android Studio / Xcode).
* Konto Firebase (jeśli chcesz podpiąć własną instancję bazy danych).

### Kroki uruchomienia

1. **Sklonuj repozytorium:**
   ```bash
   git clone https://github.com/JakubW99/WorkAndStudySpots.git
   cd WorkAndStudySpots
   ```

2. **Zainstaluj zależności:**
   ```bash
   npm install
   ```

3. **Skonfiguruj zmienne środowiskowe:**
   Skopiuj plik `.env.example` i zmień jego nazwę na `.env`. Wypełnij go swoimi danymi z konsoli Firebase:
   ```env
   EXPO_PUBLIC_FIREBASE_API_KEY=twoj_api_key
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=twoja_domena
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=twoj_project_id
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=twoj_bucket
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=twoj_sender_id
   EXPO_PUBLIC_FIREBASE_APP_ID=twoj_app_id
   ```

4. **Uruchom serwer developerski (Expo):**
   ```bash
   npx expo start
   ```

5. **Uruchom na urządzeniu:**
   Zeskanuj kod QR, który pojawi się w terminalu, za pomocą aplikacji **Expo Go** na swoim telefonie. Ewentualnie wciśnij `a`, aby otworzyć aplikację na emulatorze Androida, lub `i` dla symulatora iOS.

## 🏗️ Architektura projektu
Aplikacja została podzielona na logiczne komponenty:
* `src/components/` - współdzielone komponenty UI (karty, odznaki, gwiazdki ocen).
* `src/context/` - globalny stan aplikacji (np. autentykacja z Firebase).
* `src/navigation/` - konfiguratory nawigacji (Stack Navigator dla ekranów logowania, Tab Navigator dla głównych ekranów).
* `src/screens/` - główne widoki aplikacji (MapScreen, ListScreen, ProfileScreen, AdminPanelScreen, SpotDetailScreen, itp.).
* `src/services/` - logika biznesowa i komunikacja z Firebase.
* `src/theme/` - scentralizowany system designu (kolory, typografia).

## 👥 Zespół
Projekt tworzony w ramach pracy zespołowej. Podział ról i szczegółowy plan znajduje się w pliku `TEAM_ROLES.md`.
