# YouTube Music Auto-Like Script 🎵

Automatically like all songs in a YouTube Music playlist with this browser console script.

## ✨ Features

- **Smart Detection**: Automatically finds and likes only unliked songs
- **Progress Tracking**: Real-time logging with song titles and progress counts
- **Configurable Delays**: Customize timing to avoid overwhelming YouTube's servers
- **Safety Features**: 
  - Maximum scroll limits to prevent infinite loops
  - Graceful error handling
  - Manual stop functionality
- **Multiple Selector Support**: Works across different YouTube Music interface versions
- **Detailed Statistics**: Shows total likes, runtime, and scroll attempts when complete

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
```

## ⚙️ Configuration

You can customize the script behavior by modifying the configuration when creating the instance:

```javascript
const autoLiker = new YouTubeMusicAutoLike({
    likeDelay: 1500,        // Milliseconds between individual likes
    scrollDelay: 6000,      // Milliseconds between scroll cycles
    scrollDistance: 1000,   // Pixels to scroll each time
    maxScrollAttempts: 50,  // Maximum scrolls before stopping
    loadWaitTime: 2000,     // Wait time after scrolling for content to load
    verbose: true           // Enable detailed logging
});
```

### Configuration Options

| Option | Default | Description |
|--------|---------|-------------|
| `likeDelay` | 1500ms | Delay between liking individual songs |
| `scrollDelay` | 6000ms | Delay between scroll cycles |
| `scrollDistance` | 1000px | How far to scroll each time |
| `maxScrollAttempts` | 50 | Maximum scroll attempts to prevent infinite loops |
| `loadWaitTime` | 2000ms | Time to wait for new content after scrolling |
| `verbose` | true | Enable detailed console logging |

## 📊 Example Output

```
🎵 YouTube Music Auto-Like Script Loaded
📋 Creating auto-liker with default settings...

[10:30:15] YT Auto-Like: ℹ️ 🚀 Starting YouTube Music Auto-Like script...
[10:30:15] YT Auto-Like: ℹ️ 💡 You can stop the script anytime by running: autoLiker.stop()
[10:30:15] YT Auto-Like: ℹ️ Found 12 songs to like
[10:30:16] YT Auto-Like: ✅ Liked: "Song Title 1" (1 total)
[10:30:18] YT Auto-Like: ✅ Liked: "Song Title 2" (2 total)
...
==================================================
[10:35:22] YT Auto-Like: ✅ 🎉 Script completed!
[10:35:22] YT Auto-Like: ✅ 📊 Total songs liked: 47
[10:35:22] YT Auto-Like: ℹ️ ⏱️ Runtime: 307 seconds
[10:35:22] YT Auto-Like: ℹ️ 📜 Scroll attempts: 12
==================================================
```

## 🛡️ Safety Features

- **Rate Limiting**: Built-in delays prevent overwhelming YouTube's servers
- **Maximum Attempts**: Prevents infinite scrolling with configurable limits
- **Error Handling**: Gracefully handles network issues and DOM changes
- **Manual Control**: Can be stopped at any time
- **Smart Detection**: Only likes songs that aren't already liked

## ❗ Troubleshooting

### "No more songs to like" immediately
- **Cause**: All songs in the playlist are already liked, or YouTube changed their DOM structure
- **Solution**: Check if songs are already liked, or try refreshing the page

### Script stops working after YouTube update
- **Cause**: YouTube updated their interface and selectors changed
- **Solution**: The script includes multiple selectors for compatibility, but may need updates for major changes

### "Maximum scroll attempts reached"
- **Cause**: Very large playlist or slow internet connection
- **Solution**: Increase `maxScrollAttempts` in the configuration

### Script runs too fast/slow
- **Cause**: Default timing doesn't match your needs
- **Solution**: Adjust `likeDelay` and `scrollDelay` in the configuration

### Console shows errors
- **Cause**: Network issues or YouTube interface changes
- **Solution**: Check your internet connection and try refreshing the page

## 📝 How It Works

1. **Detection**: Scans the page for "Like" buttons that haven't been pressed
2. **Liking**: Clicks each button with configurable delays
3. **Scrolling**: Automatically scrolls down to load more songs
4. **Monitoring**: Tracks progress and detects when all songs are processed
5. **Completion**: Shows final statistics and stops automatically

## ⚠️ Important Notes

- **Use Responsibly**: This script automates interactions with YouTube Music. Use reasonable delays to avoid being rate-limited
- **Account Safety**: Only use on your own playlists and account
- **Browser Compatibility**: Works in all modern browsers (Chrome, Firefox, Safari, Edge)
- **No Installation Required**: Pure JavaScript - runs directly in browser console

## 🤝 Contributing

Feel free to submit issues or improvements! The script is designed to be robust but YouTube occasionally updates their interface.

## 📄 License

This script is provided as-is for educational and personal use. Please respect YouTube Music's terms of service.

---

**Happy listening! 🎶** 