# tetris_gemma
A quick and simple tetris game generated my Gemma 3.1 PRO (low)
# Modern HTML Tetris

A beautiful, modern implementation of the classic Tetris game built entirely with HTML, CSS, and vanilla JavaScript. No frameworks or external dependencies required!

## Features

- 🎮 **Classic Tetris Gameplay:** Full support for soft drops, hard drops, rotation, and wall-kicking.
- 🎨 **Modern Aesthetics:** Glassmorphism UI, smooth gradients, and floating background animations.
- ✨ **Dynamic Animations:** Exciting visual effects that scale with your combos!
  - 1 Line: "NICE" + Light confetti
  - 2 Lines: "AMAZING" + Faster confetti
  - 3 Lines: "EXCELLENT" + Heavy confetti
  - 4 Lines: "TETRIS!" + Explosive golden confetti
- 👻 **Ghost Shadow:** A clear, modern outline shadow showing exactly where your piece will land.
- 📈 **Score & Leveling:** The game gets progressively faster as you clear lines and advance in levels.

## How to Play

### Controls
- **Left / Right Arrow (or A/D):** Move piece horizontally
- **Up Arrow (or W):** Rotate piece
- **Down Arrow (or S):** Soft Drop (Hold to fall faster)
- **Spacebar:** Hard Drop (Instantly drop to the bottom)
- **Escape:** Pause / Resume the game

### Scoring
- 1 Line: 100 × Level
- 2 Lines: 300 × Level
- 3 Lines: 500 × Level
- 4 Lines (Tetris): 800 × Level
- Soft Drops give you +1 point per row.

*Tip: You level up for every 10 lines cleared. The game drops pieces faster at higher levels!*

## How to Run Locally

Because this is a completely vanilla web project, it's incredibly easy to run.

**Option 1: Direct File Open**
Simply locate the `index.html` file in your file explorer (Finder/Windows Explorer) and double-click it to open it in your default web browser.

**Option 2: Local Web Server (Recommended)**
If you have Python installed, you can serve the game via a local HTTP server:
1. Open your terminal and navigate to the game folder.
2. Run the following command:
   ```bash
   python3 -m http.server 8000
   ```
3. Open your web browser and go to `http://localhost:8000`
4. When you're done playing, go back to your terminal and press `Ctrl + C` to stop the server.

---
*Built with pure HTML Canvas and JavaScript.*
