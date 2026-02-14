# Secure Auth App

Passwordless authentication prototype built with Expo + React Native. Users request a 6-digit OTP over email, validate it locally, then land on a live session screen with a resilient timer and analytics logging powered by AsyncStorage.

## Getting Started
Follow these steps to clone the repository and launch the Expo development server locally:

1. **Clone the repo**
  ```bash
  git clone https://github.com/Ramakrishnajakkula/otp_gen.git
  cd otp_gen/secure-auth-app
  ```
2. **Install dependencies** (Node 18+ recommended)
  ```bash
  npm install
  ```
3. **Run the Expo dev server** (starts Metro + provides QR / platform options)
  ```bash
  npx expo start
  ```
4. **Launch on a device or simulator**
  - Scan the QR code with Expo Go on iOS/Android
  - Press `a` for Android emulator or `i` for iOS simulator
  - Press `w` to open the web build in your browser

If you run into cache issues, stop the server and rerun `npx expo start -c`.

## Features
- Email + OTP flow with local generation, expiry (60s), max attempt guardrails (3 strikes), and a modern six-box OTP input that prevents copy/paste spam.
- OTPs stored per email via an in-memory map, guaranteeing true multi-user isolation.
- Session screen shows start timestamp, a leak-free mm:ss timer, and a rolling log of the last three session durations for auditability.
- Analytics service backed by `@react-native-async-storage/async-storage` logging OTP generation, validation outcomes, and logout events.
- Clear separation between UI (screens/components), business logic (services/hooks), and side effects (analytics/storage).

## Project Structure
```
src/
├── components/        # UI building blocks (buttons, inputs, layout shells)
├── context/           # SessionProvider for global session state + persistence
├── hooks/             # Reusable logic (session timer, OTP countdown)
├── navigation/        # Stack navigator wiring the three screens
├── screens/           # Login, Otp, and Session feature screens
├── services/          # otpManager and analytics adapters
├── theme/             # Color + spacing tokens
└── types/             # Shared TypeScript contracts
```

## OTP Logic & Expiry
- `otpManager` maintains a `Map<string, OtpRecord>` keyed by normalized email.
- Generating an OTP stores `{ code, expiresAt, attemptsLeft }` and invalidates previous entries for that email.
- Validation checks:
  1. Missing/expired entries immediately fail and require regeneration.
  2. Attempt counter decrements on every wrong entry; once it reaches zero the OTP is removed.
  3. Successful validations delete the OTP and hand control to the session layer.
- `useOtpCountdown` polls `otpManager` every second to show a live countdown and refreshes instantly when a new code is issued.

## Data Structures
- **OTP Store (`Map`)** — Constant-time lookups per email, enabling independent expiry + attempts tracking without global collisions.
- **Session State (`SessionProvider`)** — Simple object `{ email, startedAt }` persisted in AsyncStorage so the timer can resume after reloads.
- **Analytics Buffer (array saved in AsyncStorage)** — Keeps the latest 100 audit events with metadata (timestamp, payload) for troubleshooting.
- **Session History Buffer** — Every logout appends `{ email, start, end, duration }` to a capped list (20 entries) so interviewers can verify each login session length.

## External SDK Choice
- **SDK**: `@react-native-async-storage/async-storage`.
- **Why**: Lightweight, works offline, Expo-ready, and perfect for persisting both analytics logs and the active session with zero backend calls.
- **Events Logged**:
  - `otp_generated` — includes email + expiry timestamp (+ reason when resending).
  - `otp_validation_success` — email metadata.
  - `otp_validation_failure` — email + failure reason (expired, invalid, attempts_exceeded, missing).
  - `logout` — email + total session duration in ms.

## Running the App
1. Install dependencies (already done via `create-expo-app`, but run again if needed):
   ```bash
   npm install
   ```
2. Start the Expo dev server:
   ```bash
   npx expo start
   ```
3. Launch on your preferred target (Expo Go, Android emulator, iOS simulator, or web) using the on-screen instructions.

## Verification & Testing
- Static type check:
  ```bash
  npx tsc --noEmit
  ```
- The OTP input displays the generated code in development builds to simplify manual QA; in production you would replace this with an email/SMS integration.

## GPT Assistance Disclosure
- **Used GPT-5.1-Codex for**: drafting component/layout scaffolds and double-checking AsyncStorage API usage syntax.
- **Implemented & validated manually**: OTP manager rules, countdown/session hooks, navigation wiring, analytics logging, and overall state management.
