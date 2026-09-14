# VIT Bus Route Tracking and Management System

This workspace now includes an installable mobile-friendly web app for VIT shuttle operations with separate auth, student, and driver pages.

## Live App

Open the published app at [dhruv-thecloud.github.io/VITshuttle_code](https://dhruv-thecloud.github.io/VITshuttle_code/).

GitHub Pages runs the installable app in local demo mode. Student accounts and ride data are stored in the current browser. The included Python server can be hosted separately when shared accounts, live cross-device GPS, and central sensor data are required.

## What Changed

- Student mode shows live shuttle location, estimated arrival, available seats, and a boarding charge flow
- Students now have a dedicated `signup.html` page and log in from `index.html`
- Successful student login opens the separate `student.html` dashboard
- Drivers use a separate `driver-login.html` page, then open the protected `driver.html` dashboard
- Student and driver auth now use separate backend data stores
- Driver mode only needs shuttle number, route choice, and live location
- ETA is calculated automatically from live driver GPS plus Google route services when configured
- Capacity is sourced from a bus sensor endpoint when configured, with demo fallback values otherwise
- The app can be installed like a mobile app on Android and iPhone through the web app manifest and service worker
- A packaged download bundle is generated at `dist/vit-shuttle-mobile-app.zip`
- Seed data now reflects the two main shuttle loops:
  - Main Gate -> SMV -> Tunnel H Block -> One Food World -> Enzo -> K Block -> L Block -> R/M Block -> N Block
  - Main Gate -> Health Center -> Anna Audi -> SMV -> G/H Ladies Block -> TT -> SJT -> PRP -> MGB -> Main Gate

## Main Files

- [`index.html`](index.html) app UI
- [`signup.html`](signup.html) student sign up page
- [`student.html`](student.html) student dashboard
- [`driver-login.html`](driver-login.html) driver login page
- [`driver.html`](driver.html) driver dashboard
- [`styles.css`](styles.css) app styling
- [`app.js`](app.js) app logic
- [`auth.js`](auth.js) signup flow logic
- [`driver-auth.js`](driver-auth.js) driver login flow logic
- [`manifest.webmanifest`](manifest.webmanifest) installable app manifest
- [`sw.js`](sw.js) service worker
- [`google-config.js`](google-config.js) local integration config
- [`google-config.example.js`](google-config.example.js) config example
- [`server.py`](server.py) shared backend and static server

## Run

```bash
cd "/Users/dhruvsharma/Desktop/bus shuttle project "
PORT=8000 python3 server.py
```

Then open `http://localhost:8000`.

## Page Flow

- `index.html`: login / landing page
- `signup.html`: separate student signup page
- `student.html`: student shuttle dashboard after login
- `driver-login.html`: separate driver login page
- `driver.html`: driver dashboard after driver login

## Install On Android

1. Open the app in Chrome.
2. Tap `Install App` inside the page, or use the Chrome menu and choose `Install app` / `Add to Home screen`.
3. Launch `VIT Shuttle` from the home screen like a normal app.

## Install On iPhone

1. Open the app in Safari.
2. Tap the `Share` button.
3. Choose `Add to Home Screen`.
4. Launch `VIT Shuttle` from the home screen.

## Downloadable Bundle

To rebuild the distributable package:

```bash
cd "/Users/dhruvsharma/Desktop/bus shuttle project "
./package-mobile-app.sh
```

The generated bundle is:

- `dist/vit-shuttle-mobile-app.zip`

## Google And Sensor Integration

Edit [`google-config.js`](google-config.js) to connect production services:

- `googleMapsApiKey`: browser key for Google Maps JavaScript services
- `routesProxyEndpoint`: backend endpoint that calls Google Routes API securely
- `capacitySensorEndpoint`: backend endpoint that returns available seats for a shuttle

Expected sensor response shape:

```json
{
  "availableSeats": 18,
  "totalSeats": 40
}
```

Expected routes proxy response shape:

```json
{
  "etaMinutes": 7
}
```

## Notes

- The real map requires internet access.
- Browser geolocation permission is required for live driver tracking.
- Without configured Google/sensor endpoints, the app uses local demo fallback behavior.
