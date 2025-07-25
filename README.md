# YouTube Music Auto-Like Script 🎵

Automatically like all songs in a YouTube Music playlist with this browser console script.

## ✨ Features

- **Smart Detection**: Automatically finds and likes only unliked songs using multiple selector strategies
- **Progress Tracking**: Real-time logging with song titles and progress counts
- **Randomized Delays**: Natural timing with configurable random delays to avoid detection
- **Advanced Scrolling**: Intelligent scroll detection with multiple fallback methods
- **Safety Features**: 
  - Maximum scroll limits to prevent infinite loops
  - Graceful error handling and retry logic
  - Manual stop functionality
  - Smart detection when reaching playlist end
- **Multiple Selector Support**: Works across different YouTube Music interface versions
- **Detailed Statistics**: Shows total likes, runtime, and scroll attempts when complete
- **Debug Tools**: Built-in diagnostics for troubleshooting

## 🚀 Quick Start

### Step 1: Open YouTube Music
1. Go to [music.youtube.com](https://music.youtube.com)
2. Navigate to the playlist you want to auto-like
3. Make sure you're logged into your account

### Step 2: Open Browser Console
- **Chrome/Edge**: Press `F12` or `Ctrl+Shift+I`, then click "Console" tab
- **Firefox**: Press `F12` or `Ctrl+Shift+K`
- **Safari**: Press `Cmd+Option+I` (may need to enable Developer menu first)

### Step 3: Run the Script
1. Copy the entire contents of `youtube-music-auto-like.js`
2. Paste it into the browser console
3. Press `Enter` to execute

The script will start automatically and begin liking songs!

## 🎮 Controls

Once the script is running, you can control it using these console commands:

```javascript
// Stop the script
autoLiker.stop()

// Check current status and statistics
autoLiker.getStatus()

// Start the script again (if stopped)
autoLiker.start()

// Test individual functions
autoLiker.scrollToLoadMore()        // Test scrolling
autoLiker.likeVisibleSongs()        // Like currently visible songs

// Debug tools (for troubleshooting)
autoLiker.debugPageStructure()       // Analyze page layout
autoLiker.debugLikeButtons()         // Analyze like button detection
```

## ⚙️ Configuration

You can customize the script behavior by modifying the configuration when creating the instance:

```javascript
const autoLiker = new YouTubeMusicAutoLike({
    likeDelayMin: 1200,        // Minimum delay between likes (milliseconds)
    likeDelayMax: 2300,        // Maximum delay between likes (milliseconds)
    scrollDelay: 3000,         // Milliseconds between scroll cycles
    scrollDistance: 600,       // Pixels to scroll each time
    maxScrollAttempts: 75,     // Maximum scrolls before stopping
    loadWaitTime: 4000,        // Wait time after scrolling for content to load
    verbose: true              // Enable detailed logging
});
```

### Configuration Options

| Option | Default | Description |
|--------|---------|-------------|
| `likeDelayMin` | 1200ms | Minimum delay between liking individual songs |
| `likeDelayMax` | 2300ms | Maximum delay between liking individual songs |
| `scrollDelay` | 3000ms | Delay between scroll cycles |
| `scrollDistance` | 600px | How far to scroll each time (optimized for YouTube Music) |
| `maxScrollAttempts` | 75 | Maximum scroll attempts to prevent infinite loops |
| `loadWaitTime` | 4000ms | Time to wait for new content after scrolling |
| `verbose` | true | Enable detailed console logging |

### 🎯 Smart Delay System

The script uses **randomized delays** between `likeDelayMin` and `likeDelayMax` to make the automation appear more natural. Each like action waits a random amount of time within your specified range, making it less likely to be detected as automated behavior.

## 📊 Example Output

```
🎵 YouTube Music Auto-Like Script Loaded
📋 Creating auto-liker with default settings...

[10:30:15] YT Auto-Like: ℹ️ 🚀 Starting YouTube Music Auto-Like script...
[10:30:15] YT Auto-Like: ℹ️ 💡 You can stop the script anytime by running: autoLiker.stop()
[10:30:15] YT Auto-Like: ℹ️ Found 12 songs to like
[10:30:16] YT Auto-Like: 🔍 Waiting 1.8s before next like...
[10:30:16] YT Auto-Like: ✅ Liked: "Song Title 1" (1 total)
[10:30:18] YT Auto-Like: 🔍 Waiting 2.1s before next like...
[10:30:18] YT Auto-Like: ✅ Liked: "Song Title 2" (2 total)
[10:30:21] YT Auto-Like: 🔍 Scrolling to load more content... (attempt 1)
...
==================================================
[10:35:22] YT Auto-Like: ✅ 🎉 Script completed!
[10:35:22] YT Auto-Like: ✅ 📊 Total songs liked: 47
[10:35:22] YT Auto-Like: ℹ️ ⏱️ Runtime: 307 seconds
[10:35:22] YT Auto-Like: ℹ️ 📜 Scroll attempts: 12
==================================================
All done! Your playlist songs have been liked! ❤️
```

## 🛡️ Safety Features

- **Smart Rate Limiting**: Randomized delays between actions prevent overwhelming YouTube's servers
- **Intelligent Scrolling**: Multiple scroll detection methods ensure reliable content loading
- **Maximum Attempts**: Prevents infinite scrolling with configurable limits
- **Error Handling**: Gracefully handles network issues and DOM changes
- **Manual Control**: Can be stopped at any time
- **End Detection**: Automatically stops when no more content can be loaded
- **Retry Logic**: Multiple attempts to find content before giving up

## 🔧 Debug Tools

The script includes built-in diagnostic tools for troubleshooting:

```javascript
// Analyze the current page structure
autoLiker.debugPageStructure()

// Analyze like button detection
autoLiker.debugLikeButtons()
```

These tools help identify issues when YouTube Music updates their interface or when the script isn't working as expected.

## ❗ Troubleshooting

### "No more songs to like" immediately
- **Cause**: All songs in the playlist are already liked, or YouTube changed their DOM structure
- **Solution**: Use `autoLiker.debugLikeButtons()` to check button detection, or try refreshing the page

### Script stops working after YouTube update
- **Cause**: YouTube updated their interface and selectors changed
- **Solution**: The script includes multiple selectors for compatibility, but may need updates for major changes. Use debug tools to analyze the current page structure.

### "Maximum scroll attempts reached"
- **Cause**: Very large playlist or slow internet connection
- **Solution**: Increase `maxScrollAttempts` in the configuration or increase `loadWaitTime` for slower connections

### Script runs too fast/slow
- **Cause**: Default timing doesn't match your needs or network conditions
- **Solution**: Adjust `likeDelayMin`, `likeDelayMax`, `scrollDelay`, and `loadWaitTime` in the configuration

### Console shows errors or no progress
- **Cause**: Network issues, YouTube interface changes, or browser compatibility
- **Solution**: 
  1. Check your internet connection
  2. Try refreshing the page
  3. Use `autoLiker.debugPageStructure()` to analyze the page
  4. Increase `loadWaitTime` for slower loading

### Script can't find like buttons
- **Cause**: YouTube Music interface update or unexpected page structure
- **Solution**: Use `autoLiker.debugLikeButtons()` to see what buttons are detected and their attributes

## 📝 How It Works

1. **Multi-Selector Detection**: Uses multiple CSS selectors to find like buttons across different YouTube Music versions
2. **Smart Filtering**: Identifies only unliked songs by checking button states and aria labels
3. **Natural Timing**: Implements randomized delays between actions to appear more human-like
4. **Advanced Scrolling**: Uses multiple scroll methods and containers for reliable content loading
5. **Progress Monitoring**: Tracks scrolling success and detects when no new content is available
6. **Completion Detection**: Automatically stops when reaching the end of the playlist

## ⚠️ Important Notes

- **Use Responsibly**: This script automates interactions with YouTube Music. Use reasonable delays to avoid being rate-limited
- **Account Safety**: Only use on your own playlists and account
- **Browser Compatibility**: Works in all modern browsers (Chrome, Firefox, Safari, Edge)
- **No Installation Required**: Pure JavaScript - runs directly in browser console
- **Natural Behavior**: Random delays and smart detection help avoid automation detection

## 🤝 Contributing

Feel free to submit issues or improvements! The script is designed to be robust but YouTube occasionally updates their interface.

## 📄 License

This script is provided as-is for educational and personal use. Please respect YouTube Music's terms of service.

---

**Happy listening! 🎶** 