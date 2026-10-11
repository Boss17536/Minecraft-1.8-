# CM CLIENT 1.8.8 — BROWSER EDITION (HOSTING & DEPLOYMENT GUIDE)

## 1. Overview & Architecture

Can you host a fully working Minecraft 1.8.8 with CM Client in a browser with zero downloads, cracked server support, custom FOV, mods, and resource packs?

**Yes.** There are two primary architectural methods used in modern browser gaming ports (like *playgta5* and *Eaglercraft*):

---

### Comparison of Methods

| Feature | Method A: Client-Side WebAssembly (Eaglercraft / EaglerForge Style) | Method B: Cloud WebRTC Streaming (playgta5 / Moonlight Web Style) |
| :--- | :--- | :--- |
| **How it Works** | Recompiled 1.8.8 engine compiled to WebAssembly / JS via TeaVM + WebGL 2.0. | Runs the exact desktop `cmpack_1.8.8.jar` on a host/cloud machine and streams 60 FPS video + inputs over WebRTC. |
| **Server Costs** | **$0 / Free** (Runs 100% on player's browser GPU/CPU). Static hosting on GitHub Pages / Vercel. | Requires a server with GPU/CPU encoding per player. |
| **Mods & HUD** | EaglerForge / CM Client PvP HUD (Keystrokes, CPS, ToggleSprint, ArmorStatus, Fullbright, custom FOV). | 100% exact identical desktop CM Client mods & OptiFine shaders. |
| **Multiplayer** | Connects to cracked servers via a **WebSocket Proxy Bridge** (`ws://` / `wss://`). | Direct TCP connection from host server. |
| **Offline Singleplayer** | Supported via browser IndexedDB storage. | Managed on backend storage. |

---

## 2. The Complete User Workflow (Built in this Project)

1. **User visits website:** Opens `index.html` on any device/browser without downloading anything.
2. **Persistent Identity:** Automatically saves and remembers the player's username in `localStorage`. Returning players see **"✓ SAVED PROFILE: [Username]"** with a one-click **"Play"** action — they will never be asked for their username again unless they choose to click *"Switch Name"*.
3. **Settings & Mods:**
   - Sliders for **FOV** (30 to 110 Quake Pro), Render Distance, and FPS limit.
   - Quick toggles for **Keystrokes**, **CPS Counter**, **ToggleSprint**, **ArmorHUD**, and **Fullbright**.
4. **Resource Packs:** Drag & drop any 1.8 PvP resource pack `.zip` directly onto the website.
5. **Launch & Play:**
   - **Play Singleplayer:** Launches offline world directly in browser WebGL.
   - **Join Cracked Servers:** Directly connect to **MineBerry (`mc.mineberry.org`)**, ArchMC, AssPixel, or custom cracked servers via the WebSocket bridge.

---

## 3. How to Host 100% FREE (NO RDP, NO VPS, NO Laptop Running 24/7)

You do **NOT** need an RDP, VPS, or to leave your computer running 24/7. Because this client is engineered to run **client-side WebAssembly & WebGL**, all game computations happen directly in the visiting player's browser!

### Step 1: Host the Website on GitHub Pages (100% Free Forever)
1. Go to [GitHub.com](https://github.com) and create a free public repository (e.g., `cmclient-web`).
2. Upload the project files:
   - `index.html`
   - `style.css`
   - `app.js`
   - `/packs` (contains `Dewiers-20k-Resource-Pack-16x-1.8.9.zip` and `dewiers_pack.png`)
   - `/client`
3. In your GitHub repo, click **Settings** -> **Pages** (on the left menu).
4. Under **Branch**, select `main` (or `master`) and folder `/ (root)`, then click **Save**.
5. Your website is instantly live at:
   `https://<your-github-username>.github.io/cmclient-web/`
   *You can turn off your laptop completely — anyone around the world can open the link and play anytime!*

### Step 2: Playing Online Cracked Servers for Free (Zero Servers Needed)
- **Public Community Relays:** Popular cracked servers like **ArchMC** (`wss://mc.arch.lol/`) and **AssPixel** (`wss://eagler.asspixel.net/`) already run 24/7 public WebSocket bridges managed by the community for free.
- **For MineBerry (`mc.mineberry.org`):** You can use public community WebSocket relays (such as `wss://relay.deev.is/`) or deploy `proxy/server.js` to **Koyeb** or **Render.com** (both offer 100% free cloud tiers that run 24/7 in the cloud with zero credit card and zero payment).

---

## 4. Included Resource Pack
- **Dewier's 20k Resource Pack 16x (1.8.9)** is bundled directly in the `packs/` folder:
  - File: `packs/Dewiers-20k-Resource-Pack-16x-1.8.9.zip`
  - Icon: `packs/dewiers_pack.png`
  - Pre-selected as the active PvP pack with optimized 16x short swords, custom skies, and high FPS boost.

---

## 3. How to Connect to Cracked Servers (The WebSocket Bridge)

Web browsers cannot open raw TCP sockets (port 25565) due to browser security restrictions. To connect a browser player to an offline-mode (cracked) Minecraft 1.8.8 Java server:

### The WebSocket-to-TCP Proxy:
Included in this repository under `/proxy`:

```
Browser Client (WSS)  --->  Proxy Server (Node.js / EaglerXBungee)  --->  Minecraft 1.8.8 Server (TCP 25565)
```

### Running the Included Proxy:
1. Navigate to the proxy folder:
   ```powershell
   cd "proxy"
   npm install
   ```
2. Start the bridge:
   ```powershell
   $env:TARGET_HOST="127.0.0.1"
   $env:TARGET_PORT="25565"
   $env:WS_PORT="8081"
   node server.js
   ```
3. Enter `ws://localhost:8081` in the website's Custom Server input, click **CONNECT**, and the browser client bridges straight into your cracked Minecraft server.

---

## 4. Hosting the Website for Free

To make the website accessible globally with zero setup for your friends:

1. **Static Frontend (GitHub Pages / Vercel):**
   - Push `index.html`, `style.css`, `app.js`, and the `/client` directory to a GitHub repository.
   - Enable GitHub Pages (under Repository Settings -> Pages -> Deploy from branch `main`).
   - Your site is now live at `https://yourusername.github.io/cmclient-web/`.

2. **Public WebSocket Proxy (for Multiplayer):**
   - Deploy `proxy/server.js` to a free cloud container (Render.com, Railway.app, or Oracle Cloud Free Tier VM).
   - Use Cloudflare or Let's Encrypt to enable `wss://` (secure WebSocket) so HTTPS web browsers can connect without mixed-content warnings.

---

## 5. File Structure in this Project

```
c:\Users\ARAYAN\Documents\1.8 in Tab\
├── index.html               # Main website interface & PvP launcher
├── style.css                # Dark PvP glassmorphism styling
├── app.js                   # Client state, settings, HUD overlay, and engine loader
├── client/
│   └── index.html           # In-browser game canvas & runtime loader
├── proxy/
│   ├── package.json         # Node.js dependencies
│   └── server.js            # WebSocket-to-TCP Minecraft bridge proxy
└── cmpack_1.8.8_2.8.11-beta/ # Your local CM Client files
```
