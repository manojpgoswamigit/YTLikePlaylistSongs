# YouTube Music Auto-Like 🎵

[![JavaScript](https://img.shields.io/badge/Language-Vanilla%20JS-F7DF1E?logo=javascript&logoColor=black)](youtube-music-auto-like.js)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/manojpgoswamigit/YTLikePlaylistSongs/pulls)

A lightweight, zero-dependency browser script that automatically likes every song in a YouTube Music playlist. Runs directly in your browser's Developer Tools console.

---

## ✨ Features

- 🎯 **Playlist-Scoped Only**: Strictly confines liking to tracks within your playlist (`ytmusic-playlist-shelf-renderer`) and ignores the endless "Suggestions" section at the bottom.
- 🏷️ **Accurate Title Logging**: Extracts real track titles directly from YouTube Music components to give clear progress logs (no "Unknown Song").
- ⏱️ **Human-like Delays**: Configurable randomized intervals between likes to mimic natural user interaction and respect rate limits.
- 📜 **Intelligent Auto-Scrolling**: Continuously lazy-loads tracks by scrolling the playlist container, with end-of-playlist detection and timeout safety checks.
- 🎮 **Live Interactive Controls**: Pause, resume, query status, or run diagnostics directly from the console at any point while running.
- ⚡ **Zero Setup**: Plain Vanilla JavaScript. No browser extensions, Node.js runtime, API keys, or OAuth credentials needed.

---

## 🚀 Quick Start

### 1. Open Your Playlist
1. Navigate to your target playlist on [music.youtube.com](https://music.youtube.com).
2. Ensure you are signed in to the account where you want to save liked songs.

### 2. Open Browser DevTools Console
- **Chrome / Edge / Brave**: Press <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>J</kbd> (Windows/Linux) or <kbd>Cmd</kbd> + <kbd>Option</kbd> + <kbd>J</kbd> (Mac).
- **Firefox**: Press <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>K</kbd> (Windows/Linux) or <kbd>Cmd</kbd> + <kbd>Option</kbd> + <kbd>K</kbd> (Mac).
- **Safari**: Press <kbd>Cmd</kbd> + <kbd>Option</kbd> + <kbd>C</kbd> (*Requires "Develop" menu enabled in Safari Settings*).

> [!TIP]
> If your browser blocks pasting code with a warning (*"Warning: Don't paste code..."*), type `allow pasting` and press <kbd>Enter</kbd> first.

### 3. Run the Script
1. Copy the full contents of [`youtube-music-auto-like.js`](youtube-music-auto-like.js).
2. Paste it into the console and press <kbd>Enter</kbd>.
3. The script initializes and begins liking songs automatically!

---

## 🎮 Console Controls

While the script is running, the global `autoLiker` object exposes controls in your console:

```javascript
// Stop or pause execution
autoLiker.stop();

// Resume execution after stopping
autoLiker.start();

// Print current stats (songs liked, runtime, scroll count)
autoLiker.getStatus();

// Print command reference to the console
autoLiker.help();

// Run isolated diagnostics
autoLiker.debugLikeButtons();     // Inspect detected playlist buttons and titles
autoLiker.debugPageStructure();   // Inspect page containers and scroll targets
```

---

## ⚙️ Configuration

The script runs with tuned defaults out-of-the-box, but you can customize parameters by editing the initialization block at the bottom of [`youtube-music-auto-like.js`](youtube-music-auto-like.js):

```javascript
const autoLiker = new YouTubeMusicAutoLike({
    likeDelayMin: 1200,        // Min delay between likes (ms)
    likeDelayMax: 2300,        // Max delay between likes (ms)
    scrollDelay: 3000,         // Pause between scroll attempts (ms)
    scrollDistance: 600,       // Distance in pixels to scroll per cycle
    loadWaitTime: 4000,        // Time to wait for newly scrolled items to render (ms)
    maxScrollAttempts: 75,     // Stop after N consecutive unproductive scroll attempts
    verbose: true              // Output detailed step-by-step logs
});
```

### Options Reference

| Option | Default | Description |
|---|---|---|
| `likeDelayMin` | `1200` (1.2s) | Minimum random delay before clicking the next like button |
| `likeDelayMax` | `2300` (2.3s) | Maximum random delay before clicking the next like button |
| `scrollDelay` | `3000` (3.0s) | Delay before initiating a scroll action |
| `scrollDistance` | `600px` | Pixels to scroll down when loading additional tracks |
| `loadWaitTime` | `4000` (4.0s) | Grace period to allow YouTube Music to render new DOM nodes |
| `maxScrollAttempts`| `75` | Maximum scroll attempts allowed to guard against infinite loops |
| `verbose` | `true` | When `true`, prints individual action lines for each song and scroll |

---

## 📊 Example Console Output

```text
🎵 YouTube Music Auto-Like Script Loaded
📋 Creating auto-liker with default settings...

💡 CONTROLS:
• To stop the script: autoLiker.stop()
• To check status: autoLiker.getStatus()
• To start again: autoLiker.start()
...
[4:20:10 PM] YT Auto-Like: ℹ️ 🚀 Starting YouTube Music Auto-Like script...
[4:20:10 PM] YT Auto-Like: ℹ️ Found 15 songs to like
[4:20:12 PM] YT Auto-Like: ✅ Liked: "Starboy" (1 total)
[4:20:14 PM] YT Auto-Like: ✅ Liked: "Blinding Lights" (2 total)
[4:20:16 PM] YT Auto-Like: 🔍 Scrolling to load more content... (attempt 1)
...
==================================================
[4:25:30 PM] YT Auto-Like: ✅ 🎉 Script completed!
[4:25:30 PM] YT Auto-Like: ✅ 📊 Total songs liked: 54
[4:25:30 PM] YT Auto-Like: ℹ️ ⏱️ Runtime: 320 seconds
[4:25:30 PM] YT Auto-Like: ℹ️ 📜 Scroll attempts: 8
==================================================
All done! Your playlist songs have been liked! ❤️
```

---

## 🛡️ Safety & Reliability

- **Scoped to Playlist**: YouTube Music appends recommended songs ("Suggestions") at the bottom of playlists. The script explicitly verifies that buttons belong to `<ytmusic-playlist-shelf-renderer>` and ignores any outside shelves.
- **Natural Jitter**: Delays fluctuate dynamically between `likeDelayMin` and `likeDelayMax` for each click to emulate human pacing.
- **Graceful Termination**: Checks if the bottom of the playlist has been reached and safely exits without hanging.

---

## ❓ Troubleshooting

| Issue | Cause & Fix |
|---|---|
| **Console says "DevTools was unable to paste"** | Modern Chromium browsers block pasting unfamiliar scripts. Type `allow pasting` into the console, press <kbd>Enter</kbd>, and paste again. |
| **"No more songs to like" immediately** | All visible songs may already be liked, or the playlist is empty. Verify like states or run `autoLiker.debugLikeButtons()` to check button states. |
| **Songs load slowly while scrolling** | On slower network connections, YouTube Music may take longer to fetch chunked tracks. Increase `loadWaitTime` to `6000` or higher. |
| **Need to inspect page elements** | Run `autoLiker.debugPageStructure()` or `autoLiker.debugLikeButtons()` to inspect detected containers and buttons. |

---

## 🤝 Contributing

Contributions, bug reports, and improvements are welcome!
1. Fork the repository.
2. Create a feature or bugfix branch (`git checkout -b fix/my-improvement`).
3. Commit your changes and open a Pull Request.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.