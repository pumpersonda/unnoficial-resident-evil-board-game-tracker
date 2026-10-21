# Unnoficial Campaign Tracker Resident Evil: The Board Game

An unofficial, fan-made companion app to track full campaigns of **Resident Evil: The Board Game**, built with React Native + TypeScript. Designed for players who want a fast, offline way to manage scenario progress, characters, cards, and the shared item box during play — without pausing the game to shuffle through rulebooks or spreadsheets.

## Purpose

Running a campaign of Resident Evil: The Board Game involves tracking a lot of moving state: which scenarios are unlocked, character health and inventories, kerosene, danger level, and several card piles (tension, narrative, mission, event, equipment, map, discarded). This app replaces pen-and-paper/spreadsheet tracking with a quick, mobile-friendly interface so the table can stay focused on the game.

Everything runs **100% offline** — all campaign data is stored locally on your device.

## Features

- **Campaign management** — create, edit, and delete multiple campaigns, each with its own progress
- **Scenario tracking** — locked / unlocked / completed status per scenario
- **Character management** — health track, inventory, and kerosene per character
- **Card control** — tension, narrative, mission, event, equipment, and map card piles, plus a discard pile
- **Shared Item Box & Danger Level** — manage the shared inventory and current danger level for the party
- **Campaign summary** — at-a-glance overview of overall progress
- **Light / Dark / Red themes** — runtime-switchable app theme
- **Fully offline** — no account, no network calls; all data persists locally on-device

## Tech Stack

- React Native + TypeScript (Expo)
- Gluestack UI (styled with UniWind / Tailwind CSS v4)
- Zustand + AsyncStorage for state and persistence
- React Navigation

## Getting Started

```bash
npm install
npm start
```

Then run on your platform of choice (`npm run ios`, `npm run android`, or `npm run web`).

## Legal Disclaimer

This project is an **unofficial, fan-made** tool created by a fan for personal and community use. It is **not affiliated with, endorsed by, or sponsored by Capcom Co., Ltd.** or the publisher of Resident Evil: The Board Game.

**Resident Evil**, all related character names, logos, artwork, and imagery are trademarks and/or copyrights of **Capcom Co., Ltd.** All rights to these assets belong to their respective owners. Any use of Resident Evil names, logos, or likenesses within this app is for identification and reference purposes only, under fair use, and no copyright or trademark infringement is intended.

This app does not distribute, sell, or include any copyrighted game rules, card text, or artwork beyond what is necessary to reference the player's own physical copy of the game. If you are a rights holder and have concerns about this project, please open an issue in the repository.

No data collection: all campaign data entered into the app is stored **locally on the user's device only** and is never transmitted, sold, or shared with any third party.

This disclaimer is also shown inside the app (via the info icon on the main Campaigns screen).
