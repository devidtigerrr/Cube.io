# cube.io

An agar.io-style multiplayer game with cubes. Plain HTML/CSS/JS, no build step.

## Folders
- `final/index.html` - the latest version (v9) as ONE self-contained file. Open it in a browser.
- `split/` - the same latest version split into `index.html`, `style.css`, `game.js`.
- `versions/` - every earlier version (v1 - v9), so you can see how the game grew.

## Features (v9)
- Cube cells, split (Space), eject mass (W), spiky viruses, shared food and mass between players
- Bots when you play alone
- 31 skins in a coin shop (Free / Common / Rare / Epic / Legendary / Mythic), animated top skins
- 4-minute matches; the top 3 at the end win coins (1st 30, 2nd 20, 3rd 10; min. 100 mass)
- Admin (TigerD) with ban/unban panel and cheat hints, all skins unlocked

## Important: what works where
The game was built to run as a published Claude artifact. Multiplayer, admin and bans use the
`window.claude` runtime capabilities (`room`, `db`, `user`), which only exist in that environment.
- Opened locally (double-click `index.html`): single-player vs bots works and the coin shop works
  (progress is saved in the browser's localStorage). There is no multiplayer, admin or banning.
- For real online multiplayer on your own site you need a server (for example Node.js + WebSocket)
  and you must replace the `room` / `db` / `user` calls in the script with your own networking.
  Look for the sections "multiplayer" and "admin & bans" in the script.
- Admin and ban checks are only trustworthy with a server. In the artifact they rely on the
  platform's own permissions.

## Controls
Mouse = move, Space = split, W = eject mass (touch: on-screen buttons).
